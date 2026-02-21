'use client';

import { useState } from 'react';
import { Select, SelectItem, Button, Badge, Input, Autocomplete, AutocompleteItem, Tabs, Tab, Card, CardBody, CardFooter, Chip } from '@heroui/react';
import { ShoppingCart, Search, ScanBarcode, Grid3x3, Coffee, Milk, Sparkles, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';

const PAISES = [
  { codigo: 've', nombre: 'Venezuela', moneda: 'VES', simbolo: 'Bs.', impuesto: 'IVA', tasa: 16 },
  { codigo: 'mx', nombre: 'México', moneda: 'MXN', simbolo: '$', impuesto: 'IVA', tasa: 16 },
  { codigo: 'co', nombre: 'Colombia', moneda: 'COP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'us', nombre: 'Estados Unidos', moneda: 'USD', simbolo: '$', impuesto: 'Sales Tax', tasa: 0 },
  { codigo: 'pe', nombre: 'Perú', moneda: 'PEN', simbolo: 'S/', impuesto: 'IGV', tasa: 18 },
  { codigo: 'ar', nombre: 'Argentina', moneda: 'ARS', simbolo: '$', impuesto: 'IVA', tasa: 21 },
  { codigo: 'cl', nombre: 'Chile', moneda: 'CLP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'ec', nombre: 'Ecuador', moneda: 'USD', simbolo: '$', impuesto: 'IVA', tasa: 12 },
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
  { id: 2, nombre: 'Pan Integral Bimbo', codigo: '7501234567891', precio: 4.00, stock: 25, categoria: 'alimentos' },
  { id: 3, nombre: 'Leche Entera Alpura 1L', codigo: '7501234567892', precio: 15.00, stock: 30, categoria: 'lacteos' },
  { id: 4, nombre: 'Arroz Verde Valle 1kg', codigo: '7501234567893', precio: 15.00, stock: 40, categoria: 'alimentos' },
  { id: 5, nombre: 'Aceite Vegetal Capullo', codigo: '7501234567894', precio: 15.00, stock: 20, categoria: 'alimentos' },
  { id: 6, nombre: 'Yogurt Natural Danone', codigo: '7501234567895', precio: 8.00, stock: 35, categoria: 'lacteos' },
  { id: 7, nombre: 'Huevos San Juan x12', codigo: '7501234567896', precio: 25.00, stock: 15, categoria: 'alimentos' },
  { id: 8, nombre: 'Azúcar Estándar 1kg', codigo: '7501234567897', precio: 12.00, stock: 45, categoria: 'alimentos' },
  { id: 9, nombre: 'Detergente Ariel 1kg', codigo: '7501234567898', precio: 28.00, stock: 18, categoria: 'limpieza' },
  { id: 10, nombre: 'Jabón Zote 200g', codigo: '7501234567899', precio: 6.50, stock: 60, categoria: 'limpieza' },
  { id: 11, nombre: 'Papel Higiénico Suave', codigo: '7501234567900', precio: 22.00, stock: 28, categoria: 'limpieza' },
  { id: 12, nombre: 'Shampoo Pantene 400ml', codigo: '7501234567901', precio: 35.00, stock: 12, categoria: 'limpieza' },
  { id: 13, nombre: 'Pasta Dental Colgate', codigo: '7501234567902', precio: 18.00, stock: 33, categoria: 'limpieza' },
  { id: 14, nombre: 'Café Soluble Nescafé', codigo: '7501234567903', precio: 45.00, stock: 22, categoria: 'bebidas' },
  { id: 15, nombre: 'Té Verde Lipton x25', codigo: '7501234567904', precio: 12.00, stock: 38, categoria: 'bebidas' },
  { id: 16, nombre: 'Jugo Naranja Del Valle', codigo: '7501234567905', precio: 20.00, stock: 26, categoria: 'bebidas' },
  { id: 17, nombre: 'Galletas Marías Gamesa', codigo: '7501234567906', precio: 8.50, stock: 42, categoria: 'alimentos' },
  { id: 18, nombre: 'Atún Dolores Lata', codigo: '7501234567907', precio: 16.00, stock: 31, categoria: 'alimentos' },
  { id: 19, nombre: 'Frijoles Negros La Costeña', codigo: '7501234567908', precio: 14.00, stock: 27, categoria: 'alimentos' },
  { id: 20, nombre: 'Queso Panela Lala 400g', codigo: '7501234567909', precio: 32.00, stock: 19, categoria: 'lacteos' },
];

export default function POSPage() {
  const [monedaSeleccionada, setMonedaSeleccionada] = useState(new Set(['us']));
  const [itemsCarrito] = useState(4);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('1');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');

  const monedaActual = PAISES.find(p => p.codigo === Array.from(monedaSeleccionada)[0]);

  const productosFiltrados = categoriaSeleccionada === 'todos' 
    ? PRODUCTOS 
    : PRODUCTOS.filter(p => p.categoria === categoriaSeleccionada);

  const agregarAlCarrito = (producto) => {
    console.log('Agregando al carrito:', producto);
  };

  return (
    <div className="min-h-screen bg-default-100">
      {/* Header */}
      <header className="bg-background border-b border-divider sticky top-0 z-50">
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
                selectedKeys={monedaSeleccionada}
                onSelectionChange={setMonedaSeleccionada}
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
                  <SelectItem 
                    key={pais.codigo} 
                    value={pais.codigo}
                    textValue={`${pais.moneda} ${pais.nombre}`}
                    startContent={
                      <span className="text-lg font-bold">{pais.simbolo}</span>
                    }
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">{pais.moneda}</span>
                      <span className="text-xs text-foreground/60">{pais.nombre}</span>
                    </div>
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
                >
                  <span className="hidden sm:inline text-xs">Carrito</span>
                </Button>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Búsqueda */}
      <div className="bg-background border-b border-divider">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Input Búsqueda de Productos */}
            <div className="flex-1">
              <Input
                value={busquedaProducto}
                onValueChange={setBusquedaProducto}
                placeholder="Buscar productos por nombre o código de barras..."
                size="sm"
                variant="bordered"
                startContent={<Search className="w-4 h-4 text-default-400" />}
                endContent={
                  <button className="focus:outline-none" aria-label="Escanear código">
                    <ScanBarcode className="w-4 h-4 text-default-400 hover:text-primary transition-colors" />
                  </button>
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

      {/* Contenido Principal */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Tabs de Categorías */}
        <div className="flex justify-center mb-6">
          <Tabs 
            selectedKey={categoriaSeleccionada}
            onSelectionChange={setCategoriaSeleccionada}
            variant="bordered"
            color="primary"
            radius="sm"
            size="sm"
            classNames={{
              tabList: "gap-2 bg-default-100 p-1",
              cursor: "bg-primary shadow-md",
              tab: "h-9 px-4",
              tabContent: "group-data-[selected=true]:text-white text-foreground/60 font-semibold text-xs"
            }}
          >
            <Tab 
              key="todos" 
              title={
                <div className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  <span>Todos</span>
                </div>
              } 
            />
            <Tab 
              key="bebidas" 
              title={
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  <span>Bebidas</span>
                </div>
              } 
            />
            <Tab 
              key="alimentos" 
              title={
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Alimentos</span>
                </div>
              } 
            />
            <Tab 
              key="lacteos" 
              title={
                <div className="flex items-center gap-2">
                  <Milk className="w-4 h-4" />
                  <span>Lácteos</span>
                </div>
              } 
            />
            <Tab 
              key="limpieza" 
              title={
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Limpieza</span>
                </div>
              } 
            />
          </Tabs>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 sm:gap-3">
          {productosFiltrados.map((producto) => (
            <Card 
              key={producto.id}
              isPressable
              onPress={() => agregarAlCarrito(producto)}
              className="border border-divider hover:border-primary hover:shadow-md transition-all"
            >
              <CardBody className="p-3 gap-3">
                {/* Nombre del Producto */}
                <h3 className="text-xs font-bold text-foreground line-clamp-2 min-h-[32px] leading-tight">
                  {producto.nombre}
                </h3>

                {/* Código */}
                <p className="text-[10px] text-primary font-mono">
                  + {producto.codigo}
                </p>

                {/* Precio y Stock en la misma línea */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] text-foreground/40 uppercase tracking-wider mb-1">Precio</p>
                    <p className="text-base font-bold text-foreground">
                      {monedaActual?.simbolo}{producto.precio.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-foreground/40 uppercase tracking-wider mb-1">Stock</p>
                    <Chip 
                      size="sm" 
                      variant="flat"
                      radius="sm"
                      className="h-6 bg-default-200 text-foreground"
                    >
                      <span className="text-xs font-bold">{producto.stock}</span>
                    </Chip>
                  </div>
                </div>
              </CardBody>

              <CardFooter className="pt-0 px-3 pb-3">
                <Button
                  color="primary"
                  size="sm"
                  className="w-full h-8 text-xs font-bold"
                  startContent={<ShoppingCart className="w-3 h-3" />}
                >
                  Agregar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
