import React, { useState, useEffect } from 'react';
import { Hand, Pointer } from 'lucide-react';

const SwipeTutorial = ({ visible, onDismiss }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none"
            style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out'
            }}
        >
            <div className="bg-slate-900/80 backdrop-blur-sm text-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="relative w-16 h-16 mb-4">
                    {/* Icon Animation */}
                    <div className="absolute inset-0 flex items-center justify-center animate-swipe-hint">
                        <Hand className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h3 className="text-lg font-bold mb-1 text-center">Desliza para navegar</h3>
                <p className="text-sm text-slate-200 text-center">Mueve la tarjeta hacia los lados</p>
            </div>
        </div>
    );
};

export default SwipeTutorial;
