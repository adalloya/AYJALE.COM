import React, { useState, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Upload, CheckCircle2 } from 'lucide-react';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds limit

    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        chunksRef.current = []; // Ensure chunks are cleared
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Let browser decide the best mimeType
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                // Use the actual mime type determined by the browser
                const type = mediaRecorderRef.current.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                setAudioBlob(blob);
                chunksRef.current = [];

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            // Start timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const resetRecording = () => {
        setAudioURL(null);
        setAudioBlob(null);
        setTimeLeft(60);
    };

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        if (audioBlob) {
            onRecordingComplete(audioBlob);
            setIsSubmitted(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-slate-700">Reto de Speaking</h3>
                <p className="text-sm text-slate-500">Describe una situación difícil que hayas manejado en el trabajo.</p>
            </div>

            {!audioURL ? (
                <div className="flex flex-col items-center gap-4">
                    <div className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-slate-100'}`}>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={28} />}
                        </button>
                    </div>
                    <p className={`font-mono text-xl ${isRecording ? 'text-red-500' : 'text-slate-400'}`}>
                        00:{timeLeft.toString().padStart(2, '0')}
                    </p>
                    <p className="text-xs text-slate-400">
                        {isRecording ? 'Grabando... Toca para detener' : 'Toca el micrófono para iniciar'}
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-sm flex flex-col gap-4">
                    <audio
                        key={audioURL}
                        src={audioURL}
                        controls
                        playsInline
                        className="w-full"
                    />

                    <div className="flex gap-3 justify-center">
                        {!isSubmitted && (
                            <button
                                onClick={resetRecording}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                <RotateCcw size={18} />
                                Reintentar
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg shadow-sm transition-all ${isSubmitted
                                ? 'bg-green-700 cursor-default'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isSubmitted ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    Guardado
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Enviar Respuesta
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
