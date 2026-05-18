import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// ── Eager: always needed on first load ──
import Login from './pages/Login';
import DesktopLayout from './layouts/DesktopLayout';
import MobileLayout from './layouts/MobileLayout';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// ── Lazy: loaded on demand (each becomes its own JS chunk) ──
const MobileDashboard        = lazy(() => import('./pages/MobileDashboard'));
const CEOStockManagement     = lazy(() => import('./pages/CEOStockManagement'));
const CEODataDashboard       = lazy(() => import('./pages/CEODataDashboard'));
const ManagerDashboard       = lazy(() => import('./pages/ManagerDashboard'));
const SettingsPage           = lazy(() => import('./pages/SettingsPage'));
const WhatsAppTemplates      = lazy(() => import('./pages/WhatsAppTemplates'));
const AdvancedStockManagement= lazy(() => import('./pages/AdvancedStockManagement'));
const ConditionStockManagement=lazy(() => import('./pages/ConditionStockManagement'));
const StockLibrary           = lazy(() => import('./pages/StockLibrary'));
const CategoryView           = lazy(() => import('./pages/CategoryView'));
const AIInsightsView         = lazy(() => import('./pages/AIInsightsView'));
const StockCalculatorPage    = lazy(() => import('./pages/StockCalculatorPage'));
const TradeInRouter          = lazy(() => import('./components/TradeInRouter'));
const TechnicianManagement   = lazy(() => import('./pages/TechnicianManagement'));
const TechnicianDashboard    = lazy(() => import('./pages/TechnicianDashboard'));
const RepairManagement       = lazy(() => import('./pages/RepairManagement'));
const RepairDetail           = lazy(() => import('./pages/RepairDetail'));
const DeliveryDashboard      = lazy(() => import('./pages/DeliveryDashboard'));
const DeliveryDetail         = lazy(() => import('./pages/DeliveryDetail'));
const UserManagement         = lazy(() => import('./pages/UserManagement'));
const WanakitaaHub           = lazy(() => import('./pages/WanakitaaHub'));
const CustomerVoiceKiosk     = lazy(() => import('./pages/CustomerVoiceKiosk'));
const CustomerVoiceAdmin     = lazy(() => import('./pages/CustomerVoiceAdmin'));
const MessageCenter          = lazy(() => import('./pages/MessageCenter'));
const CustomerReview         = lazy(() => import('./pages/CustomerReview'));
const NewSalePage            = lazy(() => import('./pages/NewSalePage'));
const SalesPage              = lazy(() => import('./pages/SalesPage'));
const SupplierManagement     = lazy(() => import('./pages/SupplierManagement'));
const StockManagement        = lazy(() => import('./pages/StockManagement'));
const AddProductPage         = lazy(() => import('./pages/AddProductPage'));
const AddDevicePage          = lazy(() => import('./pages/AddDevicePage'));
const ViewDevicesPage        = lazy(() => import('./pages/ViewDevicesPage'));
const EditProductPage        = lazy(() => import('./pages/EditProductPage'));
const AllDevicesPage         = lazy(() => import('./pages/AllDevicesPage'));
const CreateRepairPage       = lazy(() => import('./pages/CreateRepairPage'));
const ProgressiveRepairForm  = lazy(() => import('./pages/ProgressiveRepairForm'));
const DiagnosisActionPage    = lazy(() => import('./pages/DiagnosisActionPage'));
const NotificationTemplates  = lazy(() => import('./pages/NotificationTemplates'));
const NotificationPreferences= lazy(() => import('./pages/NotificationPreferences'));
const CampaignManager        = lazy(() => import('./pages/CampaignManager'));
const CreateCampaign         = lazy(() => import('./pages/CreateCampaign'));
const CampaignDetail         = lazy(() => import('./pages/CampaignDetail'));
const SerialNumberScanner    = lazy(() => import('./pages/SerialNumberScanner'));
const TeamManagement         = lazy(() => import('./pages/TeamManagement'));
const StockInventoryPage     = lazy(() => import('./pages/StockInventoryPage'));
const ReportsPage            = lazy(() => import('./pages/ReportsPage'));
const ExpensesPage           = lazy(() => import('./pages/ExpensesPage'));
const DailySheetReport       = lazy(() => import('./pages/DailySheetReport'));
const ToolsPage              = lazy(() => import('./pages/ToolsPage'));
const AdvancedReportPage     = lazy(() => import('./pages/AdvancedReportPage'));

// ── Minimal loading fallback ──
const PageLoader = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(79,142,247,0.15)', borderTopColor: '#4f8ef7', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

function App() {
    const isLoggedIn = localStorage.getItem('token');
    const isMobile = window.innerWidth < 768;

    return (
        <Router>
            <Suspense fallback={<PageLoader />}>
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
                        <Route path="/customer-voice-admin" element={<CustomerVoiceAdmin />} />
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
                        <Route path="/customer-voice-admin" element={<CustomerVoiceAdmin />} />
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
                <Route path="/customer-voice" element={<CustomerVoiceKiosk />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
