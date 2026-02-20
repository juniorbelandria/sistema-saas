-- =============================================
-- SISTEMA POS V2 - PERMISOS Y ROW LEVEL SECURITY
-- Archivo 4 de 6: Permisos (RLS)
-- =============================================
-- REGLAS DE ACCESO:
--   is_super_admin = TRUE  → Ve TODOS los negocios, sin restricción de plan
--   is_super_admin = FALSE → Solo ve su propio negocio (negocio_id)
--   Plan vencido/suspendido → Bloqueado por triggers (no por RLS)
--   Catálogos globales → Sin RLS (datos de solo lectura para todos)
-- =============================================

-- =============================================
-- PARTE 1: HABILITAR RLS
-- =============================================

-- Tablas de Configuración (Multi-tenancy)
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles      ENABLE ROW LEVEL SECURITY;

-- Catálogos Globales: SIN RLS (son de solo lectura pública)
ALTER TABLE catalogo_monedas         DISABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_paises          DISABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_tipos_impuesto  DISABLE ROW LEVEL SECURITY;
ALTER TABLE impuestos_pais           DISABLE ROW LEVEL SECURITY;

-- Tablas de Negocio (Multi-tenancy por negocio_id)
ALTER TABLE monedas                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasas_cambio               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_unidad               ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversiones_unidad        ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE impuestos_negocio          ENABLE ROW LEVEL SECURITY;
ALTER TABLE impuestos_producto         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_impuestos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_detalle             ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas_inventario        ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas_inventario_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones               ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones_detalle       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cajas                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE aperturas_caja             ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldos_apertura_moneda     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiados                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_stock            ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_credito          ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_precios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                 ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PARTE 2: GRANTS DE PERMISOS
-- =============================================

-- Rol: anon (no autenticado) → solo catálogos públicos
GRANT SELECT ON catalogo_monedas TO anon;
GRANT SELECT ON catalogo_paises  TO anon;

-- Rol: authenticated → catálogos globales (solo lectura) + tablas de negocio (controlado por RLS)
GRANT SELECT ON catalogo_monedas        TO authenticated;
GRANT SELECT ON catalogo_paises         TO authenticated;
GRANT SELECT ON catalogo_tipos_impuesto TO authenticated;
GRANT SELECT ON impuestos_pais          TO authenticated;

GRANT ALL ON configuracion                 TO authenticated;
GRANT ALL ON perfiles                      TO authenticated;
GRANT ALL ON monedas                       TO authenticated;
GRANT ALL ON tasas_cambio                  TO authenticated;
GRANT ALL ON categorias                    TO authenticated;
GRANT ALL ON tipos_unidad                  TO authenticated;
GRANT ALL ON unidades                      TO authenticated;
GRANT ALL ON conversiones_unidad           TO authenticated;
GRANT ALL ON productos                     TO authenticated;
GRANT ALL ON impuestos_negocio             TO authenticated;
GRANT ALL ON impuestos_producto            TO authenticated;
GRANT ALL ON clientes                      TO authenticated;
GRANT ALL ON ventas                        TO authenticated;
GRANT ALL ON ventas_impuestos              TO authenticated;
GRANT ALL ON ventas_detalle                TO authenticated;
GRANT ALL ON entradas_inventario           TO authenticated;
GRANT ALL ON entradas_inventario_detalle   TO authenticated;
GRANT ALL ON devoluciones                  TO authenticated;
GRANT ALL ON devoluciones_detalle          TO authenticated;
GRANT ALL ON cajas                         TO authenticated;
GRANT ALL ON aperturas_caja                TO authenticated;
GRANT ALL ON saldos_apertura_moneda        TO authenticated;
GRANT ALL ON gastos                        TO authenticated;
GRANT ALL ON movimientos_caja              TO authenticated;
GRANT ALL ON fiados                        TO authenticated;
GRANT ALL ON abonos                        TO authenticated;
GRANT ALL ON historial_stock               TO authenticated;
GRANT ALL ON historial_credito             TO authenticated;
GRANT ALL ON historial_precios             TO authenticated;
GRANT ALL ON audit_logs                    TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Rol: service_role → acceso total (backend / cron jobs)
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================
-- PARTE 3: FUNCIONES HELPER PARA RLS
-- CRÍTICO: Usar SECURITY DEFINER + STABLE para performance en RLS
-- =============================================

