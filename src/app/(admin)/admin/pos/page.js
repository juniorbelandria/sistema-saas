'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Card, CardBody, Input, Button, Modal, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Badge, 
  Spinner, Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter,
  Avatar, Chip, Divider, toast
} from '@heroui/react';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, 
  Banknote, Smartphone, User, Package, Check, X, 
  Scan, DollarSign, TrendingUp, AlertCircle
} from 'lucide-react';

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
  
  // Estados de selección
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('USD');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [iva, setIva] = useState(16);
  
  // Estados UI
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  
  // Modales y Drawer
  const { isOpen: isOpenScanner, onOpen: onOpenScanner, onClose: onCloseScanner } = useDisclosure();
  const { isOpen: isOpenPago, onOpen: onOpenPago, onClose: onClosePago } = useDisclosure();
  const { isOpen: isOpenDetalle, onOpen: onOpenDetalle, onClose: onCloseDetalle } = useDisclosure();
  const { isOpen: isOpenCliente, onOpen: onOpenCliente, onClose: onCloseCliente } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose, onOpenChange } = useDisclosure();

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      setProductos([
        { id: 1, nombre: 'Coca Cola 600ml', codigo_barras: '7890', precio_venta: 15.00, stock: 48 },
        { id: 2, nombre: 'Pan Integral', codigo_barras: '7891', precio_venta: 4.00, stock: 25 },
        { id: 3, nombre: 'Leche Entera 1L', codigo_barras: '7892', precio_venta: 15.00, stock: 29 },
        { id: 4, nombre: 'Arroz 1kg', codigo_barras: '7893', precio_venta: 28.00, stock: 0 },
        { id: 5, nombre: 'Aceite 1L', codigo_barras: '7894', precio_venta: 12.00, stock: 3 },
        { id: 6, nombre: 'Azúcar 1kg', codigo_barras: '7895', precio_venta: 6.50, stock: 60 },
        { id: 7, nombre: 'Café 200g', codigo_barras: '7896', precio_venta: 8.00, stock: 2 },
        { id: 8, nombre: 'Pasta 500g', codigo_barras: '7897', precio_venta: 25.00, stock: 18 },
      ]);
      
      setClientes([
        { id: 'general', nombre: 'Cliente General', tipo: 'regular' },
        { id: 2, nombre: 'Juan Pérez', tipo: 'frecuente' },
        { id: 3, nombre: 'María García', tipo: 'vip' },
      ]);
      
      setMonedas([
        { codigo: 'USD', nombre: 'Dólar', simbolo: '$', tasa_cambio: 1 },
        { codigo: 'VES', nombre: 'Bolívar', simbolo: 'Bs', tasa_cambio: 36.50 },
        { codigo: 'EUR', nombre: 'Euro', simbolo: '€', tasa_cambio: 0.92 },
      ]);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const moneda = monedas.find(m => m.codigo === monedaSeleccionada) || monedas[0];

  // Funciones del carrito con Toast
  const agregarAlCarrito = useCallback((producto) => {
    if (producto.stock === 0) {
      toast('Producto agotado', {
        description: `${producto.nombre} no tiene stock disponible`,
        color: 'danger',
        icon: <AlertCircle className="w-5 h-5" />,
      });
      return;
    }
    
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        if (existe.cantidad < producto.stock) {
          toast('Cantidad actualizada', {
            description: `${producto.nombre} (${existe.cantidad + 1})`,
            color: 'success',
            icon: <Check className="w-5 h-5" />,
          });
          return prev.map(item =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        } else {
          toast('Stock máximo', {
            description: `Solo hay ${producto.stock} unidades`,
            color: 'warning',
            icon: <AlertCircle className="w-5 h-5" />,
          });
        }
        return prev;
      }
      toast('Producto agregado', {
        description: producto.nombre,
        color: 'primary',
        icon: <ShoppingCart className="w-5 h-5" />,
      });
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }, []);

  const actualizarCantidad = useCallback((id, cantidad) => {
    const producto = productos.find(p => p.id === id);
    if (cantidad > producto?.stock) {
      toast('Stock insuficiente', {
        description: `Solo hay ${producto.stock} unidades`,
        color: 'warning',
      });
      return;
    }
    
    if (cantidad === 0) {
      const item = carrito.find(i => i.id === id);
      toast('Producto eliminado', {
        description: item?.nombre,
        color: 'default',
        icon: <Trash2 className="w-5 h-5" />,
      });
      setCarrito(prev => prev.filter(item => item.id !== id));
    } else {
      setCarrito(prev => prev.map(item =>
        item.id === id ? { ...item, cantidad } : item
      ));
    }
  }, [productos, carrito]);

  // Cálculos
  const calcularSubtotal = useCallback(() => {
    return carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
  }, [carrito]);

  const calcularImpuesto = useCallback(() => {
    return calcularSubtotal() * (iva / 100);
  }, [calcularSubtotal, iva]);

  const calcularTotal = useCallback(() => {
    return calcularSubtotal() + calcularImpuesto();
  }, [calcularSubtotal, calcularImpuesto]);

  const convertirMoneda = useCallback((valor) => {
    if (!moneda) return '0.00';
    return (valor * moneda.tasa_cambio).toFixed(2);
  }, [moneda]);

  const finalizarVenta = async () => {
    if (carrito.length === 0 || !metodoSeleccionado) return;
    
    setProcesando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast('¡Venta completada!', {
        description: `Total: ${moneda?.simbolo}${convertirMoneda(calcularTotal())}`,
        color: 'success',
        icon: <Check className="w-5 h-5" />,
      });
      
      onClosePago();
      onOpenDetalle();
    } catch (error) {
      toast('Error al procesar', {
        description: 'Intenta nuevamente',
        color: 'danger',
      });
    } finally {
      setProcesando(false);
    }
  };

  const nuevaVenta = () => {
    setCarrito([]);
    setMetodoSeleccionado(null);
    setClienteSeleccionado(null);
    onCloseDetalle();
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo_barras?.includes(busqueda)
  );

  // Obtener stock disponible considerando el carrito
  const getStockDisponible = (producto) => {
    const enCarrito = carrito.find(item => item.id === producto.id);
    return producto.stock - (enCarrito?.cantidad || 0);
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalProductos = carrito.length;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-content1">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-default-100/20">
      {/* Header Minimalista */}
      <header className="bg-content1/80 backdrop-blur-xl border-b border-divider px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">POS Venta</h1>
            <p className="text-xs text-foreground-500 hidden sm:block">Sistema Punto de Venta</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            size="sm"
            selectedKeys={[monedaSeleccionada]}
            onChange={(e) => setMonedaSeleccionada(e.target.value)}
            className="w-24"
            classNames={{
              trigger: "h-10 min-h-10 bg-default-100",
              value: "text-sm font-semibold"
            }}
          >
            {monedas.map(m => (
              <SelectItem key={m.codigo}>{m.codigo}</SelectItem>
            ))}
          </Select>

          <Button
            size="sm"
            variant="flat"
            startContent={<User className="w-4 h-4" />}
            onClick={onOpenCliente}
            className="hidden sm:flex"
          >
            {clienteSeleccionado?.nombre || 'Cliente'}
          </Button>

          <Badge content={totalItems} color="danger" isInvisible={totalItems === 0} shape="circle">
            <Button
              isIconOnly
              size="sm"
              color="primary"
              variant="shadow"
              onClick={() => isDrawerOpen ? onDrawerClose() : onDrawerOpen()}
              className="lg:hidden"
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </Badge>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Búsqueda */}
          <div className="p-4 md:p-5 lg:p-6">
            <Input
              placeholder="Buscar producto por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              startContent={<Search className="w-4 h-4 text-default-400" />}
              endContent={
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={onOpenScanner}
                >
                  <Scan className="w-4 h-4" />
                </Button>
              }
              size="lg"
              radius="lg"
              classNames={{
                input: "text-sm",
                inputWrapper: "shadow-sm bg-default-100 border-2 border-transparent hover:border-primary/20"
              }}
            />
          </div>

          {/* Grid de Productos Minimalista */}
          <div className="flex-1 overflow-y-auto px-4 md:px-5 lg:px-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
              {productosFiltrados.map(producto => {
                const stockDisponible = getStockDisponible(producto);
                const enCarrito = carrito.find(item => item.id === producto.id);
                
                return (
                  <Card
                    key={producto.id}
                    isPressable={stockDisponible > 0}
                    onPress={() => agregarAlCarrito(producto)}
                    className={`
                      group relative overflow-hidden transition-all duration-200
                      ${stockDisponible === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg'}
                    `}
                    shadow="sm"
                  >
                    <CardBody className="p-3 md:p-4">
                      {/* Icono del producto */}
                      <div className="aspect-square bg-gradient-to-br from-default-100 to-default-200 rounded-xl mb-3 flex items-center justify-center relative">
                        <Package className="w-10 h-10 md:w-12 md:h-12 text-default-300" />
                        
                        {/* Badge de stock solo cuando hay items en carrito */}
                        {enCarrito && (
                          <div className="absolute top-2 right-2">
                            {stockDisponible === 0 ? (
                              <Chip size="sm" color="danger" variant="flat" className="text-[10px] font-bold">
                                Agotado
                              </Chip>
                            ) : stockDisponible <= 3 ? (
                              <Chip size="sm" color="warning" variant="flat" className="text-[10px] font-bold">
                                ¡{stockDisponible}!
                              </Chip>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Info del producto */}
                      <h3 className="font-semibold text-xs md:text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
                        {producto.nombre}
                      </h3>
                      <p className="text-[10px] text-default-400 mb-2">#{producto.codigo_barras}</p>
                      <p className="text-base md:text-lg font-bold text-primary">
                        {moneda?.simbolo}{convertirMoneda(producto.precio_venta)}
                      </p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Carrito Desktop */}
        <div className="hidden lg:flex w-96 xl:w-[420px] border-l border-divider bg-content1/50 backdrop-blur-xl flex-col">
          <div className="p-5 border-b border-divider">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Carrito</h3>
              <div className="flex gap-2">
                <Chip size="sm" variant="flat" color="primary">{totalProductos}</Chip>
                <Chip size="sm" variant="flat" color="secondary">{totalItems}u</Chip>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {carrito.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto rounded-full bg-default-100 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-default-300" />
                </div>
                <p className="text-sm text-default-500 font-medium">Carrito vacío</p>
              </div>
            ) : (
              carrito.map(item => (
                <Card key={item.id} shadow="none" className="bg-default-50">
                  <CardBody className="p-3">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-default-100 to-default-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-default-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.nombre}</p>
                        <p className="text-xs text-default-500">{moneda?.simbolo}{convertirMoneda(item.precio_venta)}</p>
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
                            variant="light"
                            onClick={() => actualizarCantidad(item.id, 0)}
                            className="ml-auto h-7 w-7 min-w-7"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">
                          {moneda?.simbolo}{convertirMoneda(item.precio_venta * item.cantidad)}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          <div className="p-5 border-t border-divider space-y-4 bg-content1">
            <div className="flex items-center gap-3">
              <Input
                label="IVA %"
                type="number"
                value={iva}
                onChange={(e) => setIva(Math.max(0, Math.min(100, Number(e.target.value))))}
                size="sm"
                className="flex-1"
              />
              <div className="text-right">
                <p className="text-xs text-default-500">Impuesto</p>
                <p className="text-sm font-bold text-warning">{moneda?.simbolo}{convertirMoneda(calcularImpuesto())}</p>
              </div>
            </div>

            <Divider />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-default-600">Subtotal:</span>
                <span className="font-semibold">{moneda?.simbolo}{convertirMoneda(calcularSubtotal())}</span>
              </div>
              <div className="flex justify-between text-warning">
                <span>IVA ({iva}%):</span>
                <span className="font-semibold">+{moneda?.simbolo}{convertirMoneda(calcularImpuesto())}</span>
              </div>
            </div>

            <Divider />

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-3xl font-bold text-primary">
                {moneda?.simbolo}{convertirMoneda(calcularTotal())}
              </span>
            </div>

            <Button
              color="primary"
              size="lg"
              className="w-full font-bold shadow-lg"
              isDisabled={carrito.length === 0}
              onClick={onOpenPago}
              startContent={<CreditCard className="w-5 h-5" />}
            >
              Procesar Pago
            </Button>
          </div>
        </div>

        {/* Drawer Mobile/Tablet */}
        <Drawer 
          isOpen={isDrawerOpen} 
          onOpenChange={onOpenChange}
          placement="right"
          size="lg"
          classNames={{
            base: "lg:hidden",
          }}
        >
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="border-b border-divider">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-bold">Carrito</h3>
                    <div className="flex gap-2">
                      <Chip size="sm" variant="flat" color="primary">{totalProductos}</Chip>
                      <Chip size="sm" variant="flat" color="secondary">{totalItems}u</Chip>
                    </div>
                  </div>
                </DrawerHeader>
                <DrawerBody className="p-4 space-y-2">
                  {carrito.length === 0 ? (
                    <div className="text-center py-20">
                      <ShoppingCart className="w-16 h-16 mx-auto text-default-300 mb-4" />
                      <p className="text-sm text-default-500">Carrito vacío</p>
                    </div>
                  ) : (
                    carrito.map(item => (
                      <Card key={item.id} shadow="none" className="bg-default-50">
                        <CardBody className="p-3">
                          <div className="flex gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-default-100 to-default-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-default-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{item.nombre}</p>
                              <p className="text-xs text-default-500">{moneda?.simbolo}{convertirMoneda(item.precio_venta)}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                  className="h-7 w-7"
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
                                  className="h-7 w-7"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="danger"
                                  variant="light"
                                  onClick={() => actualizarCantidad(item.id, 0)}
                                  className="ml-auto h-7 w-7"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="font-bold text-sm text-primary">
                              {moneda?.simbolo}{convertirMoneda(item.precio_venta * item.cantidad)}
                            </p>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </DrawerBody>
                <DrawerFooter className="flex-col gap-3 border-t p-4">
                  <Input
                    label="IVA %"
                    type="number"
                    value={iva}
                    onChange={(e) => setIva(Math.max(0, Math.min(100, Number(e.target.value))))}
                    size="sm"
                  />
                  <div className="space-y-2 text-sm w-full">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{moneda?.simbolo}{convertirMoneda(calcularSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-warning">
                      <span>IVA ({iva}%):</span>
                      <span className="font-semibold">+{moneda?.simbolo}{convertirMoneda(calcularImpuesto())}</span>
                    </div>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center w-full">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {moneda?.simbolo}{convertirMoneda(calcularTotal())}
                    </span>
                  </div>
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full font-bold"
                    isDisabled={carrito.length === 0}
                    onClick={() => {
                      onClose();
                      onOpenPago();
                    }}
                    startContent={<CreditCard className="w-5 h-5" />}
                  >
                    Procesar Pago
                  </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </div>

      {/* Modal Escáner Profesional */}
      <Modal isOpen={isOpenScanner} onClose={onCloseScanner} size="md" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Escanear Código</h3>
            <p className="text-sm text-default-500 font-normal">Escanea o ingresa el código de barras</p>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Scan className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <Input
                placeholder="Código de barras"
                size="lg"
                autoFocus
                startContent={<Scan className="w-4 h-4 text-default-400" />}
                classNames={{
                  inputWrapper: "bg-default-100"
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseScanner}>Cancelar</Button>
            <Button color="primary" onPress={onCloseScanner}>Buscar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Cliente Profesional */}
      <Modal isOpen={isOpenCliente} onClose={onCloseCliente} size="md" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Seleccionar Cliente</h3>
            <p className="text-sm text-default-500 font-normal">Busca y selecciona un cliente</p>
          </ModalHeader>
          <ModalBody>
            <Input
              placeholder="Buscar por nombre..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              size="md"
              classNames={{
                inputWrapper: "bg-default-100"
              }}
            />
            <div className="space-y-2 mt-4 max-h-80 overflow-y-auto">
              {clientes.map((cliente) => (
                <Card
                  key={cliente.id}
                  isPressable
                  onPress={() => {
                    setClienteSeleccionado(cliente);
                    onCloseCliente();
                    toast('Cliente seleccionado', {
                      description: cliente.nombre,
                      color: 'success',
                    });
                  }}
                  className={`${
                    clienteSeleccionado?.id === cliente.id ? 'ring-2 ring-primary' : ''
                  }`}
                  shadow="none"
                >
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={cliente.nombre}
                        size="md"
                        className="flex-shrink-0"
                        color="primary"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{cliente.nombre}</p>
                        <Chip size="sm" variant="flat" color="secondary" className="mt-1">
                          {cliente.tipo}
                        </Chip>
                      </div>
                      {clienteSeleccionado?.id === cliente.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseCliente}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Método de Pago */}
      <Modal isOpen={isOpenPago} onClose={onClosePago} size="lg" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Método de Pago</h3>
            <p className="text-sm text-default-500 font-normal">Selecciona cómo recibirás el pago</p>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metodosPago.map(metodo => {
                const Icon = metodo.icono;
                return (
                  <Card
                    key={metodo.id}
                    isPressable
                    onPress={() => setMetodoSeleccionado(metodo.id)}
                    className={`${
                      metodoSeleccionado === metodo.id 
                        ? 'ring-2 ring-primary scale-105' 
                        : ''
                    } transition-all`}
                    shadow="sm"
                  >
                    <CardBody className="p-5 text-center">
                      <div className={`w-14 h-14 mx-auto rounded-2xl bg-${metodo.color}/10 flex items-center justify-center mb-3`}>
                        <Icon className={`w-7 h-7 text-${metodo.color}`} />
                      </div>
                      <p className="font-semibold">{metodo.nombre}</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
            {metodoSeleccionado && (
              <Card shadow="none" className="bg-default-100">
                <CardBody className="p-4">
                  <Input
                    label="Monto recibido"
                    placeholder="0.00"
                    startContent={<span className="text-default-500">{moneda?.simbolo}</span>}
                    size="lg"
                    type="number"
                    defaultValue={convertirMoneda(calcularTotal())}
                    classNames={{
                      inputWrapper: "bg-content1"
                    }}
                  />
                  <div className="flex justify-between mt-4">
                    <span className="text-default-600">Total a pagar:</span>
                    <span className="font-bold text-xl text-primary">
                      {moneda?.simbolo}{convertirMoneda(calcularTotal())}
                    </span>
                  </div>
                </CardBody>
              </Card>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClosePago}>Cancelar</Button>
            <Button 
              color="primary" 
              onPress={finalizarVenta} 
              isDisabled={!metodoSeleccionado}
              isLoading={procesando}
            >
              Finalizar Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Venta Completada */}
      <Modal isOpen={isOpenDetalle} onClose={onCloseDetalle} size="lg" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 items-center pt-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-2xl font-bold">¡Venta Completada!</h3>
            <p className="text-sm text-default-500 font-normal">Transacción procesada exitosamente</p>
          </ModalHeader>
          <ModalBody>
            <Card shadow="none" className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardBody className="p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-default-600">Cliente:</span>
                    <span className="font-semibold">{clienteSeleccionado?.nombre || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Método:</span>
                    <span className="font-semibold capitalize">{metodoSeleccionado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Moneda:</span>
                    <span className="font-semibold">{moneda?.nombre}</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base">Total Pagado:</span>
                    <span className="text-3xl font-bold text-primary">
                      {moneda?.simbolo}{convertirMoneda(calcularTotal())}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <div className="space-y-1 text-sm max-h-40 overflow-y-auto bg-default-50 rounded-lg p-3 mt-3">
              <p className="font-semibold mb-2 text-default-600">Productos:</p>
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span className="font-semibold">{moneda?.simbolo}{convertirMoneda(item.precio_venta * item.cantidad)}</span>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter className="flex-col gap-2">
            <Button
              color="primary"
              onPress={nuevaVenta}
              className="w-full font-semibold"
              size="lg"
            >
              Nueva Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
