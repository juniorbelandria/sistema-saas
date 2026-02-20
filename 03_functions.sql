-- =============================================
-- SISTEMA POS V2 - FUNCIONES COMPLETAS
-- Archivo 3 de 5: Funciones PL/pgSQL + Fiscales
-- =============================================
-- REGLAS DE NEGOCIO CLAVE:
--   1. Al registrar un negocio → plan 'prueba_gratis', 7 días
--   2. Al vencer → plan_estado = 'vencido', bloqueado
--   3. is_super_admin = TRUE → jamás se bloquea, ve todo
--   4. Activación manual por super admin global
-- FUNCIONES FISCALES:
--   - recalcular_totales_impuesto_venta() → sincroniza impuestos en ventas
--   - recalcular_subtotal_detalle()       → mantiene subtotal_con_descuento
--   - recalcular_desglose_ventas()        → actualiza gravado/exento
--   - calcular_impuestos_venta()          → calcula y registra impuestos
--   - validar_factura_para_pais()         → valida campos requeridos
--   - obtener_datos_factura()             → JSON completo para renderizar
--   - crear_formato_factura_default()     → crea formato al crear negocio
-- =============================================

-- =============================================
-- 1. FUNCIÓN AUXILIAR: ACTUALIZAR TIMESTAMP
-- =============================================

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- =============================================
-- 2. FUNCIÓN: MANEJO DE NUEVO USUARIO (Auth)
-- Crea el perfil cuando auth.users inserta un registro nuevo
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insertar perfil base. El negocio_id se asigna luego al registrar el negocio.
    -- is_super_admin por defecto FALSE; se promueve manualmente si es admin de plataforma.
    INSERT INTO public.perfiles (id, nombre_completo, rol, is_super_admin, activo, negocio_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
        NULL,      -- Sin rol hasta registrar negocio
        FALSE,     -- No es super admin global por defecto
        TRUE,
        NULL       -- Sin negocio hasta completar registro
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- =============================================
-- 3. FUNCIÓN: VERIFICAR ESTADO DE SUSCRIPCIÓN
-- CRÍTICO: Los super admins globales (is_super_admin = TRUE) NUNCA son bloqueados.
-- Los negocios con plan vencido o suspendido son bloqueados en operaciones.
-- =============================================

CREATE OR REPLACE FUNCTION verificar_estado_suscripcion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_estado      TEXT;
    v_plan_vencimiento TIMESTAMP WITH TIME ZONE;
    v_negocio_id       UUID;
    v_es_super_admin   BOOLEAN;
BEGIN
    v_negocio_id := COALESCE(NEW.negocio_id, OLD.negocio_id);

    -- Verificar si el usuario actual es super admin global → NUNCA se bloquea
    SELECT COALESCE(is_super_admin, FALSE) INTO v_es_super_admin
    FROM perfiles WHERE id = auth.uid();

    IF COALESCE(v_es_super_admin, FALSE) = TRUE THEN
        RETURN COALESCE(NEW, OLD); -- Super admin global: pasa sin restricción
    END IF;

    -- Verificar estado del plan del negocio
    SELECT plan_estado, plan_vencimiento
    INTO v_plan_estado, v_plan_vencimiento
    FROM configuracion
    WHERE id = v_negocio_id;

    -- Si no encontró configuracion (no debería pasar), permitir
    IF v_plan_estado IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Bloqueo por plan suspendido (manual por admin global)
    IF v_plan_estado = 'suspendido' THEN
        RAISE EXCEPTION 'PLAN_SUSPENDIDO: La cuenta del negocio está suspendida. Contacte a soporte.';
    END IF;

    -- Bloqueo por plan vencido (columna o fecha superada)
    -- NOTA: plan_estado = 'prueba_gratis' + fecha ya pasada = vencido
    IF v_plan_estado = 'vencido' OR
       (v_plan_estado IN ('prueba_gratis', 'activo') AND v_plan_vencimiento < NOW()) THEN
        RAISE EXCEPTION 'PLAN_VENCIDO: Tu período de prueba o suscripción ha vencido. Por favor renueva tu plan para continuar.';
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- =============================================
-- 4. FUNCIÓN: ACTUALIZAR ESTADO DE PLANES VENCIDOS
-- Llamar con un cron job periódico o manualmente.
-- Marca como 'vencido' todos los negocios cuya fecha expiró.
-- =============================================

CREATE OR REPLACE FUNCTION actualizar_planes_vencidos()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_actualizados INTEGER;
BEGIN
    UPDATE configuracion
    SET plan_estado = 'vencido',
        updated_at  = NOW()
    WHERE plan_vencimiento < NOW()
      AND plan_estado IN ('prueba_gratis', 'activo'); -- No tocar 'suspendido' manualmente

    GET DIAGNOSTICS v_actualizados = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', TRUE,
        'negocios_vencidos', v_actualizados,
        'ejecutado_en', NOW()
    );
END;
$$;

-- =============================================
-- 5. FUNCIÓN: REGISTRO DE NEGOCIO (PRINCIPAL)
-- Llamada desde el frontend después de que el usuario ya existe en auth.users.
-- Crea la configuración del negocio, asigna el perfil y el plan de prueba.
-- =============================================

CREATE OR REPLACE FUNCTION registrar_usuario_con_negocio(
    p_user_id               UUID,       -- UUID del usuario ya autenticado (obligatorio)
    p_nombre_completo       TEXT,       -- Nombre del dueño
    p_nombre_negocio        TEXT,       -- Nombre corto del negocio (ej: "Mi Tienda")
    p_nombre_completo_negocio TEXT,     -- Nombre legal/fiscal (puede ser igual al anterior)
    p_direccion             TEXT,
    p_telefono              TEXT,
    p_email_negocio         TEXT,
    p_pais_codigo           VARCHAR(3),
    p_moneda_base           VARCHAR(10) DEFAULT 'USD',
    p_tipo_negocio          TEXT DEFAULT 'bodega',
    p_id_fiscal             TEXT DEFAULT NULL,
    p_nombre_fiscal         TEXT DEFAULT NULL,
    p_regimen_fiscal        TEXT DEFAULT NULL,
    p_usa_factura_electronica BOOLEAN DEFAULT FALSE,
    p_prefijo_factura       VARCHAR(10) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id    UUID;
    v_negocio_id UUID;
BEGIN
    -- Usar el user_id pasado explícitamente o intentar sesión activa
    v_user_id := COALESCE(p_user_id, auth.uid());

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Usuario no autenticado. Inicia sesión e intenta de nuevo.',
            'code', 'NOT_AUTHENTICATED'
        );
    END IF;

    -- Verificar que el usuario exista en auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'El usuario no existe en el sistema de autenticación.',
            'code', 'USER_NOT_FOUND'
        );
    END IF;

    -- Verificar que no sea ya un super admin global
    IF EXISTS (SELECT 1 FROM perfiles WHERE id = v_user_id AND is_super_admin = TRUE) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Un Super Admin Global no puede registrar un negocio.',
            'code', 'SUPER_ADMIN_CANNOT_OWN_BUSINESS'
        );
    END IF;

    -- Verificar que no tenga ya un negocio
    IF EXISTS (SELECT 1 FROM configuracion WHERE owner_id = v_user_id) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Este usuario ya tiene un negocio registrado.',
            'code', 'BUSINESS_EXISTS'
        );
    END IF;

    -- Verificar que el país exista en el catálogo
    IF NOT EXISTS (SELECT 1 FROM catalogo_paises WHERE codigo = p_pais_codigo AND activo = TRUE) THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', format('El código de país %s no es válido.', p_pais_codigo),
            'code', 'INVALID_COUNTRY'
        );
    END IF;

    -- Crear el perfil si no existe aún (por si handle_new_user no corrió)
    INSERT INTO perfiles (id, nombre_completo, rol, is_super_admin, negocio_id, activo)
    VALUES (v_user_id, p_nombre_completo, NULL, FALSE, NULL, TRUE)
    ON CONFLICT (id) DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        updated_at = NOW();

    -- Crear la configuración del negocio
    -- plan_estado = 'prueba_gratis', 7 días, tipo_plan = 'free'
    INSERT INTO configuracion (
        nombre_negocio,
        nombre_completo,
        direccion,
        telefono,
        email,
        owner_id,
        pais_codigo,
        moneda_base,
        tipo_negocio,
        id_fiscal,
        nombre_fiscal,
        regimen_fiscal,
        usa_factura_electronica,
        prefijo_factura,
        plan_estado,
        plan_vencimiento,
        tipo_plan,
        fecha_inicio_plan
    ) VALUES (
        p_nombre_negocio,
        p_nombre_completo_negocio,
        p_direccion,
        p_telefono,
        p_email_negocio,
        v_user_id,
        p_pais_codigo,
        p_moneda_base,
        p_tipo_negocio,
        p_id_fiscal,
        p_nombre_fiscal,
        p_regimen_fiscal,
        p_usa_factura_electronica,
        p_prefijo_factura,
        'prueba_gratis',                    -- Plan inicial
        NOW() + INTERVAL '7 days',          -- 7 días exactos de prueba
        'free',
        NOW()
    )
    RETURNING id INTO v_negocio_id;

    -- Actualizar el perfil: asignar rol de super_admin (del negocio) y negocio_id
    -- NOTA: is_super_admin = FALSE porque es dueño de SU negocio, no admin de la plataforma
    UPDATE perfiles
    SET rol           = 'super_admin',
        negocio_id    = v_negocio_id,
        is_super_admin = FALSE,
        updated_at    = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'user_id', v_user_id,
        'negocio_id', v_negocio_id,
        'plan', 'prueba_gratis',
        'dias_prueba', 7,
        'vencimiento', (NOW() + INTERVAL '7 days')
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error', SQLERRM,
        'code', 'DB_ERROR'
    );
