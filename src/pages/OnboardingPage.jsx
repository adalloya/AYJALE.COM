import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const OnboardingPage = () => {
    const { user } = useAuth();

    if (!user) return null;
    if (user.role === 'candidate') {
        return <Navigate to="/profile" replace />;
    }
    if (user.role === 'company') {
        return <Navigate to="/company/profile" replace />;
    }

    return <Navigate to="/dashboard" replace />;
};

export default OnboardingPage;
