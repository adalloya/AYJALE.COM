import React from 'react';

const PuzzleCanvas = ({ puzzle, onAnswer }) => {
    if (!puzzle) return null;

    const renderShape = (item, size = 'large') => {
        if (!item) return null;

        const baseSize = size === 'large' ? 'w-8 h-8' : 'w-4 h-4';
        const shapeSize = size === 'large' ? 'w-full h-full' : 'w-full h-full';

        // Handle Count (Progression)
        if (item.count && item.count > 1) {
            return (
                <div className="flex flex-wrap gap-1 justify-center items-center content-center w-full h-full p-1">
                    {Array.from({ length: item.count }).map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color || 'blue' }}
                        />
                    ))}
                </div>
            );
        }

        // Handle Single Shape (Rotation/Abstract)
        return (
            <div className={`${baseSize} flex items-center justify-center`}>
                <div
                    className={shapeSize}
                    style={{
                        backgroundColor: item.color || 'black',
                        transform: `rotate(${item.angle || 0}deg)`,
                        borderRadius: item.shape === 'circle' || item.shape === 'dot' ? '50%' : item.shape === 'triangle' ? '0' : '2px',
                        clipPath: item.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : item.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
                        position: 'relative'
                    }}
                >
                    {/* Marker for rotation visibility */}
                    {item.marker && (
                        <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                </div>
            </div>
        );
    };

    const renderAbstractMatrix = () => {
        return (
            <div className="grid grid-cols-3 gap-2 w-full max-w-[300px] mx-auto mb-8">
                {puzzle.matrix.map((row, rIdx) => (
                    row.map((cell, cIdx) => (
                        <div
                            key={`${rIdx}-${cIdx}`}
                            className="aspect-square bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center overflow-hidden"
                        >
                            {cell ? renderShape(cell, 'large') : (
                                <span className="text-2xl text-slate-300 font-bold">?</span>
                            )}
                        </div>
                    ))
                ))}
            </div>
        );
    };

    const renderNumericalSeries = () => {
        return (
            <div className="flex gap-4 justify-center mb-8 flex-wrap">
                {puzzle.series.map((num, idx) => (
                    <div
                        key={idx}
                        className={`w-16 h-16 flex items-center justify-center text-xl font-bold rounded-lg shadow-sm ${num === '?' ? 'bg-blue-100 text-blue-600 border-2 border-blue-400' : 'bg-white text-slate-700 border border-slate-200'
                            }`}
                    >
                        {num}
                    </div>
                ))}
            </div>
        );
    };

    const renderVerbalSyllogism = () => {
        return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 text-center">
                <p className="text-lg text-slate-800 font-medium leading-relaxed">
                    {puzzle.text}
                </p>
            </div>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6">
                {puzzle.type === 'abstract' && renderAbstractMatrix()}
                {puzzle.type === 'numerical' && renderNumericalSeries()}
                {puzzle.type === 'verbal' && renderVerbalSyllogism()}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {puzzle.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAnswer(idx)}
                        className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex items-center gap-3 group"
                    >
                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-blue-200 group-hover:text-blue-700">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        {typeof option === 'object' && option.shape ? (
                            // Render visual option for abstract
                            <div className="w-8 h-8 flex items-center justify-center">
                                {renderShape(option, 'small')}
                            </div>
                        ) : (
                            <span className="text-slate-700 font-medium">{option}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PuzzleCanvas;
