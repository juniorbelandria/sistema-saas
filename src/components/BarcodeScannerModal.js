'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }) {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const html5QrCodeRef = useRef(null);

  // Iniciar el escáner cuando el modal se abre
  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner();
    }

    // Limpiar el escáner cuando el modal se cierra
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Crear instancia del escáner
      html5QrCodeRef.current = new Html5Qrcode('barcode-scanner');

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778
      };

      // Iniciar el escáner
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Cámara trasera
        config,
        onScanSuccess,
        onScanError
      );
    } catch (err) {
      console.error('Error al iniciar el escáner:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Error al detener el escáner:', err);
      }
      setIsScanning(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    // Reproducir sonido de éxito (opcional)
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(200); // Vibración táctil
    }

    // Detener el escáner
    stopScanner();

    // Pasar el código al componente padre
    onScanSuccess(decodedText);

    // Cerrar el modal
    onClose();
  };

  const onScanError = (errorMessage) => {
    // No hacer nada, es normal que haya errores mientras busca el código
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      placement="center"
      size="lg"
      classNames={{
        base: "max-w-md",
        backdrop: "bg-black/50 backdrop-blur-sm"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold">Escanear Código de Barras</span>
          </div>
        </ModalHeader>
        
        <ModalBody className="py-6">
          {error ? (
            <div className="flex flex-col items-center justify-center gap-4 p-6 bg-danger-50 rounded-lg">
              <X className="w-12 h-12 text-danger" />
              <p className="text-sm text-center text-danger font-semibold">{error}</p>
              <p className="text-xs text-center text-foreground/60">
                Asegúrate de permitir el acceso a la cámara en tu navegador
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-center text-foreground/70">
                Coloca el código de barras dentro del marco
              </p>
              
              {/* Contenedor del escáner */}
              <div 
                id="barcode-scanner" 
                ref={scannerRef}
                className="w-full rounded-lg overflow-hidden shadow-lg border-2 border-primary/20"
              />
              
              <p className="text-xs text-center text-foreground/50">
                El escaneo se realizará automáticamente
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={handleClose}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
