-- =============================================
-- SISTEMA POS V2 - TRIGGERS
-- Archivo 3 de 6: Triggers
-- =============================================
-- IMPORTANTE: Ejecutar DESPUÉS de functions.sql
-- =============================================

-- =============================================
-- 1. TRIGGERS DE AUTH / USUARIOS
-- =============================================

-- Al crear usuario en auth → crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. TRIGGERS DE CONFIGURACIÓN / NEGOCIO
-- =============================================

-- Al crear un negocio → asignar rol super_admin al dueño
DROP TRIGGER IF EXISTS trigger_asignar_owner_negocio ON configuracion;
CREATE TRIGGER trigger_asignar_owner_negocio
    AFTER INSERT ON configuracion
    FOR EACH ROW EXECUTE FUNCTION asignar_owner_negocio();

-- Al crear un negocio → inicializar impuestos del país automáticamente
DROP TRIGGER IF EXISTS trigger_auto_inicializar_impuestos ON configuracion;
CREATE TRIGGER trigger_auto_inicializar_impuestos
    AFTER INSERT ON configuracion
    FOR EACH ROW EXECUTE FUNCTION trigger_inicializar_impuestos();

-- Actualizar updated_at en configuracion
DROP TRIGGER IF EXISTS trigger_update_configuracion ON configuracion;
CREATE TRIGGER trigger_update_configuracion
    BEFORE UPDATE ON configuracion
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- 3. TRIGGERS DE PERFILES
-- =============================================

DROP TRIGGER IF EXISTS trigger_update_perfiles ON perfiles;
CREATE TRIGGER trigger_update_perfiles
    BEFORE UPDATE ON perfiles
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- 4. TRIGGERS DE MONEDAS
-- =============================================

-- Solo puede haber una moneda base por negocio
DROP TRIGGER IF EXISTS trigger_validar_moneda_base ON monedas;
CREATE TRIGGER trigger_validar_moneda_base
    BEFORE INSERT OR UPDATE OF es_base ON monedas
    FOR EACH ROW EXECUTE FUNCTION validar_moneda_base_unica();

-- No se puede desactivar la moneda base
DROP TRIGGER IF EXISTS trigger_prevenir_desactivar_base ON monedas;
CREATE TRIGGER trigger_prevenir_desactivar_base
    BEFORE UPDATE OF activo ON monedas
    FOR EACH ROW EXECUTE FUNCTION prevenir_desactivar_moneda_base();

-- =============================================
-- 5. TRIGGERS DE VALIDACIÓN DE MONEDA EN TRANSACCIONES
-- =============================================

DROP TRIGGER IF EXISTS trigger_validar_moneda_ventas ON ventas;
CREATE TRIGGER trigger_validar_moneda_ventas
    BEFORE INSERT OR UPDATE OF moneda ON ventas
    FOR EACH ROW EXECUTE FUNCTION validar_moneda_activa();

DROP TRIGGER IF EXISTS trigger_validar_moneda_gastos ON gastos;
CREATE TRIGGER trigger_validar_moneda_gastos
    BEFORE INSERT OR UPDATE OF moneda ON gastos
    FOR EACH ROW EXECUTE FUNCTION validar_moneda_activa();

DROP TRIGGER IF EXISTS trigger_validar_moneda_movimientos ON movimientos_caja;
CREATE TRIGGER trigger_validar_moneda_movimientos
    BEFORE INSERT OR UPDATE OF moneda ON movimientos_caja
    FOR EACH ROW EXECUTE FUNCTION validar_moneda_activa();

DROP TRIGGER IF EXISTS trigger_validar_moneda_fiados ON fiados;
CREATE TRIGGER trigger_validar_moneda_fiados
    BEFORE INSERT OR UPDATE OF moneda ON fiados
    FOR EACH ROW EXECUTE FUNCTION validar_moneda_activa();

DROP TRIGGER IF EXISTS trigger_validar_moneda_abonos ON abonos;
CREATE TRIGGER trigger_validar_moneda_abonos
    BEFORE INSERT OR UPDATE OF moneda ON abonos
    FOR EACH ROW EXECUTE FUNCTION validar_moneda_activa();

-- =============================================
-- 6. TRIGGERS DE CAJA
-- =============================================

