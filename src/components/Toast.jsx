import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out ${bgColor} ${borderColor} ${textColor}`}>
            <Icon className="w-5 h-5 mr-3" />
            <span className="font-medium mr-8">{message}</span>
            <button
                onClick={onClose}
                className="absolute right-2 top-2 p-1 rounded-full hover:bg-black/5 transition-colors"
            >
                <X className="w-4 h-4 opacity-50" />
            </button>
        </div>
    );
};

export default Toast;
