
import React, { useState, useEffect } from 'react';
import { Send, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const ChatInterface = ({ scenario, onAnswer }) => {
    const [timeLeft, setTimeLeft] = useState(45);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isOptionsOpen, setIsOptionsOpen] = useState(true);

    useEffect(() => {
        setTimeLeft(45);
        setSelectedOption(null);
        setIsOptionsOpen(true);
    }, [scenario]);

    useEffect(() => {
        if (timeLeft > 0 && !selectedOption) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !selectedOption) {
            // Auto-submit timeout
            onAnswer(null);
        }
    }, [timeLeft, selectedOption, onAnswer]);

    const handleSelect = (option) => {
        setSelectedOption(option);
        // Add a small delay to show selection before moving on
        setTimeout(() => onAnswer(option), 500);
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full max-h-[500px] border border-slate-200">
            {/* Header */}
            <div className="bg-slate-800 p-3 flex items-center justify-between text-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="font-bold">B</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Jefe</h3>
                        <p className="text-[10px] text-slate-300">En línea</p>
                    </div>
                </div>
                <div className={`flex items-center gap-1 ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                    <Clock size={14} />
                    <span className="font-mono text-sm">{timeLeft}s</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[90%] text-slate-800 text-sm">
                        <p className="font-bold text-[10px] text-slate-500 mb-1">CONTEXTO: {scenario.context}</p>
                        <p>{scenario.question}</p>
                    </div>
                </div>

                {selectedOption && (
                    <div className="flex justify-end">
                        <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%] text-sm">
                            {selectedOption.text}
                        </div>
                    </div>
                )}
            </div>

            {/* Options Area */}
            <div className={`bg-white border-t border-slate-200 transition-all duration-300 flex flex-col ${isOptionsOpen ? 'max-h-[60%]' : 'max-h-[50px]'}`}>
                <button
                    onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                    className="w-full p-2 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase hover:bg-slate-50 border-b border-slate-100"
                >
                    <span>Elige tu respuesta:</span>
                    {isOptionsOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                <div className="p-2 space-y-2 overflow-y-auto">
                    {scenario.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(option)}
                            disabled={!!selectedOption}
                            className={`w-full text-left p-3 rounded-lg text-xs md:text-sm transition-all border ${selectedOption === option
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                                }`}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