-- Al insertar un movimiento → actualizar saldos de la apertura
DROP TRIGGER IF EXISTS trigger_actualizar_saldos_movimiento ON movimientos_caja;
CREATE TRIGGER trigger_actualizar_saldos_movimiento
    AFTER INSERT ON movimientos_caja
    FOR EACH ROW EXECUTE FUNCTION actualizar_saldos_movimiento();

-- Al eliminar un movimiento → revertir saldos (para anulaciones)
DROP TRIGGER IF EXISTS trigger_revertir_saldos_movimiento ON movimientos_caja;
CREATE TRIGGER trigger_revertir_saldos_movimiento
    AFTER DELETE ON movimientos_caja
    FOR EACH ROW EXECUTE FUNCTION revertir_saldos_movimiento();

-- =============================================
-- 7. TRIGGERS DE GASTOS
-- =============================================

-- Calcular monto_base antes de insertar
DROP TRIGGER IF EXISTS trigger_preparar_gasto ON gastos;
CREATE TRIGGER trigger_preparar_gasto
    BEFORE INSERT ON gastos
    FOR EACH ROW EXECUTE FUNCTION preparar_datos_gasto();

-- Registrar movimiento de caja después de insertar gasto
DROP TRIGGER IF EXISTS trigger_registrar_movimiento_after ON gastos;
CREATE TRIGGER trigger_registrar_movimiento_after
    AFTER INSERT ON gastos
    FOR EACH ROW EXECUTE FUNCTION registrar_movimiento_gasto_after();

-- Actualizar movimiento si se modifica el gasto
DROP TRIGGER IF EXISTS trigger_actualizar_gasto_caja ON gastos;
CREATE TRIGGER trigger_actualizar_gasto_caja
    BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION actualizar_movimiento_gasto();

-- =============================================
-- 8. TRIGGERS DE PRODUCTOS
-- =============================================

-- Calcular precio de venta automáticamente al cambiar precio_compra o margen
DROP TRIGGER IF EXISTS trigger_calcular_precio_venta ON productos;
CREATE TRIGGER trigger_calcular_precio_venta
    BEFORE INSERT OR UPDATE OF precio_compra, margen_ganancia ON productos
    FOR EACH ROW EXECUTE FUNCTION calcular_precio_venta_producto();

-- Evitar que el stock quede negativo
DROP TRIGGER IF EXISTS trigger_evitar_stock_negativo ON productos;
CREATE TRIGGER trigger_evitar_stock_negativo
    BEFORE UPDATE OF stock ON productos
    FOR EACH ROW EXECUTE FUNCTION evitar_stock_negativo();

-- Notificar (registrar en historial) cuando el stock cae al mínimo
DROP TRIGGER IF EXISTS trigger_notificar_stock_bajo ON productos;
CREATE TRIGGER trigger_notificar_stock_bajo
    AFTER UPDATE OF stock ON productos
    FOR EACH ROW EXECUTE FUNCTION notificar_stock_bajo();

-- Registrar cambios de precio en historial
DROP TRIGGER IF EXISTS trigger_registrar_cambio_precio ON productos;
CREATE TRIGGER trigger_registrar_cambio_precio
    AFTER UPDATE OF precio_compra, precio_venta, margen_ganancia ON productos
    FOR EACH ROW EXECUTE FUNCTION registrar_cambio_precio();

-- Timestamp de productos
DROP TRIGGER IF EXISTS trigger_update_productos ON productos;
CREATE TRIGGER trigger_update_productos
    BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- 9. TRIGGERS DE CLIENTES
-- =============================================

DROP TRIGGER IF EXISTS trigger_update_clientes ON clientes;
CREATE TRIGGER trigger_update_clientes
    BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- 10. TRIGGERS DE VENTAS
-- =============================================

DROP TRIGGER IF EXISTS trigger_update_ventas ON ventas;
CREATE TRIGGER trigger_update_ventas
    BEFORE UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Validar que el detalle pertenezca al mismo negocio que la venta
DROP TRIGGER IF EXISTS trigger_validar_integridad_venta ON ventas_detalle;
CREATE TRIGGER trigger_validar_integridad_venta
    BEFORE INSERT ON ventas_detalle
    FOR EACH ROW EXECUTE FUNCTION validar_integridad_venta();

