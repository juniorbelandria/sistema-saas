'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Badge } from '@heroui/react';
import { Search, Scan, ShoppingCart, Trash2, Plus, Minus, DollarSign, CreditCard, Banknote, Smartphone, Printer, Share2, User, Package, Check, Percent, Receipt } from 'lucide-react';

// Datos de ejemplo
const productosEjemplo = [
  { id: 1, nombre: 'Coca Cola 2L', codigo: '7501234567890', precio: 2.50, stock: 15 },
  { id: 2, nombre: 'Pan Blanco', codigo: '7501234567891', precio: 1.20, stock: 3 },
  { id: 3, nombre: 'Leche Entera 1L', codigo: '7501234567892', precio: 3.00, stock: 8 },
  { id: 4, nombre: 'Arroz 1kg', codigo: '7501234567893', precio: 4.50, stock: 0 },
  { id: 5, nombre: 'Aceite Vegetal', codigo: '7501234567894', precio: 5.80, stock: 12 },
  { id: 6, nombre: 'Azúcar 1kg', codigo: '7501234567895', precio: 2.80, stock: 20 },
  { id: 7, nombre: 'Café 500g', codigo: '7501234567896', precio: 8.50, stock: 2 },
  { id: 8, nombre: 'Pasta 500g', codigo: '7501234567897', precio: 1.80, stock: 25 },
];

