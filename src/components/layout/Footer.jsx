import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ compact = false }) => {
    return (
        <footer className={`bg-white border-t border-slate-200 mt-auto ${compact ? 'py-2' : ''}`}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'py-2' : 'py-8'}`}>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <Link to="/privacidad" className="text-slate-400 hover:text-slate-500 text-xs">
                            Aviso de Privacidad
                        </Link>
                        <Link to="/terminos" className="text-slate-400 hover:text-slate-500 text-xs">
                            Términos y Condiciones
                        </Link>
                    </div>
                    <div className={`mt-8 md:mt-0 md:order-1 ${compact ? 'mt-2' : ''}`}>
                        <p className="text-center text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Ayjale.com S.A.P.I. de C.V.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