-- Validar que el producto exista y esté activo en el negocio
DROP TRIGGER IF EXISTS trigger_validar_producto_detalle ON ventas_detalle;
CREATE TRIGGER trigger_validar_producto_detalle
    BEFORE INSERT ON ventas_detalle
    FOR EACH ROW EXECUTE FUNCTION validar_producto_detalle_negocio();

-- Validar límite de crédito al crear venta a crédito
DROP TRIGGER IF EXISTS trigger_validar_limite_credito ON ventas;
CREATE TRIGGER trigger_validar_limite_credito
    BEFORE INSERT OR UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION validar_limite_credito();

-- =============================================
-- 11. TRIGGERS DE CRÉDITO / FIADOS
-- =============================================

-- Al crear/actualizar/eliminar un fiado → recalcular crédito del cliente
DROP TRIGGER IF EXISTS trigger_actualizar_credito_fiado ON fiados;
CREATE TRIGGER trigger_actualizar_credito_fiado
    AFTER INSERT OR UPDATE OR DELETE ON fiados
    FOR EACH ROW EXECUTE FUNCTION actualizar_credito_cliente();

-- Al registrar un abono → actualizar saldo del fiado
DROP TRIGGER IF EXISTS trigger_calcular_saldo_fiado ON abonos;
CREATE TRIGGER trigger_calcular_saldo_fiado
    AFTER INSERT ON abonos
    FOR EACH ROW EXECUTE FUNCTION calcular_saldo_fiado();

-- Al hacer un abono → recalcular crédito disponible del cliente
DROP TRIGGER IF EXISTS trigger_actualizar_credito_abono ON abonos;
CREATE TRIGGER trigger_actualizar_credito_abono
    AFTER INSERT OR UPDATE OR DELETE ON abonos
    FOR EACH ROW EXECUTE FUNCTION actualizar_credito_cliente();

DROP TRIGGER IF EXISTS trigger_update_fiados ON fiados;
CREATE TRIGGER trigger_update_fiados
    BEFORE UPDATE ON fiados
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- 12. TRIGGERS DE DEVOLUCIONES
-- =============================================

DROP TRIGGER IF EXISTS trigger_generar_numero_devolucion ON devoluciones;
CREATE TRIGGER trigger_generar_numero_devolucion
    BEFORE INSERT ON devoluciones
    FOR EACH ROW EXECUTE FUNCTION generar_numero_devolucion();

DROP TRIGGER IF EXISTS trigger_procesar_devolucion ON devoluciones_detalle;
CREATE TRIGGER trigger_procesar_devolucion
    BEFORE INSERT OR UPDATE ON devoluciones_detalle
    FOR EACH ROW EXECUTE FUNCTION procesar_devolucion();

DROP TRIGGER IF EXISTS trigger_calcular_totales_devolucion ON devoluciones_detalle;
CREATE TRIGGER trigger_calcular_totales_devolucion
    AFTER INSERT OR UPDATE OR DELETE ON devoluciones_detalle
    FOR EACH ROW EXECUTE FUNCTION calcular_totales_devolucion();

-- Al aprobar una devolución → registrar movimiento en caja (si aplica)
DROP TRIGGER IF EXISTS trigger_movimiento_devolucion ON devoluciones;
CREATE TRIGGER trigger_movimiento_devolucion
    AFTER UPDATE OF estado ON devoluciones
    FOR EACH ROW
    WHEN (NEW.estado = 'aprobada' AND OLD.estado != 'aprobada')
    EXECUTE FUNCTION registrar_movimiento_devolucion();

DROP TRIGGER IF EXISTS trigger_update_devoluciones ON devoluciones;
CREATE TRIGGER trigger_update_devoluciones
    BEFORE UPDATE ON devoluciones
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- 13. TRIGGERS DE AUDITORÍA
-- =============================================

DROP TRIGGER IF EXISTS trigger_audit_ventas ON ventas;
CREATE TRIGGER trigger_audit_ventas
    AFTER INSERT OR UPDATE OR DELETE ON ventas
    FOR EACH ROW EXECUTE FUNCTION log_audit_change();

