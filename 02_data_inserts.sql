-- =============================================
-- SISTEMA POS V2 - DATOS INICIALES
-- Archivo 5 de 6: Inserts de Catálogos
-- =============================================
-- Ejecutar DESPUÉS de crear las tablas (01_database_structure.sql)
-- =============================================

-- =============================================
-- 1. CATÁLOGO DE PAÍSES CON CONFIGURACIÓN FISCAL
-- =============================================

INSERT INTO catalogo_paises (
    codigo, nombre, nombre_fiscal, codigo_telefono, moneda_oficial,
    requiere_factura_electronica, autoridad_fiscal, formato_id_fiscal,
    impuesto_principal, tasa_impuesto_general, tasa_impuesto_reducida
) VALUES
    ('VEN', 'Venezuela',            'República Bolivariana de Venezuela', '+58',   'VES', TRUE,  'SENIAT', 'RIF',             'IVA',   16.00,  8.00),
    ('COL', 'Colombia',             'República de Colombia',              '+57',   'COP', TRUE,  'DIAN',   'NIT',             'IVA',   19.00,  5.00),
    ('MEX', 'México',               'Estados Unidos Mexicanos',           '+52',   'MXN', TRUE,  'SAT',    'RFC',             'IVA',   16.00,  0.00),
    ('ARG', 'Argentina',            'República Argentina',                '+54',   'ARS', TRUE,  'AFIP',   'CUIT',            'IVA',   21.00, 10.50),
    ('CHL', 'Chile',                'República de Chile',                 '+56',   'CLP', TRUE,  'SII',    'RUT',             'IVA',   19.00,  NULL),
    ('PER', 'Perú',                 'República del Perú',                 '+51',   'PEN', TRUE,  'SUNAT',  'RUC',             'IGV',   18.00,  NULL),
    ('ECU', 'Ecuador',              'República del Ecuador',              '+593',  'USD', TRUE,  'SRI',    'RUC',             'IVA',   15.00,  5.00),
    ('BOL', 'Bolivia',              'Estado Plurinacional de Bolivia',    '+591',  'BOB', TRUE,  'SIN',    'NIT',             'IVA',   13.00,  NULL),
    ('PRY', 'Paraguay',             'República del Paraguay',             '+595',  'PYG', TRUE,  'SET',    'RUC',             'IVA',   10.00,  5.00),
    ('URY', 'Uruguay',              'República Oriental del Uruguay',     '+598',  'UYU', TRUE,  'DGI',    'RUT',             'IVA',   22.00, 10.00),
    ('PAN', 'Panamá',               'República de Panamá',                '+507',  'PAB', TRUE,  'DGI',    'RUC',             'ITBMS',  7.00,  NULL),
    ('CRI', 'Costa Rica',           'República de Costa Rica',            '+506',  'CRC', TRUE,  'DGT',    'Cédula Jurídica', 'IVA',   13.00,  NULL),
    ('GTM', 'Guatemala',            'República de Guatemala',             '+502',  'GTQ', TRUE,  'SAT',    'NIT',             'IVA',   12.00,  NULL),
    ('HND', 'Honduras',             'República de Honduras',              '+504',  'HNL', TRUE,  'SAR',    'RTN',             'ISV',   15.00,  NULL),
    ('NIC', 'Nicaragua',            'República de Nicaragua',             '+505',  'NIO', TRUE,  'DGI',    'RUC',             'IVA',   15.00,  NULL),
    ('DOM', 'República Dominicana', 'República Dominicana',               '+1-809','DOP', TRUE,  'DGII',   'RNC',             'ITBIS', 18.00,  NULL),
    ('USA', 'Estados Unidos',       'United States of America',           '+1',    'USD', FALSE, 'IRS',    'EIN',             'Sales Tax', 0.00, NULL),
    ('ESP', 'España',               'Reino de España',                    '+34',   'EUR', TRUE,  'AEAT',   'NIF/CIF',         'IVA',   21.00, 10.00)
ON CONFLICT (codigo) DO NOTHING;

-- =============================================
-- 2. TIPOS DE IMPUESTOS (Catálogo Global)
-- =============================================

