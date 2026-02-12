import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DesktopLayout from './layouts/DesktopLayout';
import MobileDashboard from './pages/MobileDashboard';
import CEOStockManagement from './pages/CEOStockManagement';
import CEODataDashboard from './pages/CEODataDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import SettingsPage from './pages/SettingsPage';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import AdvancedStockManagement from './pages/AdvancedStockManagement';
import ConditionStockManagement from './pages/ConditionStockManagement';
import StockLibrary from './pages/StockLibrary';
import CategoryView from './pages/CategoryView';
import AIInsightsView from './pages/AIInsightsView';
import StockCalculatorPage from './pages/StockCalculatorPage';
import TradeInRouter from './components/TradeInRouter';
import TechnicianManagement from './pages/TechnicianManagement';
import TechnicianDashboard from './pages/TechnicianDashboard';
import RepairManagement from './pages/RepairManagement';
import RepairDetail from './pages/RepairDetail';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryDetail from './pages/DeliveryDetail';
import UserManagement from './pages/UserManagement';
import WanakitaaHub from './pages/WanakitaaHub';
import MessageCenter from './pages/MessageCenter';
import CustomerReview from './pages/CustomerReview';
import NewSalePage from './pages/NewSalePage';
import SalesPage from './pages/SalesPage';
import SupplierManagement from './pages/SupplierManagement';
import StockManagement from './pages/StockManagement';
import AddProductPage from './pages/AddProductPage';
import AddDevicePage from './pages/AddDevicePage';
import ViewDevicesPage from './pages/ViewDevicesPage';
import EditProductPage from './pages/EditProductPage';
import AllDevicesPage from './pages/AllDevicesPage';
import CreateRepairPage from './pages/CreateRepairPage';
import ProgressiveRepairForm from './pages/ProgressiveRepairForm';
import DiagnosisActionPage from './pages/DiagnosisActionPage';
import NotificationTemplates from './pages/NotificationTemplates';
import NotificationPreferences from './pages/NotificationPreferences';
import CampaignManager from './pages/CampaignManager';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import SerialNumberScanner from './pages/SerialNumberScanner';
import TeamManagement from './pages/TeamManagement';
import StockInventoryPage from './pages/StockInventoryPage';
import ReportsPage from './pages/ReportsPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import './index.css';

