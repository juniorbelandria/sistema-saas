'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Input, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Badge, Spinner, Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Snippet } from '@heroui/react';
import { Search, Scan, ShoppingCart, Trash2, Plus, Minus, DollarSign, CreditCard, Banknote, Smartphone, Printer, Share2, User, Package, Check, Percent, Receipt, X, AlertCircle, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

const metodosPago = [
  { id: 'efectivo', nombre: 'Efectivo', icono: Banknote, color: 'success' },
  { id: 'tarjeta', nombre: 'Tarjeta', icono: CreditCard, color: 'primary' },
  { id: 'transferencia', nombre: 'Transferencia', icono: Smartphone, color: 'secondary' },
  { id: 'mixto', nombre: 'Mixto', icono: DollarSign, color: 'warning' },
];

export default function POSPage() {
  // Estados principales
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [impuestos, setImpuestos] = useState([]);
  
  // Estados de selección
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('USD');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [descuento, setDescuento] = useState(0);
  
  // Estados UI
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [snippetMessage, setSnippetMessage] = useState({ show: false, type: 'success', text: '', description: '' });
  
  // Modales
  const { isOpen: isOpenScanner, onOpen: onOpenScanner, onClose: onCloseScanner } = useDisclosure();
  const { isOpen: isOpenPago, onOpen: onOpenPago, onClose: onClosePago } = useDisclosure();
  const { isOpen: isOpenDetalle, onOpen: onOpenDetalle, onClose: onCloseDetalle } = useDisclosure();
  const { isOpen: isOpenCliente, onOpen: onOpenCliente, onClose: onCloseCliente } = useDisclosure();
  
  // Drawer del carrito
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose, onOpenChange } = useDisclosure();
  
  // Función para mostrar notificaciones
  const showNotification = useCallback((type, text, description = '') => {
    setSnippetMessage({ show: true, type, text, description });
    setTimeout(() => {
      setSnippetMessage({ show: false, type: 'success', text: '', description: '' });
    }, 3000);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamadas a Supabase
      // const { data: productosData } = await supabase.from('productos').select('*').eq('activo', true);
      // const { data: clientesData } = await supabase.from('clientes').select('*').eq('activo', true);
      // const { data: monedasData } = await supabase.from('monedas').select('*').eq('activo', true);
      
      // Datos de ejemplo mientras se conecta
      setProductos([
        { id: 1, nombre: 'Coca Cola 600ml', codigo_barras: '7501234567890', precio_venta: 15.00, stock: 48, categoria_id: 1 },
        { id: 2, nombre: 'Pan Integral Bimbo', codigo_barras: '7501234567891', precio_venta: 4.00, stock: 25, categoria_id: 2 },
        { id: 3, nombre: 'Leche Entera Alpura 1L', codigo_barras: '7501234567892', precio_venta: 15.00, stock: 29, categoria_id: 3 },
        { id: 4, nombre: 'Arroz Verde Valle 1kg', codigo_barras: '7501234567893', precio_venta: 28.00, stock: 0, categoria_id: 4 },
        { id: 5, nombre: 'Aceite Vegetal 1L', codigo_barras: '7501234567894', precio_venta: 12.00, stock: 45, categoria_id: 4 },
        { id: 6, nombre: 'Azúcar Estándar 1kg', codigo_barras: '7501234567895', precio_venta: 6.50, stock: 60, categoria_id: 4 },
        { id: 7, nombre: 'Café Nescafé 200g', codigo_barras: '7501234567896', precio_venta: 8.00, stock: 35, categoria_id: 5 },
        { id: 8, nombre: 'Pasta Barilla 500g', codigo_barras: '7501234567897', precio_venta: 25.00, stock: 18, categoria_id: 4 },
        { id: 9, nombre: 'Huevos San Juan x12', codigo_barras: '7501234567898', precio_venta: 15.00, stock: 15, categoria_id: 3 },
        { id: 10, nombre: 'Yogurt Natural Danone', codigo_barras: '7501234567899', precio_venta: 28.00, stock: 2, categoria_id: 3 },
      ]);
      
      setClientes([
        { id: 'general', nombre: 'Cliente General', tipo_cliente: 'regular' },
        { id: 2, nombre: 'Juan Pérez', apellido: 'García', tipo_cliente: 'frecuente', limite_credito: 5000 },
        { id: 3, nombre: 'María', apellido: 'Rodríguez', tipo_cliente: 'vip', limite_credito: 10000 },
      ]);
      
      setMonedas([
        { codigo: 'USD', nombre: 'Dólar', simbolo: '$', tasa_cambio: 1, es_base: true },
        { codigo: 'VES', nombre: 'Bolívar', simbolo: 'Bs', tasa_cambio: 36.50, es_base: false },
        { codigo: 'COP', nombre: 'Peso', simbolo: '$', tasa_cambio: 4200, es_base: false },
      ]);
      
      setImpuestos([
        { id: 1, nombre: 'IVA', tasa: 16.00, es_predeterminado: true }
      ]);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const moneda = monedas.find(m => m.codigo === monedaSeleccionada) || monedas[0];

  // Funciones del carrito
  const agregarAlCarrito = useCallback((producto) => {
    if (producto.stock === 0) {
      showNotification('danger', 'Producto agotado', `${producto.nombre} no tiene stock disponible`);
      return;
    }
    
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        if (existe.cantidad < producto.stock) {
          showNotification('success', 'Cantidad actualizada', `${producto.nombre} (${existe.cantidad + 1} unidades)`);
          return prev.map(item =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        } else {
          showNotification('warning', 'Stock máximo', `Solo hay ${producto.stock} unidades disponibles`);
        }
        return prev;
      }
      showNotification('success', 'Producto agregado', producto.nombre);
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }, [showNotification]);

  const actualizarCantidad = useCallback((id, cantidad) => {
    const producto = productos.find(p => p.id === id);
    if (cantidad > producto?.stock) {
      showNotification('warning', 'Stock insuficiente', `Solo hay ${producto.stock} unidades disponibles`);
      return;
    }
    
    if (cantidad === 0) {
      const item = carrito.find(i => i.id === id);
      showNotification('default', 'Producto eliminado', item?.nombre);
      setCarrito(prev => prev.filter(item => item.id !== id));
    } else {
      setCarrito(prev => prev.map(item =>
        item.id === id ? { ...item, cantidad } : item
      ));
    }
  }, [productos, carrito, showNotification]);

  // Cálculos
  const calcularSubtotal = useCallback(() => {
    return carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
  }, [carrito]);

  const calcularDescuento = useCallback(() => {
    return calcularSubtotal() * (descuento / 100);
  }, [calcularSubtotal, descuento]);

  const calcularImpuesto = useCallback(() => {
    const impuestoPredeterminado = impuestos.find(i => i.es_predeterminado);
    if (!impuestoPredeterminado) return 0;
    return (calcularSubtotal() - calcularDescuento()) * (impuestoPredeterminado.tasa / 100);
  }, [calcularSubtotal, calcularDescuento, impuestos]);

  const calcularTotal = useCallback(() => {
    return calcularSubtotal() - calcularDescuento() + calcularImpuesto();
  }, [calcularSubtotal, calcularDescuento, calcularImpuesto]);

  const convertirMoneda = useCallback((valor) => {
    if (!moneda) return '0.00';
    return (valor * moneda.tasa_cambio).toFixed(2);
  }, [moneda]);

  const finalizarVenta = async () => {
    if (carrito.length === 0 || !metodoSeleccionado) return;
    
    setProcesando(true);
    try {
      // TODO: Implementar guardado en Supabase
      // const ventaData = {
      //   cliente_id: clienteSeleccionado?.id,
      //   subtotal: calcularSubtotal(),
      //   descuento: calcularDescuento(),
      //   impuesto_total: calcularImpuesto(),
      //   total: calcularTotal(),
      //   metodo_pago: metodoSeleccionado,
      //   moneda: monedaSeleccionada,
      //   tasa_cambio: moneda.tasa_cambio,
      //   estado_pago: 'pagado',
      //   estado_venta: 'completada',
      //   tipo_venta: 'contado'
      // };
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClosePago();
      onOpenDetalle();
    } catch (error) {
      console.error('Error al finalizar venta:', error);
    } finally {
      setProcesando(false);
    }
  };

  const nuevaVenta = () => {
    setCarrito([]);
    setMetodoSeleccionado(null);
    setDescuento(0);
    setClienteSeleccionado(null);
    onCloseDetalle();
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo_barras?.includes(busqueda)
  );

  const getCardClass = (stock) => {
    if (stock === 0) return 'bg-danger/20 border-danger border-2 opacity-70 cursor-not-allowed';
    if (stock <= 5) return 'bg-warning/20 border-warning border-2 hover:bg-warning/30';
    return 'bg-content1 hover:bg-content2 border-2 border-transparent hover:border-primary/30';
  };
  
  const getStockChipColor = (stock) => {
    if (stock === 0) return 'danger';
    if (stock <= 5) return 'warning';
    return 'success';
  };
  
  const getStockLabel = (stock) => {
    if (stock === 0) return 'Agotado';
    if (stock <= 5) return `¡${stock} left!`;
    return stock;
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalProductos = carrito.length; // Cantidad de productos diferentes

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-content1/30">
      {/* Notificaciones con Snippet */}
      {snippetMessage.show && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2">
          <Snippet
            color={snippetMessage.type}
            variant="bordered"
            hideSymbol
            classNames={{
              base: "shadow-lg backdrop-blur-md",
              pre: "font-medium"
            }}
          >
            <div className="flex items-start gap-2 py-1">
              {snippetMessage.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {snippetMessage.type === 'danger' && <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {snippetMessage.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {snippetMessage.type === 'default' && <Package className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold text-sm">{snippetMessage.text}</p>
                {snippetMessage.description && (
                  <p className="text-xs opacity-80 mt-0.5">{snippetMessage.description}</p>
                )}
              </div>
            </div>
          </Snippet>
        </div>
      )}
      
      {/* Header Superior Fijo */}
      <header className="bg-content1/95 backdrop-blur-md shadow-lg border-b border-divider px-3 sm:px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between gap-2 md:gap-4 flex-wrap z-40">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              POS Venta
            </h1>
            <p className="text-[10px] md:text-xs text-foreground/60 hidden sm:block">Sistema de Punto de Venta</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2.5">
          <Select
            size="sm"
            selectedKeys={[monedaSeleccionada]}
            onChange={(e) => setMonedaSeleccionada(e.target.value)}
            className="w-20 md:w-24"
            aria-label="Moneda"
            classNames={{
              trigger: "h-8 md:h-9 min-h-8 md:min-h-9",
              value: "text-xs md:text-sm"
            }}
          >
            {monedas.map(m => (
              <SelectItem key={m.codigo} value={m.codigo}>
                {m.codigo}
              </SelectItem>
            ))}
          </Select>

          <Button
            size="sm"
            variant="flat"
            startContent={<User className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            onClick={onOpenCliente}
            className="hidden sm:flex h-8 md:h-9 text-xs md:text-sm"
          >
            <span className="hidden md:inline max-w-[100px] truncate">
              {clienteSeleccionado?.nombre || 'Cliente'}
            </span>
            <span className="md:hidden">Cliente</span>
          </Button>

          <Badge content={totalItems} color="danger" isInvisible={totalItems === 0} shape="circle" size="sm">
            <Button
              isIconOnly
              size="sm"
              color="primary"
              variant="shadow"
              className="lg:hidden h-8 w-8 md:h-9 md:w-9"
              onClick={() => isDrawerOpen ? onDrawerClose() : onDrawerOpen()}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </Badge>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sección de Productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de Búsqueda */}
          <div className="p-2.5 sm:p-3 md:p-4 bg-content1/50 backdrop-blur-sm border-b border-divider">
            <Input
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              startContent={<Search className="w-4 h-4 text-foreground/40" />}
              endContent={
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={onOpenScanner}
                  className="h-7 w-7"
                >
                  <Scan className="w-4 h-4" />
                </Button>
              }
              size="md"
              classNames={{
                input: "text-sm",
                inputWrapper: "h-9 md:h-10 shadow-sm"
              }}
            />
          </div>

          {/* Grid de Productos con Scroll */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
              {productosFiltrados.map(producto => (
                  <Card
                    key={producto.id}
                    isPressable={producto.stock > 0}
                    onPress={() => agregarAlCarrito(producto)}
                    className={`shadow-md hover:shadow-xl transition-all duration-200 ${getCardClass(producto.stock)}`}
                    isDisabled={producto.stock === 0}
                  >
                    <CardBody className="p-2 md:p-3">
                      <div className="aspect-square bg-gradient-to-br from-content2 to-content3 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                        <Package className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-foreground/20" />
                        <Chip
                          size="sm"
                          color={getStockChipColor(producto.stock)}
                          variant="flat"
                          className="absolute top-1 right-1 text-[9px] md:text-[10px] h-4 md:h-5 px-1.5 font-bold"
                        >
                          {getStockLabel(producto.stock)}
                        </Chip>
                      </div>
                      <h3 className="font-semibold text-[11px] md:text-xs lg:text-sm mb-1 line-clamp-2 min-h-[2.2rem] md:min-h-[2.5rem]">
                        {producto.nombre}
                      </h3>
                      <p className="text-[9px] md:text-[10px] text-foreground/50 mb-1">
                        #{producto.codigo_barras?.slice(-4)}
                      </p>
                      <p className="text-sm md:text-base lg:text-lg font-bold text-primary">
                        {moneda?.simbolo}{convertirMoneda(producto.precio_venta)}
                      </p>
                    </CardBody>
                  </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Carrito Desktop - Fijo */}
        <div className="hidden lg:flex w-80 xl:w-96 2xl:w-[420px] border-l border-divider bg-content1 flex-col">
          {/* Header del Carrito */}
          <div className="p-3 md:p-4 border-b border-divider flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Carrito
            </h3>
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" size="sm">
                {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
              </Chip>
              <Chip color="secondary" variant="flat" size="sm">
                {totalItems} {totalItems === 1 ? 'unidad' : 'unidades'}
              </Chip>
            </div>
          </div>

          {/* Items del Carrito con Scroll */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
            {carrito.length === 0 ? (
              <div className="text-center py-16 md:py-20">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-primary/40" />
                </div>
                <p className="text-sm text-foreground/60 font-medium">Carrito vacío</p>
                <p className="text-xs text-foreground/40 mt-1">Agrega productos para comenzar</p>
              </div>
            ) : (
              carrito.map(item => (
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-2.5 md:p-3">
                    <div className="flex gap-2.5 md:gap-3">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-content2 to-content3 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 md:w-7 md:h-7 text-foreground/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs md:text-sm truncate mb-0.5">{item.nombre}</p>
                        <p className="text-[10px] md:text-xs text-foreground/60">
                          {moneda?.simbolo}{convertirMoneda(item.precio_venta)} c/u
                        </p>
                        <div className="flex items-center gap-1.5 md:gap-2 mt-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="h-7 w-7 min-w-7"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs md:text-sm font-bold w-8 text-center">{item.cantidad}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            isDisabled={item.cantidad >= item.stock}
                            className="h-7 w-7 min-w-7"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            onClick={() => actualizarCantidad(item.id, 0)}
                            className="ml-auto h-7 w-7 min-w-7"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-xs md:text-sm text-primary">
                          {moneda?.simbolo}{convertirMoneda(item.precio_venta * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          {/* Footer del Carrito - Totales y Botón */}
          <div className="p-3 md:p-4 border-t border-divider space-y-2.5 md:space-y-3 bg-content1 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Descuento %"
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(Math.max(0, Math.min(100, Number(e.target.value))))}
                startContent={<Percent className="w-3 h-3" />}
                size="sm"
                classNames={{ 
                  input: "text-xs",
                  label: "text-xs"
                }}
              />
              <div className="flex items-center justify-center bg-content2 rounded-lg px-2">
                <div className="text-center">
                  <p className="text-[9px] text-foreground/60">Impuesto</p>
                  <p className="text-xs font-semibold">{impuestos[0]?.tasa || 0}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs md:text-sm">
              <div className="flex justify-between text-foreground/70">
                <span>Subtotal:</span>
                <span className="font-semibold">{moneda?.simbolo}{convertirMoneda(calcularSubtotal())}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-success">
                  <span>Descuento ({descuento}%):</span>
                  <span className="font-semibold">-{moneda?.simbolo}{convertirMoneda(calcularDescuento())}</span>
                </div>
              )}
              <div className="flex justify-between text-warning">
                <span>Impuesto ({impuestos[0]?.tasa || 0}%):</span>
                <span className="font-semibold">+{moneda?.simbolo}{convertirMoneda(calcularImpuesto())}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-divider">
              <span className="text-base md:text-lg font-bold">Total:</span>
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                {moneda?.simbolo}{convertirMoneda(calcularTotal())}
              </span>
            </div>

            <Button
              color="primary"
              size="lg"
              className="w-full font-bold text-sm md:text-base shadow-lg"
              isDisabled={carrito.length === 0}
              onClick={onOpenPago}
            >
              <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
              Procesar Pago
            </Button>
          </div>
        </div>

        {/* Drawer del Carrito - Mobile/Tablet */}
        <Drawer 
          isOpen={isDrawerOpen} 
          onOpenChange={onOpenChange}
          placement="right"
          size="lg"
          classNames={{
            base: "lg:hidden",
            backdrop: "lg:hidden"
          }}
        >
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex items-center justify-between border-b border-divider bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Carrito de Compras</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip color="primary" variant="flat" size="sm">
                      {totalProductos}
                    </Chip>
                    <Chip color="secondary" variant="flat" size="sm">
                      {totalItems} u
                    </Chip>
                  </div>
                </DrawerHeader>
                <DrawerBody className="p-4 space-y-2">
                  {carrito.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <ShoppingCart className="w-10 h-10 text-primary/40" />
                      </div>
                      <p className="text-sm text-foreground/60 font-medium">Carrito vacío</p>
                      <p className="text-xs text-foreground/40 mt-1">Agrega productos para comenzar</p>
                    </div>
                  ) : (
                    carrito.map(item => (
                      <Card key={item.id} className="shadow-sm">
                        <CardBody className="p-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-content2 to-content3 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-7 h-7 text-foreground/30" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate mb-0.5">{item.nombre}</p>
                              <p className="text-xs text-foreground/60">
                                {moneda?.simbolo}{convertirMoneda(item.precio_venta)} c/u
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                  className="h-7 w-7 min-w-7"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm font-bold w-8 text-center">{item.cantidad}</span>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                  isDisabled={item.cantidad >= item.stock}
                                  className="h-7 w-7 min-w-7"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onClick={() => actualizarCantidad(item.id, 0)}
                                  className="ml-auto h-7 w-7 min-w-7"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-sm text-primary">
                                {moneda?.simbolo}{convertirMoneda(item.precio_venta * item.cantidad)}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </DrawerBody>
                <DrawerFooter className="flex-col gap-3 border-t border-divider p-4">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Input
                      label="Descuento %"
                      type="number"
                      value={descuento}
                      onChange={(e) => setDescuento(Math.max(0, Math.min(100, Number(e.target.value))))}
                      startContent={<Percent className="w-3 h-3" />}
                      size="sm"
                    />
                    <div className="flex items-center justify-center bg-content2 rounded-lg px-2">
                      <div className="text-center">
                        <p className="text-[9px] text-foreground/60">Impuesto</p>
                        <p className="text-xs font-semibold">{impuestos[0]?.tasa || 0}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm w-full">
                    <div className="flex justify-between text-foreground/70">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{moneda?.simbolo}{convertirMoneda(calcularSubtotal())}</span>
                    </div>
                    {descuento > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Descuento ({descuento}%):</span>
                        <span className="font-semibold">-{moneda?.simbolo}{convertirMoneda(calcularDescuento())}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-warning">
                      <span>Impuesto ({impuestos[0]?.tasa || 0}%):</span>
                      <span className="font-semibold">+{moneda?.simbolo}{convertirMoneda(calcularImpuesto())}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-divider w-full">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {moneda?.simbolo}{convertirMoneda(calcularTotal())}
                    </span>
                  </div>

                  <Button
                    color="primary"
                    size="lg"
                    className="w-full font-bold shadow-lg"
                    isDisabled={carrito.length === 0}
                    onClick={() => {
                      onClose();
                      onOpenPago();
                    }}
                  >
                    <CreditCard className="w-5 h-5" />
                    Procesar Pago
                  </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </div>

      {/* Modal de Escáner */}
      <Modal isOpen={isOpenScanner} onClose={onCloseScanner} size="md">
        <ModalContent>
          <ModalHeader className="text-base">Escanear Código de Barras</ModalHeader>
          <ModalBody>
            <div className="py-6 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Scan className="w-10 h-10 md:w-12 md:h-12 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-foreground/60 mb-4">Escanea o escribe el código</p>
              <Input 
                placeholder="Código de barras" 
                size="lg" 
                autoFocus
                startContent={<Scan className="w-4 h-4" />}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseScanner} size="sm">Cancelar</Button>
            <Button color="primary" onPress={onCloseScanner} size="sm">Buscar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Cliente */}
      <Modal isOpen={isOpenCliente} onClose={onCloseCliente} size="md">
        <ModalContent>
          <ModalHeader className="text-base">Seleccionar Cliente</ModalHeader>
          <ModalBody>
            <Input 
              placeholder="Buscar por nombre..." 
              startContent={<Search className="w-4 h-4" />} 
              size="md" 
            />
            <div className="space-y-2 mt-3 max-h-80 overflow-y-auto">
              {clientes.map((cliente) => (
                <Card
                  key={cliente.id}
                  isPressable
                  onPress={() => {
                    setClienteSeleccionado(cliente);
                    onCloseCliente();
                  }}
                  className={`shadow-sm hover:shadow-md transition-shadow ${
                    clienteSeleccionado?.id === cliente.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardBody className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {cliente.nombre} {cliente.apellido || ''}
                        </p>
                        {cliente.tipo_cliente !== 'regular' && (
                          <Chip size="sm" color="secondary" variant="flat" className="mt-1">
                            {cliente.tipo_cliente}
                          </Chip>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseCliente} size="sm">Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Método de Pago */}
      <Modal isOpen={isOpenPago} onClose={onClosePago} size="lg">
        <ModalContent>
          <ModalHeader className="text-base md:text-lg">Método de Pago</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metodosPago.map(metodo => {
                const Icon = metodo.icono;
                return (
                  <Card
                    key={metodo.id}
                    isPressable
                    onPress={() => setMetodoSeleccionado(metodo.id)}
                    className={`shadow-md hover:shadow-lg transition-all ${
                      metodoSeleccionado === metodo.id ? 'ring-2 ring-primary scale-105' : ''
                    }`}
                  >
                    <CardBody className="p-4 text-center">
                      <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto rounded-2xl bg-${metodo.color}/10 flex items-center justify-center mb-2`}>
                        <Icon className={`w-6 h-6 md:w-7 md:h-7 text-${metodo.color}`} />
                      </div>
                      <p className="font-semibold text-sm">{metodo.nombre}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
            {metodoSeleccionado && (
              <Card className="bg-content2">
                <CardBody className="p-4">
                  <Input
                    label="Monto recibido"
                    placeholder="0.00"
                    startContent={<span className="text-sm text-foreground/60">{moneda?.simbolo}</span>}
                    size="lg"
                    type="number"
                    defaultValue={convertirMoneda(calcularTotal())}
                  />
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-foreground/70">Total a pagar:</span>
                    <span className="font-bold text-lg text-primary">
                      {moneda?.simbolo}{convertirMoneda(calcularTotal())}
                    </span>
                  </div>
                </CardBody>
              </Card>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClosePago} size="sm">Cancelar</Button>
            <Button 
              color="primary" 
              onPress={finalizarVenta} 
              isDisabled={!metodoSeleccionado}
              isLoading={procesando}
              size="sm"
            >
              Finalizar Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Venta Completada */}
      <Modal isOpen={isOpenDetalle} onClose={onCloseDetalle} size="lg">
        <ModalContent>
          <ModalHeader className="text-base md:text-lg">Venta Completada</ModalHeader>
          <ModalBody>
            <div className="text-center mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-3 animate-bounce">
                <Check className="w-8 h-8 md:w-10 md:h-10 text-success" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-1">¡Venta Exitosa!</h3>
              <p className="text-sm text-foreground/60">Transacción procesada correctamente</p>
            </div>
            
            <Card className="shadow-md mb-3 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardBody className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Cliente:</span>
                    <span className="font-semibold">{clienteSeleccionado?.nombre || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Método de Pago:</span>
                    <span className="font-semibold capitalize">{metodoSeleccionado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Moneda:</span>
                    <span className="font-semibold">{moneda?.nombre}</span>
                  </div>
                  <div className="border-t border-divider pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base">Total Pagado:</span>
                      <span className="text-2xl md:text-3xl font-bold text-primary">
                        {moneda?.simbolo}{convertirMoneda(calcularTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <div className="space-y-1 text-sm max-h-40 overflow-y-auto bg-content2 rounded-lg p-3">
              <p className="font-semibold mb-2 text-foreground/70">Productos:</p>
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between py-1">
                  <span className="text-foreground/80">{item.cantidad}x {item.nombre}</span>
                  <span className="font-semibold">{moneda?.simbolo}{convertirMoneda(item.precio_venta * item.cantidad)}</span>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter className="flex-col gap-2">
            <div className="flex gap-2 w-full">
              <Button variant="flat" startContent={<Receipt className="w-4 h-4" />} className="flex-1" size="sm">
                Nota
              </Button>
              <Button variant="flat" startContent={<Printer className="w-4 h-4" />} className="flex-1" size="sm">
                Imprimir
              </Button>
            </div>
            <Button color="success" startContent={<Share2 className="w-4 h-4" />} className="w-full" size="sm" variant="flat">
              Compartir por WhatsApp
            </Button>
            <Button
              color="primary"
              onPress={nuevaVenta}
              className="w-full font-semibold"
              size="sm"
            >
              Nueva Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
