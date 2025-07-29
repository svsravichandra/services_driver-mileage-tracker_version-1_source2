
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, XCircleIcon } from './Icons';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please ensure you have granted permission and are not using it in another app.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: stop all video tracks when the component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl.split(',')[1]); // Send only the base64 part
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      <h2 className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded-lg z-10">
        Position Odometer in View
      </h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={onCancel}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent flex justify-center items-center">
        <button
          onClick={onCancel}
          className="absolute left-6 p-3 rounded-full bg-black/40 text-white hover:bg-red-500/80 transition-colors"
          aria-label="Cancel"
        >
          <XCircleIcon />
        </button>
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 ring-offset-4 ring-offset-black/20 transition-transform active:scale-95"
          aria-label="Capture Odometer"
        >
          <div className="w-12 h-12 text-cyan-600"><CameraIcon /></div>
        </button>
      </div>
    </div>
  );
};

export default CameraView;
