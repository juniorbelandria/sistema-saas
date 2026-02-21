'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Tabs, Tab } from '@heroui/react';
import { addToast } from '@heroui/toast';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Keyboard } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess: onScanSuccessCallback }) {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [selectedTab, setSelectedTab] = useState('camera');
  const html5QrCodeRef = useRef(null);

  // Iniciar el escáner cuando el modal se abre y está en modo cámara
  useEffect(() => {
    if (isOpen && selectedTab === 'camera' && !isScanning) {
      startScanner();
    }

    // Limpiar el escáner cuando el modal se cierra o cambia de tab
    return () => {
      stopScanner();
    };
  }, [isOpen, selectedTab]);

  const onScanSuccess = (decodedText) => {
    // Reproducir sonido de éxito (opcional)
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(200); // Vibración táctil
    }

    // Detener el escáner
    stopScanner();

    // Pasar el código al componente padre
    onScanSuccessCallback(decodedText);

    // Cerrar el modal
    onClose();
  };

  const onScanError = (errorMessage) => {
    // No hacer nada, es normal que haya errores mientras busca el código
  };

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Crear instancia del escáner
      html5QrCodeRef.current = new Html5Qrcode('barcode-scanner');

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { 
          width: Math.min(250, window.innerWidth - 100), 
          height: Math.min(150, window.innerHeight / 4) 
        },
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

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      // Pasar el código al componente padre
      onScanSuccessCallback(manualCode.trim());
      
      // Limpiar y cerrar
      setManualCode('');
      onClose();
    }
  };

  const handleClose = () => {
    stopScanner();
    setManualCode('');
    onClose();
  };

  const handleTabChange = (key) => {
    if (key === 'manual') {
      stopScanner();
    }
    setSelectedTab(key);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      placement="center"
      size="lg"
      scrollBehavior="inside"
      classNames={{
        base: "max-w-[95vw] sm:max-w-md mx-2",
        backdrop: "bg-black/50 backdrop-blur-sm"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span className="text-base sm:text-lg font-bold">Buscar Producto</span>
          </div>
        </ModalHeader>
        
        <ModalBody className="py-2 sm:py-4">
          <Tabs 
            selectedKey={selectedTab}
            onSelectionChange={handleTabChange}
            variant="underlined"
            color="primary"
            classNames={{
              tabList: "w-full",
              tab: "h-10",
              tabContent: "text-sm font-semibold"
            }}
          >
            <Tab 
              key="camera" 
              title={
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Escanear</span>
                </div>
              }
            >
              <div className="py-4">
                {error ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 sm:p-6 bg-danger-50 rounded-lg">
                    <X className="w-10 h-10 sm:w-12 sm:h-12 text-danger" />
                    <p className="text-xs sm:text-sm text-center text-danger font-semibold">{error}</p>
                    <p className="text-[10px] sm:text-xs text-center text-foreground/60">
                      Asegúrate de permitir el acceso a la cámara en tu navegador
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm text-center text-foreground/70">
                      Coloca el código de barras dentro del marco
                    </p>
                    
                    {/* Contenedor del escáner */}
                    <div 
                      id="barcode-scanner" 
                      ref={scannerRef}
                      className="w-full aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-primary/20"
                    />
                    
                    <p className="text-[10px] sm:text-xs text-center text-foreground/50">
                      El escaneo se realizará automáticamente
                    </p>
                  </div>
                )}
              </div>
            </Tab>
            
            <Tab 
              key="manual" 
              title={
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Escribir</span>
                </div>
              }
            >
              <div className="py-4 flex flex-col gap-4">
                <p className="text-xs sm:text-sm text-center text-foreground/70">
                  Ingresa el código de barras manualmente
                </p>
                
                <Input
                  value={manualCode}
                  onValueChange={setManualCode}
                  placeholder="Ej: 7702354949785"
                  size="lg"
                  variant="bordered"
                  type="number"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSubmit();
                    }
                  }}
                  classNames={{
                    input: "text-center text-base sm:text-lg font-mono",
                    inputWrapper: "h-12 sm:h-14"
                  }}
                />
                
                <Button
                  color="primary"
                  size="lg"
                  onPress={handleManualSubmit}
                  isDisabled={!manualCode.trim()}
                  className="w-full font-semibold"
                >
                  Buscar Producto
                </Button>
              </div>
            </Tab>
          </Tabs>
        </ModalBody>

        <ModalFooter className="pt-2">
          <Button 
            color="danger" 
            variant="light" 
            onPress={handleClose}
            size="sm"
          >
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
