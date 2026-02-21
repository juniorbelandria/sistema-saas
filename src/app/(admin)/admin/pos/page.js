'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Drawer, DrawerContent, DrawerHeader, DrawerBody } from '@heroui/react';
import { Search, Scan, ShoppingCart, Trash2, Plus, Minus, X, DollarSign, CreditCard, Banknote, Smartphone, Printer, Share2, User, Phone, Package, Check } from 'lucide-react';

// Datos de ejemplo
const productosEjemplo = [
  { id: 1, nombre: 'Coca Cola 2L', codigo: '7501234567890', precio: 2.50, stock: 15, imagen: '/placeholder.jpg' },
  { id: 2, nombre: 'Pan Blanco', codigo: '7501234567891', precio: 1.20, stock: 8, imagen: '/placeholder.jpg' },
  { id: 3, nombre: 'Leche Entera 1L', codigo: '7501234567892', precio: 3.00, stock: 3, imagen: '/placeholder.jpg' },
  { id: 4, nombre: 'Arroz 1kg', codigo: '7501234567893', precio: 4.50, stock: 0, imagen: '/placeholder.jpg' },
  { id: 5, nombre: 'Aceite Vegetal', codigo: '7501234567894', precio: 5.80, stock: 12, imagen: '/placeholder.jpg' },
  { id: 6, nombre: 'Azúcar 1kg', codigo: '7501234567895', precio: 2.80, stock: 20, imagen: '/placeholder.jpg' },
];

const monedas = [
  { key: 'usd', label: 'USD - Dólar', simbolo: '$', tasa: 1 },
  { key: 'bs', label: 'Bs - Bolívar', simbolo: 'Bs', tasa: 36.50 },
  { key: 'cop', label: 'COP - Peso Colombiano', simbolo: '$', tasa: 4200 },
];

const metodosPago = [
  { id: 'efectivo', nombre: 'Efectivo', icono: Banknote, color: 'success' },
  { id: 'tarjeta', nombre: 'Tarjeta', icono: CreditCard, color: 'primary' },
  { id: 'transferencia', nombre: 'Transferencia', icono: Smartphone, color: 'secondary' },
  { id: 'mixto', nombre: 'Mixto', icono: DollarSign, color: 'warning' },
];

