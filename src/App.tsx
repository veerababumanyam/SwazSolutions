
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
                    <Route path="/" element={
                      <RouteErrorBoundary routeName="Landing">
                        <LandingPage />
                        <Footer />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/login" element={
                      <RouteErrorBoundary routeName="Login">
                        <LoginPage />
                      </RouteErrorBoundary>
                    } />
                    <Route path="/register" element={
                      <RouteErrorBoundary routeName="Register">
                        <RegisterPage />
                      </RouteErrorBoundary>
                    } />
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

                    {/* Virtual Profile Routes - Unified Edit Profile */}
                    <Route path="/profile/edit" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Profile Editor">
                          <UnifiedProfileEditor />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/dashboard" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Profile Dashboard">
                          <ProfileDashboard />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/analytics" element={
                      <ProtectedRoute>
                        <RouteErrorBoundary routeName="Profile Analytics">
                          <ProfileAnalytics />
                        </RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="/u/:username" element={
                      <PublicRoute>
                        <RouteErrorBoundary routeName="Public Profile">
                          <PublicProfile />
                        </RouteErrorBoundary>
                      </PublicRoute>
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
      <HashRouter>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
