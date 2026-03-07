import { Outlet } from 'react-router-dom';

const MobileLayout = () => {
    return (
        <div className="premium-bg min-h-screen">
            <div className="premium-container">
                <div className="pb-12">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MobileLayout;
