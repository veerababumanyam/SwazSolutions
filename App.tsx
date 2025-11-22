
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LyricStudio } from './pages/LyricStudio';
import { MusicPage } from './pages/MusicPage';
import { AboutPage } from './pages/AboutPage';
import { CameraUpdatesPage } from './pages/CameraUpdatesPage';
import { HelpPage } from './pages/HelpPage';
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ToastProvider>
          <MusicProvider>
            <ErrorBoundary>
              <div className="flex flex-col min-h-screen bg-background text-primary font-sans antialiased selection:bg-accent selection:text-white">
                <Header />
                <Routes>
                  <Route path="/" element={<>
                    <LandingPage />
                    <Footer />
                  </>} />
                  <Route path="/about" element={<>
                    <AboutPage />
                    <Footer />
                  </>} />
                  <Route path="/studio" element={
                    <ErrorBoundary>
                      <LyricStudio />
                    </ErrorBoundary>
                  } />
                  <Route path="/music" element={
                    <ErrorBoundary>
                      <MusicPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/camera-updates" element={
                    <ErrorBoundary>
                      <CameraUpdatesPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/help" element={<>
                    <HelpPage />
                    <Footer />
                  </>} />
                </Routes>
              </div>
            </ErrorBoundary>
          </MusicProvider>
        </ToastProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
