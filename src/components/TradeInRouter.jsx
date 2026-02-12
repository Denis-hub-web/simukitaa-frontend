import { useEffect, useState } from 'react';
import TradeInsPage from '../pages/TradeInsPage';
import StaffTradeInPage from '../pages/StaffTradeInPage';

const TradeInRouter = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role);
    }, []);

    // CEO/Manager sees Trade-In Management Dashboard
    if (userRole === 'CEO' || userRole === 'MANAGER') {
        return <TradeInsPage />;
    }

    // Staff sees submission page
    return <StaffTradeInPage />;
};

export default TradeInRouter;
