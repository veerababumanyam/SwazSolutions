
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LyricStudio } from './pages/LyricStudio';
import { MusicPage } from './pages/MusicPage';
import { AboutPage } from './pages/AboutPage';
import { MusicProvider } from './contexts/MusicContext';

const App: React.FC = () => {
  return (
    <HashRouter>
      <MusicProvider>
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
              <Route path="/studio" element={<LyricStudio />} />
              <Route path="/music" element={<MusicPage />} />
          </Routes>
        </div>
      </MusicProvider>
    </HashRouter>
  );
};

export default App;
