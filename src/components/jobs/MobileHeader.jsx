import React, { memo, useRef, useEffect } from 'react';
import { ArrowLeft, X, Menu, Home, Briefcase, User, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileHeader = memo(({
    currentIndex,
    totalJobs,
    onBack,
    isMenuOpen,
    setIsMenuOpen,
    user,
    handleLogout
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMenuOpen, setIsMenuOpen]);

    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-50 h-[60px] flex-shrink-0 relative">
            <button
                onClick={onBack}
                className="flex items-center text-slate-600 font-medium text-sm hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Volver
            </button>

            <div className="text-sm font-medium text-slate-400">
                {currentIndex + 1} de {totalJobs}
            </div>

            <div className="flex items-center gap-3">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(prev => !prev)}
                        className="p-2 -mr-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute top-[60px] right-0 w-64 bg-white shadow-xl border border-slate-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate('/');
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                >
                                    <Home className="w-5 h-5 text-slate-400" />
                                    Inicio
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        // Only navigate if not already on jobs page
                                        if (!location.pathname.startsWith('/jobs')) {
                                            navigate('/jobs');
                                        }
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                >
                                    <Briefcase className="w-5 h-5 text-slate-400" />
                                    Vacantes
                                </button>
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/profile');
                                            }}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                        >
                                            <User className="w-5 h-5 text-slate-400" />
                                            Mi Perfil
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/dashboard');
                                            }}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                        >
                                            <LayoutDashboard className="w-5 h-5 text-slate-400" />
                                            Panel de candidato
                                        </button>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium flex items-center gap-3 transition-colors"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Cerrar Sesión
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-px bg-slate-100 my-1" />
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                navigate('/auth');
                                            }}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                        >
                                            <LogIn className="w-5 h-5 text-slate-400" />
                                            Iniciar Sesión
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default MobileHeader;
