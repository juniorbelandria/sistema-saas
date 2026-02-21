'use client';

import { useState, useRef } from 'react';
import { Select, SelectItem, Button, Badge, Input, Autocomplete, AutocompleteItem, Tabs, Tab, Tooltip } from '@heroui/react';
import { addToast } from '@heroui/toast';
import { ShoppingCart, Search, ScanBarcode, Grid3x3, Coffee, Milk, Sparkles, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import CartDrawer from '@/components/CartDrawer';
import PaymentModal from '@/components/PaymentModal';
import SuccessModal from '@/components/SuccessModal';

const PAISES = [
  { codigo: 've', nombre: 'Venezuela', moneda: 'VES', simbolo: 'Bs.', impuesto: 'IVA', tasa: 16 },
  { codigo: 'mx', nombre: 'México', moneda: 'MXN', simbolo: '$', impuesto: 'IVA', tasa: 16 },
  { codigo: 'co', nombre: 'Colombia', moneda: 'COP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'ar', nombre: 'Argentina', moneda: 'ARS', simbolo: '$', impuesto: 'IVA', tasa: 21 },
  { codigo: 'cl', nombre: 'Chile', moneda: 'CLP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'pe', nombre: 'Perú', moneda: 'PEN', simbolo: 'S/', impuesto: 'IGV', tasa: 18 },
  { codigo: 'ec', nombre: 'Ecuador', moneda: 'USD', simbolo: '$', impuesto: 'IVA', tasa: 12 },
  { codigo: 'bo', nombre: 'Bolivia', moneda: 'BOB', simbolo: 'Bs.', impuesto: 'IVA', tasa: 13 },
  { codigo: 'py', nombre: 'Paraguay', moneda: 'PYG', simbolo: '₲', impuesto: 'IVA', tasa: 10 },
  { codigo: 'uy', nombre: 'Uruguay', moneda: 'UYU', simbolo: '$', impuesto: 'IVA', tasa: 22 },
  { codigo: 'br', nombre: 'Brasil', moneda: 'BRL', simbolo: 'R$', impuesto: 'ICMS', tasa: 18 },
  { codigo: 'pa', nombre: 'Panamá', moneda: 'PAB', simbolo: 'B/.', impuesto: 'ITBMS', tasa: 7 },
  { codigo: 'cr', nombre: 'Costa Rica', moneda: 'CRC', simbolo: '₡', impuesto: 'IVA', tasa: 13 },
  { codigo: 'gt', nombre: 'Guatemala', moneda: 'GTQ', simbolo: 'Q', impuesto: 'IVA', tasa: 12 },
  { codigo: 'hn', nombre: 'Honduras', moneda: 'HNL', simbolo: 'L', impuesto: 'ISV', tasa: 15 },
  { codigo: 'sv', nombre: 'El Salvador', moneda: 'USD', simbolo: '$', impuesto: 'IVA', tasa: 13 },
  { codigo: 'ni', nombre: 'Nicaragua', moneda: 'NIO', simbolo: 'C$', impuesto: 'IVA', tasa: 15 },
  { codigo: 'do', nombre: 'Rep. Dominicana', moneda: 'DOP', simbolo: 'RD$', impuesto: 'ITBIS', tasa: 18 },
  { codigo: 'us', nombre: 'Estados Unidos', moneda: 'USD', simbolo: '$', impuesto: 'Sales Tax', tasa: 0 },
  { codigo: 'es', nombre: 'España', moneda: 'EUR', simbolo: '€', impuesto: 'IVA', tasa: 21 },
];

const CLIENTES = [
  { id: 1, nombre: 'Cliente General', email: 'general@pos.com', telefono: '' },
  { id: 2, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '+58 412 1234567' },
  { id: 3, nombre: 'María González', email: 'maria@email.com', telefono: '+58 424 7654321' },
  { id: 4, nombre: 'Carlos Rodríguez', email: 'carlos@email.com', telefono: '+58 414 9876543' },
  { id: 5, nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '+58 426 5551234' },
];

const PRODUCTOS = [
  { id: 1, nombre: 'Coca Cola 600ml', codigo: '7501234567890', precio: 15.00, stock: 50, categoria: 'bebidas' },
  { id: 2, nombre: 'Pan Integral 500g', codigo: '7501234567891', precio: 4.00, stock: 25, categoria: 'alimentos' },
  { id: 3, nombre: 'Leche Entera 1L', codigo: '7501234567892', precio: 15.00, stock: 3, categoria: 'lacteos' },
  { id: 4, nombre: 'Arroz Blanco 1kg', codigo: '7501234567893', precio: 15.00, stock: 40, categoria: 'alimentos' },
  { id: 5, nombre: 'Aceite Vegetal 1L', codigo: '7501234567894', precio: 15.00, stock: 20, categoria: 'alimentos' },
  { id: 6, nombre: 'Yogurt Natural 150g', codigo: '7501234567895', precio: 8.00, stock: 35, categoria: 'lacteos' },
  { id: 7, nombre: 'Huevos Blancos x12', codigo: '7501234567896', precio: 25.00, stock: 15, categoria: 'alimentos' },
  { id: 8, nombre: 'Azúcar Blanca 1kg', codigo: '7501234567897', precio: 12.00, stock: 45, categoria: 'alimentos' },
  { id: 9, nombre: 'Detergente Polvo 1kg', codigo: '7501234567898', precio: 28.00, stock: 2, categoria: 'limpieza' },
  { id: 10, nombre: 'Jabón de Lavar 200g', codigo: '7501234567899', precio: 6.50, stock: 0, categoria: 'limpieza' },
  { id: 11, nombre: 'Papel Higiénico x4', codigo: '7501234567900', precio: 22.00, stock: 28, categoria: 'limpieza' },
  { id: 12, nombre: 'Shampoo Anticaspa 400ml', codigo: '7501234567901', precio: 35.00, stock: 12, categoria: 'limpieza' },
  { id: 13, nombre: 'Pasta Dental Triple Acción', codigo: '7501234567902', precio: 18.00, stock: 33, categoria: 'limpieza' },
  { id: 14, nombre: 'Café Instantáneo 200g', codigo: '7501234567903', precio: 45.00, stock: 22, categoria: 'bebidas' },
  { id: 15, nombre: 'Té Verde x25 Sobres', codigo: '7501234567904', precio: 12.00, stock: 38, categoria: 'bebidas' },
  { id: 16, nombre: 'Jugo de Naranja 1L', codigo: '7501234567905', precio: 20.00, stock: 26, categoria: 'bebidas' },
  { id: 17, nombre: 'Galletas Marías 200g', codigo: '7501234567906', precio: 8.50, stock: 42, categoria: 'alimentos' },
  { id: 18, nombre: 'Atún en Aceite 140g', codigo: '7501234567907', precio: 16.00, stock: 31, categoria: 'alimentos' },
  { id: 19, nombre: 'Frijoles Negros 400g', codigo: '7501234567908', precio: 14.00, stock: 4, categoria: 'alimentos' },
  { id: 20, nombre: 'Queso Fresco 400g', codigo: '7501234567909', precio: 32.00, stock: 19, categoria: 'lacteos' },
  { id: 21, nombre: 'Cubitos Doña Gallina x48', codigo: '7702354949785', precio: 18.00, stock: 30, categoria: 'alimentos' },
];

export default function POSPage() {
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('us');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('1');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Estado del carrito: { productoId: { producto, cantidad } }
  const [carrito, setCarrito] = useState({});
  
  // Estado de stock actualizado
  const [stockProductos, setStockProductos] = useState(
    PRODUCTOS.reduce((acc, prod) => {
      acc[prod.id] = prod.stock;
      return acc;
    }, {})
  );

  // Estados para los modales del flujo de pago
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [ivaPercentage, setIvaPercentage] = useState(16);
  const [paymentData, setPaymentData] = useState(null);
  
  // Ref para controlar toasts y evitar spam
  const lastToastId = useRef(null);

  const monedaActual = PAISES.find(p => p.codigo === monedaSeleccionada);
  const clienteActual = CLIENTES.find(c => c.id === parseInt(clienteSeleccionado));

  // Actualizar IVA cuando cambia el país
  const handleMonedaChange = (codigo) => {
    setMonedaSeleccionada(codigo);
    const pais = PAISES.find(p => p.codigo === codigo);
    if (pais) {
      setIvaPercentage(pais.tasa);
    }
  };

  // Calcular total de items en carrito
  const itemsCarrito = Object.values(carrito).reduce((total, item) => total + item.cantidad, 0);

  // Calcular totales del carrito
  const calcularTotales = () => {
    const items = Object.values(carrito);
    const subtotal = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
    const iva = subtotal * (ivaPercentage / 100);
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  // Filtrar productos por categoría y búsqueda
  const productosFiltrados = PRODUCTOS
    .filter(p => categoriaSeleccionada === 'todos' || p.categoria === categoriaSeleccionada)
    .filter(p => {
      if (!busquedaProducto) return true;
      const searchLower = busquedaProducto.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(searchLower) ||
        p.codigo.includes(busquedaProducto)
      );
    });

  const agregarAlCarrito = (producto) => {
    // Verificar si hay stock disponible
    if (stockProductos[producto.id] <= 0) {
      return;
    }

    const itemExistente = carrito[producto.id];
    const isNewItem = !itemExistente;

    // Actualizar carrito
    setCarrito(prev => {
      if (itemExistente) {
        return {
          ...prev,
          [producto.id]: {
            ...itemExistente,
            cantidad: itemExistente.cantidad + 1
          }
        };
      } else {
        return {
          ...prev,
          [producto.id]: {
            producto,
            cantidad: 1
          }
        };
      }
    });

    // Reducir stock
    setStockProductos(prev => ({
      ...prev,
      [producto.id]: prev[producto.id] - 1
    }));

    // Toast eléctrico - UN SOLO TOAST con ID único, duración 1200ms
    const toastId = 'cart-action';
    if (isNewItem) {
      addToast({
        id: toastId,
        title: 'Producto agregado',
        description: `${producto.nombre}`,
        variant: 'solid',
        color: 'success',
        duration: 1200
      });
    } else {
      addToast({
        id: toastId,
        title: 'Cantidad actualizada',
        description: `${itemExistente.cantidad + 1} unidades`,
        variant: 'solid',
        color: 'primary',
        duration: 1200
      });
    }
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (productoId) => {
    const item = carrito[productoId];
    if (!item) return;

    // Restaurar stock
    setStockProductos(prev => ({
      ...prev,
      [productoId]: prev[productoId] + item.cantidad
    }));

    // Eliminar del carrito
    setCarrito(prev => {
      const newCarrito = { ...prev };
      delete newCarrito[productoId];
      return newCarrito;
    });
  };

  // Abrir modal de pago
  const handleOpenPaymentModal = (data) => {
    setPaymentData(data);
    setIsPaymentModalOpen(true);
  };

  // Confirmar pago desde el modal
  const handleConfirmPayment = (paymentInfo) => {
    const { subtotal, iva, total } = calcularTotales();
    
    // Generar número de venta
    const numeroVenta = `V${Date.now().toString().slice(-8)}`;
    const fecha = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Preparar datos de la venta
    const ventaData = {
      numeroVenta,
      fecha,
      items: Object.values(carrito),
      subtotal,
      iva,
      total,
      payment: paymentInfo,
      monedaActual,
      cliente: clienteActual
    };

    setSaleData(ventaData);
    setIsPaymentModalOpen(false);
    setIsCartOpen(false);
    setTimeout(() => setIsSuccessOpen(true), 300);
  };

  // Nueva venta
  const handleNewSale = () => {
    // Vaciar carrito
    setCarrito({});
    
    // Resetear IVA al valor por defecto del país
    const pais = PAISES.find(p => p.codigo === monedaSeleccionada);
    if (pais) {
      setIvaPercentage(pais.tasa);
    }
    
    // Cerrar modal
    setIsSuccessOpen(false);
    
    // Mostrar toast eléctrico
    addToast({
      id: 'new-sale',
      title: 'Nueva venta iniciada',
      description: `Venta #${saleData?.numeroVenta} completada`,
      variant: 'solid',
      color: 'success',
      duration: 1200
    });

    // Limpiar datos de venta
    setSaleData(null);
  };

  // Manejar el resultado del escáner
  const handleScanSuccess = (decodedText) => {
    // Buscar el producto por código
    const productoEncontrado = PRODUCTOS.find(p => p.codigo === decodedText);
    
    if (productoEncontrado) {
      // Verificar si hay stock disponible
      const stockDisponible = stockProductos[productoEncontrado.id];
      
      if (stockDisponible > 0) {
        // Producto encontrado con stock - agregarlo al carrito
        agregarAlCarrito(productoEncontrado);
        
        // Actualizar el campo de búsqueda temporalmente
        setBusquedaProducto(decodedText);
        
        // Limpiar el campo después de 2 segundos
        setTimeout(() => {
          setBusquedaProducto('');
        }, 2000);
      } else {
        // Producto sin stock
        addToast({
          id: 'scan-result',
          title: 'Producto agotado',
          description: `${productoEncontrado.nombre}`,
          variant: 'solid',
          color: 'danger',
          duration: 1200
        });
        
        // Limpiar el campo inmediatamente
        setBusquedaProducto('');
      }
    } else {
      // Producto no encontrado en la base de datos
      addToast({
        id: 'scan-result',
        title: 'No registrado',
        description: `Código: ${decodedText}`,
        variant: 'solid',
        color: 'danger',
        duration: 1200
      });
      
      // Limpiar el campo inmediatamente
      setBusquedaProducto('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-default-100">
      {/* Header */}
      <header className="bg-background border-b border-divider flex-shrink-0">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-3">
            {/* Logo y Título */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                <Image
                  src="/assets/imagenes/logonegro.webp"
                  alt="Sistema POS"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                  quality={85}
                />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-foreground">
                POS Venta
              </h1>
            </div>

            {/* Select de Moneda y Carrito */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Select de Moneda */}
              <Select
                selectedKeys={[monedaSeleccionada]}
                onSelectionChange={(keys) => handleMonedaChange(Array.from(keys)[0])}
                variant="bordered"
                size="sm"
                className="w-20 sm:w-24"
                classNames={{
                  trigger: "h-8 sm:h-9 min-h-[32px] sm:min-h-[36px] border-default-300",
                  value: "text-xs sm:text-sm font-semibold"
                }}
                aria-label="Seleccionar moneda"
                renderValue={() => (
                  <span className="text-xs sm:text-sm font-semibold">
                    {monedaActual?.moneda}
                  </span>
                )}
              >
                {PAISES.map((pais) => (
                  <SelectItem key={pais.codigo}>
                    {pais.moneda}
                  </SelectItem>
                ))}
              </Select>

              {/* Botón Carrito */}
              <Badge 
                content={itemsCarrito} 
                color="primary" 
                size="sm"
                placement="top-right"
              >
                <Button
                  color="primary"
                  size="sm"
                  className="h-8 sm:h-9 px-2 sm:px-3"
                  startContent={<ShoppingCart className="w-4 h-4" />}
                  onPress={() => setIsCartOpen(true)}
                >
                  <span className="hidden sm:inline text-xs">Carrito</span>
                </Button>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Búsqueda */}
      <div className="bg-background border-b border-divider flex-shrink-0">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Input Búsqueda de Productos */}
            <div className="flex-1">
              <Input
                value={busquedaProducto}
                onValueChange={setBusquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                placeholder="Buscar productos por nombre o código de barras..."
                size="sm"
                variant="bordered"
                startContent={<Search className="w-4 h-4 text-default-400" />}
                endContent={
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => setIsScannerOpen(true)}
                    className="min-w-6 w-6 h-6"
                    aria-label="Escanear código"
                  >
                    <ScanBarcode className="w-4 h-4 text-default-400 hover:text-primary transition-colors" />
                  </Button>
                }
                classNames={{
                  input: "text-xs sm:text-sm",
                  inputWrapper: "h-9 sm:h-10 border-default-300"
                }}
              />
            </div>

            {/* Autocomplete Clientes */}
            <div className="w-full sm:w-64 lg:w-72">
              <Autocomplete
                defaultSelectedKey="1"
                selectedKey={clienteSeleccionado}
                onSelectionChange={setClienteSeleccionado}
                placeholder="Buscar cliente..."
                size="sm"
                variant="bordered"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[200px]",
                  selectorButton: "text-default-400"
                }}
                inputProps={{
                  classNames: {
                    input: "text-xs sm:text-sm",
                    inputWrapper: "h-9 sm:h-10 border-default-300"
                  }
                }}
              >
                {CLIENTES.map((cliente) => (
                  <AutocompleteItem 
                    key={cliente.id} 
                    value={cliente.id}
                    textValue={cliente.nombre}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{cliente.nombre}</span>
                      <span className="text-xs text-foreground/60">{cliente.email}</span>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal con Scroll */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-2 sm:px-3 lg:px-4 py-3">
          {/* Tabs de Categorías - Centrado en móvil con contraste mejorado */}
          <div className="w-full flex justify-center overflow-x-auto py-2 mb-3">
            <Tabs 
              selectedKey={categoriaSeleccionada}
              onSelectionChange={setCategoriaSeleccionada}
              variant="bordered"
              color="primary"
              size="sm"
              aria-label="Categorías"
              classNames={{
                base: "w-full sm:w-auto",
                tabList: "mx-auto flex-nowrap gap-1.5 sm:gap-2 bg-background p-1 shadow-sm",
                cursor: "bg-primary shadow-sm",
                tab: "h-8 sm:h-9 px-3 sm:px-4",
                tabContent: "font-bold text-[11px] sm:text-xs"
              }}
            >
              <Tab 
                key="todos" 
                title={
                  <div className="flex items-center gap-1.5">
                    <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Todos</span>
                  </div>
                } 
              />
              <Tab 
                key="bebidas" 
                title={
                  <div className="flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Bebidas</span>
                  </div>
                } 
              />
              <Tab 
                key="alimentos" 
                title={
                  <div className="flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Alimentos</span>
                  </div>
                } 
              />
              <Tab 
                key="lacteos" 
                title={
                  <div className="flex items-center gap-1.5">
                    <Milk className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Lácteos</span>
                  </div>
                } 
              />
              <Tab 
                key="limpieza" 
                title={
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Limpieza</span>
                  </div>
                } 
              />
            </Tabs>
          </div>

          {/* Grid de Productos - Responsivo y compacto */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1.5 sm:gap-2 pb-4">
            {productosFiltrados.map((producto) => (
              <ProductCard
                key={producto.id}
                product={producto}
                onAddToCart={agregarAlCarrito}
                setSearchTerm={setBusquedaProducto}
                monedaActual={monedaActual}
                stockActual={stockProductos[producto.id]}
                cantidadEnCarrito={carrito[producto.id]?.cantidad || 0}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Modal de Escáner de Códigos de Barras */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Drawer del Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        carrito={carrito}
        onRemoveItem={eliminarDelCarrito}
        monedaActual={monedaActual}
        ivaPercentage={ivaPercentage}
        onIvaChange={setIvaPercentage}
        onOpenPaymentModal={handleOpenPaymentModal}
      />

      {/* Modal de Procesar Pago */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={calcularTotales().total}
        monedaActual={monedaActual}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Modal de Éxito */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        saleData={saleData}
        onNewSale={handleNewSale}
      />
    </div>
  );
}
