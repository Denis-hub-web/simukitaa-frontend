import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdvancedReportPage from './pages/AdvancedReportPage';
import DesktopLayout from './layouts/DesktopLayout';
import MobileLayout from './layouts/MobileLayout';
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
import ExpensesPage from './pages/ExpensesPage';
import DailySheetReport from './pages/DailySheetReport';
import ToolsPage from './pages/ToolsPage';
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
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/daily-sheet" element={<DailySheetReport />} />
                        <Route path="/analytics" element={<AdvancedReportPage />} />
                        <Route path="/tools" element={<ToolsPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Route>
                ) : (
                    <Route element={isLoggedIn ? <MobileLayout /> : <Navigate to="/login" />}>
                        <Route path="/dashboard" element={<MobileDashboard />} />
                        <Route path="/stock" element={<CEOStockManagement />} />
                        <Route path="/manager" element={<ManagerDashboard />} />
                        <Route path="/trade-ins/*" element={<TradeInRouter />} />
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
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/messages" element={<MessageCenter />} />
                        <Route path="/wanakitaa" element={<WanakitaaHub />} />
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
                        <Route path="/notification-preferences" element={<NotificationPreferences />} />
                        <Route path="/campaigns" element={<CampaignManager />} />
                        <Route path="/campaigns/create" element={<CreateCampaign />} />
                        <Route path="/campaigns/:id" element={<CampaignDetail />} />
                        <Route path="/serial-scanner-test" element={<SerialNumberScanner />} />
                        <Route path="/team-management" element={<TeamManagement />} />
                        <Route path="/stock-inventory" element={<StockInventoryPage />} />
                        <Route path="/stock-calculator" element={<StockCalculatorPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/expenses" element={<ExpensesPage />} />
                        <Route path="/daily-sheet" element={<DailySheetReport />} />
                        <Route path="/tools" element={<ToolsPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Route>
                )}

                <Route path="/rate/:token" element={<CustomerReview />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;
