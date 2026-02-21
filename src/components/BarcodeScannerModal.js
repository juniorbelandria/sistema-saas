'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Tabs, Tab } from '@heroui/react';
import { addToast } from '@heroui/toast';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Keyboard } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess: onScanSuccessCallback }) {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [canScan, setCanScan] = useState(true); // Bandera para cooldown
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [selectedTab, setSelectedTab] = useState('camera');
  const [scanSuccess, setScanSuccess] = useState(false); // Para efecto visual
  const html5QrCodeRef = useRef(null);
  const lastScannedCodeRef = useRef(null);

  // Iniciar el escáner cuando el modal se abre y está en modo cámara
  useEffect(() => {
    if (isOpen && selectedTab === 'camera' && !isScanning) {
      startScanner();
    }

    // Limpiar el escáner cuando el modal se cierra
    return () => {
      cleanupScanner();
    };
  }, [isOpen, selectedTab]);

  const onScanSuccess = (decodedText) => {
    // Si no puede escanear (cooldown activo), ignorar
    if (!canScan) return;

    // Activar efecto visual
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 300);

    // Vibración táctil
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }

    // Desactivar escaneo temporalmente (cooldown)
    setCanScan(false);

    // Pasar el código al componente padre
    onScanSuccessCallback(decodedText);

    // Guardar el último código escaneado
    lastScannedCodeRef.current = decodedText;

    // Reactivar escaneo después del cooldown (2 segundos)
    setTimeout(() => {
      setCanScan(true);
      lastScannedCodeRef.current = null;
    }, 2000);
  };

  const onScanError = (errorMessage) => {
    // No hacer nada, es normal que haya errores mientras busca el código
  };

  const startScanner = async () => {
    // Si ya hay una instancia activa, no crear otra
    if (html5QrCodeRef.current && isScanning) {
      return;
    }

    try {
      setError(null);
      setIsScanning(true);
      setCanScan(true);

      // Crear instancia del escáner solo si no existe
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('barcode-scanner');
      }

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { 
          width: Math.min(250, window.innerWidth - 100), 
          height: Math.min(150, window.innerHeight / 4) 
        },
        aspectRatio: 1.777778
      };

      // Iniciar el escáner (NO se detiene después de cada lectura)
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
      html5QrCodeRef.current = null;
    }
  };

  const cleanupScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const isCurrentlyScanning = html5QrCodeRef.current.getState() === 2; // 2 = SCANNING
        if (isCurrentlyScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error al limpiar el escáner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
        setCanScan(true);
      }
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
    cleanupScanner();
    setManualCode('');
    setScanSuccess(false);
    onClose();
  };

  const handleTabChange = async (key) => {
    if (key === 'manual') {
      // Detener escáner al cambiar a manual
      await cleanupScanner();
    } else if (key === 'camera' && !isScanning) {
      // Reiniciar escáner al volver a cámara
      startScanner();
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
          {/* Indicador de estado */}
          {isScanning && (
            <div className="flex items-center gap-2 text-xs text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Escáner activo</span>
            </div>
          )}
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
                      {canScan ? 'Coloca el código de barras dentro del marco' : 'Procesando...'}
                    </p>
                    
                    {/* Contenedor del escáner con efecto visual */}
                    <div 
                      id="barcode-scanner" 
                      ref={scannerRef}
                      className={`w-full aspect-video rounded-lg overflow-hidden shadow-lg border-2 transition-all duration-300 ${
                        scanSuccess 
                          ? 'border-success shadow-success/50 scale-[1.02]' 
                          : canScan 
                            ? 'border-primary/20' 
                            : 'border-warning/50'
                      }`}
                    />
                    
                    <div className="flex items-center justify-center gap-2">
                      {!canScan && (
                        <div className="flex items-center gap-2 text-xs text-warning">
                          <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                          <span>Esperando para próximo escaneo...</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-[10px] sm:text-xs text-center text-foreground/50">
                      El escáner es continuo - puedes escanear múltiples productos
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
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
