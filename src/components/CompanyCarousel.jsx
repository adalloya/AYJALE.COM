import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo1 from '../assets/company_logo_1.png';
import logo2 from '../assets/company_logo_2.png';
import logo3 from '../assets/company_logo_3.png';

import logo4 from '../assets/company_logo_4.png';
import logo5 from '../assets/company_logo_5.png';
import logo6 from '../assets/company_logo_6.png';

const CompanyCarousel = () => {
    const navigate = useNavigate();
    const logos = [
        { id: 1, src: logo1, alt: "Manpower" },
        { id: 2, src: logo2, alt: "Adecco" },
        { id: 3, src: logo3, alt: "FEMSA" },
        { id: 4, src: logo4, alt: "Caffenio" },
        { id: 5, src: logo5, alt: "Samsung" },
        { id: 6, src: logo6, alt: "Starbucks" },
    ];

    const handleCompanyClick = (companyName) => {
        navigate(`/jobs?keyword=${companyName}`);
    };

    return (
        <div className="w-full bg-transparent py-4 overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                    Empresas que confían en nosotros
                </p>

                <div className="relative mask-linear-gradient">
                    {/* Gradients for fade effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>

                    {/* Carousel Container */}
                    <div className="flex overflow-hidden">
                        {/* Inner Sliding Track */}
                        <div className="flex animate-scroll space-x-24 min-w-full items-center">
                            {logos.map((logo) => (
                                <button
                                    key={logo.id}
                                    onClick={() => handleCompanyClick(logo.alt)}
                                    className="flex-shrink-0 h-20 w-40 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100 transform hover:scale-110 cursor-pointer focus:outline-none"
                                >
                                    <img
                                        src={logo.src}
                                        alt={logo.alt}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </button>
                            ))}
                            {/* Duplicate set for seamless loop */}
                            {logos.map((logo) => (
                                <button
                                    key={`dup-${logo.id}`}
                                    onClick={() => handleCompanyClick(logo.alt)}
                                    className="flex-shrink-0 h-20 w-40 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100 transform hover:scale-110 cursor-pointer focus:outline-none"
                                >
                                    <img
                                        src={logo.src}
                                        alt={logo.alt}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default CompanyCarousel;
