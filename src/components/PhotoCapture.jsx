import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';

const PhotoCapture = ({ onCapture, initialImage }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [image, setImage] = useState(initialImage || null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialImage) {
            setImage(initialImage);
        }
    }, [initialImage]);

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Tu navegador no soporta el acceso a la cámara.");
            return;
        }
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 300, height: 300 }
            });
            setStream(mediaStream);
            setIsCameraOpen(true);
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("No se pudo acceder a la cámara. Por favor verifica los permisos.");
        }
    };

    useEffect(() => {
        if (isCameraOpen && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraOpen, stream]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to fixed size for consistency and storage efficiency
            const size = 300;
            canvas.width = size;
            canvas.height = size;

            // Draw video frame to canvas (center crop)
            const minScale = Math.max(size / video.videoWidth, size / video.videoHeight);
            const width = video.videoWidth * minScale;
            const height = video.videoHeight * minScale;
            const offsetX = (size - width) / 2;
            const offsetY = (size - height) / 2;

            context.drawImage(video, offsetX, offsetY, width, height);

            // Convert to base64 with lower quality to save space
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setImage(dataUrl);
            onCapture(dataUrl);
            stopCamera();
        }
    };

    const retakePhoto = () => {
        setImage(null);
        startCamera();
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative w-48 h-48 rounded-full overflow-hidden bg-slate-100 border-4 border-slate-200 shadow-inner group">
                {image ? (
                    <img src={image} alt="Captured" className="w-full h-full object-cover" />
                ) : isCameraOpen ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                        />
                        {/* Silhouette Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                                <path d="M20 100C20 80 35 75 50 75C65 75 80 80 80 100" fill="white" />
                                <circle cx="50" cy="55" r="20" fill="white" />
                                <path d="M25 45 C 25 25, 75 25, 75 45 L 80 48 L 20 48 Z" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Camera className="w-12 h-12 mb-2" />
                        <span className="text-xs text-center px-4">Sin foto</span>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex space-x-3">
                {!isCameraOpen && !image && (
                    <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
                    >
                        <Camera className="w-4 h-4" />
                        <span>Tomar Foto</span>
                    </button>
                )}

                {isCameraOpen && (
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            <Check className="w-4 h-4" />
                            <span>Capturar</span>
                        </button>
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            <span>Cancelar</span>
                        </button>
                    </div>
                )}

                {image && (
                    <button
                        type="button"
                        onClick={retakePhoto}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Repetir Foto</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default PhotoCapture;
