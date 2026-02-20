-- =============================================
-- SISTEMA POS V2 - ESTRUCTURA COMPLETA
-- Archivo 1 de 5: Tablas, índices y constraints
-- =============================================
-- ORDEN DE EJECUCIÓN:
--   01_database_structure.sql  ← ESTE ARCHIVO
--   02_data_inserts.sql
--   03_functions.sql
--   04_triggers.sql
--   05_permissions.sql
--
-- LÓGICA DE PLANES:
--   Negocio normal      → 7 días gratis → pago/activación manual
--   Super Admin Global  → sin vencimiento, acceso total a todo
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CATÁLOGOS GLOBALES (sin tenant, solo lectura)
-- =============================================

CREATE TABLE IF NOT EXISTS catalogo_monedas (
    codigo      VARCHAR(10) PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    nombre_en   VARCHAR(100),
    simbolo     VARCHAR(10) NOT NULL,
    decimales   INT DEFAULT 2 CHECK (decimales BETWEEN 0 AND 8),
    pais_origen VARCHAR(100),
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_catalogo_monedas_activo ON catalogo_monedas(activo);

CREATE TABLE IF NOT EXISTS catalogo_paises (
    codigo                       VARCHAR(3) PRIMARY KEY,
    nombre                       VARCHAR(100) NOT NULL,
    nombre_fiscal                VARCHAR(100),
    codigo_telefono              VARCHAR(10),
    moneda_oficial               VARCHAR(10),
    requiere_factura_electronica BOOLEAN DEFAULT FALSE,
    autoridad_fiscal             VARCHAR(100),
    url_autoridad_fiscal         TEXT,
    formato_id_fiscal            VARCHAR(50),
    patron_id_fiscal             VARCHAR(100),
    impuesto_principal           VARCHAR(50) DEFAULT 'IVA',
    tasa_impuesto_general        DECIMAL(5,2) DEFAULT 0,
    tasa_impuesto_reducida       DECIMAL(5,2),
    activo                       BOOLEAN DEFAULT TRUE,
    created_at                   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalogo_tipos_impuesto (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo       VARCHAR(20) NOT NULL UNIQUE,
    nombre       VARCHAR(100) NOT NULL,
    descripcion  TEXT,
    tipo_calculo VARCHAR(20) DEFAULT 'porcentaje'
        CHECK (tipo_calculo IN ('porcentaje', 'fijo', 'formula')),
    aplica_sobre VARCHAR(20) DEFAULT 'subtotal'
        CHECK (aplica_sobre IN ('subtotal', 'total', 'producto')),
    es_retencion BOOLEAN DEFAULT FALSE,
    activo       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impuestos_pais (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pais_codigo       VARCHAR(3) NOT NULL REFERENCES catalogo_paises(codigo) ON DELETE CASCADE,
    tipo_impuesto_id  UUID NOT NULL REFERENCES catalogo_tipos_impuesto(id) ON DELETE CASCADE,
    nombre_local      VARCHAR(100),
    tasa              DECIMAL(5,2) NOT NULL,
    es_predeterminado BOOLEAN DEFAULT FALSE,
    orden_aplicacion  INTEGER DEFAULT 1,
    activo            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pais_codigo, tipo_impuesto_id, tasa)
);

-- =============================================
-- CONFIGURACIÓN Y PERFILES (núcleo multi-tenant)
-- =============================================
-- ORDEN: configuracion → perfiles → alter FK configuracion→perfiles
-- plan_estado: 'prueba_gratis' | 'activo' | 'vencido' | 'suspendido'
-- tipo_plan:   'free' | 'mensual' | 'anual'

CREATE TABLE IF NOT EXISTS configuracion (
    id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre_negocio           TEXT NOT NULL,
    nombre_completo          TEXT NOT NULL,
    direccion                TEXT NOT NULL,
    telefono                 TEXT NOT NULL,
    email                    TEXT NOT NULL,
    owner_id                 UUID NOT NULL REFERENCES auth.users(id),
    pais_codigo              VARCHAR(3) NOT NULL REFERENCES catalogo_paises(codigo),
    id_fiscal                TEXT,
    nombre_fiscal            TEXT,
    regimen_fiscal           TEXT,
    moneda_base              VARCHAR(10) DEFAULT 'USD' NOT NULL,
    tipo_negocio             TEXT DEFAULT 'bodega' NOT NULL,
    usa_factura_electronica  BOOLEAN DEFAULT FALSE,
    prefijo_factura          VARCHAR(10),
    siguiente_numero_factura INTEGER DEFAULT 1,
    logo_url                 TEXT,
    -- Suscripción
    plan_estado              TEXT DEFAULT 'prueba_gratis' NOT NULL
        CHECK (plan_estado IN ('prueba_gratis', 'activo', 'vencido', 'suspendido')),
    plan_vencimiento         TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    tipo_plan                TEXT DEFAULT 'free' NOT NULL
        CHECK (tipo_plan IN ('free', 'mensual', 'anual')),
    fecha_inicio_plan        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activado_por             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notas_admin              TEXT,
    created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PERFILES
-- is_super_admin = TRUE  → Admin Global de la plataforma (negocio_id = NULL, sin restricción de plan)
-- is_super_admin = FALSE → Usuario de un negocio específico
CREATE TABLE IF NOT EXISTS perfiles (
    id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre_completo TEXT,
    rol             TEXT CHECK (rol IN ('super_admin', 'admin', 'cajero', 'vendedor', 'contador')),
    is_super_admin  BOOLEAN DEFAULT FALSE NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    negocio_id      UUID REFERENCES configuracion(id) ON DELETE SET NULL,
    telefono        TEXT,
    direccion       TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Re-vincular owner_id → perfiles (permite JOINs directos en Supabase)
ALTER TABLE configuracion DROP CONSTRAINT IF EXISTS configuracion_owner_id_fkey;
ALTER TABLE configuracion
    ADD CONSTRAINT configuracion_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES perfiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_configuracion_owner_id       ON configuracion(owner_id);
CREATE INDEX IF NOT EXISTS idx_configuracion_plan_estado    ON configuracion(plan_estado);
CREATE INDEX IF NOT EXISTS idx_configuracion_plan_vencimiento ON configuracion(plan_vencimiento);
CREATE INDEX IF NOT EXISTS idx_perfiles_negocio_id          ON perfiles(negocio_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_is_super_admin      ON perfiles(is_super_admin) WHERE is_super_admin = TRUE;

-- =============================================
-- FORMATO DE FACTURAS POR NEGOCIO
-- =============================================

CREATE TABLE IF NOT EXISTS facturas_formato (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negocio_id            UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE UNIQUE,
    mostrar_logo          BOOLEAN DEFAULT TRUE,
    mostrar_direccion     BOOLEAN DEFAULT TRUE,
    mostrar_telefono      BOOLEAN DEFAULT TRUE,
    mostrar_email         BOOLEAN DEFAULT TRUE,
    mostrar_id_fiscal     BOOLEAN DEFAULT TRUE,
    mensaje_pie           TEXT,
    terminos_condiciones  TEXT,
    politica_devolucion   TEXT,
    prefijo               VARCHAR(10),
    siguiente_numero      INTEGER DEFAULT 1,
    digitos_numero        INTEGER DEFAULT 6,
    usar_consecutivo_separado_notas     BOOLEAN DEFAULT TRUE,
    siguiente_numero_nota_debito        INTEGER DEFAULT 1,
    siguiente_numero_nota_credito       INTEGER DEFAULT 1,
    formato_papel         TEXT DEFAULT 'carta'
        CHECK (formato_papel IN ('carta','media_carta','ticket_58mm','ticket_80mm','a4','oficio')),
    mostrar_cantidad_letras BOOLEAN DEFAULT TRUE,
    moneda_letras_idioma  TEXT DEFAULT 'es',
    mostrar_tasa_cambio   BOOLEAN DEFAULT FALSE,
    mostrar_codigo_barras BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PLANTILLAS DE FACTURA POR PAÍS (catálogo global)
-- Define qué campos son obligatorios para que la factura sea legal
-- =============================================

CREATE TABLE IF NOT EXISTS plantillas_factura_pais (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pais_codigo                 VARCHAR(3) NOT NULL REFERENCES catalogo_paises(codigo) ON DELETE CASCADE,
    version                     TEXT DEFAULT '1.0',
    vigente_desde               DATE DEFAULT CURRENT_DATE,
    vigente_hasta               DATE,
    nombre_documento            TEXT NOT NULL,
    requiere_id_fiscal_emisor   BOOLEAN DEFAULT TRUE,
    requiere_nombre_fiscal_emisor BOOLEAN DEFAULT TRUE,
    requiere_direccion_emisor   BOOLEAN DEFAULT TRUE,
    requiere_id_fiscal_receptor BOOLEAN DEFAULT FALSE,
    requiere_nombre_receptor    BOOLEAN DEFAULT FALSE,
    requiere_direccion_receptor BOOLEAN DEFAULT FALSE,
    requiere_numero_control     BOOLEAN DEFAULT FALSE,
    requiere_numero_acceso      BOOLEAN DEFAULT FALSE,
    requiere_desglose_impuesto  BOOLEAN DEFAULT TRUE,
    requiere_base_imponible     BOOLEAN DEFAULT TRUE,
    requiere_subtotal_exento    BOOLEAN DEFAULT FALSE,
    requiere_condicion_pago     BOOLEAN DEFAULT FALSE,
    requiere_vendedor           BOOLEAN DEFAULT FALSE,
    requiere_numero_factura     BOOLEAN DEFAULT TRUE,
    requiere_fecha_emision      BOOLEAN DEFAULT TRUE,
    patron_id_fiscal_emisor     TEXT,
    patron_id_fiscal_receptor   TEXT,
    texto_legal_obligatorio     TEXT,
    texto_exento_obligatorio    TEXT,
    etiqueta_impuesto           TEXT,
    etiqueta_base_imponible     TEXT,
    etiqueta_exento             TEXT,
    moneda_nombre_singular      TEXT,
    moneda_nombre_plural        TEXT,
    centavos_nombre_singular    TEXT,
    centavos_nombre_plural      TEXT,
    notas                       TEXT,
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pais_codigo, version)
);
CREATE INDEX IF NOT EXISTS idx_plantillas_pais     ON plantillas_factura_pais(pais_codigo);
CREATE INDEX IF NOT EXISTS idx_plantillas_vigentes ON plantillas_factura_pais(pais_codigo) WHERE vigente_hasta IS NULL;

-- =============================================
-- MONEDAS POR NEGOCIO
-- =============================================

CREATE TABLE IF NOT EXISTS monedas (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo               VARCHAR(10) NOT NULL,
    nombre               VARCHAR(50) NOT NULL,
    simbolo              VARCHAR(10) NOT NULL,
    decimales            INT DEFAULT 2 CHECK (decimales BETWEEN 0 AND 8),
    tasa_cambio          DECIMAL(18,6) DEFAULT 1.000000,
    es_base              BOOLEAN DEFAULT FALSE,
    activo               BOOLEAN DEFAULT TRUE,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    negocio_id           UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    UNIQUE(negocio_id, codigo)
);

CREATE TABLE IF NOT EXISTS tasas_cambio (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    moneda_origen_id  UUID REFERENCES monedas(id) ON DELETE CASCADE,
    moneda_destino_id UUID REFERENCES monedas(id) ON DELETE CASCADE,
    tasa_cambio       DECIMAL(18,6) NOT NULL,
    fecha_tasa        DATE DEFAULT CURRENT_DATE,
    fuente            VARCHAR(100) DEFAULT 'Sistema',
    negocio_id        UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(moneda_origen_id, moneda_destino_id, fecha_tasa, negocio_id)
);

-- =============================================
-- CATEGORÍAS Y UNIDADES
-- =============================================

CREATE TABLE IF NOT EXISTS categorias (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre      TEXT NOT NULL,
    descripcion TEXT,
    activo      BOOLEAN DEFAULT TRUE,
    negocio_id  UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipos_unidad (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo          TEXT NOT NULL,
    nombre          TEXT NOT NULL,
    es_fraccionable BOOLEAN DEFAULT FALSE,
    activo          BOOLEAN DEFAULT TRUE,
    negocio_id      UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(negocio_id, codigo)
);

CREATE TABLE IF NOT EXISTS unidades (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre            TEXT NOT NULL,
    abreviatura       TEXT NOT NULL,
    permite_decimales BOOLEAN DEFAULT FALSE,
    tipo_unidad_id    UUID REFERENCES tipos_unidad(id) ON DELETE CASCADE,
    factor_conversion DECIMAL(10,4) DEFAULT 1,
    es_principal      BOOLEAN DEFAULT FALSE,
    activo            BOOLEAN DEFAULT TRUE,
    negocio_id        UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversiones_unidad (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unidad_origen_id  UUID REFERENCES unidades(id) ON DELETE CASCADE,
    unidad_destino_id UUID REFERENCES unidades(id) ON DELETE CASCADE,
    factor_conversion DECIMAL(10,4) NOT NULL CHECK (factor_conversion > 0),
    negocio_id        UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(unidad_origen_id, unidad_destino_id, negocio_id)
);

-- =============================================
-- PRODUCTOS
-- =============================================

CREATE TABLE IF NOT EXISTS productos (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre            TEXT NOT NULL,
    codigo_barras     VARCHAR(50),
    precio_compra     DECIMAL(10,2) DEFAULT 0,
    precio_venta      DECIMAL(10,2) DEFAULT 0,
    margen_ganancia   DECIMAL(10,2) DEFAULT 30,
    stock             DECIMAL(10,3) DEFAULT 0,
    stock_minimo      DECIMAL(10,3) DEFAULT 5,
    fecha_vencimiento DATE,
    categoria_id      UUID REFERENCES categorias(id) ON DELETE SET NULL,
    unidad_id         UUID REFERENCES unidades(id) ON DELETE SET NULL,
    activo            BOOLEAN DEFAULT TRUE,
    busqueda_fts      TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('spanish', nombre || ' ' || COALESCE(codigo_barras, ''))
    ) STORED,
    negocio_id        UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_productos_negocio_activo ON productos(negocio_id, activo);
CREATE INDEX IF NOT EXISTS idx_productos_fts            ON productos USING GIN(busqueda_fts);

-- =============================================
-- IMPUESTOS POR NEGOCIO
-- =============================================

CREATE TABLE IF NOT EXISTS impuestos_negocio (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    negocio_id           UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    impuesto_pais_id     UUID NOT NULL REFERENCES impuestos_pais(id) ON DELETE CASCADE,
    nombre_personalizado VARCHAR(100),
    tasa_personalizada   DECIMAL(5,2),
    es_predeterminado    BOOLEAN DEFAULT FALSE,
    activo               BOOLEAN DEFAULT TRUE,
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(negocio_id, impuesto_pais_id)
);

CREATE TABLE IF NOT EXISTS impuestos_producto (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id         UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    impuesto_negocio_id UUID NOT NULL REFERENCES impuestos_negocio(id) ON DELETE CASCADE,
    tasa_especial       DECIMAL(5,2),
    exento              BOOLEAN DEFAULT FALSE,
    negocio_id          UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producto_id, impuesto_negocio_id)
);

-- =============================================
-- CLIENTES
-- =============================================

CREATE TABLE IF NOT EXISTS clientes (
    id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre             TEXT NOT NULL,
    apellido           TEXT,
    tipo_documento     TEXT,
    numero_documento   TEXT,
    celular            TEXT,
    direccion          TEXT,
    tipo_cliente       TEXT DEFAULT 'regular',
    limite_credito     DECIMAL(10,2) DEFAULT 0,
    credito_disponible DECIMAL(10,2) DEFAULT 0,
    dias_credito       INTEGER DEFAULT 0,
    id_fiscal          TEXT,
    nombre_fiscal      TEXT,
    direccion_fiscal   TEXT,
    email_fiscal       TEXT,
    requiere_factura   BOOLEAN DEFAULT FALSE,
    activo             BOOLEAN DEFAULT TRUE,
    busqueda_fts       TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('spanish', nombre || ' ' || COALESCE(apellido,'') || ' ' || COALESCE(numero_documento,''))
    ) STORED,
    negocio_id         UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clientes_fts     ON clientes USING GIN(busqueda_fts);
CREATE INDEX IF NOT EXISTS idx_clientes_negocio ON clientes(negocio_id);

-- =============================================
-- VENTAS (con desglose fiscal completo)
-- =============================================

CREATE TABLE IF NOT EXISTS ventas (
    id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_factura         TEXT NOT NULL,
    cliente_id             UUID REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    consecutivo            INTEGER,

    -- Totales monetarios
    subtotal               DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal_gravado       DECIMAL(10,2) DEFAULT 0,   -- líneas que pagan impuesto
    subtotal_exento        DECIMAL(10,2) DEFAULT 0,   -- líneas exentas
    subtotal_no_sujeto     DECIMAL(10,2) DEFAULT 0,   -- sin sujeción (El Salvador, etc.)
    descuento              DECIMAL(10,2) DEFAULT 0,

    -- Impuestos (calculados automáticamente por trigger desde ventas_impuestos)
    impuesto_manual        DECIMAL(10,2) DEFAULT 0,   -- campo heredado / compatibilidad
    impuesto_total         DECIMAL(10,2) DEFAULT 0,   -- suma de impuestos positivos
    impuesto_retenido      DECIMAL(10,2) DEFAULT 0,   -- retenciones (RET_IVA, RET_RENTA)
    impuesto_neto          DECIMAL(10,2) DEFAULT 0,   -- impuesto_total - impuesto_retenido

    total                  DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Pago y estado
    metodo_pago            TEXT,
    estado_pago            TEXT CHECK (estado_pago IN ('pendiente','pagado','parcial','anulado')),
    estado_venta           TEXT CHECK (estado_venta IN ('borrador','completada','anulada')),
    tipo_venta             TEXT CHECK (tipo_venta IN ('contado','credito')),
    fecha_vencimiento_pago DATE,
    condicion_pago_fiscal  TEXT,          -- "Contado", "30 días" — texto para la factura
    vendedor_nombre        TEXT,          -- puede diferir del usuario_id

    -- Moneda
    moneda                 VARCHAR(10) DEFAULT 'USD',
    tasa_cambio            DECIMAL(10,4) DEFAULT 1,
    total_moneda_base      DECIMAL(10,2),

    -- Tipo de documento fiscal
    tipo_documento_fiscal  TEXT DEFAULT 'factura'
        CHECK (tipo_documento_fiscal IN (
            'factura','factura_simplificada','nota_debito',
            'nota_credito','ticket','recibo','proforma'
        )),

    -- Campos fiscales por país
    cae                    TEXT,   -- Argentina (AFIP)
    cuf                    TEXT,   -- Bolivia (SIN)
    cufe                   TEXT,   -- Colombia (DIAN)
    uuid_fiscal            TEXT,   -- México (SAT/PAC)
    clave_acceso           TEXT,   -- Ecuador (SRI)
    numero_control_fiscal  TEXT,   -- Venezuela (SENIAT)
    fecha_emision_fiscal   TIMESTAMP WITH TIME ZONE,

    notas                  TEXT,
    datos_facturacion      JSONB,  -- datos adicionales sin estructura fija

    negocio_id             UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(negocio_id, consecutivo)
);
CREATE INDEX IF NOT EXISTS idx_ventas_negocio_fecha ON ventas(negocio_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_tipo_doc      ON ventas(negocio_id, tipo_documento_fiscal);
CREATE INDEX IF NOT EXISTS idx_ventas_estado        ON ventas(negocio_id, estado_pago, estado_venta);

-- Impuestos de la venta (uno por tipo de impuesto aplicado)
CREATE TABLE IF NOT EXISTS ventas_impuestos (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id            UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    impuesto_negocio_id UUID NOT NULL REFERENCES impuestos_negocio(id) ON DELETE RESTRICT,
    nombre_impuesto     VARCHAR(100) NOT NULL,
    tasa                DECIMAL(5,2) NOT NULL,
    base_imponible      DECIMAL(10,2) NOT NULL,
    monto_impuesto      DECIMAL(10,2) NOT NULL,
    es_retencion        BOOLEAN DEFAULT FALSE,
    negocio_id          UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ventas_impuestos_venta ON ventas_impuestos(venta_id);

-- Detalle de venta (líneas de productos)
CREATE TABLE IF NOT EXISTS ventas_detalle (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id                UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id             UUID REFERENCES productos(id) ON DELETE SET NULL,
    unidad_id               UUID REFERENCES unidades(id) ON DELETE SET NULL,
    cantidad                DECIMAL(10,3) NOT NULL CHECK (cantidad > 0),
    precio_unitario         DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    precio_sin_descuento    DECIMAL(10,2),               -- precio original antes del descuento
    descuento_linea         DECIMAL(10,2) DEFAULT 0,     -- descuento sobre esta línea
    subtotal_linea          DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    subtotal_con_descuento  DECIMAL(10,2),               -- (cantidad * precio_unitario) - descuento_linea
    es_exento               BOOLEAN DEFAULT FALSE,        -- esta línea no aplica impuesto
    impuesto_linea          DECIMAL(10,2) DEFAULT 0,     -- impuesto calculado solo de esta línea
    tasa_impuesto_aplicada  DECIMAL(5,2),                -- tasa usada (ej: 16.00)
    codigo_impuesto         TEXT,                         -- "IVA", "IGV", "ITBMS"
    total_linea             DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    moneda                  VARCHAR(10) DEFAULT 'USD',
    nombre_producto         TEXT,                         -- snapshot del nombre al momento de venta
    fecha_vencimiento       DATE,
    negocio_id              UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    deleted_at              TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ventas_detalle_venta ON ventas_detalle(venta_id);

-- Impuesto desglosado por línea (para facturas que requieren detalle por ítem)
CREATE TABLE IF NOT EXISTS ventas_detalle_impuestos (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_detalle_id    UUID NOT NULL REFERENCES ventas_detalle(id) ON DELETE CASCADE,
    venta_id            UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    impuesto_negocio_id UUID NOT NULL REFERENCES impuestos_negocio(id) ON DELETE RESTRICT,
    codigo_impuesto     TEXT NOT NULL,
    nombre_impuesto     TEXT NOT NULL,
    tasa                DECIMAL(5,2) NOT NULL,
    base_imponible      DECIMAL(10,2) NOT NULL,
    monto_impuesto      DECIMAL(10,2) NOT NULL,
    es_retencion        BOOLEAN DEFAULT FALSE,
    negocio_id          UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vdi_venta_detalle ON ventas_detalle_impuestos(venta_detalle_id);
CREATE INDEX IF NOT EXISTS idx_vdi_venta         ON ventas_detalle_impuestos(venta_id);

-- =============================================
-- ENTRADAS DE INVENTARIO
-- =============================================

CREATE TABLE IF NOT EXISTS entradas_inventario (
    id                       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_entrada           TEXT NOT NULL,
    consecutivo              INTEGER,
    tipo_entrada             TEXT DEFAULT 'compra'
        CHECK (tipo_entrada IN ('compra','ajuste_positivo','ajuste_negativo',
               'devolucion_proveedor','traslado_entrada','inventario_inicial','produccion','otro')),
    proveedor_nombre         TEXT,
    proveedor_documento      TEXT,
    proveedor_telefono       TEXT,
    proveedor_direccion      TEXT,
    proveedor_email          TEXT,
    subtotal                 DECIMAL(10,2) DEFAULT 0,
    descuento                DECIMAL(10,2) DEFAULT 0,
    impuesto                 DECIMAL(10,2) DEFAULT 0,
    total                    DECIMAL(10,2) DEFAULT 0,
    moneda                   VARCHAR(10) DEFAULT 'USD',
    tasa_cambio              DECIMAL(10,4) DEFAULT 1,
    total_moneda_base        DECIMAL(10,2),
    numero_factura_proveedor TEXT,
    fecha_factura_proveedor  DATE,
    metodo_pago              TEXT,
    notas                    TEXT,
    estado                   TEXT DEFAULT 'completada'
        CHECK (estado IN ('borrador','completada','anulada')),
    fecha_entrada            DATE DEFAULT CURRENT_DATE,
    negocio_id               UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(negocio_id, consecutivo)
);

CREATE TABLE IF NOT EXISTS entradas_inventario_detalle (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entrada_id        UUID NOT NULL REFERENCES entradas_inventario(id) ON DELETE CASCADE,
    producto_id       UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    unidad_id         UUID REFERENCES unidades(id) ON DELETE SET NULL,
    cantidad          DECIMAL(10,3) NOT NULL CHECK (cantidad > 0),
    precio_compra     DECIMAL(10,2) NOT NULL CHECK (precio_compra >= 0),
    descuento_linea   DECIMAL(10,2) DEFAULT 0,
    subtotal_linea    DECIMAL(10,2) GENERATED ALWAYS AS (
        cantidad * precio_compra - COALESCE(descuento_linea, 0)
    ) STORED,
    lote              TEXT,
    fecha_vencimiento DATE,
    fecha_fabricacion DATE,
    stock_actualizado BOOLEAN DEFAULT FALSE,
    nombre_producto   TEXT,
    negocio_id        UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DEVOLUCIONES
-- =============================================

CREATE TABLE IF NOT EXISTS devoluciones (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_devolucion     TEXT NOT NULL,
    tipo_devolucion       TEXT DEFAULT 'cliente'
        CHECK (tipo_devolucion IN ('cliente','proveedor')),
    venta_id              UUID REFERENCES ventas(id) ON DELETE RESTRICT,
    cliente_id            UUID REFERENCES clientes(id) ON DELETE SET NULL,
    entrada_inventario_id UUID REFERENCES entradas_inventario(id) ON DELETE RESTRICT,
    proveedor_nombre      TEXT,
    proveedor_documento   TEXT,
    proveedor_telefono    TEXT,
    motivo                TEXT NOT NULL
        CHECK (motivo IN ('defectuoso','equivocado','no_satisfecho','vencido','dañado','exceso','otro')),
    descripcion           TEXT,
    subtotal              DECIMAL(10,2) DEFAULT 0,
    impuesto              DECIMAL(10,2) DEFAULT 0,
    total                 DECIMAL(10,2) NOT NULL DEFAULT 0,
    moneda                VARCHAR(10) DEFAULT 'USD',
    tasa_cambio           DECIMAL(10,4) DEFAULT 1,
    metodo_devolucion     TEXT DEFAULT 'efectivo'
        CHECK (metodo_devolucion IN ('efectivo','credito_tienda','reembolso',
               'cambio_producto','nota_credito','descuento_proxima_compra','reemplazo')),
    estado                TEXT DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','aprobada','rechazada','procesada','anulada')),
    aprobada_por          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha_aprobacion      TIMESTAMP WITH TIME ZONE,
    notas                 TEXT,
    negocio_id            UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_devolucion_tipo CHECK (
        (tipo_devolucion = 'cliente'    AND venta_id IS NOT NULL) OR
        (tipo_devolucion = 'proveedor'  AND entrada_inventario_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS devoluciones_detalle (
    id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    devolucion_id      UUID NOT NULL REFERENCES devoluciones(id) ON DELETE CASCADE,
    venta_detalle_id   UUID REFERENCES ventas_detalle(id) ON DELETE SET NULL,
    entrada_detalle_id UUID REFERENCES entradas_inventario_detalle(id) ON DELETE SET NULL,
    producto_id        UUID REFERENCES productos(id) ON DELETE SET NULL,
    unidad_id          UUID REFERENCES unidades(id) ON DELETE SET NULL,
    cantidad           DECIMAL(10,3) NOT NULL CHECK (cantidad > 0),
    precio_unitario    DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal_linea     DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    devolver_stock     BOOLEAN DEFAULT TRUE,
    stock_devuelto     BOOLEAN DEFAULT FALSE,
    lote               TEXT,
    fecha_vencimiento  DATE,
    nombre_producto    TEXT,
    negocio_id         UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CAJAS Y APERTURAS
-- =============================================

CREATE TABLE IF NOT EXISTS cajas (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo     TEXT NOT NULL,
    nombre     TEXT NOT NULL,
    ubicacion  TEXT,
    activa     BOOLEAN DEFAULT TRUE,
    negocio_id UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(negocio_id, codigo)
);

CREATE TABLE IF NOT EXISTS aperturas_caja (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    caja_id              UUID REFERENCES cajas(id) ON DELETE CASCADE,
    usuario_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notas_cierre         TEXT,
    tasa_cambio_apertura DECIMAL(10,4),
    fecha_apertura       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_cierre         TIMESTAMP WITH TIME ZONE,
    estado               TEXT DEFAULT 'abierta'
        CHECK (estado IN ('abierta','cerrada','auditada')),
    negocio_id           UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saldos_apertura_moneda (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    apertura_id    UUID NOT NULL REFERENCES aperturas_caja(id) ON DELETE CASCADE,
    moneda_id      UUID NOT NULL REFERENCES monedas(id) ON DELETE RESTRICT,
    monto_apertura DECIMAL(12,2) DEFAULT 0,
    ingresos       DECIMAL(12,2) DEFAULT 0,
    egresos        DECIMAL(12,2) DEFAULT 0,
    saldo_final    DECIMAL(12,2) DEFAULT 0,
    conteo_fisico  DECIMAL(12,2) DEFAULT 0,
    diferencia     DECIMAL(12,2) DEFAULT 0,
    negocio_id     UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(apertura_id, moneda_id)
);

-- =============================================
-- GASTOS Y MOVIMIENTOS
-- =============================================

CREATE TABLE IF NOT EXISTS gastos (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    descripcion     TEXT NOT NULL,
    monto           DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    moneda          VARCHAR(10) DEFAULT 'USD',
    tasa_cambio     DECIMAL(18,6) DEFAULT 1,
    monto_base      DECIMAL(10,2),
    categoria       TEXT,
    metodo_pago     TEXT DEFAULT 'efectivo',
    fecha_gasto     DATE DEFAULT CURRENT_DATE,
    comprobante_url TEXT,
    notas           TEXT,
    usuario_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    apertura_id     UUID REFERENCES aperturas_caja(id) ON DELETE SET NULL,
    negocio_id      UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimientos_caja (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_movimiento TEXT NOT NULL
        CHECK (tipo_movimiento IN ('apertura','venta','gasto','ingreso','cierre','abono','devolucion','retiro')),
    monto           DECIMAL(10,2) NOT NULL,
    moneda          TEXT DEFAULT 'USD',
    descripcion     TEXT,
    metodo_pago     TEXT,
    referencia      TEXT,
    usuario_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    caja_id         UUID REFERENCES cajas(id) ON DELETE SET NULL,
    apertura_id     UUID REFERENCES aperturas_caja(id) ON DELETE SET NULL,
    venta_id        UUID REFERENCES ventas(id) ON DELETE SET NULL,
    gasto_id        UUID REFERENCES gastos(id) ON DELETE SET NULL,
    negocio_id      UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_movimientos_negocio ON movimientos_caja(negocio_id, created_at DESC);

-- =============================================
-- CRÉDITOS Y FIADOS
-- =============================================

CREATE TABLE IF NOT EXISTS fiados (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id        UUID REFERENCES clientes(id) ON DELETE CASCADE,
    venta_id          UUID REFERENCES ventas(id) ON DELETE CASCADE,
    descripcion       TEXT,
    monto_total       DECIMAL(10,2) NOT NULL,
    saldo_pendiente   DECIMAL(10,2) NOT NULL,
    moneda            VARCHAR(10) DEFAULT 'USD',
    fecha_fiado       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento DATE,
    fecha_pago        TIMESTAMP WITH TIME ZONE,
    estado            TEXT DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente','parcial','pagado','vencido','anulado')),
    negocio_id        UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_by        UUID REFERENCES auth.users(id),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abonos (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fiado_id        UUID REFERENCES fiados(id) ON DELETE CASCADE,
    cliente_id      UUID REFERENCES clientes(id) ON DELETE CASCADE,
    monto           DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    moneda          VARCHAR(10) DEFAULT 'USD',
    tasa_cambio     DECIMAL(10,4) DEFAULT 1,
    metodo_pago     TEXT,
    referencia_pago TEXT,
    nota            TEXT,
    confirmado      BOOLEAN DEFAULT TRUE,
    negocio_id      UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_by      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- HISTORIAL Y AUDITORÍA
-- =============================================

CREATE TABLE IF NOT EXISTS historial_stock (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id       UUID REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id        UUID REFERENCES auth.users(id),
    cantidad_anterior DECIMAL(10,3),
    cantidad_nueva    DECIMAL(10,3),
    tipo_movimiento   TEXT,
    referencia_id     UUID,
    referencia_tabla  TEXT,
    motivo            TEXT,
    negocio_id        UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_precios (
    id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id            UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    precio_compra_anterior DECIMAL(10,2),
    precio_compra_nuevo    DECIMAL(10,2),
    precio_venta_anterior  DECIMAL(10,2),
    precio_venta_nuevo     DECIMAL(10,2),
    margen_anterior        DECIMAL(10,2),
    margen_nuevo           DECIMAL(10,2),
    motivo                 TEXT,
    usuario_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    negocio_id             UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- historial_credito con FK reales a fiados y abonos
CREATE TABLE IF NOT EXISTS historial_credito (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
    fiado_id        UUID REFERENCES fiados(id) ON DELETE SET NULL,   -- FK real
    abono_id        UUID REFERENCES abonos(id) ON DELETE SET NULL,   -- FK real
    venta_id        UUID REFERENCES ventas(id) ON DELETE SET NULL,
    tipo_movimiento TEXT,
    tipo_documento  TEXT,   -- 'factura', 'nota_credito', 'abono'
    monto           DECIMAL(10,2),
    moneda          TEXT,
    deuda_anterior  DECIMAL(10,2),
    deuda_nueva     DECIMAL(10,2),
    descripcion     TEXT,
    negocio_id      UUID NOT NULL REFERENCES configuracion(id) ON DELETE CASCADE,
    usuario_id      UUID REFERENCES auth.users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_historial_credito_cliente ON historial_credito(cliente_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name  TEXT NOT NULL,
    record_id   UUID,
    operation   TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
    old_data    JSONB,
    new_data    JSONB,
    changed_by  UUID REFERENCES auth.users(id),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    negocio_id  UUID REFERENCES configuracion(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_negocio ON audit_logs(negocio_id, created_at DESC);

-- =============================================
-- FIN DEL ARCHIVO DE ESTRUCTURA
-- =============================================
