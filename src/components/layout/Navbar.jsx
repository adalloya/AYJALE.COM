import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Menu, X, User, LogOut, Briefcase, LayoutDashboard, PlusCircle, Users, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import logo from '../../assets/ayjale_logo_new.png';

const NotificationDropdown = ({ notifications, onClose }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleClick = (link) => {
        navigate(link);
        onClose();
    };

    if (notifications.length === 0) {
        return (
            <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200">
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                    No tienes notificaciones nuevas
                </div>
            </div>
        );
    }

    return (
        <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-200 max-h-96 overflow-y-auto">
            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700">Notificaciones</h3>
            </div>
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    onClick={() => handleClick(notif.link)}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                >
                    <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1 text-right">
                        {new Date(notif.date).toLocaleDateString()} {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            ))}
        </div>
    );
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const { notifications } = useData();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isMenuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img className="h-12 w-auto object-contain" src={logo} alt="AyJale" />
                        </Link>
                    </div>

                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
                        <ul className="flex space-x-8 items-center">
                            <li>
                                <Link to="/" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Inicio
                                </Link>
                            </li>

                            {(!user || user.role !== 'company') && (
                                <li>
                                    <Link to="/jobs" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Vacantes
                                    </Link>
                                </li>
                            )}

                            {!user && (
                                <>
                                    <li>
                                        <Link to="/company/login" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                            Soy Empresa
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/auth?mode=register&role=candidate" className="bg-secondary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-700 transition-colors">
                                            Soy Candidato
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>

                        {user && user.role === 'candidate' && (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    Panel de candidato
                                </Link>
                                <Link to="/profile" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <User className="w-4 h-4 mr-1" /> Mi Perfil
                                </Link>
                            </>
                        )}

                        {user && user.role === 'company' && (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <LayoutDashboard className="w-4 h-4 mr-1" /> Panel Empresa
                                </Link>
                                <Link to="/company/candidates" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <Users className="w-4 h-4 mr-1" /> Buscar Candidatos
                                </Link>
                                <Link to="/post-job" className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <PlusCircle className="w-4 h-4 mr-1" /> Publicar Vacante
                                </Link>
                            </>
                        )}

                        {user && user.role === 'admin' && (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <LayoutDashboard className="w-4 h-4 mr-1" /> Panel Admin
                                </Link>
                                <Link to="/users" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <Users className="w-4 h-4 mr-1" /> Usuarios
                                </Link>
                            </>
                        )}

                        {user && (
                            <div className="flex items-center ml-4 border-l pl-4 border-slate-200 space-x-4">
                                {/* Notification Bell */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                                        className="text-slate-400 hover:text-slate-600 relative p-1"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {notifications.length > 0 && (
                                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white transform translate-x-1/4 -translate-y-1/4"></span>
                                        )}
                                    </button>
                                    {isNotifOpen && (
                                        <NotificationDropdown
                                            notifications={notifications}
                                            onClose={() => setIsNotifOpen(false)}
                                        />
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <span className="text-sm text-slate-500 mr-4">Hola, {user.name}</span>
                                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-600">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center md:hidden">
                        {user && (
                            <div className="relative mr-2">
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="text-slate-400 hover:text-slate-600 relative p-2"
                                >
                                    <Bell className="w-6 h-6" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                    )}
                                </button>
                                {isNotifOpen && (
                                    <NotificationDropdown
                                        notifications={notifications}
                                        onClose={() => setIsNotifOpen(false)}
                                    />
                                )}
                            </div>
                        )}
                        <button
                            ref={buttonRef}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div ref={menuRef} className="md:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                            Inicio
                        </Link>

                        {user && user.role === 'candidate' && (
                            <>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Panel de candidato
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Mi Perfil
                                </Link>
                                <Link
                                    to="/jobs"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Buscar Vacantes
                                </Link>
                            </>
                        )}

                        {user && user.role === 'company' && (
                            <>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Panel Empresa
                                </Link>
                                <Link
                                    to="/company/candidates"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Buscar Candidatos
                                </Link>
                                <Link
                                    to="/post-job"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Publicar Vacante
                                </Link>
                            </>
                        )}

                        {user && (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-slate-50"
                            >
                                Cerrar Sesión
                            </button>
                        )}

                        {!user && (
                            <>
                                <Link
                                    to="/jobs"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Vacantes
                                </Link>
                                <Link
                                    to="/company/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                                >
                                    Soy Empresa
                                </Link>
                                <Link
                                    to="/auth?mode=register&role=candidate"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-slate-50"
                                >
                                    Soy Candidato
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