-- Obtener negocio_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_negocio_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT negocio_id FROM perfiles WHERE id = auth.uid();
$$;

-- Verificar si el usuario es Super Admin GLOBAL (is_super_admin = TRUE)
-- Esta cuenta NO pertenece a ningún negocio y puede ver TODO.
CREATE OR REPLACE FUNCTION is_super_admin_global()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM perfiles
        WHERE id = auth.uid() AND is_super_admin = TRUE AND activo = TRUE
    );
$$;

-- Verificar si el usuario es admin de su propio negocio (rol admin o super_admin, pero NO global)
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM perfiles
        WHERE id = auth.uid()
          AND rol IN ('super_admin', 'admin')
          AND activo = TRUE
    );
$$;

-- Verificar si el usuario tiene un rol específico dentro de su negocio
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM perfiles
        WHERE id = auth.uid() AND rol = required_role AND activo = TRUE
    );
$$;

-- Verificar si el usuario tiene alguno de varios roles
CREATE OR REPLACE FUNCTION check_user_role(allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM perfiles
        WHERE id = auth.uid() AND rol = ANY(allowed_roles) AND activo = TRUE
    );
$$;

-- =============================================
-- PARTE 4: POLÍTICAS RLS - CONFIGURACION (Negocios)
-- =============================================

DROP POLICY IF EXISTS "config_select" ON configuracion;
DROP POLICY IF EXISTS "config_insert" ON configuracion;
DROP POLICY IF EXISTS "config_update" ON configuracion;
DROP POLICY IF EXISTS "config_delete" ON configuracion;

-- Ver: dueño del negocio O super admin global
CREATE POLICY "config_select" ON configuracion FOR SELECT
    USING (owner_id = auth.uid() OR is_super_admin_global());

-- Insertar: el usuario inserta su propio negocio (owner_id = su id)
CREATE POLICY "config_insert" ON configuracion FOR INSERT
    WITH CHECK (owner_id = auth.uid() OR is_super_admin_global());

-- Actualizar: solo el dueño O super admin global
CREATE POLICY "config_update" ON configuracion FOR UPDATE
    USING (owner_id = auth.uid() OR is_super_admin_global());

-- Eliminar: solo super admin global (protección extra)
CREATE POLICY "config_delete" ON configuracion FOR DELETE
    USING (is_super_admin_global());

-- =============================================
-- PARTE 5: POLÍTICAS RLS - PERFILES
-- =============================================

DROP POLICY IF EXISTS "perfiles_select_own"   ON perfiles;
DROP POLICY IF EXISTS "perfiles_select_admin" ON perfiles;
DROP POLICY IF EXISTS "perfiles_update_own"   ON perfiles;
DROP POLICY IF EXISTS "perfiles_insert"       ON perfiles;
DROP POLICY IF EXISTS "perfiles_delete"       ON perfiles;

-- Cada usuario ve su propio perfil; admins ven los de su negocio; super admin global ve todos
CREATE POLICY "perfiles_select_own" ON perfiles FOR SELECT
    USING (
        id = auth.uid()                                                 -- Mi propio perfil
        OR (negocio_id = get_user_negocio_id() AND is_user_admin())    -- Admin de mi negocio ve su equipo
        OR is_super_admin_global()                                      -- Super admin ve todos
    );

