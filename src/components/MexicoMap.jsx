```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass } from 'lucide-react';

const MexicoMap = () => {
    const navigate = useNavigate();
    const [activeRegion, setActiveRegion] = useState('Todos');

    const regions = {
        'Norte': [
            'Baja California', 'Baja California Sur', 'Chihuahua', 'Coahuila', 
            'Durango', 'Nuevo León', 'Sinaloa', 'Sonora', 'Tamaulipas'
        ],
        'Centro / Bajío': [
            'Aguascalientes', 'Ciudad de México', 'Colima', 'Estado de México', 
            'Guanajuato', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 
            'Nayarit', 'Puebla', 'Querétaro', 'San Luis Potosí', 'Tlaxcala', 'Zacatecas'
        ],
        'Sur / Sureste': [
            'Campeche', 'Chiapas', 'Guerrero', 'Oaxaca', 'Quintana Roo', 
            'Tabasco', 'Veracruz', 'Yucatán'
        ]
    };

    const allStates = Object.values(regions).flat().sort();

    const handleStateClick = (stateName) => {
        navigate(`/ jobs ? state = ${ encodeURIComponent(stateName) } `);
    };

    const displayedStates = activeRegion === 'Todos' 
        ? allStates 
        : regions[activeRegion];

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <Compass className="w-8 h-8 text-secondary-600" />
                    Explora vacantes por región
                </h2>
                <p className="text-slate-600 mt-3 text-lg max-w-2xl mx-auto">
                    Selecciona tu ubicación para descubrir oportunidades laborales cerca de ti.
                </p>
            </div>

            {/* Region Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button
                    onClick={() => setActiveRegion('Todos')}
                    className={`px - 6 py - 2.5 rounded - full text - sm font - semibold transition - all duration - 300 ${
    activeRegion === 'Todos'
        ? 'bg-slate-900 text-white shadow-lg scale-105'
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
} `}
                >
                    Todo México
                </button>
                {Object.keys(regions).map(region => (
                    <button
                        key={region}
                        onClick={() => setActiveRegion(region)}
                        className={`px - 6 py - 2.5 rounded - full text - sm font - semibold transition - all duration - 300 ${
    activeRegion === region
        ? 'bg-secondary-600 text-white shadow-lg scale-105'
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
} `}
                    >
                        {region}
                    </button>
                ))}
            </div>
            
            {/* States Grid */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayedStates.map(state => (
                        <button
                            key={state}
                            onClick={() => handleStateClick(state)}
                            className="group flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-200"
                        >
                            <div className="p-2 rounded-full bg-slate-100 text-slate-500 mr-3 group-hover:bg-secondary-100 group-hover:text-secondary-600 transition-colors">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                {state}
                            </span>
                        </button>
                    ))}
                </div>
                
                {displayedStates.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        No se encontraron estados en esta región.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MexicoMap;
```
