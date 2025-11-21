'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { checkIn, processCheckInWithPhoto, processCheckInVerified } from '@/app/actions/attendance';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoCapture from '@/app/components/PhotoCapture';
import VerificationModal from '@/app/components/VerificationModal';
import LogoHeader from '@/app/components/LogoHeader';

export default function CheckInPage() {
  const [result, setResult] = useState<{
    success?: boolean;
    type?: string;
    participant?: string;
    message?: string;
    error?: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<{
    id: string;
    name: string;
    email: string;
    photo_url: string | null;
    event_id?: string;
  } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [manualId, setManualId] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [eventLocation, setEventLocation] = useState<string | null>(null);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.error('Error clearing scanner:', e);
      } finally {
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
  };

  const startScanner = () => {
    // Clear any existing scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {
        // Ignore cleanup errors
      });
    }

    setError(null);
    setIsScanning(true);

    try {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: { width: 300, height: 300 },
          fps: 10,
          aspectRatio: 1.0,
        },
        false // verbose
      );

      scanner.render(
        async (decodedText) => {
          await stopScanner();
          await processIdentifier(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're normal during scanning)
          // Only show error if it's a permission or setup issue
          if (
            errorMessage.includes('Permission') ||
            errorMessage.includes('NotAllowedError') ||
            errorMessage.includes('NotFoundError')
          ) {
            setError(errorMessage);
            setIsScanning(false);
          }
        }
      );

      scannerRef.current = scanner;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize camera');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // Start scanner when component mounts
    startScanner();

    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {
          // Ignore cleanup errors
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartScan = () => {
    setError(null);
    setResult(null);
    setShowPhotoCapture(false);
    setShowVerification(false);
    setCurrentParticipant(null);
    setLocation(eventLocation || '');
    startScanner();
  };

  const processIdentifier = async (identifier: string) => {
    if (!identifier?.trim()) {
      setManualError('Please enter a valid ID number.');
      return;
    }

    setManualError(null);
    setError(null);
    setResult(null);
    setShowPhotoCapture(false);
    setShowVerification(false);
    setCurrentParticipant(null);
    setIsProcessing(true);

    try {
      const scanResult = await checkIn(identifier.trim());

      if (scanResult.error) {
        setResult(scanResult);
        setIsProcessing(false);
        timeoutRef.current = setTimeout(() => {
          setResult(null);
          startScanner();
        }, 3000);
        return;
      }

      // Store event location if available
      if ('eventLocation' in scanResult && scanResult.eventLocation) {
        setEventLocation(scanResult.eventLocation);
        setLocation(scanResult.eventLocation);
      }

      if (scanResult.needsPhoto && scanResult.participant) {
        setCurrentParticipant(scanResult.participant);
        setShowPhotoCapture(true);
        setIsProcessing(false);
      } else if (scanResult.needsVerification && scanResult.participant) {
        setCurrentParticipant(scanResult.participant);
        setShowVerification(true);
        setIsProcessing(false);
      } else {
        setResult(scanResult);
        setIsProcessing(false);
        timeoutRef.current = setTimeout(() => {
          setResult(null);
          startScanner();
        }, 3000);
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to process check-in' });
      setIsProcessing(false);
      timeoutRef.current = setTimeout(() => {
        setResult(null);
        startScanner();
      }, 2000);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await stopScanner();
    await processIdentifier(manualId);
    setManualId('');
  };

  const handlePhotoCapture = async (photoDataUrl: string) => {
    if (!currentParticipant) return;
    
    setShowPhotoCapture(false);
    setIsProcessing(true);
    
    try {
      const result = await processCheckInWithPhoto(currentParticipant.id, photoDataUrl, location || undefined);
      setResult(result);
      setIsProcessing(false);
      
      timeoutRef.current = setTimeout(() => {
        setResult(null);
        setCurrentParticipant(null);
        setLocation(eventLocation || '');
        startScanner();
      }, 3000);
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to process check-in' });
      setIsProcessing(false);
      timeoutRef.current = setTimeout(() => {
        setResult(null);
        setCurrentParticipant(null);
        setLocation(eventLocation || '');
        startScanner();
      }, 2000);
    }
  };

  const handleVerificationApprove = async () => {
    if (!currentParticipant) return;
    
    setIsProcessing(true);
    
    try {
      const result = await processCheckInVerified(currentParticipant.id, location || undefined);
      setShowVerification(false);
      setResult(result);
      setIsProcessing(false);
      
      timeoutRef.current = setTimeout(() => {
        setResult(null);
        setCurrentParticipant(null);
        setLocation(eventLocation || '');
        startScanner();
      }, 3000);
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to process check-in' });
      setIsProcessing(false);
      setShowVerification(false);
      timeoutRef.current = setTimeout(() => {
        setResult(null);
        setCurrentParticipant(null);
        setLocation(eventLocation || '');
        startScanner();
      }, 2000);
    }
  };

  const handleVerificationDecline = () => {
    setShowVerification(false);
    setResult({ error: 'Check-in declined by reception' });
    setCurrentParticipant(null);
    setLocation(eventLocation || '');
    timeoutRef.current = setTimeout(() => {
      setResult(null);
      startScanner();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <LogoHeader />
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl p-8 border-2 border-blue-200"
          >
            <h1 className="text-4xl font-bold text-center mb-2 text-blue-600">
              Check In
            </h1>
            <p className="text-center text-gray-600 mb-8 text-lg">Scan QR code to check in</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 text-red-800 rounded-lg">
              <p className="font-semibold mb-2 text-lg">Camera Error</p>
              <p className="text-sm mb-3">{error}</p>
              <button
                onClick={handleStartScan}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {isProcessing && !showPhotoCapture && !showVerification && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 text-blue-800 rounded-lg text-center">
              <p className="font-semibold text-lg">Processing check-in...</p>
            </div>
          )}

          <div id="qr-reader" className="mb-6 rounded-lg overflow-hidden"></div>

          {/* Location Selection for Reception */}
          {(showPhotoCapture || showVerification || currentParticipant) && (
            <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (Required for Reception)
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={eventLocation ? `e.g., ${eventLocation} or enter second location` : 'Enter check-in location'}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the location where the participant is checking in. For events with multiple locations, specify which location.
              </p>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <label htmlFor="manual-id" className="block text-sm font-medium text-gray-700">
              Enter Participant ID Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="manual-id"
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., EMP-1001"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use ID Number
              </button>
            </div>
            {manualError && <p className="text-sm text-red-600">{manualError}</p>}
            <p className="text-xs text-gray-500">
              Participants can now check in with either their QR code or assigned ID number.
            </p>
          </form>

          {!isScanning && !error && !isProcessing && !showPhotoCapture && !showVerification && (
            <div className="mb-4 text-center">
              <button
                onClick={handleStartScan}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
              >
                Start Scanning
              </button>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 rounded-lg ${
                  result.success
                    ? 'bg-green-50 border-2 border-green-300 text-green-800'
                    : 'bg-red-50 border-2 border-red-300 text-red-800'
                }`}
              >
                {result.success ? (
                  <div className="text-center">
                    <p className="font-semibold text-2xl mb-2">
                      ✓ Checked In Successfully
                    </p>
                    {result.participant && (
                      <p className="text-lg mt-2 font-medium">{result.participant}</p>
                    )}
                    <p className="text-sm mt-2">{result.message}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-semibold text-xl">Error</p>
                    <p className="text-sm mt-2">{result.error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {isScanning && (
            <div className="mt-6 text-center">
              <p className="text-base text-gray-600 font-medium">
                Position the QR code within the frame
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure camera permissions are granted
              </p>
            </div>
          )}
        </motion.div>
        </div>
      </div>

      {showPhotoCapture && currentParticipant && (
        <PhotoCapture
          onCapture={handlePhotoCapture}
          onCancel={handleStartScan}
          participantName={currentParticipant.name}
        />
      )}

      {showVerification && currentParticipant && (
        <VerificationModal
          participant={currentParticipant}
          onApprove={handleVerificationApprove}
          onDecline={handleVerificationDecline}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}


