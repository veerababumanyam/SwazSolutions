
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LyricStudio } from './pages/LyricStudio';
import { LyricStudioUI } from './pages/LyricStudioUI';
import { MusicPage } from './pages/MusicPage';
import { AboutPage } from './pages/AboutPage';
import { AgenticAIPage } from './pages/AgenticAIPage';
import { AgenticAIResourcesPage } from './pages/AgenticAIResourcesPage';
import { CameraUpdatesPage } from './pages/CameraUpdatesPage';
import { HelpPage } from './pages/HelpPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfileDashboard } from './pages/ProfileDashboard';
import { PublicProfile } from './pages/PublicProfile';
import { ProfileAnalytics } from './pages/ProfileAnalytics';
import { UnifiedProfileEditor } from './pages/UnifiedProfileEditor';
import { VCardPanel } from './pages/VCardPanel';
// Data Recovery Service Pages
import { DataRecoveryHub } from './pages/services/DataRecoveryHub';
import { HardDriveRecovery } from './pages/services/HardDriveRecovery';
import { SSDRecovery } from './pages/services/SSDRecovery';
import { RAIDRecovery } from './pages/services/RAIDRecovery';
import { RansomwareRecovery } from './pages/services/RansomwareRecovery';
// Modern vCard Suite - Phase 4 Components
import { Layout } from './components/admin/Layout';
import { InviteDashboard } from './components/invites/InviteDashboard';
import { InviteEditor } from './components/invites/InviteEditor';
import { GuestManagerWrapper } from './components/invites/GuestManagerWrapper';
import { AnalyticsDashboardWrapper } from './components/invites/AnalyticsDashboardWrapper';
import { TemplateMarketplaceWrapper } from './components/invites/TemplateMarketplaceWrapper';
import { CheckInScannerWrapper } from './components/invites/CheckInScannerWrapper';
import { PublicInviteViewWrapper } from './pages/PublicInviteViewWrapper';
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import SubscriptionManager from './components/Subscription/SubscriptionManager';
import { preloadFonts } from './utils/fontLoader';

// Inner component - MusicProvider always wraps AppRoutes to ensure context is available
// MusicProvider handles unauthenticated state internally
const AppContent: React.FC = () => {
  return (
    <MusicProvider>
      <SubscriptionManager />
      <ErrorBoundary name="Main Content" level="page">
        <div className="flex flex-col min-h-screen bg-background text-primary font-sans antialiased selection:bg-accent selection:text-white">
          <Header />
          <AppRoutes />
        </div>
      </ErrorBoundary>
    </MusicProvider>
  );
};

// Routes component extracted for reuse
const AppRoutes: React.FC = () => (
  <Routes>
                    {/* Public Marketing Pages */}
                    <Route path="/" element={
                      <RouteErrorBoundary routeName="Landing">
                        <LandingPage />
                        <Footer />
                      </RouteErrorBoundary>
                    } />

                    {/* Authentication Pages (redirect if already logged in) */}
                    <Route path="/login" element={
                      <PublicRoute redirectIfAuthenticated={true}>
                        <RouteErrorBoundary routeName="Login">
                          <LoginPage />
                        </RouteErrorBoundary>
                      </PublicRoute>
                    } />
                    <Route path="/register" element={
                      <PublicRoute redirectIfAuthenticated={true}>
                        <RouteErrorBoundary routeName="Register">
                          <RegisterPage />
                        </RouteErrorBoundary>
                      </PublicRoute>
                    } />

                    {/* Public Content Pages */}
                    <Route path="/about" element={
                      <RouteErrorBoundary routeName="About">
                        <AboutPage />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/agentic-ai" element={
                      <RouteErrorBoundary routeName="Agentic AI">
                        <AgenticAIPage />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/agentic-ai/resources" element={
                      <RouteErrorBoundary routeName="AI Resources">
                        <AgenticAIResourcesPage />
                        <Footer />
                      </RouteErrorBoundary>
                    } />

                    {/* Protected User Features */}
                    <Route path="/studio" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Lyric Studio">
                          <LyricStudio />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/lyric-studio" element={
                      <RouteErrorBoundary routeName="Lyric Studio UI">
                        <LyricStudioUI />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/music" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Music">
                          <MusicPage />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/news" element={
                      <RouteErrorBoundary routeName="News">
                        <CameraUpdatesPage />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/help" element={
                      <RouteErrorBoundary routeName="Help">
                        <HelpPage />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/contact" element={
                      <RouteErrorBoundary routeName="Contact">
                        <ContactPage />
                        <Footer />
                      </RouteErrorBoundary>
                    } />

                    {/* Data Recovery Service Routes */}
                    <Route path="/services/data-recovery" element={
                      <RouteErrorBoundary routeName="Data Recovery">
                        <DataRecoveryHub />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/services/hard-drive-recovery" element={
                      <RouteErrorBoundary routeName="Hard Drive Recovery">
                        <HardDriveRecovery />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/services/ssd-recovery" element={
                      <RouteErrorBoundary routeName="SSD Recovery">
                        <SSDRecovery />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/services/raid-recovery" element={
                      <RouteErrorBoundary routeName="RAID Recovery">
                        <RAIDRecovery />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/services/ransomware-recovery" element={
                      <RouteErrorBoundary routeName="Ransomware Recovery">
                        <RansomwareRecovery />
                        <Footer />
                      </RouteErrorBoundary>
                    } />

                    {/* Virtual Profile Routes - Modern vCard Suite */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="vCard Panel">
                          <VCardPanel />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />

                    {/* Profile Redirects (backward compatibility) */}
                    <Route path="/profile/edit" element={
                      <Navigate to="/profile?tab=portfolio" replace />
                    } />
                    <Route path="/profile/appearance" element={
                      <Navigate to="/profile?tab=aesthetics" replace />
                    } />
                    <Route path="/profile/analytics" element={
                      <Navigate to="/profile?tab=insights" replace />
                    } />

                    {/* Legacy Profile Routes (backward compatibility) */}
                    <Route path="/profile/dashboard" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Profile Dashboard">
                          <ProfileDashboard />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/edit-legacy" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Legacy Profile Editor">
                          <UnifiedProfileEditor />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />

                    {/* Public Profile Viewing */}
                    <Route path="/u/:username" element={
                      <PublicRoute>
                        <RouteErrorBoundary routeName="Public Profile">
                          <PublicProfile />
                        </RouteErrorBoundary>
                      </PublicRoute>
                    } />

                    {/* Digital Invites Routes */}
                    <Route path="/invites" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Invites Dashboard">
                          <InviteDashboard />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/invites/create" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Create Invite">
                          <InviteEditor mode="create" />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/invites/edit/:id" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Edit Invite">
                          <InviteEditor mode="edit" />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/invites/:id/guests" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Guest Manager">
                          <GuestManagerWrapper />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/invites/:id/analytics" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Analytics Dashboard">
                          <AnalyticsDashboardWrapper />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/invites/:id/checkin" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Check-In Scanner">
                          <CheckInScannerWrapper />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/invites/templates" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Template Marketplace">
                          <TemplateMarketplaceWrapper />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />

                    {/* Public Invite Viewing */}
                    <Route path="/invite/:slug" element={
                      <RouteErrorBoundary routeName="Public Invite">
                        <PublicInviteViewWrapper />
                      </RouteErrorBoundary>
                    } />
  </Routes>
);

const App: React.FC = () => {
  // Preload locally hosted fonts on app mount
  useEffect(() => {
    preloadFonts();
  }, []);

  return (
    <ErrorBoundary name="App Root" level="page">
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <AppContent />
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