DROP TRIGGER IF EXISTS trigger_audit_productos ON productos;
CREATE TRIGGER trigger_audit_productos
    AFTER INSERT OR UPDATE OR DELETE ON productos
    FOR EACH ROW EXECUTE FUNCTION log_audit_change();

DROP TRIGGER IF EXISTS trigger_audit_clientes ON clientes;
CREATE TRIGGER trigger_audit_clientes
    AFTER INSERT OR UPDATE OR DELETE ON clientes
    FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- =============================================
-- 14. TRIGGERS DE UNIDADES
-- =============================================

DROP TRIGGER IF EXISTS trigger_validar_conversion_unidad ON conversiones_unidad;
CREATE TRIGGER trigger_validar_conversion_unidad
    BEFORE INSERT OR UPDATE ON conversiones_unidad
    FOR EACH ROW EXECUTE FUNCTION trigger_validar_conversion();

-- =============================================
-- 15. TRIGGERS DE SUSCRIPCIÓN
-- CRÍTICO: Estos triggers bloquean operaciones si el plan está vencido.
-- Los super admins globales (is_super_admin=TRUE) nunca son bloqueados.
-- =============================================

-- Macro para crear triggers de suscripción en múltiples tablas
DO $$
DECLARE
    t_name TEXT;
    tables_list TEXT[] := ARRAY[
        'categorias', 'tipos_unidad', 'unidades', 'conversiones_unidad',
        'monedas', 'tasas_cambio', 'productos', 'clientes',
        'ventas', 'ventas_detalle', 'cajas', 'aperturas_caja',
        'movimientos_caja', 'gastos', 'fiados', 'abonos'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables_list LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS check_subs_%I ON %I', t_name, t_name);
        EXECUTE format(
            'CREATE TRIGGER check_subs_%I
             BEFORE INSERT OR UPDATE OR DELETE ON %I
             FOR EACH ROW EXECUTE FUNCTION verificar_estado_suscripcion()',
            t_name, t_name
        );
    END LOOP;
END $$;

-- =============================================
-- 16. TIMESTAMPS ADICIONALES
-- =============================================

DROP TRIGGER IF EXISTS trigger_update_entradas ON entradas_inventario;
CREATE TRIGGER trigger_update_entradas
    BEFORE UPDATE ON entradas_inventario
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- FIN DEL ARCHIVO DE TRIGGERS
-- =============================================

-- =============================================
-- TRIGGERS FISCALES
-- (Sincronizan impuestos y subtotales en ventas)
-- =============================================

-- Al insertar/modificar ventas_impuestos → recalcular totales en ventas
DROP TRIGGER IF EXISTS trigger_recalcular_impuestos_venta ON ventas_impuestos;
CREATE TRIGGER trigger_recalcular_impuestos_venta
    AFTER INSERT OR UPDATE OR DELETE ON ventas_impuestos
    FOR EACH ROW EXECUTE FUNCTION recalcular_totales_impuesto_venta();

-- Al modificar cantidad, precio o descuento en detalle → recalcular subtotal_con_descuento
DROP TRIGGER IF EXISTS trigger_subtotal_detalle ON ventas_detalle;
CREATE TRIGGER trigger_subtotal_detalle
    BEFORE INSERT OR UPDATE OF cantidad, precio_unitario, descuento_linea ON ventas_detalle
    FOR EACH ROW EXECUTE FUNCTION recalcular_subtotal_detalle();

-- Al insertar/modificar/eliminar líneas → recalcular gravado/exento en ventas
DROP TRIGGER IF EXISTS trigger_desglose_ventas ON ventas_detalle;
CREATE TRIGGER trigger_desglose_ventas
    AFTER INSERT OR UPDATE OR DELETE ON ventas_detalle
    FOR EACH ROW EXECUTE FUNCTION recalcular_desglose_ventas();

-- Al crear un negocio → crear formato de factura con valores por defecto
DROP TRIGGER IF EXISTS trigger_crear_formato_factura ON configuracion;
CREATE TRIGGER trigger_crear_formato_factura
    AFTER INSERT ON configuracion
    FOR EACH ROW EXECUTE FUNCTION crear_formato_factura_default();