function App() {
    const isLoggedIn = localStorage.getItem('token');
    const isMobile = window.innerWidth < 768;

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                {!isMobile && isLoggedIn ? (
                    <Route element={<DesktopLayout />}>
                        <Route path="/dashboard" element={<MobileDashboard />} />
                        <Route path="/stock" element={<CEOStockManagement />} />
                        <Route path="/stock-advanced" element={<AdvancedStockManagement />} />
                        <Route path="/condition-stock" element={<StockLibrary />} />
                        <Route path="/condition-stock/list" element={<ConditionStockManagement />} />
                        <Route path="/condition-stock/category/:type/:category" element={<CategoryView />} />
                        <Route path="/condition-stock/ai-insights" element={<AIInsightsView />} />
                        <Route path="/manager" element={<ManagerDashboard />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/settings/whatsapp" element={<WhatsAppTemplates />} />
                        <Route path="/ceo-data" element={<CEODataDashboard />} />
                        <Route path="/technicians" element={<TechnicianManagement />} />
                        <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
                        <Route path="/repairs" element={<RepairManagement />} />
                        <Route path="/repairs/new" element={<CreateRepairPage />} />
                        <Route path="/repairs/:id" element={<RepairDetail />} />
                        <Route path="/repair-form" element={<ProgressiveRepairForm />} />
                        <Route path="/repair-form/:id" element={<ProgressiveRepairForm />} />
                        <Route path="/repairs/:id/diagnosis-action" element={<DiagnosisActionPage />} />
                        <Route path="/deliveries" element={<DeliveryDashboard />} />
                        <Route path="/deliveries/:id" element={<DeliveryDetail />} />
                        <Route path="/wanakitaa" element={<WanakitaaHub />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/trade-ins/*" element={<TradeInRouter />} />
                        <Route path="/messages" element={<MessageCenter />} />
                        <Route path="/sales/new" element={<NewSalePage />} />
                        <Route path="/sales" element={<SalesPage />} />
                        <Route path="/suppliers" element={<SupplierManagement />} />
                        <Route path="/stock-management" element={<StockManagement />} />
                        <Route path="/stock-management/add-product" element={<AddProductPage />} />
                        <Route path="/stock-management/add-device/:productId" element={<AddDevicePage />} />
                        <Route path="/stock-management/devices/:productId" element={<ViewDevicesPage />} />
                        <Route path="/stock-management/edit-product/:productId" element={<EditProductPage />} />
                        <Route path="/stock-management/all-devices" element={<AllDevicesPage />} />
                        <Route path="/notification-templates" element={<NotificationTemplates />} />
                        <Route path="/stock-inventory" element={<StockInventoryPage />} />
                        <Route path="/stock-calculator" element={<StockCalculatorPage />} />
                        <Route path="/team-management" element={<TeamManagement />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Route>
                ) : (
                    <>
                        <Route
                            path="/dashboard"
                            element={isLoggedIn ? <MobileDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock"
                            element={isLoggedIn ? <CEOStockManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-advanced"
                            element={isLoggedIn ? <AdvancedStockManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/condition-stock"
                            element={isLoggedIn ? <StockLibrary /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/condition-stock/list"
                            element={isLoggedIn ? <ConditionStockManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/condition-stock/category/:type/:category"
                            element={isLoggedIn ? <CategoryView /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/condition-stock/ai-insights"
                            element={isLoggedIn ? <AIInsightsView /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/manager"
                            element={isLoggedIn ? <ManagerDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/trade-ins/*"
                            element={isLoggedIn ? <TradeInRouter /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/settings"
                            element={isLoggedIn ? <SettingsPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/settings/whatsapp"
                            element={isLoggedIn ? <WhatsAppTemplates /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/ceo-data"
                            element={isLoggedIn ? <CEODataDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/technicians"
                            element={isLoggedIn ? <TechnicianManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/technician-dashboard"
                            element={isLoggedIn ? <TechnicianDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/repairs"
                            element={isLoggedIn ? <RepairManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/repairs/new"
                            element={isLoggedIn ? <CreateRepairPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/repairs/:id"
                            element={isLoggedIn ? <RepairDetail /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/repair-form"
                            element={isLoggedIn ? <ProgressiveRepairForm /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/repair-form/:id"
                            element={isLoggedIn ? <ProgressiveRepairForm /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/repairs/:id/diagnosis-action"
                            element={isLoggedIn ? <DiagnosisActionPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/deliveries"
                            element={isLoggedIn ? <DeliveryDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/deliveries/:id"
                            element={isLoggedIn ? <DeliveryDetail /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/users"
                            element={isLoggedIn ? <UserManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/messages"
                            element={isLoggedIn ? <MessageCenter /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/wanakitaa"
                            element={isLoggedIn ? <WanakitaaHub /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/sales/new"
                            element={isLoggedIn ? <NewSalePage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/sales"
                            element={isLoggedIn ? <SalesPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/suppliers"
                            element={isLoggedIn ? <SupplierManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-management"
                            element={isLoggedIn ? <StockManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-management/add-product"
                            element={isLoggedIn ? <AddProductPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-management/add-device/:productId"
                            element={isLoggedIn ? <AddDevicePage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-management/devices/:productId"
                            element={isLoggedIn ? <ViewDevicesPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-management/edit-product/:productId"
                            element={isLoggedIn ? <EditProductPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-management/all-devices"
                            element={isLoggedIn ? <AllDevicesPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/notification-templates"
                            element={isLoggedIn ? <NotificationTemplates /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/notification-preferences"
                            element={isLoggedIn ? <NotificationPreferences /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/campaigns"
                            element={isLoggedIn ? <CampaignManager /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/campaigns/create"
                            element={isLoggedIn ? <CreateCampaign /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/campaigns/:id"
                            element={isLoggedIn ? <CampaignDetail /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/serial-scanner-test"
                            element={isLoggedIn ? <SerialNumberScanner /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/team-management"
                            element={isLoggedIn ? <TeamManagement /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-inventory"
                            element={isLoggedIn ? <StockInventoryPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/stock-calculator"
                            element={isLoggedIn ? <StockCalculatorPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/reports"
                            element={isLoggedIn ? <ReportsPage /> : <Navigate to="/login" />}
                        />
                        <Route path="/" element={<Navigate to="/login" />} />
                    </>
                )}

                <Route path="/rate/:token" element={<CustomerReview />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