-- Cada usuario puede actualizar su propio perfil (datos básicos); admin puede cambiar rol de su equipo
CREATE POLICY "perfiles_update_own" ON perfiles FOR UPDATE
    USING (
        id = auth.uid()
        OR (negocio_id = get_user_negocio_id() AND is_user_admin())
        OR is_super_admin_global()
    );

-- Insertar perfil: solo el propio usuario (vía trigger handle_new_user) o super admin global
CREATE POLICY "perfiles_insert" ON perfiles FOR INSERT
    WITH CHECK (id = auth.uid() OR is_super_admin_global());

-- Eliminar perfiles: solo super admin global
CREATE POLICY "perfiles_delete" ON perfiles FOR DELETE
    USING (is_super_admin_global());

-- =============================================
-- PARTE 6: POLÍTICAS RLS - TABLAS DE NEGOCIO (Multi-tenancy)
-- Patrón estándar: negocio_id = mi negocio O super admin global
-- =============================================

-- MONEDAS
DROP POLICY IF EXISTS "Ver monedas"      ON monedas;
DROP POLICY IF EXISTS "Gestionar monedas" ON monedas;
CREATE POLICY "Ver monedas"       ON monedas FOR SELECT
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Gestionar monedas" ON monedas FOR ALL
    USING ((negocio_id = get_user_negocio_id() AND is_user_admin()) OR is_super_admin_global());

-- PRODUCTOS
DROP POLICY IF EXISTS "Ver productos"      ON productos;
DROP POLICY IF EXISTS "Insertar productos" ON productos;
DROP POLICY IF EXISTS "Actualizar productos" ON productos;
DROP POLICY IF EXISTS "Eliminar productos" ON productos;
CREATE POLICY "Ver productos"       ON productos FOR SELECT
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Insertar productos"  ON productos FOR INSERT
    WITH CHECK (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Actualizar productos" ON productos FOR UPDATE
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Eliminar productos"  ON productos FOR DELETE
    USING ((negocio_id = get_user_negocio_id() AND is_user_admin()) OR is_super_admin_global());

-- VENTAS
DROP POLICY IF EXISTS "Ver ventas"      ON ventas;
DROP POLICY IF EXISTS "Gestionar ventas" ON ventas;
CREATE POLICY "Ver ventas"       ON ventas FOR SELECT
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Gestionar ventas" ON ventas FOR ALL
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());

DROP POLICY IF EXISTS "Gestionar ventas_detalle" ON ventas_detalle;
CREATE POLICY "Gestionar ventas_detalle" ON ventas_detalle FOR ALL
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());

-- CLIENTES
DROP POLICY IF EXISTS "Ver clientes"      ON clientes;
DROP POLICY IF EXISTS "Gestionar clientes" ON clientes;
CREATE POLICY "Ver clientes"       ON clientes FOR SELECT
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Gestionar clientes" ON clientes FOR ALL
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());

-- CAJAS
DROP POLICY IF EXISTS "Ver cajas"      ON cajas;
DROP POLICY IF EXISTS "Gestionar cajas" ON cajas;
CREATE POLICY "Ver cajas"       ON cajas FOR SELECT
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Gestionar cajas" ON cajas FOR ALL
    USING ((negocio_id = get_user_negocio_id() AND is_user_admin()) OR is_super_admin_global());

-- MOVIMIENTOS
DROP POLICY IF EXISTS "Gestionar movimientos" ON movimientos_caja;
CREATE POLICY "Gestionar movimientos" ON movimientos_caja FOR ALL
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());

-- GASTOS
DROP POLICY IF EXISTS "Ver gastos"      ON gastos;
DROP POLICY IF EXISTS "Insertar gastos" ON gastos;
CREATE POLICY "Ver gastos"      ON gastos FOR SELECT
    USING (negocio_id = get_user_negocio_id() OR is_super_admin_global());
CREATE POLICY "Insertar gastos" ON gastos FOR INSERT
    WITH CHECK (negocio_id = get_user_negocio_id() OR is_super_admin_global());

