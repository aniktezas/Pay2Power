import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { DevicePage } from './pages/DevicePage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Owner pages
import { OwnerDashboardPage } from './pages/owner/DashboardPage';
import { DevicesPage } from './pages/owner/DevicesPage';
import { DeviceDetailPage } from './pages/owner/DeviceDetailPage';
import { DeviceQRPage } from './pages/owner/DeviceQRPage';
import { PricingPage } from './pages/owner/PricingPage';
import { AnalyticsPage } from './pages/owner/AnalyticsPage';
import { AIAlertsPage } from './pages/owner/AIAlertsPage';

// Consumer pages
import { ConsumerDashboardPage } from './pages/consumer/DashboardPage';
import { WalletPage } from './pages/consumer/WalletPage';

// Shared
import { TransactionsPage } from './pages/TransactionsPage';
import { DemoControlPanel } from './components/demo/DemoControlPanel';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <DemoControlPanel />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/device/:deviceCode" element={<DevicePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected — Owner */}
          <Route element={<ProtectedRoute allowedRole="owner" />}>
            <Route element={<AppLayout />}>
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              <Route path="/owner/devices" element={<DevicesPage />} />
              <Route path="/owner/devices/:id" element={<DeviceDetailPage />} />
              <Route path="/owner/devices/:id/qr" element={<DeviceQRPage />} />
              <Route path="/owner/devices/:id/pricing" element={<PricingPage />} />
              <Route path="/owner/analytics" element={<AnalyticsPage />} />
              <Route path="/owner/ai-alerts" element={<AIAlertsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
            </Route>
          </Route>

          {/* Protected — Consumer */}
          <Route element={<ProtectedRoute allowedRole="consumer" />}>
            <Route element={<AppLayout />}>
              <Route path="/consumer/dashboard" element={<ConsumerDashboardPage />} />
              <Route path="/consumer/wallet" element={<WalletPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
