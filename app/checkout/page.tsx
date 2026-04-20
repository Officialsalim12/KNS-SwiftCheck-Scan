'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { checkOut } from '@/app/actions/attendance';
import { motion, AnimatePresence } from 'framer-motion';
import LogoHeader from '@/app/components/LogoHeader';
import { pickCameraIdByPreference, detectCameraFacing, CameraFacing } from '@/lib/cameraHelpers';
import { updateEventLocation } from '@/app/actions/event-auth';

export default function CheckOutPage() {
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
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [manualId, setManualId] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [stationLocation, setStationLocation] = useState<string | null>(null);
  const [stationLocationError, setStationLocationError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [cameraPreference, setCameraPreference] = useState<CameraFacing>('back');
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isOrg, setIsOrg] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSessionLocation = async () => {
      try {
        const response = await fetch('/api/event-session', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load session context');
        const data = await response.json();
        if (isMounted) {
          setStationLocation(data?.session?.location ?? null);
          setEventId(data?.session?.eventId ?? null);
          setIsOrg(!!data?.isOrg);
          setStationLocationError(null);
        }
      } catch {
        if (isMounted) {
          setStationLocation(null);
          setStationLocationError('Unable to determine your current location. Please log in again.');
        }
      }
    };
    fetchSessionLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCameraSelection = async (deviceId: string) => {
    if (!deviceId) return;
    setSelectedCameraId(deviceId);
    const selectedDevice = availableCameras.find((device) => device.id === deviceId);
    const inferredFacing = detectCameraFacing(selectedDevice?.label);
    if (inferredFacing !== 'unknown') {
      setCameraPreference(inferredFacing);
    }
    await startScanner(deviceId);
  };

  const handleSwitchCamera = async () => {
    const nextPreference: CameraFacing = cameraPreference === 'back' ? 'front' : 'back';
    setCameraPreference(nextPreference);
    const targetCameraId =
      pickCameraIdByPreference(availableCameras, nextPreference) ?? (await prepareCameraDevices());
    if (targetCameraId) {
      await startScanner(targetCameraId);
    }
  };

  const stopScanner = async (silent = false) => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        if (!silent) {
          console.error('Error stopping scanner:', e);
        }
      }
      try {
        await html5QrCodeRef.current.clear();
      } catch (e) {
        if (!silent) {
          console.error('Error clearing scanner:', e);
        }
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const prepareCameraDevices = async (): Promise<string | null> => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      setIsCameraLoading(true);
      const devices = await Html5Qrcode.getCameras();
      setAvailableCameras(devices);
      if (!devices.length) {
        setError('No camera devices detected. Please connect a camera and reload the page.');
        return null;
      }
      const existingSelection =
        selectedCameraId && devices.some((device) => device.id === selectedCameraId) ? selectedCameraId : null;
      const preferredCameraId =
        existingSelection ?? pickCameraIdByPreference(devices, cameraPreference) ?? devices[0].id ?? null;
      if (preferredCameraId) {
        setSelectedCameraId(preferredCameraId);
      }
      return preferredCameraId;
    } catch (err: any) {
      console.error('Unable to enumerate cameras', err);
      setError(err?.message || 'Unable to load camera list. Check permissions and refresh the page.');
      return null;
    } finally {
      setIsCameraLoading(false);
    }
  };

  const startScanner = async (cameraIdOverride?: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    setError(null);

    const cameraId =
      cameraIdOverride ||
      selectedCameraId ||
      (availableCameras.length ? pickCameraIdByPreference(availableCameras, cameraPreference) : await prepareCameraDevices());

    if (!cameraId) {
      setIsScanning(false);
      return;
    }

    await stopScanner(true);
    setIsSwitchingCamera(true);

    try {
      const scanner = new Html5Qrcode('qr-reader', {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { deviceId: { exact: cameraId } },
        { fps: 10, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0 },
        async (decodedText) => {
          await stopScanner(true);
          await processIdentifier(decodedText);
        },
        (errorMessage) => {
          if (
            typeof errorMessage === 'string' &&
            (errorMessage.includes('Permission') ||
              errorMessage.includes('NotAllowedError') ||
              errorMessage.includes('NotFoundError'))
          ) {
            setError(errorMessage);
            setIsScanning(false);
          }
        },
      );

      setSelectedCameraId(cameraId);
      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start camera', err);
      setError(err?.message || 'Failed to initialize camera');
      setIsScanning(false);
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeScanner = async () => {
      const defaultCameraId = await prepareCameraDevices();
      if (!isMounted || !defaultCameraId) return;
      await startScanner(defaultCameraId);
    };

    initializeScanner();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopScanner(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartScan = async () => {
    setError(null);
    setResult(null);
    await startScanner();
  };

  const processIdentifier = async (identifier: string) => {
    if (!identifier?.trim()) {
      setManualError('Please enter a valid ID number.');
      return;
    }

    setManualError(null);
    setError(null);
    setResult(null);
    setIsProcessing(true);

    try {
      const scanResult = await checkOut(identifier.trim());
      setResult(scanResult);
      setIsProcessing(false);

      timeoutRef.current = setTimeout(() => {
        setResult(null);
        void startScanner();
      }, scanResult?.error ? 2000 : 3000);
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to process check-out' });
      setIsProcessing(false);
      timeoutRef.current = setTimeout(() => {
        setResult(null);
        void startScanner();
      }, 2000);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await stopScanner();
    await processIdentifier(manualId);
    setManualId('');
  };

  const handleSetLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLocation = formData.get('newLocation') as string;

    if (!newLocation.trim()) return;

    setIsProcessing(true);
    try {
      const result = await updateEventLocation(newLocation.trim());
      if (result.success) {
        setStationLocation(newLocation.trim());
        setStationLocationError(null);
      } else {
        setStationLocationError(result.error || 'Failed to update location');
      }
    } catch (err) {
      setStationLocationError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <LogoHeader />
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-xl p-5 md:p-8 border-2 border-blue-200"
          >
            {eventId && (
              <div className="mb-4">
                <Link
                  href={isOrg ? `/org/dashboard/analytics/${eventId}` : `/admin/events/${eventId}/dashboard`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Return to Dashboard
                </Link>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-blue-600">
              Check Out
            </h1>
            <p className="text-center text-gray-600 mb-6 md:mb-8 text-base md:text-lg">Scan QR code to check out</p>

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

            {isProcessing && (
              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 text-blue-800 rounded-lg text-center">
                <p className="font-semibold text-lg">Processing check-out...</p>
              </div>
            )}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="checkout-camera-select" className="block text-sm font-semibold text-gray-700 mb-1">
                  Camera Source
                </label>
                <select
                  id="checkout-camera-select"
                  value={selectedCameraId ?? ''}
                  onChange={(e) => handleCameraSelection(e.target.value)}
                  disabled={isCameraLoading || isSwitchingCamera || availableCameras.length === 0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  {isCameraLoading && <option value="">Detecting cameras...</option>}
                  {!isCameraLoading && availableCameras.length === 0 && <option value="">No cameras detected</option>}
                  {!isCameraLoading && availableCameras.length > 0 && !selectedCameraId && (
                    <option value="">Select a camera</option>
                  )}
                  {availableCameras.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label || `Camera ${device.id.slice(0, 4)}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isCameraLoading
                    ? 'Looking for available cameras...'
                    : selectedCameraId
                      ? `Using ${availableCameras.find((device) => device.id === selectedCameraId)?.label || 'selected camera'}`
                      : 'Select a camera to begin scanning'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSwitchCamera}
                disabled={isCameraLoading || isSwitchingCamera || availableCameras.length <= 1}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Switch to {cameraPreference === 'back' ? 'Front' : 'Back'} Camera
              </button>
            </div>

            <div className="mb-6 rounded-lg overflow-hidden border-2 border-blue-100 bg-gray-900 relative">
              <div id="qr-reader" className="w-full min-h-[320px]"></div>
              {isSwitchingCamera && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white font-semibold">
                  Switching camera...
                </div>
              )}
            </div>

            <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 font-bold">Current Station Location</p>
              
              {!stationLocation ? (
                <div className="mt-2">
                  <p className="text-red-600 text-sm mb-3">Location Not Set</p>
                  <form onSubmit={handleSetLocation} className="space-y-2">
                    <input
                      type="text"
                      name="newLocation"
                      placeholder="e.g., Gate 4 Checkout"
                      required
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Setting...' : 'Set Station Location'}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold text-blue-700 mt-1">
                    {stationLocation}
                  </p>
                  {stationLocationError ? (
                    <p className="text-xs text-red-600 mt-2">{stationLocationError}</p>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 italic">
                        Stamping all records with this location.
                      </p>
                      <button 
                        onClick={() => setStationLocation(null)}
                        className="text-[10px] text-blue-600 hover:underline font-medium"
                      >
                        Change Location
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

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
                Participants can now check out with either their QR code or assigned ID number.
              </p>
            </form>

            {!isScanning && !error && !isProcessing && (
              <div className="mb-4 text-center">
                <button
                  onClick={handleStartScan}
                  className="w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
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
                  className={`p-6 rounded-lg ${result.success
                    ? 'bg-green-50 border-2 border-green-300 text-green-800'
                    : 'bg-red-50 border-2 border-red-300 text-red-800'
                    }`}
                >
                  {result.success ? (
                    <div className="text-center">
                      <p className="font-semibold text-2xl mb-2">
                        ✓ Checked Out Successfully
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
    </div>
  );
}
