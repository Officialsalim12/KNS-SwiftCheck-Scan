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

  useEffect(() => {
    // Start camera
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        streamRef.current = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please grant camera permissions.');
      }
    };

    startCamera();

    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
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

