import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, LogOut, Briefcase, LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { useState } from 'react';
import logo from '../../assets/ayjale_logo_new.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        <Link to="/" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                            Inicio
                        </Link>

                        {!user && (
                            <>
                                <Link to="/company/login" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Soy Empresa
                                </Link>
                                <Link to="/login" className="bg-secondary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-700 transition-colors">
                                    Iniciar Sesión
                                </Link>
                            </>
                        )}

                        {user && user.role === 'candidate' && (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <LayoutDashboard className="w-4 h-4 mr-1" /> Mis Postulaciones
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
                            <div className="flex items-center ml-4 border-l pl-4 border-slate-200">
                                <span className="text-sm text-slate-500 mr-4">Hola, {user.name}</span>
                                <button onClick={handleLogout} className="text-slate-400 hover:text-red-600">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
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
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                            Inicio
                        </Link>
                        {/* Add mobile links here similarly if needed, keeping it simple for now */}
                        {user && (
                            <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-slate-50">
                                Cerrar Sesión
                            </button>
                        )}
                        {!user && (
                            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-slate-50">
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