export default function POSPage() {
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('usd');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { isOpen: isOpenScanner, onOpen: onOpenScanner, onClose: onCloseScanner } = useDisclosure();
  const { isOpen: isOpenPago, onOpen: onOpenPago, onClose: onClosePago } = useDisclosure();
  const { isOpen: isOpenDetalle, onOpen: onOpenDetalle, onClose: onCloseDetalle } = useDisclosure();
  const { isOpen: isOpenCliente, onOpen: onOpenCliente, onClose: onCloseCliente } = useDisclosure();

  const moneda = monedas.find(m => m.key === monedaSeleccionada);

  const agregarAlCarrito = (producto) => {
    if (producto.stock === 0) return;
    
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      if (existe.cantidad < producto.stock) {
        setCarrito(carrito.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ));
      }
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad === 0) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad } : item
      ));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const convertirMoneda = (valor) => {
    return (valor * moneda.tasa).toFixed(2);
  };

  const finalizarVenta = () => {
    if (carrito.length === 0 || !metodoSeleccionado) return;
    onClosePago();
    onOpenDetalle();
  };

  const productosFiltrados = productosEjemplo.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.includes(busqueda)
  );

  const getStockColor = (stock) => {
    if (stock === 0) return 'danger';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  const CarritoContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-divider">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Carrito de Compras
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {carrito.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-foreground/20 mb-3" />
            <p className="text-foreground/60">Carrito vacío</p>
          </div>
        ) : (
          carrito.map(item => (
            <Card key={item.id} className="shadow-sm">
              <CardBody className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-content2 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-foreground/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.nombre}</p>
                    <p className="text-xs text-foreground/60">{moneda.simbolo}{convertirMoneda(item.precio)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-semibold w-8 text-center">{item.cantidad}</span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        isDisabled={item.cantidad >= item.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="flat"
                        onClick={() => actualizarCantidad(item.id, 0)}
                        className="ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{moneda.simbolo}{convertirMoneda(item.precio * item.cantidad)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <div className="p-4 border-t border-divider space-y-3 bg-content1">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {moneda.simbolo}{convertirMoneda(calcularTotal())}
          </span>
        </div>
        <Button
          color="primary"
          size="lg"
          className="w-full font-semibold"
          isDisabled={carrito.length === 0}
          onClick={onOpenPago}
        >
          Completar Venta
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-content1">
      {/* Top Header */}
      <header className="bg-content1 border-b border-divider px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">POS - Punto de Venta</h1>
            <p className="text-xs text-foreground/60">Sistema de ventas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            size="sm"
            selectedKeys={[monedaSeleccionada]}
            onChange={(e) => setMonedaSeleccionada(e.target.value)}
            className="w-40"
            aria-label="Seleccionar moneda"
          >
            {monedas.map(m => (
              <SelectItem key={m.key} value={m.key}>
                {m.label}
              </SelectItem>
            ))}
          </Select>

          <Button
            size="sm"
            variant="flat"
            startContent={<User className="w-4 h-4" />}
            onClick={onOpenCliente}
          >
            {clienteSeleccionado || 'Cliente'}
          </Button>

          <Button
            isIconOnly
            size="sm"
            color="primary"
            variant="flat"
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingCart className="w-4 h-4" />
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {carrito.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Búsqueda */}
          <div className="p-4 bg-content1 border-b border-divider">
            <Input
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              startContent={<Search className="w-4 h-4 text-foreground/40" />}
              endContent={
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onClick={onOpenScanner}
                >
                  <Scan className="w-4 h-4" />
                </Button>
              }
              size="lg"
            />
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {productosFiltrados.map(producto => (
                <Card
                  key={producto.id}
                  isPressable
                  onPress={() => agregarAlCarrito(producto)}
                  className={`shadow-md hover:shadow-lg transition-all ${
                    producto.stock === 0 ? 'opacity-60' : ''
                  }`}
                >
                  <CardBody className="p-3">
                    <div className="aspect-square bg-content2 rounded-lg mb-3 flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-foreground/40" />
                      <Chip
                        size="sm"
                        color={getStockColor(producto.stock)}
                        className="absolute top-2 right-2"
                      >
                        {producto.stock === 0 ? 'Agotado' : producto.stock}
                      </Chip>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{producto.nombre}</h3>
                    <p className="text-xs text-foreground/60 mb-2">Cód: {producto.codigo}</p>
                    <p className="text-lg font-bold text-primary">
                      {moneda.simbolo}{convertirMoneda(producto.precio)}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Carrito Desktop */}
        <div className="hidden lg:block w-96 border-l border-divider bg-content1">
          <CarritoContent />
        </div>
      </div>

      {/* Drawer Carrito Mobile */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} placement="right">
        <DrawerContent>
          <DrawerHeader>
            <h3 className="text-lg font-bold">Carrito</h3>
          </DrawerHeader>
          <DrawerBody className="p-0">
            <CarritoContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Modal Scanner */}
      <Modal isOpen={isOpenScanner} onClose={onCloseScanner}>
        <ModalContent>
          <ModalHeader>Escanear Código de Barras</ModalHeader>
          <ModalBody>
            <div className="py-8 text-center">
              <div className="w-32 h-32 mx-auto bg-content2 rounded-2xl flex items-center justify-center mb-4">
                <Scan className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <p className="text-foreground/60 mb-4">Escanea el código de barras del producto</p>
              <Input
                placeholder="O escribe el código manualmente"
                size="lg"
                autoFocus
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseScanner}>Cancelar</Button>
            <Button color="primary" onPress={onCloseScanner}>Buscar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Selección Cliente */}
      <Modal isOpen={isOpenCliente} onClose={onCloseCliente}>
        <ModalContent>
          <ModalHeader>Seleccionar Cliente</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              startContent={<Search className="w-4 h-4" />}
              size="lg"
            />
            <div className="space-y-2 mt-4">
              {['Cliente General', 'Juan Pérez - 555-1234', 'María García - 555-5678'].map((cliente, i) => (
                <Card
                  key={i}
                  isPressable
                  onPress={() => {
                    setClienteSeleccionado(cliente);
                    onCloseCliente();
                  }}
                  className="shadow-sm"
                >
                  <CardBody className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{cliente}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseCliente}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Método de Pago */}
      <Modal isOpen={isOpenPago} onClose={onClosePago} size="2xl">
        <ModalContent>
          <ModalHeader>Método de Pago</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metodosPago.map(metodo => {
                const Icon = metodo.icono;
                return (
                  <Card
                    key={metodo.id}
                    isPressable
                    onPress={() => setMetodoSeleccionado(metodo.id)}
                    className={`shadow-md ${
                      metodoSeleccionado === metodo.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <CardBody className="p-4 text-center">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-${metodo.color}/10 flex items-center justify-center mb-3`}>
                        <Icon className={`w-8 h-8 text-${metodo.color}`} />
                      </div>
                      <p className="font-semibold">{metodo.nombre}</p>
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
                    startContent={<span className="text-foreground/60">{moneda.simbolo}</span>}
                    size="lg"
                    type="number"
                  />
                  <div className="flex justify-between mt-3 text-sm">
                    <span>Total a pagar:</span>
                    <span className="font-bold">{moneda.simbolo}{convertirMoneda(calcularTotal())}</span>
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
            >
              Finalizar Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Detalle Venta */}
      <Modal isOpen={isOpenDetalle} onClose={onCloseDetalle} size="2xl">
        <ModalContent>
          <ModalHeader>Venta Completada</ModalHeader>
          <ModalBody>
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-3">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-2">¡Venta Exitosa!</h3>
              <p className="text-foreground/60">Venta #00123</p>
            </div>

            <Card className="shadow-md mb-4">
              <CardBody className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Cliente:</span>
                    <span className="font-semibold">{clienteSeleccionado || 'Cliente General'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Método de pago:</span>
                    <span className="font-semibold capitalize">{metodoSeleccionado}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Moneda:</span>
                    <span className="font-semibold">{moneda.label}</span>
                  </div>
                  <div className="border-t border-divider pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {moneda.simbolo}{convertirMoneda(calcularTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="space-y-2">
              <p className="text-sm font-semibold mb-2">Productos:</p>
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span className="font-semibold">{moneda.simbolo}{convertirMoneda(item.precio * item.cantidad)}</span>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter className="flex-col gap-2">
            <div className="flex gap-2 w-full">
              <Button
                variant="flat"
                startContent={<Printer className="w-4 h-4" />}
                className="flex-1"
              >
                Nota de Venta
              </Button>
              <Button
                variant="flat"
                startContent={<Printer className="w-4 h-4" />}
                className="flex-1"
              >
                Ticket
              </Button>
            </div>
            <Button
              color="success"
              startContent={<Share2 className="w-4 h-4" />}
              className="w-full"
            >
              Compartir por WhatsApp
            </Button>
            <Button
              color="primary"
              onPress={() => {
                setCarrito([]);
                setMetodoSeleccionado(null);
                onCloseDetalle();
              }}
              className="w-full"
            >
              Nueva Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
