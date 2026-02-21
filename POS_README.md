# Sistema POS - Punto de Venta Profesional

## Características Implementadas

### 🎨 Diseño Profesional Sin Sidebar
- **Pantalla completa**: El POS ocupa toda la pantalla sin distracciones
- **Layout limpio**: Sin sidebar ni header del admin, enfocado 100% en ventas
- **Interfaz moderna**: Gradientes, sombras y animaciones suaves

### 📱 Responsive Design (Breakpoints Optimizados)

#### Mobile (< 640px)
- Grid de productos: 2 columnas
- Carrito: Overlay deslizable desde la derecha
- Botón flotante con badge de cantidad
- Tamaños de fuente reducidos
- Iconos y botones compactos

#### Tablet (640px - 1024px)
- Grid de productos: 3 columnas
- Carrito: Overlay más ancho (384px)
- Mejor espaciado
- Fuentes intermedias

#### Desktop (> 1024px)
- Grid de productos: 4-6 columnas (según tamaño)
- Carrito: Panel fijo lateral (320-420px)
- Espaciado generoso
- Fuentes completas

### 🛒 Funcionalidades del Carrito

1. **Agregar productos**: Click en tarjeta de producto
2. **Ajustar cantidad**: Botones +/- con validación de stock
3. **Eliminar items**: Botón de basura
4. **Descuentos**: Input de porcentaje (0-100%)
5. **Impuestos**: Cálculo automático según configuración
6. **Totales en tiempo real**: Subtotal, descuento, impuesto, total

### 💰 Sistema de Monedas

- **Múltiples monedas**: USD, VES, COP, etc.
- **Conversión automática**: Según tasa de cambio
- **Selector en header**: Cambio rápido de moneda
- **Decimales configurables**: Según moneda

### 👥 Gestión de Clientes

- **Cliente general**: Por defecto
- **Clientes registrados**: Con límite de crédito
- **Búsqueda rápida**: Por nombre
- **Tipos**: Regular, Frecuente, VIP

### 💳 Métodos de Pago

1. **Efectivo**: Verde (success)
2. **Tarjeta**: Azul (primary)
3. **Transferencia**: Morado (secondary)
4. **Mixto**: Amarillo (warning)

### 📊 Integración con Base de Datos

El sistema está preparado para conectarse con Supabase usando la estructura SQL proporcionada:

#### Tablas Principales
- `productos`: Stock, precios, categorías
- `clientes`: Datos, crédito, tipo
- `monedas`: Códigos, tasas, símbolos
- `impuestos_negocio`: Tasas por país
- `ventas`: Transacciones completas
- `ventas_detalle`: Líneas de venta
- `ventas_impuestos`: Desglose fiscal

#### Campos Fiscales Soportados
- Subtotal gravado/exento
- Impuestos múltiples
- Retenciones
- Números de control fiscal
- Datos de facturación

### 🎯 Características Avanzadas

1. **Búsqueda inteligente**: Por nombre o código de barras
2. **Escáner de códigos**: Modal dedicado
3. **Stock en tiempo real**: Indicadores visuales
   - Verde: Stock normal (>5)
   - Amarillo: Stock bajo (≤5)
   - Rojo: Agotado (0)
4. **Validaciones**: No vender sin stock
5. **Animaciones**: Transiciones suaves
6. **Feedback visual**: Estados de carga

### 🧾 Comprobante de Venta

Modal de confirmación con:
- Resumen de la transacción
- Desglose de productos
- Totales calculados
- Opciones de impresión
- Compartir por WhatsApp
- Botón para nueva venta

### 🎨 Temas y Colores

- **Soporte dark/light**: Automático
- **Gradientes**: Primary/Secondary
- **Sombras**: Elevación visual
- **Backdrop blur**: Efectos modernos

## Próximos Pasos de Integración

### 1. Conectar Supabase

```javascript
// En el useEffect de cargarDatosIniciales()
const { data: productosData } = await supabase
  .from('productos')
  .select('*')
  .eq('activo', true)
  .eq('negocio_id', negocioId);

const { data: monedasData } = await supabase
  .from('monedas')
  .select('*')
  .eq('activo', true)
  .eq('negocio_id', negocioId);
```

### 2. Guardar Ventas

```javascript
// En finalizarVenta()
const { data: venta, error } = await supabase
  .from('ventas')
  .insert({
    cliente_id: clienteSeleccionado?.id,
    subtotal: calcularSubtotal(),
    descuento: calcularDescuento(),
    impuesto_total: calcularImpuesto(),
    total: calcularTotal(),
    metodo_pago: metodoSeleccionado,
    moneda: monedaSeleccionada,
    tasa_cambio: moneda.tasa_cambio,
    estado_pago: 'pagado',
    estado_venta: 'completada',
    tipo_venta: 'contado',
    negocio_id: negocioId
  })
  .select()
  .single();

// Insertar detalle
const detalles = carrito.map(item => ({
  venta_id: venta.id,
  producto_id: item.id,
  cantidad: item.cantidad,
  precio_unitario: item.precio_venta,
  subtotal_linea: item.precio_venta * item.cantidad,
  negocio_id: negocioId
}));

await supabase.from('ventas_detalle').insert(detalles);
```

### 3. Actualizar Stock

```javascript
// Después de guardar la venta
for (const item of carrito) {
  await supabase.rpc('actualizar_stock_producto', {
    p_producto_id: item.id,
    p_cantidad: -item.cantidad
  });
}
```

### 4. Registrar en Caja

```javascript
// Si hay apertura de caja activa
await supabase.from('movimientos_caja').insert({
  apertura_id: aperturaActiva.id,
  tipo_movimiento: 'venta',
  monto: calcularTotal(),
  moneda: monedaSeleccionada,
  venta_id: venta.id,
  negocio_id: negocioId
});
```

## Mejoras Futuras

- [ ] Búsqueda por código de barras con escáner físico
- [ ] Atajos de teclado para operaciones rápidas
- [ ] Impresión de tickets térmicos
- [ ] Ventas a crédito con validación de límite
- [ ] Descuentos por producto individual
- [ ] Aplicar múltiples impuestos
- [ ] Modo offline con sincronización
- [ ] Historial de ventas del día
- [ ] Cierre de caja desde el POS
- [ ] Devoluciones rápidas

## Tecnologías Utilizadas

- **Next.js 14**: App Router
- **React 18**: Hooks y optimizaciones
- **HeroUI**: Componentes UI
- **Tailwind CSS**: Estilos responsive
- **Lucide React**: Iconos
- **Supabase**: Base de datos (pendiente integración)

## Estructura de Archivos

```
src/app/(admin)/admin/pos/
├── page.js          # Componente principal del POS
└── layout.js        # Layout sin sidebar (pantalla completa)
```

## Notas de Desarrollo

- El POS usa `position: fixed` para ocupar toda la pantalla
- El carrito en mobile usa overlay con backdrop blur
- Todos los cálculos son en tiempo real con `useCallback`
- Los datos de ejemplo están hardcodeados temporalmente
- La estructura está lista para conectar con Supabase

---

**Desarrollado con ❤️ para un sistema POS profesional y escalable**
