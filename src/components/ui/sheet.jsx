'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 backdrop-blur-md transition-all duration-500 ease-in-out',
      'bg-black/40 dark:bg-black/60',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:duration-500 data-[state=open]:duration-500',
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = {
  right: 'inset-y-0 right-0 h-full w-full sm:max-w-md border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-500 ease-in-out',
  left: 'inset-y-0 left-0 h-full w-full sm:max-w-md border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-500 ease-in-out',
  top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top duration-500 ease-in-out',
  bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-500 ease-in-out',
};

const SheetContent = React.forwardRef(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 gap-4 bg-content1 transition-all ease-in-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:duration-500 data-[state=open]:duration-500',
        'flex flex-col',
        // Sombra premium para modo claro
        'shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-2xl',
        sheetVariants[side],
        className
      )}
      {...props}
    >
      {children}
      {/* Botón cerrar premium con efecto flotante */}
      <SheetPrimitive.Close 
        className={cn(
          'absolute right-4 top-4 z-10',
          'rounded-full p-2',
          'bg-default-100 dark:bg-content2',
          'text-default-600 dark:text-foreground/70',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300 ease-in-out',
          'hover:scale-110 hover:rotate-90',
          'hover:bg-default-200 dark:hover:bg-content3',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50'
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn('text-sm text-foreground/60', className)} {...props} />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