-- AUDIT LOGS → solo admins o contadores ven los logs de su negocio; super admin global ve todos
DROP POLICY IF EXISTS "Ver audit logs" ON audit_logs;
CREATE POLICY "Ver audit logs" ON audit_logs FOR SELECT
    USING (
        (negocio_id = get_user_negocio_id() AND check_user_role(ARRAY['super_admin', 'admin', 'contador']))
        OR is_super_admin_global()
    );

-- =============================================
-- PARTE 7: POLÍTICAS GENÉRICAS PARA TABLAS RESTANTES
-- Para las tablas que siguen el patrón estándar: negocio_id = mi negocio
-- =============================================

DO $$
DECLARE
    t_name TEXT;
    tables_list TEXT[] := ARRAY[
        'tasas_cambio', 'categorias', 'tipos_unidad', 'unidades', 'conversiones_unidad',
        'impuestos_negocio', 'impuestos_producto', 'ventas_impuestos',
        'entradas_inventario', 'entradas_inventario_detalle',
        'devoluciones', 'devoluciones_detalle',
        'aperturas_caja', 'saldos_apertura_moneda',
        'fiados', 'abonos',
        'historial_stock', 'historial_credito', 'historial_precios'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables_list LOOP
        EXECUTE format('DROP POLICY IF EXISTS "policy_%I" ON %I', t_name, t_name);
        EXECUTE format(
            'CREATE POLICY "policy_%I" ON %I FOR ALL
             USING (negocio_id = get_user_negocio_id() OR is_super_admin_global())',
            t_name, t_name
        );
    END LOOP;
END $$;

-- =============================================
-- PARTE 8: ÍNDICES PARA OPTIMIZAR RLS
-- =============================================

CREATE INDEX IF NOT EXISTS idx_rls_perfiles_negocio
    ON perfiles(negocio_id) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_rls_perfiles_super_admin
    ON perfiles(is_super_admin) WHERE is_super_admin = TRUE;
CREATE INDEX IF NOT EXISTS idx_rls_productos_negocio
    ON productos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_rls_ventas_negocio
    ON ventas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_rls_clientes_negocio
    ON clientes(negocio_id);
CREATE INDEX IF NOT EXISTS idx_rls_movimientos_negocio
    ON movimientos_caja(negocio_id);

-- =============================================
-- PARTE 9: COMENTARIOS DE DOCUMENTACIÓN
-- =============================================

COMMENT ON FUNCTION get_user_negocio_id() IS
    'Devuelve el negocio_id del usuario autenticado. NULL si es super admin global.';
COMMENT ON FUNCTION is_super_admin_global() IS
    'TRUE si el usuario es Super Admin Global (is_super_admin=TRUE). Estos usuarios tienen acceso total a todos los negocios y no son bloqueados por restricciones de suscripción.';
COMMENT ON FUNCTION activar_plan_negocio(UUID, TEXT, INTEGER) IS
    'Activa el plan de pago de un negocio. Solo puede ser llamada por un Super Admin Global.';
COMMENT ON FUNCTION gestionar_estado_negocio(UUID, TEXT, TEXT) IS
    'Suspende, reactiva o marca como vencido un negocio. Solo Super Admin Global.';
COMMENT ON COLUMN configuracion.plan_estado IS
    'Estado de suscripción: prueba_gratis (7 días al registrar), activo (pagó), vencido (expiró), suspendido (bloqueado manualmente).';
COMMENT ON COLUMN configuracion.plan_vencimiento IS
    'Fecha de vencimiento del plan actual. Al vencer, el trigger de suscripción bloquea operaciones.';
COMMENT ON COLUMN perfiles.is_super_admin IS
    'TRUE = Super Admin Global de la plataforma. Acceso total, sin restricción de plan, negocio_id = NULL. FALSE = Usuario normal del negocio.';

-- =============================================
-- FIN DEL ARCHIVO DE PERMISOS
-- =============================================
