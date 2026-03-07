import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import TradeInsPage from '../pages/TradeInsPage';

const TradeInRouter = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role);
    }, []);

    if (userRole === null) {
        return null;
    }

    // CEO/Manager sees Trade-In Management Dashboard
    if (userRole === 'CEO' || userRole === 'MANAGER') {
        return <TradeInsPage />;
    }

    return <Navigate to="/unauthorized" />;
};

export default TradeInRouter;