INSERT INTO catalogo_tipos_impuesto (codigo, nombre, descripcion, tipo_calculo, aplica_sobre, es_retencion) VALUES
    ('IVA',      'Impuesto al Valor Agregado',                                  'Impuesto general sobre ventas',                     'porcentaje', 'subtotal', FALSE),
    ('IGV',      'Impuesto General a las Ventas',                               'Impuesto peruano sobre ventas',                     'porcentaje', 'subtotal', FALSE),
    ('ITBMS',    'Impuesto de Transferencia de Bienes Muebles y Servicios',     'Impuesto panameño',                                 'porcentaje', 'subtotal', FALSE),
    ('ITBIS',    'Impuesto sobre Transferencias de Bienes y Servicios',         'Impuesto dominicano',                               'porcentaje', 'subtotal', FALSE),
    ('ISV',      'Impuesto Sobre Ventas',                                        'Impuesto hondureño sobre ventas',                   'porcentaje', 'subtotal', FALSE),
    ('IGTF',     'Impuesto a las Grandes Transacciones Financieras',             'Impuesto venezolano sobre divisas',                 'porcentaje', 'total',    FALSE),
    ('ISC',      'Impuesto Selectivo al Consumo',                                'Impuesto sobre productos específicos',              'porcentaje', 'producto', FALSE),
    ('IEPS',     'Impuesto Especial sobre Producción y Servicios',               'Impuesto mexicano sobre productos específicos',     'porcentaje', 'producto', FALSE),
    ('ICE',      'Impuesto a los Consumos Especiales',                           'Impuesto ecuatoriano sobre productos específicos',  'porcentaje', 'producto', FALSE),
    ('RET_IVA',  'Retención de IVA',                                             'Retención aplicada por el comprador',               'porcentaje', 'subtotal', TRUE),
    ('RET_RENTA','Retención en la Fuente',                                        'Retención sobre la renta',                          'porcentaje', 'subtotal', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- =============================================
-- 3. IMPUESTOS POR PAÍS (Tasas específicas)
-- =============================================

INSERT INTO impuestos_pais (pais_codigo, tipo_impuesto_id, nombre_local, tasa, es_predeterminado, orden_aplicacion)
SELECT 'VEN', id, 'IVA General',      16.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'VEN', id, 'IVA Reducido',      8.00, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'VEN', id, 'IGTF (Divisas)',    3.00, FALSE, 2 FROM catalogo_tipos_impuesto WHERE codigo = 'IGTF'
UNION ALL
SELECT 'COL', id, 'IVA General',      19.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'COL', id, 'IVA Reducido',      5.00, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'COL', id, 'Retención IVA',    15.00, FALSE, 2 FROM catalogo_tipos_impuesto WHERE codigo = 'RET_IVA'
UNION ALL
SELECT 'MEX', id, 'IVA General',      16.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'MEX', id, 'IVA Frontera',      8.00, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'ARG', id, 'IVA General',      21.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'ARG', id, 'IVA Reducido',     10.50, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'CHL', id, 'IVA',             19.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'PER', id, 'IGV',             18.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IGV'
UNION ALL
SELECT 'ECU', id, 'IVA General',      15.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'ECU', id, 'IVA Reducido',      5.00, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'BOL', id, 'IVA',             13.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'PRY', id, 'IVA General',      10.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'PRY', id, 'IVA Reducido',      5.00, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'URY', id, 'IVA General',      22.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'URY', id, 'IVA Reducido',     10.00, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'PAN', id, 'ITBMS',            7.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'ITBMS'
UNION ALL
SELECT 'CRI', id, 'IVA',             13.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'GTM', id, 'IVA',             12.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'HND', id, 'ISV',             15.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'ISV'
UNION ALL
SELECT 'NIC', id, 'IVA',             15.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'DOM', id, 'ITBIS',           18.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'ITBIS'
UNION ALL
SELECT 'ESP', id, 'IVA General',      21.00, TRUE,  1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
UNION ALL
SELECT 'ESP', id, 'IVA Reducido',     10.00, FALSE, 1 FROM catalogo_tipos_impuesto WHERE codigo = 'IVA'
ON CONFLICT (pais_codigo, tipo_impuesto_id, tasa) DO NOTHING;

-- =============================================
-- 4. CATÁLOGO GLOBAL DE MONEDAS (ISO 4217)
-- =============================================

INSERT INTO catalogo_monedas (codigo, nombre, nombre_en, simbolo, decimales, pais_origen) VALUES
    ('USD',  'Dólar Estadounidense',  'US Dollar',           '$',    2, 'Estados Unidos'),
    ('EUR',  'Euro',                  'Euro',                'EUR',  2, 'Unión Europea'),
    ('VES',  'Bolívar Digital',       'Venezuelan Bolivar',  'Bs',   2, 'Venezuela'),
    ('VED',  'Bolívar Digital',       'Venezuelan Digital Bolivar', 'Bs', 2, 'Venezuela'),
    ('COP',  'Peso Colombiano',       'Colombian Peso',      '$',    0, 'Colombia'),
    ('MXN',  'Peso Mexicano',         'Mexican Peso',        '$',    2, 'México'),
    ('CAD',  'Dólar Canadiense',      'Canadian Dollar',     'C$',   2, 'Canadá'),
    ('PEN',  'Sol Peruano',           'Peruvian Sol',        'S/',   2, 'Perú'),
    ('ARS',  'Peso Argentino',        'Argentine Peso',      '$',    2, 'Argentina'),
    ('CLP',  'Peso Chileno',          'Chilean Peso',        '$',    0, 'Chile'),
    ('BRL',  'Real Brasileño',        'Brazilian Real',      'R$',   2, 'Brasil'),
    ('UYU',  'Peso Uruguayo',         'Uruguayan Peso',      '$U',   2, 'Uruguay'),
    ('BOB',  'Boliviano',             'Bolivian Boliviano',  'Bs.',  2, 'Bolivia'),
    ('PYG',  'Guaraní',               'Paraguayan Guarani',  'GS',   0, 'Paraguay'),
    ('DOP',  'Peso Dominicano',       'Dominican Peso',      'RD$',  2, 'República Dominicana'),
    ('CRC',  'Colón Costarricense',   'Costa Rican Colon',   'C',    2, 'Costa Rica'),
    ('PAB',  'Balboa Panameño',       'Panamanian Balboa',   'B/.',  2, 'Panamá'),
    ('GTQ',  'Quetzal',               'Guatemalan Quetzal',  'Q',    2, 'Guatemala'),
    ('HNL',  'Lempira',               'Honduran Lempira',    'L',    2, 'Honduras'),
    ('NIO',  'Córdoba',               'Nicaraguan Cordoba',  'C$',   2, 'Nicaragua'),
    ('GBP',  'Libra Esterlina',       'British Pound',       'GBP',  2, 'Reino Unido'),
    ('CHF',  'Franco Suizo',          'Swiss Franc',         'CHF',  2, 'Suiza'),
    ('AUD',  'Dólar Australiano',     'Australian Dollar',   'A$',   2, 'Australia'),
    ('JPY',  'Yen Japonés',           'Japanese Yen',        'JPY',  0, 'Japón'),
    ('CNY',  'Yuan Chino',            'Chinese Yuan',        'CNY',  2, 'China'),
    ('RUB',  'Rublo Ruso',            'Russian Ruble',       'RUB',  2, 'Rusia'),
    ('INR',  'Rupia India',           'Indian Rupee',        'Rs',   2, 'India'),
    ('KRW',  'Won Surcoreano',        'South Korean Won',    'KRW',  0, 'Corea del Sur'),
    ('TRY',  'Lira Turca',            'Turkish Lira',        'TRY',  2, 'Turquía'),
    ('BTC',  'Bitcoin',               'Bitcoin',             'BTC',  8, 'Descentralizado'),
    ('USDT', 'Tether',                'Tether USD',          'USDT', 2, 'Descentralizado')
ON CONFLICT (codigo) DO UPDATE SET
    nombre    = EXCLUDED.nombre,
    nombre_en = EXCLUDED.nombre_en,
    simbolo   = EXCLUDED.simbolo;

-- =============================================
-- FIN DEL ARCHIVO DE INSERTS
-- =============================================

-- =============================================
-- PLANTILLAS DE FACTURA POR PAÍS
-- =============================================

INSERT INTO plantillas_factura_pais (
    pais_codigo, nombre_documento, version,
    requiere_id_fiscal_emisor, requiere_nombre_fiscal_emisor, requiere_direccion_emisor,
    requiere_id_fiscal_receptor, requiere_nombre_receptor,
    requiere_numero_control, requiere_numero_acceso,
    requiere_desglose_impuesto, requiere_base_imponible,
    requiere_subtotal_exento, requiere_condicion_pago,
    etiqueta_impuesto, etiqueta_base_imponible, etiqueta_exento,
    texto_legal_obligatorio,
    moneda_nombre_singular, moneda_nombre_plural,
    centavos_nombre_singular, centavos_nombre_plural
) VALUES

('VEN','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, TRUE,FALSE, TRUE,TRUE, TRUE,TRUE,
 'IVA','Base Imponible','Exento',
 'Factura válida solo con número de control. SENIAT.',
 'Bolívar','Bolívares','Céntimo','Céntimos'),

('COL','Factura de Venta','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,TRUE,
 'IVA','Base Gravable','Excluido',
 'Resolución DIAN. Factura de Venta.',
 'Peso','Pesos','Centavo','Centavos'),

('MEX','CFDI','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'IVA','Base','Exento',
 'Comprobante Fiscal Digital por Internet (CFDI). SAT.',
 'Peso','Pesos','Centavo','Centavos'),

('ARG','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, TRUE,FALSE,
 'IVA','Neto Gravado','Exento',
 'Documento Fiscal. AFIP.',
 'Peso','Pesos','Centavo','Centavos'),

('CHL','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'IVA','Neto','Exento',
 'Documento Tributario. SII.',
 'Peso','Pesos','Centavo','Centavos'),

('PER','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, TRUE,FALSE,
 'IGV','Valor de Venta','Inafecto',
 'Comprobante de Pago. SUNAT.',
 'Sol','Soles','Céntimo','Céntimos'),

('ECU','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,TRUE, TRUE,TRUE, TRUE,FALSE,
 'IVA','Base Imponible','Tarifa 0%',
 'Documento válido con clave de acceso del SRI.',
 'Dólar','Dólares','Centavo','Centavos'),

('BOL','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'IVA','Importe Base','Exento',
 'Factura con Código de Control. SIN Bolivia.',
 'Boliviano','Bolivianos','Centavo','Centavos'),

('PRY','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'IVA','Base Imponible','Exento',
 'Factura. SET Paraguay.',
 'Guaraní','Guaraníes','Céntimo','Céntimos'),

('URY','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, TRUE,FALSE,
 'IVA','Base Imponible','Exento',
 'Documento Fiscal. DGI Uruguay.',
 'Peso','Pesos','Centésimo','Centésimos'),

('PAN','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'ITBMS','Base Imponible','Exento',
 'Factura. DGI Panamá.',
 'Balboa','Balboas','Centésimo','Centésimos'),

('CRI','Factura Electrónica','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'IVA','Base Imponible','Exento',
 'Comprobante Electrónico. Ministerio de Hacienda.',
 'Colón','Colones','Céntimo','Céntimos'),

('GTM','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'IVA','Base Imponible','Exento',
 'Factura. SAT Guatemala.',
 'Quetzal','Quetzales','Centavo','Centavos'),

('HND','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'ISV','Base Imponible','Exento',
 'Factura. SAR Honduras.',
 'Lempira','Lempiras','Centavo','Centavos'),

('NIC','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'IVA','Base Imponible','Exento',
 'Factura. DGI Nicaragua.',
 'Córdoba','Córdobas','Centavo','Centavos'),

('DOM','Factura con NCF','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, FALSE,FALSE,
 'ITBIS','Base Imponible','Exento',
 'Número de Comprobante Fiscal. DGII.',
 'Peso','Pesos','Centavo','Centavos'),

('ESP','Factura','1.0',
 TRUE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, TRUE,TRUE, TRUE,TRUE,
 'IVA','Base Imponible','Exento',
 'Factura según normativa AEAT.',
 'Euro','Euros','Céntimo','Céntimos'),

('USA','Invoice','1.0',
 FALSE,TRUE,TRUE, FALSE,FALSE, FALSE,FALSE, FALSE,FALSE, FALSE,FALSE,
 'Tax','Subtotal','Tax Exempt',
 NULL,
 'Dollar','Dollars','Cent','Cents')

ON CONFLICT (pais_codigo, version) DO NOTHING;
