
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LyricStudio } from './pages/LyricStudio';
import { MusicPage } from './pages/MusicPage';
import { AboutPage } from './pages/AboutPage';
import { AgenticAIPage } from './pages/AgenticAIPage';
import { CameraUpdatesPage } from './pages/CameraUpdatesPage';
import { HelpPage } from './pages/HelpPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ToastProvider>
          <AuthProvider>
            <MusicProvider>
              <ErrorBoundary>
                <div className="flex flex-col min-h-screen bg-background text-primary font-sans antialiased selection:bg-accent selection:text-white">
                  <Header />
                  <Routes>
                    <Route path="/" element={<>
                      <LandingPage />
                      <Footer />
                    </>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/about" element={<>
                      <AboutPage />
                      <Footer />
                    </>} />
                    <Route path="/agentic-ai" element={<>
                      <AgenticAIPage />
                      <Footer />
                    </>} />
                    <Route path="/studio" element={
                      <ProtectedRoute>
                        <LyricStudio />
                      </ProtectedRoute>
                    } />
                    <Route path="/music" element={
                      <ProtectedRoute>
                        <MusicPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/news" element={
                      <CameraUpdatesPage />
                    } />
                    <Route path="/help" element={<>
                      <HelpPage />
                      <Footer />
                    </>} />
                  </Routes>
                </div>
              </ErrorBoundary>
            </MusicProvider>
          </AuthProvider>
        </ToastProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