END;
$$;

-- =============================================
-- 6. FUNCIÓN: TRIGGER - ASIGNAR OWNER DEL NEGOCIO
-- Se ejecuta cuando se inserta una configuracion nueva.
-- Garantiza que el dueño tenga rol y negocio_id aunque algo falle en la función principal.
-- =============================================

CREATE OR REPLACE FUNCTION asignar_owner_negocio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE perfiles
    SET rol           = 'super_admin',
        negocio_id    = NEW.id,
        is_super_admin = FALSE,    -- Dueño de negocio ≠ super admin global
        updated_at    = NOW()
    WHERE id = NEW.owner_id
      AND is_super_admin = FALSE;  -- Protección: no degradar a un super admin global

    RAISE NOTICE 'Usuario % asignado como super_admin del negocio %', NEW.owner_id, NEW.id;
    RETURN NEW;
END;
$$;

-- =============================================
-- 7. FUNCIÓN: ACTIVAR PLAN DE NEGOCIO (Por super admin global)
-- Activa manualmente el plan de un negocio (equivale a confirmar pago).
-- =============================================

CREATE OR REPLACE FUNCTION activar_plan_negocio(
    p_negocio_id    UUID,
    p_tipo_plan     TEXT DEFAULT 'mensual',   -- 'mensual' | 'anual'
    p_dias_adicionales INTEGER DEFAULT NULL   -- Si se quiere un período custom
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_es_super_admin   BOOLEAN;
    v_negocio          RECORD;
    v_nuevo_vencimiento TIMESTAMP WITH TIME ZONE;
    v_dias             INTEGER;
BEGIN
    -- Solo super admins globales pueden activar planes
    SELECT COALESCE(is_super_admin, FALSE) INTO v_es_super_admin
    FROM perfiles WHERE id = auth.uid();

    IF NOT COALESCE(v_es_super_admin, FALSE) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No autorizado. Solo super admins globales pueden activar planes.', 'code', 'UNAUTHORIZED');
    END IF;

    -- Validar tipo de plan
    IF p_tipo_plan NOT IN ('mensual', 'anual') THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Tipo de plan inválido. Use mensual o anual.', 'code', 'INVALID_PLAN');
    END IF;

    -- Obtener datos del negocio
    SELECT * INTO v_negocio FROM configuracion WHERE id = p_negocio_id;
    IF v_negocio.id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Negocio no encontrado.', 'code', 'NOT_FOUND');
    END IF;

    -- Calcular nuevo vencimiento
    -- Si el plan actual es futuro (no vencido), extender desde ese punto
    IF p_dias_adicionales IS NOT NULL THEN
        v_dias := p_dias_adicionales;
    ELSIF p_tipo_plan = 'mensual' THEN
        v_dias := 30;
    ELSE
        v_dias := 365;
    END IF;

    -- Si ya tiene un vencimiento futuro, extender desde ahí; si no, desde ahora
    IF v_negocio.plan_vencimiento > NOW() THEN
        v_nuevo_vencimiento := v_negocio.plan_vencimiento + (v_dias || ' days')::INTERVAL;
    ELSE
        v_nuevo_vencimiento := NOW() + (v_dias || ' days')::INTERVAL;
    END IF;

    -- Actualizar el plan
    UPDATE configuracion
    SET plan_estado      = 'activo',
        tipo_plan        = p_tipo_plan,
        plan_vencimiento = v_nuevo_vencimiento,
        fecha_inicio_plan = NOW(),
        activado_por     = auth.uid(),
        updated_at       = NOW()
    WHERE id = p_negocio_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'negocio_id', p_negocio_id,
        'plan_activado', p_tipo_plan,
        'nuevo_vencimiento', v_nuevo_vencimiento,
        'dias', v_dias,
        'activado_por', auth.uid()
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- =============================================
-- 8. FUNCIÓN: SUSPENDER / REACTIVAR NEGOCIO (Por super admin global)
-- =============================================

CREATE OR REPLACE FUNCTION gestionar_estado_negocio(
    p_negocio_id UUID,
    p_accion     TEXT,   -- 'suspender' | 'reactivar' | 'vencer'
    p_notas      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_es_super_admin BOOLEAN;
    v_nuevo_estado   TEXT;
BEGIN
    SELECT COALESCE(is_super_admin, FALSE) INTO v_es_super_admin
    FROM perfiles WHERE id = auth.uid();

    IF NOT COALESCE(v_es_super_admin, FALSE) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No autorizado.', 'code', 'UNAUTHORIZED');
    END IF;

    IF p_accion NOT IN ('suspender', 'reactivar', 'vencer') THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Acción inválida. Use: suspender, reactivar, vencer.', 'code', 'INVALID_ACTION');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM configuracion WHERE id = p_negocio_id) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Negocio no encontrado.', 'code', 'NOT_FOUND');
    END IF;

    v_nuevo_estado := CASE p_accion
        WHEN 'suspender'  THEN 'suspendido'
        WHEN 'reactivar'  THEN 'activo'
        WHEN 'vencer'     THEN 'vencido'
    END;

    UPDATE configuracion
    SET plan_estado  = v_nuevo_estado,
        notas_admin  = COALESCE(p_notas, notas_admin),
        activado_por = auth.uid(),
        updated_at   = NOW()
    WHERE id = p_negocio_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'negocio_id', p_negocio_id,
        'nuevo_estado', v_nuevo_estado,
        'gestionado_por', auth.uid()
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- =============================================
-- 9. FUNCIÓN: REGISTRAR SUPER ADMIN GLOBAL
-- Solo puede ser llamado por un super admin existente.
-- Excepción: si NO hay ningún super admin aún, el primero se crea libremente.
-- =============================================

CREATE OR REPLACE FUNCTION registrar_super_admin_global(
    p_email          TEXT,
    p_nombre_completo TEXT,
    p_notas          TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id             UUID;
    v_caller_is_super_admin BOOLEAN;
    v_hay_super_admins    BOOLEAN;
BEGIN
    -- ¿Ya existen super admins globales?
    SELECT EXISTS(SELECT 1 FROM perfiles WHERE is_super_admin = TRUE)
    INTO v_hay_super_admins;

    -- Verificar si quien llama es super admin
    SELECT COALESCE(is_super_admin, FALSE) INTO v_caller_is_super_admin
    FROM perfiles WHERE id = auth.uid();

    -- Si ya hay super admins y quien llama no lo es → rechazar
    IF v_hay_super_admins AND NOT COALESCE(v_caller_is_super_admin, FALSE) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No autorizado. Solo un super admin existente puede crear otro.', 'code', 'UNAUTHORIZED');
    END IF;

    -- Buscar el usuario por email
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Usuario no encontrado con ese email.', 'code', 'USER_NOT_FOUND');
    END IF;

    -- No convertir a alguien que ya tiene un negocio activo
    IF EXISTS (SELECT 1 FROM configuracion WHERE owner_id = v_user_id) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Este usuario ya es dueño de un negocio. No puede ser promovido a Super Admin Global.', 'code', 'HAS_BUSINESS');
    END IF;

    -- Crear o actualizar perfil como super admin global
    -- Super admin global: is_super_admin = TRUE, negocio_id = NULL, rol = 'super_admin'
    INSERT INTO perfiles (id, nombre_completo, rol, is_super_admin, negocio_id, activo)
    VALUES (v_user_id, p_nombre_completo, 'super_admin', TRUE, NULL, TRUE)
    ON CONFLICT (id) DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        rol             = 'super_admin',
        is_super_admin  = TRUE,
        negocio_id      = NULL,  -- Sin negocio propio
        activo          = TRUE,
        updated_at      = NOW();

    RETURN jsonb_build_object(
        'success', TRUE,
        'user_id', v_user_id,
        'email', p_email,
        'mensaje', 'Super Admin Global registrado exitosamente.'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- =============================================
-- 10. FUNCIÓN: PROMOVER USUARIO A SUPER ADMIN GLOBAL
-- =============================================

CREATE OR REPLACE FUNCTION convertir_a_super_admin_global(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_is_super_admin BOOLEAN;
    v_user_email            TEXT;
BEGIN
    SELECT COALESCE(is_super_admin, FALSE) INTO v_caller_is_super_admin
    FROM perfiles WHERE id = auth.uid();

    -- Primer super admin: se permite si no hay ninguno aún
    IF NOT EXISTS (SELECT 1 FROM perfiles WHERE is_super_admin = TRUE) THEN
        v_caller_is_super_admin := TRUE;
    END IF;

    IF NOT COALESCE(v_caller_is_super_admin, FALSE) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No autorizado.', 'code', 'UNAUTHORIZED');
    END IF;

    SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
    IF v_user_email IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Usuario no encontrado.', 'code', 'NOT_FOUND');
    END IF;

    -- Verificar que no tenga negocio propio
    IF EXISTS (SELECT 1 FROM configuracion WHERE owner_id = p_user_id) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'El usuario tiene un negocio registrado. No puede ser promovido.', 'code', 'HAS_BUSINESS');
    END IF;

    UPDATE perfiles
    SET rol            = 'super_admin',
        is_super_admin = TRUE,
        negocio_id     = NULL,
        activo         = TRUE,
        updated_at     = NOW()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', TRUE, 'user_id', p_user_id, 'mensaje', 'Promovido a Super Admin Global exitosamente.');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- =============================================
-- 11. FUNCIÓN: REVOCAR SUPER ADMIN GLOBAL
-- =============================================

CREATE OR REPLACE FUNCTION revocar_super_admin_global(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_is_super_admin BOOLEAN;
BEGIN
    SELECT COALESCE(is_super_admin, FALSE) INTO v_caller_is_super_admin
    FROM perfiles WHERE id = auth.uid();

    IF NOT COALESCE(v_caller_is_super_admin, FALSE) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No autorizado.', 'code', 'UNAUTHORIZED');
    END IF;

    -- Proteger: no puede revocar el último super admin
    IF p_user_id = auth.uid() AND (SELECT COUNT(*) FROM perfiles WHERE is_super_admin = TRUE) <= 1 THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No puedes revocar al único Super Admin Global restante.', 'code', 'LAST_SUPER_ADMIN');
    END IF;

    UPDATE perfiles
    SET is_super_admin = FALSE,
        rol            = NULL,
        negocio_id     = NULL,
        updated_at     = NOW()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', TRUE, 'mensaje', 'Permisos de Super Admin Global revocados.');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- =============================================
-- 12. FUNCIÓN: TRIGGER - AUTO INICIALIZAR IMPUESTOS DEL PAÍS
-- Al crear un negocio, carga automáticamente los impuestos del país seleccionado.
-- =============================================

CREATE OR REPLACE FUNCTION inicializar_impuestos_negocio(p_negocio_id UUID, p_pais_codigo VARCHAR(3))
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_impuesto RECORD;
    v_count    INTEGER := 0;
    v_result   JSONB := '[]'::JSONB;
BEGIN
    FOR v_impuesto IN
        SELECT ip.id AS impuesto_pais_id, ip.nombre_local, ip.tasa, ip.es_predeterminado,
               cti.codigo AS tipo_codigo
        FROM impuestos_pais ip
        JOIN catalogo_tipos_impuesto cti ON ip.tipo_impuesto_id = cti.id
        WHERE ip.pais_codigo = p_pais_codigo AND ip.activo = TRUE
        ORDER BY ip.orden_aplicacion
    LOOP
        INSERT INTO impuestos_negocio (negocio_id, impuesto_pais_id, nombre_personalizado, tasa_personalizada, es_predeterminado, activo)
        VALUES (p_negocio_id, v_impuesto.impuesto_pais_id, v_impuesto.nombre_local, v_impuesto.tasa, v_impuesto.es_predeterminado, TRUE)
        ON CONFLICT (negocio_id, impuesto_pais_id) DO NOTHING;

        v_count  := v_count + 1;
        v_result := v_result || jsonb_build_object('tipo', v_impuesto.tipo_codigo, 'tasa', v_impuesto.tasa);
    END LOOP;

    RETURN jsonb_build_object('success', TRUE, 'pais', p_pais_codigo, 'impuestos_cargados', v_count, 'detalle', v_result);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION trigger_inicializar_impuestos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_result JSONB; BEGIN
    v_result := inicializar_impuestos_negocio(NEW.id, NEW.pais_codigo);
    RAISE NOTICE 'Impuestos inicializados para negocio %: %', NEW.id, v_result;
    RETURN NEW;
END;
$$;

-- =============================================
-- 13. FUNCIONES DE MONEDAS
-- =============================================

CREATE OR REPLACE FUNCTION validar_moneda_base_unica()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.es_base = TRUE THEN
        IF EXISTS (SELECT 1 FROM monedas WHERE negocio_id = NEW.negocio_id AND es_base = TRUE AND id != NEW.id) THEN
            RAISE EXCEPTION 'Ya existe una moneda base para este negocio. Cambia la actual antes de asignar una nueva.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION prevenir_desactivar_moneda_base()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.es_base = TRUE AND NEW.activo = FALSE THEN
        RAISE EXCEPTION 'No puedes desactivar la moneda base. Asigna otra moneda base primero.';
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validar_moneda_activa()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.moneda IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM monedas WHERE codigo = NEW.moneda AND negocio_id = NEW.negocio_id AND activo = TRUE) THEN
            -- Permitir si es la moneda base configurada (aun sin estar en tabla monedas)
            IF NOT EXISTS (SELECT 1 FROM configuracion WHERE id = NEW.negocio_id AND moneda_base = NEW.moneda) THEN
                RAISE EXCEPTION 'La moneda % no está activa para este negocio.', NEW.moneda;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION convertir_a_moneda_base(
    p_monto DECIMAL, p_moneda_transaccion TEXT, p_negocio_id UUID
) RETURNS DECIMAL
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
    v_moneda_base       TEXT;
    v_tasa_transaccion  DECIMAL(18,6);
    v_tasa_base         DECIMAL(18,6);
BEGIN
    SELECT moneda_base INTO v_moneda_base FROM configuracion WHERE id = p_negocio_id;
    IF p_moneda_transaccion = v_moneda_base THEN RETURN p_monto; END IF;

    SELECT tasa_cambio INTO v_tasa_transaccion FROM monedas WHERE codigo = p_moneda_transaccion AND negocio_id = p_negocio_id;
    SELECT tasa_cambio INTO v_tasa_base FROM monedas WHERE codigo = v_moneda_base AND negocio_id = p_negocio_id;

    RETURN (p_monto / NULLIF(v_tasa_transaccion, 0)) * COALESCE(v_tasa_base, 1);
END;
$$;

CREATE OR REPLACE FUNCTION agregar_moneda_negocio(
    p_negocio_id UUID, p_codigo VARCHAR(10), p_nombre VARCHAR(50) DEFAULT NULL,
    p_simbolo VARCHAR(10) DEFAULT NULL, p_decimales INT DEFAULT 2,
    p_es_base BOOLEAN DEFAULT FALSE, p_tasa_cambio DECIMAL(18,6) DEFAULT 1.0
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_moneda_id UUID; v_catalogo RECORD;
    v_nombre VARCHAR(50); v_simbolo VARCHAR(10); v_decimales INT;
BEGIN
    IF p_codigo !~ '^[A-Z]{2,10}$' THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Código de moneda inválido.', 'code', 'INVALID_CODE');
    END IF;
    IF EXISTS (SELECT 1 FROM monedas WHERE negocio_id = p_negocio_id AND codigo = p_codigo) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'La moneda ya existe para este negocio.', 'code', 'EXISTS');
    END IF;

    SELECT * INTO v_catalogo FROM catalogo_monedas WHERE codigo = p_codigo AND activo = TRUE;
    v_nombre   := COALESCE(p_nombre, v_catalogo.nombre);
    v_simbolo  := COALESCE(p_simbolo, v_catalogo.simbolo);
    v_decimales := COALESCE(p_decimales, v_catalogo.decimales, 2);

    IF v_nombre IS NULL OR v_simbolo IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Para monedas personalizadas debes proporcionar nombre y símbolo.', 'code', 'MISSING_DATA');
    END IF;

    IF p_es_base THEN
        UPDATE monedas SET es_base = FALSE, updated_at = NOW() WHERE negocio_id = p_negocio_id AND es_base = TRUE;
    END IF;

    INSERT INTO monedas (codigo, nombre, simbolo, decimales, tasa_cambio, es_base, activo, negocio_id)
    VALUES (p_codigo, v_nombre, v_simbolo, v_decimales, p_tasa_cambio, p_es_base, TRUE, p_negocio_id)
    RETURNING id INTO v_moneda_id;

    RETURN jsonb_build_object('success', TRUE, 'moneda_id', v_moneda_id, 'codigo', p_codigo, 'es_base', p_es_base);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- =============================================
-- 14. FUNCIONES DE STOCK
-- =============================================

CREATE OR REPLACE FUNCTION evitar_stock_negativo()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo. Stock actual: %, intento: %', OLD.stock, NEW.stock;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notificar_stock_bajo()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stock <= NEW.stock_minimo AND OLD.stock > OLD.stock_minimo THEN
        INSERT INTO historial_stock (producto_id, usuario_id, cantidad_anterior, cantidad_nueva, tipo_movimiento, motivo, negocio_id)
        VALUES (NEW.id, auth.uid(), OLD.stock, NEW.stock, 'alerta_stock_bajo', 'Stock bajo mínimo', NEW.negocio_id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calcular_precio_venta_producto()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.precio_compra > 0 AND NEW.margen_ganancia >= 0 THEN
        NEW.precio_venta := ROUND(NEW.precio_compra * (1 + NEW.margen_ganancia / 100), 2);
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================
-- 15. FUNCIONES DE CAJA
-- =============================================

CREATE OR REPLACE FUNCTION actualizar_saldos_movimiento()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_moneda_id UUID;
    v_apertura_id UUID;
BEGIN
    v_apertura_id := NEW.apertura_id;
    IF v_apertura_id IS NULL THEN RETURN NEW; END IF;

    SELECT id INTO v_moneda_id FROM monedas
    WHERE negocio_id = NEW.negocio_id AND codigo = NEW.moneda AND activo = TRUE LIMIT 1;
    IF v_moneda_id IS NULL THEN RETURN NEW; END IF;

    IF NEW.tipo_movimiento IN ('venta', 'abono', 'ingreso', 'apertura') THEN
        UPDATE saldos_apertura_moneda
        SET ingresos   = ingresos + ABS(NEW.monto),
            saldo_final = saldo_final + ABS(NEW.monto),
            updated_at  = NOW()
        WHERE apertura_id = v_apertura_id AND moneda_id = v_moneda_id;
    ELSIF NEW.tipo_movimiento IN ('gasto', 'retiro', 'devolucion') THEN
        UPDATE saldos_apertura_moneda
        SET egresos    = egresos + ABS(NEW.monto),
            saldo_final = saldo_final - ABS(NEW.monto),
            updated_at  = NOW()
        WHERE apertura_id = v_apertura_id AND moneda_id = v_moneda_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION revertir_saldos_movimiento()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_moneda_id UUID;
BEGIN
    IF OLD.apertura_id IS NULL THEN RETURN OLD; END IF;
    SELECT id INTO v_moneda_id FROM monedas WHERE negocio_id = OLD.negocio_id AND codigo = OLD.moneda LIMIT 1;
    IF v_moneda_id IS NULL THEN RETURN OLD; END IF;

    IF OLD.tipo_movimiento IN ('venta', 'abono', 'ingreso', 'apertura') THEN
        UPDATE saldos_apertura_moneda
        SET ingresos = ingresos - ABS(OLD.monto), saldo_final = saldo_final - ABS(OLD.monto), updated_at = NOW()
        WHERE apertura_id = OLD.apertura_id AND moneda_id = v_moneda_id;
    ELSIF OLD.tipo_movimiento IN ('gasto', 'retiro', 'devolucion') THEN
        UPDATE saldos_apertura_moneda
        SET egresos = egresos - ABS(OLD.monto), saldo_final = saldo_final + ABS(OLD.monto), updated_at = NOW()
        WHERE apertura_id = OLD.apertura_id AND moneda_id = v_moneda_id;
    END IF;
    RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION preparar_datos_gasto()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NEW.monto_base IS NULL THEN
        NEW.monto_base := convertir_a_moneda_base(NEW.monto, NEW.moneda, NEW.negocio_id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION registrar_movimiento_gasto_after()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_apertura_id UUID;
BEGIN
    SELECT id INTO v_apertura_id FROM aperturas_caja
    WHERE negocio_id = NEW.negocio_id AND estado = 'abierta' LIMIT 1;

    IF v_apertura_id IS NOT NULL THEN
        INSERT INTO movimientos_caja (tipo_movimiento, monto, moneda, descripcion, metodo_pago,
            gasto_id, apertura_id, usuario_id, negocio_id)
        VALUES ('gasto', NEW.monto, NEW.moneda, NEW.descripcion, NEW.metodo_pago,
            NEW.id, v_apertura_id, NEW.usuario_id, NEW.negocio_id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION actualizar_movimiento_gasto()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE movimientos_caja
    SET monto = NEW.monto, moneda = NEW.moneda, descripcion = NEW.descripcion
    WHERE gasto_id = OLD.id;
    RETURN NEW;
END;
$$;

-- =============================================
-- 16. FUNCIONES DE CRÉDITO Y FIADOS
-- =============================================

CREATE OR REPLACE FUNCTION actualizar_credito_cliente()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_cliente_id UUID;
    v_deuda_total DECIMAL(10,2);
BEGIN
    v_cliente_id := COALESCE(NEW.cliente_id, OLD.cliente_id);
    IF v_cliente_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

    SELECT COALESCE(SUM(saldo_pendiente), 0) INTO v_deuda_total
    FROM fiados WHERE cliente_id = v_cliente_id AND estado IN ('pendiente', 'parcial');

    UPDATE clientes
    SET credito_disponible = GREATEST(limite_credito - v_deuda_total, 0),
        updated_at = NOW()
    WHERE id = v_cliente_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION calcular_saldo_fiado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_fiado RECORD; v_nuevo_saldo DECIMAL(10,2);
BEGIN
    SELECT * INTO v_fiado FROM fiados WHERE id = NEW.fiado_id FOR UPDATE;
    v_nuevo_saldo := v_fiado.saldo_pendiente - NEW.monto;

    UPDATE fiados
    SET saldo_pendiente = GREATEST(v_nuevo_saldo, 0),
        estado = CASE WHEN v_nuevo_saldo <= 0 THEN 'pagado' WHEN v_nuevo_saldo < v_fiado.monto_total THEN 'parcial' ELSE 'pendiente' END,
        fecha_pago = CASE WHEN v_nuevo_saldo <= 0 THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = NEW.fiado_id;

    INSERT INTO historial_credito (cliente_id, fiado_id, abono_id, tipo_movimiento, monto, moneda,
        deuda_anterior, deuda_nueva, descripcion, negocio_id, usuario_id)
    VALUES (NEW.cliente_id, NEW.fiado_id, NEW.id, 'abono', NEW.monto, NEW.moneda,
        v_fiado.saldo_pendiente, GREATEST(v_nuevo_saldo, 0), 'Abono registrado', NEW.negocio_id, auth.uid());

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validar_limite_credito()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_credito_disponible DECIMAL(10,2);
BEGIN
    IF NEW.tipo_venta = 'credito' AND NEW.cliente_id IS NOT NULL THEN
        SELECT credito_disponible INTO v_credito_disponible FROM clientes WHERE id = NEW.cliente_id;
        IF COALESCE(v_credito_disponible, 0) < COALESCE(NEW.total, 0) THEN
            RAISE EXCEPTION 'LIMITE_CREDITO: El cliente no tiene crédito disponible suficiente. Disponible: %, Requerido: %',
                COALESCE(v_credito_disponible, 0), COALESCE(NEW.total, 0);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================
-- 17. FUNCIONES DE VALIDACIÓN DE VENTAS
-- =============================================

CREATE OR REPLACE FUNCTION validar_integridad_venta()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ventas WHERE id = NEW.venta_id AND negocio_id = NEW.negocio_id) THEN
        RAISE EXCEPTION 'La venta % no pertenece al negocio %.', NEW.venta_id, NEW.negocio_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validar_producto_detalle_negocio()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.producto_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM productos WHERE id = NEW.producto_id AND negocio_id = NEW.negocio_id AND activo = TRUE) THEN
            RAISE EXCEPTION 'El producto % no existe o no está activo en este negocio.', NEW.producto_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================
-- 18. FUNCIONES DE DEVOLUCIONES
-- =============================================

CREATE OR REPLACE FUNCTION generar_numero_devolucion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_consecutivo INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_devolucion FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO v_consecutivo FROM devoluciones WHERE negocio_id = NEW.negocio_id;
    NEW.numero_devolucion := 'DEV-' || LPAD(v_consecutivo::TEXT, 6, '0');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION procesar_devolucion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_devolucion RECORD;
BEGIN
    SELECT * INTO v_devolucion FROM devoluciones WHERE id = NEW.devolucion_id;
    IF v_devolucion.id IS NULL OR v_devolucion.estado NOT IN ('pendiente', 'aprobada') THEN
        RAISE EXCEPTION 'No se puede agregar detalle a una devolución en estado: %', COALESCE(v_devolucion.estado, 'inexistente');
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION calcular_totales_devolucion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE devoluciones d
    SET subtotal = COALESCE((SELECT SUM(subtotal_linea) FROM devoluciones_detalle WHERE devolucion_id = d.id), 0),
        total    = COALESCE((SELECT SUM(subtotal_linea) FROM devoluciones_detalle WHERE devolucion_id = d.id), 0),
        updated_at = NOW()
    WHERE d.id = COALESCE(NEW.devolucion_id, OLD.devolucion_id);
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION registrar_movimiento_devolucion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_apertura_id UUID;
BEGIN
    IF NEW.estado = 'aprobada' AND OLD.estado != 'aprobada' AND NEW.metodo_devolucion = 'efectivo' THEN
        SELECT id INTO v_apertura_id FROM aperturas_caja
        WHERE negocio_id = NEW.negocio_id AND estado = 'abierta' LIMIT 1;

        IF v_apertura_id IS NOT NULL THEN
            INSERT INTO movimientos_caja (tipo_movimiento, monto, moneda, descripcion, apertura_id, negocio_id)
            VALUES ('devolucion', NEW.total, NEW.moneda, 'Devolución ' || NEW.numero_devolucion, v_apertura_id, NEW.negocio_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================
-- 19. FUNCIÓN: HISTORIAL DE PRECIOS
-- =============================================

CREATE OR REPLACE FUNCTION registrar_cambio_precio()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_motivo TEXT;
BEGIN
    IF (OLD.precio_compra IS DISTINCT FROM NEW.precio_compra) OR
       (OLD.precio_venta IS DISTINCT FROM NEW.precio_venta) OR
       (OLD.margen_ganancia IS DISTINCT FROM NEW.margen_ganancia) THEN

        v_motivo := CASE
            WHEN OLD.precio_compra IS DISTINCT FROM NEW.precio_compra THEN 'Actualización de precio de compra'
            WHEN OLD.precio_venta IS DISTINCT FROM NEW.precio_venta THEN 'Actualización de precio de venta'
            ELSE 'Actualización de margen de ganancia'
        END;

        INSERT INTO historial_precios (producto_id, precio_compra_anterior, precio_compra_nuevo,
            precio_venta_anterior, precio_venta_nuevo, margen_anterior, margen_nuevo, motivo, usuario_id, negocio_id)
        VALUES (NEW.id, OLD.precio_compra, NEW.precio_compra, OLD.precio_venta, NEW.precio_venta,
            OLD.margen_ganancia, NEW.margen_ganancia, v_motivo, auth.uid(), NEW.negocio_id);
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================
-- 20. FUNCIONES DE AUDITORÍA
-- =============================================

CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, old_data, new_data, changed_by, negocio_id)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD)::JSONB ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::JSONB ELSE NULL END,
        auth.uid(),
        COALESCE(NEW.negocio_id, OLD.negocio_id)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- =============================================
-- 21. FUNCIÓN: VALIDACIÓN DE CONVERSIÓN DE UNIDADES
-- =============================================

CREATE OR REPLACE FUNCTION trigger_validar_conversion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.unidad_origen_id = NEW.unidad_destino_id THEN
        RAISE EXCEPTION 'Una unidad no puede convertirse a sí misma.';
    END IF;
    IF NEW.factor_conversion <= 0 THEN
        RAISE EXCEPTION 'El factor de conversión debe ser mayor que cero.';
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================
-- 22. FUNCIÓN: VER ESTADO DE TODOS LOS NEGOCIOS (Super Admin)
-- =============================================

CREATE OR REPLACE FUNCTION obtener_dashboard_admin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_es_super_admin BOOLEAN;
    v_resultado      JSONB;
BEGIN
    SELECT COALESCE(is_super_admin, FALSE) INTO v_es_super_admin FROM perfiles WHERE id = auth.uid();
    IF NOT COALESCE(v_es_super_admin, FALSE) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'No autorizado.', 'code', 'UNAUTHORIZED');
    END IF;

    SELECT jsonb_build_object(
        'total_negocios', COUNT(*),
        'en_prueba', COUNT(*) FILTER (WHERE plan_estado = 'prueba_gratis' AND plan_vencimiento > NOW()),
        'activos', COUNT(*) FILTER (WHERE plan_estado = 'activo' AND plan_vencimiento > NOW()),
        'vencidos', COUNT(*) FILTER (WHERE plan_estado = 'vencido' OR plan_vencimiento < NOW()),
        'suspendidos', COUNT(*) FILTER (WHERE plan_estado = 'suspendido'),
        'vencen_pronto', COUNT(*) FILTER (WHERE plan_vencimiento BETWEEN NOW() AND NOW() + INTERVAL '3 days')
    ) INTO v_resultado FROM configuracion;

    RETURN jsonb_build_object('success', TRUE, 'stats', v_resultado);
END;
$$;


-- =============================================
-- FUNCIONES FISCALES
-- =============================================

-- 23. FUNCIÓN TRIGGER: RECALCULAR TOTALES DE IMPUESTO EN ventas
-- Los triggers que la usan están en 04_triggers.sql

CREATE OR REPLACE FUNCTION recalcular_totales_impuesto_venta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_venta_id          UUID;
    v_impuesto_total    DECIMAL(10,2);
    v_impuesto_retenido DECIMAL(10,2);
BEGIN
    v_venta_id := COALESCE(NEW.venta_id, OLD.venta_id);

    -- Sumar impuestos positivos (IVA, IGV, etc.)
    SELECT COALESCE(SUM(monto_impuesto), 0)
    INTO v_impuesto_total
    FROM ventas_impuestos
    WHERE venta_id = v_venta_id AND es_retencion = FALSE;

    -- Sumar retenciones (RET_IVA, RET_RENTA)
    SELECT COALESCE(SUM(monto_impuesto), 0)
    INTO v_impuesto_retenido
    FROM ventas_impuestos
    WHERE venta_id = v_venta_id AND es_retencion = TRUE;

    -- Actualizar los campos de resumen en ventas
    UPDATE ventas
    SET impuesto_total    = v_impuesto_total,
        impuesto_retenido = v_impuesto_retenido,
        impuesto_neto     = v_impuesto_total - v_impuesto_retenido,
        -- Mantener impuesto_manual igual al total calculado para compatibilidad
        impuesto_manual   = v_impuesto_total,
        updated_at        = NOW()
    WHERE id = v_venta_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;
-- Trigger definido en 04_triggers.sql: trigger_recalcular_impuestos_venta

-- =============================================
-- FUNCIÓN: RECALCULAR SUBTOTALES EN ventas_detalle
-- =============================================

CREATE OR REPLACE FUNCTION recalcular_subtotal_detalle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.subtotal_con_descuento :=
        (NEW.cantidad * NEW.precio_unitario) - COALESCE(NEW.descuento_linea, 0);

    -- Guardar precio original si se agrega descuento
    IF NEW.descuento_linea > 0 AND NEW.precio_sin_descuento IS NULL THEN
        NEW.precio_sin_descuento := NEW.precio_unitario;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger definido en 04_triggers.sql: trigger_subtotal_detalle

-- =============================================
-- 3. TRIGGER: RECALCULAR DESGLOSE GRAVADO/EXENTO EN ventas
-- Cuando cambian las líneas de detalle, recalcular subtotal_gravado y subtotal_exento
-- =============================================

CREATE OR REPLACE FUNCTION recalcular_desglose_ventas()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_venta_id         UUID;
    v_gravado          DECIMAL(10,2);
    v_exento           DECIMAL(10,2);
BEGIN
    v_venta_id := COALESCE(NEW.venta_id, OLD.venta_id);

    SELECT
        COALESCE(SUM(CASE WHEN es_exento = FALSE THEN subtotal_con_descuento ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN es_exento = TRUE  THEN subtotal_con_descuento ELSE 0 END), 0)
    INTO v_gravado, v_exento
    FROM ventas_detalle
    WHERE venta_id = v_venta_id AND deleted_at IS NULL;

    UPDATE ventas
    SET subtotal_gravado = v_gravado,
        subtotal_exento  = v_exento,
        updated_at       = NOW()
    WHERE id = v_venta_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger definido en 04_triggers.sql: trigger_desglose_ventas

-- =============================================
-- 4. FUNCIÓN: CALCULAR IMPUESTOS DE UNA VENTA
-- Calcula y registra los impuestos en ventas_impuestos
-- basándose en los productos del detalle y la configuración del negocio
-- =============================================

CREATE OR REPLACE FUNCTION calcular_impuestos_venta(p_venta_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_venta         RECORD;
    v_detalle       RECORD;
    v_impuesto      RECORD;
    v_base          DECIMAL(10,2);
    v_monto         DECIMAL(10,2);
    v_tasa          DECIMAL(5,2);
    v_total_impuesto DECIMAL(10,2) := 0;
    v_items_procesados INTEGER := 0;
BEGIN
    -- Obtener datos de la venta
    SELECT v.*, c.pais_codigo
    INTO v_venta
    FROM ventas v
    JOIN configuracion c ON v.negocio_id = c.id
    WHERE v.id = p_venta_id;

    IF v_venta.id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Venta no encontrada.', 'code', 'NOT_FOUND');
    END IF;

    -- Limpiar impuestos previos (recalculo limpio)
    DELETE FROM ventas_impuestos WHERE venta_id = p_venta_id;

    -- Recorrer cada línea de detalle
    FOR v_detalle IN
        SELECT vd.id, vd.producto_id, vd.cantidad, vd.precio_unitario,
               COALESCE(vd.descuento_linea, 0) AS descuento_linea,
               COALESCE(vd.es_exento, FALSE) AS es_exento,
               COALESCE(vd.subtotal_con_descuento, vd.cantidad * vd.precio_unitario) AS base_linea
        FROM ventas_detalle vd
        WHERE vd.venta_id = p_venta_id AND vd.deleted_at IS NULL
    LOOP
        -- Si la línea está exenta, saltar
        IF v_detalle.es_exento THEN
            -- Actualizar la línea como exenta
            UPDATE ventas_detalle SET impuesto_linea = 0, tasa_impuesto_aplicada = 0, updated_at = NOW()
            WHERE id = v_detalle.id;
            CONTINUE;
        END IF;

        -- Buscar si el producto tiene impuesto especial
        -- Si no, usar el impuesto predeterminado del negocio
        FOR v_impuesto IN
            SELECT
                inp.id AS impuesto_negocio_id,
                COALESCE(ip_prod.tasa_especial, inp.tasa_personalizada, ip_cat.tasa) AS tasa_aplicada,
                cti.codigo AS codigo_impuesto,
                COALESCE(inp.nombre_personalizado, ip_cat.nombre_local, cti.nombre) AS nombre_impuesto,
                cti.es_retencion
            FROM impuestos_negocio inp
            JOIN impuestos_pais ip_cat ON inp.impuesto_pais_id = ip_cat.id
            JOIN catalogo_tipos_impuesto cti ON ip_cat.tipo_impuesto_id = cti.id
            LEFT JOIN impuestos_producto ip_prod
                ON ip_prod.impuesto_negocio_id = inp.id
                AND ip_prod.producto_id = v_detalle.producto_id
                AND ip_prod.exento = FALSE
            WHERE inp.negocio_id = v_venta.negocio_id
              AND inp.activo = TRUE
              AND (ip_prod.id IS NOT NULL OR inp.es_predeterminado = TRUE)
              AND cti.aplica_sobre IN ('subtotal', 'producto')
            ORDER BY inp.es_predeterminado DESC
            LIMIT 1
        LOOP
            v_tasa  := v_impuesto.tasa_aplicada;
            v_base  := v_detalle.base_linea;
            v_monto := ROUND(v_base * (v_tasa / 100), 2);

            -- Registrar en ventas_impuestos (agrupado por tipo)
            INSERT INTO ventas_impuestos (
                venta_id, impuesto_negocio_id, nombre_impuesto, tasa,
                base_imponible, monto_impuesto, es_retencion, negocio_id
            ) VALUES (
                p_venta_id, v_impuesto.impuesto_negocio_id, v_impuesto.nombre_impuesto, v_tasa,
                v_base, v_monto, v_impuesto.es_retencion, v_venta.negocio_id
            )
            ON CONFLICT DO NOTHING;

            -- Registrar desglose por línea
            INSERT INTO ventas_detalle_impuestos (
                venta_detalle_id, venta_id, impuesto_negocio_id, codigo_impuesto,
                nombre_impuesto, tasa, base_imponible, monto_impuesto, es_retencion, negocio_id
            ) VALUES (
                v_detalle.id, p_venta_id, v_impuesto.impuesto_negocio_id, v_impuesto.codigo_impuesto,
                v_impuesto.nombre_impuesto, v_tasa, v_base, v_monto, v_impuesto.es_retencion, v_venta.negocio_id
            );

            -- Actualizar la línea con el impuesto calculado
            UPDATE ventas_detalle
            SET impuesto_linea          = v_monto,
                tasa_impuesto_aplicada  = v_tasa,
                codigo_impuesto         = v_impuesto.codigo_impuesto
            WHERE id = v_detalle.id;

            v_total_impuesto := v_total_impuesto + v_monto;
        END LOOP;

        v_items_procesados := v_items_procesados + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'venta_id', p_venta_id,
        'items_procesados', v_items_procesados,
        'total_impuesto', v_total_impuesto
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- =============================================
-- 5. FUNCIÓN: VALIDAR FACTURA SEGÚN PAÍS
-- Verifica que todos los campos requeridos por el país estén presentes
-- antes de generar el documento formal
-- Retorna una lista de errores de validación (vacía si todo está bien)
-- =============================================

CREATE OR REPLACE FUNCTION validar_factura_para_pais(p_venta_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_venta      RECORD;
    v_negocio    RECORD;
    v_cliente    RECORD;
    v_plantilla  RECORD;
    v_errores    JSONB := '[]'::JSONB;
    v_avisos     JSONB := '[]'::JSONB;
BEGIN
    -- Obtener venta completa con datos del negocio
    SELECT
        v.*,
        c.pais_codigo,
        c.nombre_negocio,
        c.id_fiscal      AS negocio_id_fiscal,
        c.nombre_fiscal  AS negocio_nombre_fiscal,
        c.direccion      AS negocio_direccion,
        c.telefono       AS negocio_telefono,
        c.email          AS negocio_email
    INTO v_venta
    FROM ventas v
    JOIN configuracion c ON v.negocio_id = c.id
    WHERE v.id = p_venta_id;

    IF v_venta.id IS NULL THEN
        RETURN jsonb_build_object('valida', FALSE, 'errores', jsonb_build_array('Venta no encontrada'));
    END IF;

    -- Obtener plantilla del país (la vigente)
    SELECT * INTO v_plantilla
    FROM plantillas_factura_pais
    WHERE pais_codigo = v_venta.pais_codigo
      AND (vigente_hasta IS NULL OR vigente_hasta >= CURRENT_DATE)
    ORDER BY vigente_desde DESC
    LIMIT 1;

    -- Si no hay plantilla para el país, solo avisar pero no bloquear
    IF v_plantilla.id IS NULL THEN
        v_avisos := v_avisos || jsonb_build_object(
            'campo', 'pais',
            'mensaje', format('No hay plantilla de facturación definida para %s. Se usarán validaciones básicas.', v_venta.pais_codigo)
        );
    ELSE
        -- ---- VALIDACIONES SEGÚN PLANTILLA DEL PAÍS ----

        -- ID Fiscal del emisor (negocio)
        IF v_plantilla.requiere_id_fiscal_emisor AND (v_venta.negocio_id_fiscal IS NULL OR v_venta.negocio_id_fiscal = '') THEN
            v_errores := v_errores || jsonb_build_object(
                'campo', 'id_fiscal_negocio',
                'mensaje', format('El negocio requiere %s (ID fiscal del emisor) para facturar en %s.',
                    (SELECT formato_id_fiscal FROM catalogo_paises WHERE codigo = v_venta.pais_codigo),
                    v_venta.pais_codigo)
            );
        END IF;

        -- Nombre fiscal del emisor
        IF v_plantilla.requiere_nombre_fiscal_emisor AND (v_venta.negocio_nombre_fiscal IS NULL OR v_venta.negocio_nombre_fiscal = '') THEN
            v_errores := v_errores || jsonb_build_object(
                'campo', 'nombre_fiscal_negocio',
                'mensaje', 'Se requiere el nombre o razón social fiscal del negocio.'
            );
        END IF;

        -- Dirección del emisor
        IF v_plantilla.requiere_direccion_emisor AND (v_venta.negocio_direccion IS NULL OR v_venta.negocio_direccion = '') THEN
            v_errores := v_errores || jsonb_build_object(
                'campo', 'direccion_negocio',
                'mensaje', 'Se requiere la dirección fiscal del negocio.'
            );
        END IF;

        -- Datos del receptor (cliente) si la plantilla los requiere
        IF v_plantilla.requiere_id_fiscal_receptor OR v_plantilla.requiere_nombre_receptor THEN
            IF v_venta.cliente_id IS NULL THEN
                v_avisos := v_avisos || jsonb_build_object(
                    'campo', 'cliente',
                    'mensaje', 'Esta factura no tiene cliente asignado. Si el cliente es contribuyente, agregarlo para factura formal.'
                );
            ELSE
                SELECT * INTO v_cliente FROM clientes WHERE id = v_venta.cliente_id;

                IF v_plantilla.requiere_id_fiscal_receptor AND (v_cliente.id_fiscal IS NULL OR v_cliente.id_fiscal = '') THEN
                    v_avisos := v_avisos || jsonb_build_object(
                        'campo', 'id_fiscal_cliente',
                        'mensaje', 'El cliente no tiene ID fiscal. Si requiere factura a nombre de empresa, registrar el dato.'
                    );
                END IF;

                IF v_plantilla.requiere_nombre_receptor AND (v_cliente.nombre_fiscal IS NULL OR v_cliente.nombre_fiscal = '') THEN
                    v_avisos := v_avisos || jsonb_build_object(
                        'campo', 'nombre_fiscal_cliente',
                        'mensaje', 'El cliente no tiene nombre fiscal registrado.'
                    );
                END IF;
            END IF;
        END IF;

        -- Número de control (Venezuela)
        IF v_plantilla.requiere_numero_control AND (v_venta.numero_control_fiscal IS NULL OR v_venta.numero_control_fiscal = '') THEN
            v_errores := v_errores || jsonb_build_object(
                'campo', 'numero_control_fiscal',
                'mensaje', 'Se requiere número de control fiscal (Venezuela - SENIAT).'
            );
        END IF;

        -- Desglose de impuesto
        IF v_plantilla.requiere_desglose_impuesto THEN
            IF NOT EXISTS (SELECT 1 FROM ventas_impuestos WHERE venta_id = p_venta_id) THEN
                v_errores := v_errores || jsonb_build_object(
                    'campo', 'impuestos',
                    'mensaje', format('La factura en %s requiere desglose de impuestos (%s). Ejecutar calcular_impuestos_venta() primero.',
                        v_venta.pais_codigo, v_plantilla.etiqueta_impuesto)
                );
            END IF;
        END IF;

    END IF;

    -- ---- VALIDACIONES BÁSICAS (independientes del país) ----

    -- Número de factura
    IF v_venta.numero_factura IS NULL OR v_venta.numero_factura = '' THEN
        v_errores := v_errores || jsonb_build_object('campo', 'numero_factura', 'mensaje', 'La factura no tiene número asignado.');
    END IF;

    -- Estado de la venta (solo se puede facturar si está completada)
    IF v_venta.estado_venta NOT IN ('completada') THEN
        v_errores := v_errores || jsonb_build_object('campo', 'estado_venta', 'mensaje', format('Solo se pueden generar facturas de ventas completadas. Estado actual: %s', v_venta.estado_venta));
    END IF;

    -- Tiene líneas de detalle
    IF NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE venta_id = p_venta_id AND deleted_at IS NULL) THEN
        v_errores := v_errores || jsonb_build_object('campo', 'detalle', 'mensaje', 'La venta no tiene productos en el detalle.');
    END IF;

    -- Total mayor a cero
    IF COALESCE(v_venta.total, 0) <= 0 THEN
        v_errores := v_errores || jsonb_build_object('campo', 'total', 'mensaje', 'El total de la venta debe ser mayor a cero.');
    END IF;

    RETURN jsonb_build_object(
        'valida',        jsonb_array_length(v_errores) = 0,
        'pais',          v_venta.pais_codigo,
        'numero_errores', jsonb_array_length(v_errores),
        'numero_avisos',  jsonb_array_length(v_avisos),
        'errores',       v_errores,
        'avisos',        v_avisos
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('valida', FALSE, 'errores', jsonb_build_array(SQLERRM));
END;
$$;

-- =============================================
-- 6. FUNCIÓN: OBTENER DATOS COMPLETOS DE FACTURA
-- Devuelve todo lo necesario para renderizar la factura
-- en el frontend o generar el PDF
-- =============================================

CREATE OR REPLACE FUNCTION obtener_datos_factura(p_venta_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_venta     RECORD;
    v_negocio   RECORD;
    v_cliente   RECORD;
    v_pais      RECORD;
    v_plantilla RECORD;
    v_formato   RECORD;
    v_lineas    JSONB;
    v_impuestos JSONB;
BEGIN
    -- Venta
    SELECT * INTO v_venta FROM ventas WHERE id = p_venta_id;
    IF v_venta.id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Venta no encontrada.');
    END IF;

    -- Negocio
    SELECT * INTO v_negocio FROM configuracion WHERE id = v_venta.negocio_id;

    -- Cliente (puede ser NULL para ventas al público general)
    IF v_venta.cliente_id IS NOT NULL THEN
        SELECT * INTO v_cliente FROM clientes WHERE id = v_venta.cliente_id;
    END IF;

    -- País
    SELECT * INTO v_pais FROM catalogo_paises WHERE codigo = v_negocio.pais_codigo;

    -- Plantilla del país
    SELECT * INTO v_plantilla
    FROM plantillas_factura_pais
    WHERE pais_codigo = v_negocio.pais_codigo
      AND (vigente_hasta IS NULL OR vigente_hasta >= CURRENT_DATE)
    ORDER BY vigente_desde DESC LIMIT 1;

    -- Formato del negocio
    SELECT * INTO v_formato FROM facturas_formato WHERE negocio_id = v_venta.negocio_id;

    -- Líneas de detalle con impuestos por línea
    SELECT jsonb_agg(
        jsonb_build_object(
            'id',              vd.id,
            'nombre_producto', COALESCE(vd.nombre_producto, p.nombre, 'Producto'),
            'codigo_barras',   p.codigo_barras,
            'cantidad',        vd.cantidad,
            'unidad',          u.abreviatura,
            'precio_unitario', vd.precio_unitario,
            'precio_sin_descuento', vd.precio_sin_descuento,
            'descuento_linea', COALESCE(vd.descuento_linea, 0),
            'subtotal',        COALESCE(vd.subtotal_con_descuento, vd.cantidad * vd.precio_unitario),
            'es_exento',       COALESCE(vd.es_exento, FALSE),
            'impuesto_linea',  COALESCE(vd.impuesto_linea, 0),
            'tasa_impuesto',   vd.tasa_impuesto_aplicada,
            'codigo_impuesto', vd.codigo_impuesto,
            'total_linea',     COALESCE(vd.subtotal_con_descuento, vd.cantidad * vd.precio_unitario) + COALESCE(vd.impuesto_linea, 0)
        ) ORDER BY vd.created_at
    )
    INTO v_lineas
    FROM ventas_detalle vd
    LEFT JOIN productos p ON vd.producto_id = p.id
    LEFT JOIN unidades  u ON vd.unidad_id = u.id
    WHERE vd.venta_id = p_venta_id AND vd.deleted_at IS NULL;

    -- Impuestos agrupados por tipo
    SELECT jsonb_agg(
        jsonb_build_object(
            'codigo',         vi.nombre_impuesto,
            'tasa',           vi.tasa,
            'base_imponible', vi.base_imponible,
            'monto',          vi.monto_impuesto,
            'es_retencion',   vi.es_retencion,
            'etiqueta',       vi.tasa || '% ' || vi.nombre_impuesto
        ) ORDER BY vi.es_retencion, vi.tasa DESC
    )
    INTO v_impuestos
    FROM ventas_impuestos vi
    WHERE vi.venta_id = p_venta_id;

    -- Construir respuesta completa
    RETURN jsonb_build_object(
        'success', TRUE,

        -- Encabezado del documento
        'documento', jsonb_build_object(
            'tipo',              COALESCE(v_venta.tipo_documento_fiscal, 'factura'),
            'numero',            v_venta.numero_factura,
            'consecutivo',       v_venta.consecutivo,
            'fecha_emision',     v_venta.created_at,
            'condicion_pago',    COALESCE(v_venta.condicion_pago_fiscal, v_venta.tipo_venta),
            'moneda',            v_venta.moneda,
            'tasa_cambio',       v_venta.tasa_cambio,
            'notas',             v_venta.notas,
            -- Campos fiscales según país
            'numero_control_fiscal', v_venta.numero_control_fiscal,
            'cufe',              v_venta.cufe,
            'uuid_fiscal',       v_venta.uuid_fiscal,
            'clave_acceso',      v_venta.clave_acceso,
            'cuf',               v_venta.cuf,
            'cae',               v_venta.cae
        ),

        -- Datos del emisor (negocio)
        'emisor', jsonb_build_object(
            'nombre',        v_negocio.nombre_negocio,
            'nombre_fiscal', COALESCE(v_negocio.nombre_fiscal, v_negocio.nombre_negocio),
            'id_fiscal',     v_negocio.id_fiscal,
            'formato_id',    v_pais.formato_id_fiscal,
            'direccion',     v_negocio.direccion,
            'telefono',      v_negocio.telefono,
            'email',         v_negocio.email,
            'pais',          v_pais.nombre,
            'pais_codigo',   v_negocio.pais_codigo,
            'regimen_fiscal', v_negocio.regimen_fiscal,
            'logo_url',      v_negocio.logo_url
        ),

        -- Datos del receptor (cliente o consumidor final)
        'receptor', CASE
            WHEN v_cliente.id IS NOT NULL THEN
                jsonb_build_object(
                    'nombre',         v_cliente.nombre || ' ' || COALESCE(v_cliente.apellido, ''),
                    'nombre_fiscal',  COALESCE(v_cliente.nombre_fiscal, v_cliente.nombre),
                    'id_fiscal',      v_cliente.id_fiscal,
                    'tipo_documento', v_cliente.tipo_documento,
                    'numero_documento', v_cliente.numero_documento,
                    'direccion',      COALESCE(v_cliente.direccion_fiscal, v_cliente.direccion),
                    'email',          v_cliente.email_fiscal,
                    'telefono',       v_cliente.celular
                )
            ELSE
                jsonb_build_object(
                    'nombre', 'Consumidor Final',
                    'id_fiscal', NULL,
                    'direccion', NULL
                )
        END,

        -- Líneas de detalle
        'lineas', COALESCE(v_lineas, '[]'::JSONB),

        -- Totales
        'totales', jsonb_build_object(
            'subtotal',           v_venta.subtotal,
            'subtotal_gravado',   COALESCE(v_venta.subtotal_gravado, v_venta.subtotal),
            'subtotal_exento',    COALESCE(v_venta.subtotal_exento, 0),
            'descuento',          COALESCE(v_venta.descuento, 0),
            'impuesto_total',     COALESCE(v_venta.impuesto_total, v_venta.impuesto_manual, 0),
            'impuesto_retenido',  COALESCE(v_venta.impuesto_retenido, 0),
            'impuesto_neto',      COALESCE(v_venta.impuesto_neto, v_venta.impuesto_manual, 0),
            'total',              v_venta.total,
            'total_moneda_base',  v_venta.total_moneda_base
        ),

        -- Desglose de impuestos
        'impuestos', COALESCE(v_impuestos, '[]'::JSONB),

        -- Configuración de formato para renderizar
        'formato', jsonb_build_object(
            'papel',              COALESCE(v_formato.formato_papel, 'carta'),
            'prefijo',            COALESCE(v_formato.prefijo, ''),
            'mensaje_pie',        v_formato.mensaje_pie,
            'terminos',           v_formato.terminos_condiciones,
            'mostrar_logo',       COALESCE(v_formato.mostrar_logo, TRUE),
            'mostrar_tasa_cambio', COALESCE(v_formato.mostrar_tasa_cambio, FALSE),
            'cantidad_letras',    COALESCE(v_formato.mostrar_cantidad_letras, TRUE),
            'digitos_numero',     COALESCE(v_formato.digitos_numero, 6)
        ),

        -- Etiquetas según país (para el PDF)
        'etiquetas', jsonb_build_object(
            'impuesto',       COALESCE(v_plantilla.etiqueta_impuesto, v_pais.impuesto_principal, 'IVA'),
            'base_imponible', COALESCE(v_plantilla.etiqueta_base_imponible, 'Base Imponible'),
            'exento',         COALESCE(v_plantilla.etiqueta_exento, 'Exento'),
            'nombre_documento', COALESCE(v_plantilla.nombre_documento, 'Factura'),
            'moneda_singular', COALESCE(v_plantilla.moneda_nombre_singular, 'Unidad'),
            'moneda_plural',   COALESCE(v_plantilla.moneda_nombre_plural, 'Unidades'),
            'centavos_singular', COALESCE(v_plantilla.centavos_nombre_singular, 'Centavo'),
            'centavos_plural',   COALESCE(v_plantilla.centavos_nombre_plural, 'Centavos'),
            'texto_legal',     v_plantilla.texto_legal_obligatorio
        )
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM, 'code', 'DB_ERROR');
END;
$$;

-- (Datos de plantillas_factura_pais en 02_data_inserts.sql)

-- =============================================
-- FUNCIÓN: CREAR FORMATO DE FACTURA POR DEFECTO
-- Se ejecuta automáticamente al crear un negocio (trigger)
-- =============================================

CREATE OR REPLACE FUNCTION crear_formato_factura_default()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO facturas_formato (
        negocio_id,
        mostrar_logo, mostrar_direccion, mostrar_telefono,
        mostrar_email, mostrar_id_fiscal,
        prefijo, siguiente_numero, digitos_numero,
        formato_papel, mostrar_cantidad_letras,
        mostrar_tasa_cambio
    ) VALUES (
        NEW.id,
        TRUE, TRUE, TRUE,
        TRUE, TRUE,
        COALESCE(NEW.prefijo_factura, 'FAC-'), NEW.siguiente_numero_factura, 6,
        'carta', TRUE,
        FALSE
    )
    ON CONFLICT (negocio_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- =============================================
-- FIN DEL ARCHIVO DE FUNCIONES
-- =============================================
