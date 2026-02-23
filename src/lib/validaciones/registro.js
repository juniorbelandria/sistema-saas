import { z } from 'zod';

// Esquema de validación para el registro completo
export const registroSchema = z.object({
  // Paso 1: Cuenta del Propietario
  nombreCompleto: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  
  email: z.string()
    .email('Correo electrónico inválido')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  
  confirmarPassword: z.string(),
  
  // Paso 2: Información del Negocio
  nombreNegocio: z.string()
    .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  
  tipoNegocio: z.enum([
    'bodega', 'supermercado', 'farmacia', 'restaurante', 
    'cafeteria', 'ferreteria', 'tienda_ropa', 'panaderia', 
    'libreria', 'otro'
  ], { errorMap: () => ({ message: 'Selecciona un tipo de negocio' }) }),
  
  direccion: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección es demasiado larga'),
  
  telefono: z.string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono es demasiado largo'),
  
  // Paso 3: Configuración Fiscal
  codigoPais: z.string()
    .length(3, 'Código de país inválido')
    .toUpperCase(),
  
  codigoMoneda: z.string()
    .min(2, 'Código de moneda inválido')
    .max(10, 'Código de moneda inválido')
    .toUpperCase(),
  
  idFiscal: z.string()
    .optional()
    .nullable(),
  
  razonSocial: z.string()
    .min(2, 'La razón social debe tener al menos 2 caracteres')
    .max(150, 'La razón social es demasiado larga'),
  
  regimenFiscal: z.string()
    .optional()
    .nullable(),
  
  usaFacturaElectronica: z.boolean().default(false),
  
}).refine((data) => data.password === data.confirmarPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarPassword'],
});

// Tipos de negocio disponibles
export const TIPOS_NEGOCIO = [
  { value: 'bodega', label: 'Bodega' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'farmacia', label: 'Farmacia' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'ferreteria', label: 'Ferretería' },
  { value: 'tienda_ropa', label: 'Tienda de Ropa' },
  { value: 'panaderia', label: 'Panadería' },
  { value: 'libreria', label: 'Librería' },
  { value: 'otro', label: 'Otro' },
];