const monedas = [
  { key: 'usd', label: 'USD', simbolo: '$', tasa: 1 },
  { key: 'bs', label: 'Bs', simbolo: 'Bs', tasa: 36.50 },
  { key: 'cop', label: 'COP', simbolo: '$', tasa: 4200 },
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
  const [descuento, setDescuento] = useState(0);
  const [impuesto, setImpuesto] = useState(0);
  const [carritoVisible, setCarritoVisible] = useState(false);
  
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
    const producto = productosEjemplo.find(p => p.id === id);
    if (cantidad > producto.stock) return;
    
    if (cantidad === 0) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else {
      setCarrito(carrito.map(item =>
        item.id === id ? { ...item, cantidad } : item
      ));
    }
  };

  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const calcularDescuento = () => {
    return calcularSubtotal() * (descuento / 100);
  };

  const calcularImpuesto = () => {
    return (calcularSubtotal() - calcularDescuento()) * (impuesto / 100);
  };

  const calcularTotal = () => {
    return calcularSubtotal() - calcularDescuento() + calcularImpuesto();
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

  const getCardClass = (stock) => {
    if (stock === 0) return 'bg-danger/10 border-danger/30';
    if (stock <= 5) return 'bg-warning/10 border-warning/30';
    return 'bg-content1';
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-content1">
      {/* Top Header */}
      <header className="bg-content1 shadow-md px-3 md:px-6 py-3 flex items-center justify-between gap-3 md:gap-6 flex-wrap">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-bold">POS - Punto de Venta</h1>
            <p className="text-[10px] md:text-xs text-foreground/60 hidden sm:block">Sistema POS</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Select
            size="sm"
            selectedKeys={[monedaSeleccionada]}
            onChange={(e) => setMonedaSeleccionada(e.target.value)}
            className="w-20 md:w-28"
            aria-label="Moneda"
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
            startContent={<User className="w-3 h-3 md:w-4 md:h-4" />}
            onClick={onOpenCliente}
            className="hidden sm:flex"
          >
            <span className="hidden md:inline">{clienteSeleccionado || 'Cliente'}</span>
          </Button>

          <Badge content={totalItems} color="danger" isInvisible={totalItems === 0} shape="circle">
            <Button
              isIconOnly
              size="sm"
              color="primary"
              variant="flat"
              className="lg:hidden"
              onClick={() => setCarritoVisible(!carritoVisible)}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Productos */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Búsqueda */}
          <div className="p-3 md:p-4 bg-content1/50">
            <Input
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              startContent={<Search className="w-4 h-4 text-foreground/40" />}
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
              size="md"
              classNames={{
                input: "text-sm",
                inputWrapper: "h-10"
              }}
            />
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
              {productosFiltrados.map(producto => (
                <Card
                  key={producto.id}
                  isPressable
                  onPress={() => agregarAlCarrito(producto)}
                  className={`shadow-sm hover:shadow-md transition-all border ${getCardClass(producto.stock)}`}
                >
                  <CardBody className="p-2 md:p-3">
                    <div className="aspect-square bg-content2 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                      <Package className="w-8 h-8 md:w-12 md:h-12 text-foreground/30" />
                      <Chip
                        size="sm"
                        color={producto.stock === 0 ? 'danger' : producto.stock <= 5 ? 'warning' : 'success'}
                        className="absolute top-1 right-1 text-[10px] h-5"
                      >
                        {producto.stock === 0 ? 'Agotado' : producto.stock}
                      </Chip>
                    </div>
                    <h3 className="font-semibold text-xs md:text-sm mb-1 line-clamp-2 min-h-[2.5rem]">{producto.nombre}</h3>
                    <p className="text-[10px] text-foreground/60 mb-1">#{producto.codigo.slice(-4)}</p>
                    <p className="text-sm md:text-lg font-bold text-primary">
                      {moneda.simbolo}{convertirMoneda(producto.precio)}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Carrito Desktop */}
        <div className={`${carritoVisible ? 'block' : 'hidden'} lg:block w-full lg:w-80 xl:w-96 border-l border-divider bg-content1 flex flex-col fixed lg:relative inset-0 z-50 lg:z-0`}>
          <div className="p-3 md:p-4 border-b border-divider flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              Carrito ({totalItems})
            </h3>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="lg:hidden"
              onClick={() => setCarritoVisible(false)}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
            {carrito.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 mx-auto text-foreground/20 mb-3" />
                <p className="text-sm text-foreground/60">Carrito vacío</p>
              </div>
            ) : (
              carrito.map(item => (
                <Card key={item.id} className="shadow-sm">
                  <CardBody className="p-2 md:p-3">
                    <div className="flex gap-2 md:gap-3">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-content2 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 md:w-8 md:h-8 text-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs md:text-sm truncate">{item.nombre}</p>
                        <p className="text-[10px] md:text-xs text-foreground/60">{moneda.simbolo}{convertirMoneda(item.precio)}</p>
                        <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="h-6 w-6 min-w-6"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs md:text-sm font-semibold w-6 md:w-8 text-center">{item.cantidad}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            isDisabled={item.cantidad >= item.stock}
                            className="h-6 w-6 min-w-6"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            onClick={() => actualizarCantidad(item.id, 0)}
                            className="ml-auto h-6 w-6 min-w-6"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs md:text-sm">{moneda.simbolo}{convertirMoneda(item.precio * item.cantidad)}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          <div className="p-3 md:p-4 border-t border-divider space-y-2 md:space-y-3 bg-content1">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Descuento %"
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                startContent={<Percent className="w-3 h-3" />}
                size="sm"
                classNames={{ input: "text-xs" }}
              />
              <Input
                label="Impuesto %"
                type="number"
                value={impuesto}
                onChange={(e) => setImpuesto(Number(e.target.value))}
                startContent={<Percent className="w-3 h-3" />}
                size="sm"
                classNames={{ input: "text-xs" }}
              />
            </div>

            <div className="space-y-1 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Subtotal:</span>
                <span className="font-semibold">{moneda.simbolo}{convertirMoneda(calcularSubtotal())}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-success">
                  <span>Descuento ({descuento}%):</span>
                  <span>-{moneda.simbolo}{convertirMoneda(calcularDescuento())}</span>
                </div>
              )}
              {impuesto > 0 && (
                <div className="flex justify-between text-warning">
                  <span>Impuesto ({impuesto}%):</span>
                  <span>+{moneda.simbolo}{convertirMoneda(calcularImpuesto())}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-divider">
              <span className="text-base md:text-lg font-bold">Total:</span>
              <span className="text-xl md:text-2xl font-bold text-primary">
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
      </div>

      {/* Modals */}
      <Modal isOpen={isOpenScanner} onClose={onCloseScanner} size="md">
        <ModalContent>
          <ModalHeader className="text-base">Escanear Código</ModalHeader>
          <ModalBody>
            <div className="py-6 text-center">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Scan className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-foreground/60 mb-4">Escanea o escribe el código</p>
              <Input placeholder="Código de barras" size="lg" autoFocus />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onCloseScanner} size="sm">Cancelar</Button>
            <Button color="primary" onPress={onCloseScanner} size="sm">Buscar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenCliente} onClose={onCloseCliente} size="md">
        <ModalContent>
          <ModalHeader className="text-base">Seleccionar Cliente</ModalHeader>
          <ModalBody>
            <Input placeholder="Buscar por nombre o teléfono..." startContent={<Search className="w-4 h-4" />} size="md" />
            <div className="space-y-2 mt-3">
              {['Cliente General', 'Juan Pérez', 'María García'].map((cliente, i) => (
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
                      <p className="font-semibold text-sm">{cliente}</p>
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

      <Modal isOpen={isOpenPago} onClose={onClosePago} size="lg">
        <ModalContent>
          <ModalHeader className="text-base">Método de Pago</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metodosPago.map(metodo => {
                const Icon = metodo.icono;
                return (
                  <Card
                    key={metodo.id}
                    isPressable
                    onPress={() => setMetodoSeleccionado(metodo.id)}
                    className={`shadow-md ${metodoSeleccionado === metodo.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardBody className="p-4 text-center">
                      <div className={`w-14 h-14 mx-auto rounded-2xl bg-${metodo.color}/10 flex items-center justify-center mb-2`}>
                        <Icon className={`w-7 h-7 text-${metodo.color}`} />
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
                    startContent={<span className="text-sm text-foreground/60">{moneda.simbolo}</span>}
                    size="lg"
                    type="number"
                  />
                  <div className="flex justify-between mt-3 text-sm">
                    <span>Total:</span>
                    <span className="font-bold">{moneda.simbolo}{convertirMoneda(calcularTotal())}</span>
                  </div>
                </CardBody>
              </Card>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClosePago} size="sm">Cancelar</Button>
            <Button color="primary" onPress={finalizarVenta} isDisabled={!metodoSeleccionado} size="sm">
              Finalizar Venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenDetalle} onClose={onCloseDetalle} size="lg">
        <ModalContent>
          <ModalHeader className="text-base">Venta Completada</ModalHeader>
          <ModalBody>
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-1">¡Venta Exitosa!</h3>
              <p className="text-sm text-foreground/60">Venta #00123</p>
            </div>
            <Card className="shadow-md mb-3">
              <CardBody className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Cliente:</span>
                    <span className="font-semibold">{clienteSeleccionado || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Método:</span>
                    <span className="font-semibold capitalize">{metodoSeleccionado}</span>
                  </div>
                  <div className="flex justify-between">
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
            <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span className="font-semibold">{moneda.simbolo}{convertirMoneda(item.precio * item.cantidad)}</span>
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
                Ticket
              </Button>
            </div>
            <Button color="success" startContent={<Share2 className="w-4 h-4" />} className="w-full" size="sm">
              WhatsApp
            </Button>
            <Button
              color="primary"
              onPress={() => {
                setCarrito([]);
                setMetodoSeleccionado(null);
                setDescuento(0);
                setImpuesto(0);
                onCloseDetalle();
              }}
              className="w-full"
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
