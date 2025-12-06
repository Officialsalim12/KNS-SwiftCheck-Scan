'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PhotoCaptureProps {
  onCapture: (photoDataUrl: string) => void;
  onCancel: () => void;
  participantName: string;
}

export default function PhotoCapture({ onCapture, onCancel, participantName }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [preferredFacingMode, setPreferredFacingMode] = useState<'user' | 'environment'>('user');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported on this device.');
      return;
    }

    // Start camera
    const initializeCamera = async () => {
      await startCamera();
    };

    initializeCamera();

    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAvailableDevices = async (activeDeviceId?: string | null) => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      if (videoDevices.length === 0) {
        setError('No camera devices were found.');
        return;
      }

      if (activeDeviceId) {
        setSelectedCameraId(activeDeviceId);
        return;
      }

      if (!selectedCameraId) {
        // Prefer a back camera if we can identify one
        const preferredDevice =
          videoDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')) ??
          videoDevices[0];
        setSelectedCameraId(preferredDevice.deviceId);
      }
    } catch (err) {
      console.warn('Unable to enumerate camera devices', err);
    }
  };

  const stopActiveStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
    setStream(null);
  };

  const startCamera = async (options?: { deviceId?: string; facingMode?: 'user' | 'environment' }) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported on this device.');
      return;
    }

    setIsSwitchingCamera(true);
    setError(null);

    stopActiveStream();

    const videoConstraints: MediaTrackConstraints =
      options?.deviceId
        ? {
            deviceId: { exact: options.deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        : {
            facingMode: options?.facingMode ?? preferredFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const videoTrack = mediaStream.getVideoTracks()[0];
      const settings = videoTrack?.getSettings();
      if (settings?.facingMode && settings.facingMode !== preferredFacingMode) {
        setPreferredFacingMode(settings.facingMode as 'user' | 'environment');
      }
      if (settings?.deviceId) {
        setSelectedCameraId(settings.deviceId);
        await refreshAvailableDevices(settings.deviceId);
      } else {
        await refreshAvailableDevices();
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(
        err?.message ||
          'Unable to access camera. Please make sure permissions are granted and no other app is using the camera.',
      );
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  const handleSelectCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    await startCamera({ deviceId });
  };

  const handleToggleCamera = async () => {
    const nextFacingMode = preferredFacingMode === 'user' ? 'environment' : 'user';
    setPreferredFacingMode(nextFacingMode);
    setSelectedCameraId(null);
    await startCamera({ facingMode: nextFacingMode });
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Convert to data URL
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setTimeout(() => {
        onCapture(photoDataUrl);
      }, 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Capture Photo for {participantName}
        </h2>
        <p className="text-gray-600 mb-6">
          Please position yourself in the frame and click &quot;Capture Photo&quot;
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label htmlFor="camera-select" className="block text-sm font-semibold text-gray-700 mb-1">
              Camera Source
            </label>
            <select
              id="camera-select"
              disabled={availableCameras.length <= 1 || isSwitchingCamera}
              value={selectedCameraId ?? ''}
              onChange={(e) => handleSelectCamera(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              {availableCameras.length === 0 && <option value="">Detecting cameras...</option>}
              {availableCameras.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 4)}`}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleToggleCamera}
            disabled={isSwitchingCamera}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Switch to {preferredFacingMode === 'user' ? 'Back' : 'Front'} Camera
          </button>
        </div>

        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          {isSwitchingCamera && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-semibold text-lg">
              Switching camera...
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={capturePhoto}
            disabled={isCapturing || !!error}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCapturing ? 'Capturing...' : 'Capture Photo'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

