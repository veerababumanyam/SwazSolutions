import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, BarChart2, Palette, Share, LogOut, Aperture, Eye, EyeOff } from 'lucide-react';
import { PhonePreview } from './PhonePreview';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { trigger } = useHaptic();

  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    setMobileViewMode('editor');
  }, [location.pathname]);

  const toggleMobileView = () => {
    trigger(15);
    setMobileViewMode(prev => prev === 'editor' ? 'preview' : 'editor');
  };

  const navItems = [
    { path: '/profile/edit', icon: Layers, label: 'Portfolio' },
    { path: '/profile/appearance', icon: Palette, label: 'Aesthetics' },
    { path: '/profile/analytics', icon: BarChart2, label: 'Insights' },
  ];

  const showPreviewToggle = location.pathname === '/profile/edit' || location.pathname === '/profile/appearance';

  return (
    <div className="flex flex-col h-screen w-full bg-[#f2f2f7] dark:bg-black relative overflow-hidden font-sans transition-colors duration-500">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 dark:bg-indigo-900/20 rounded-full blur-[150px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-blue-900/10 rounded-full blur-[150px] animate-blob animation-delay-2000" />
      </div>

      {/* Desktop Horizontal Navigation (Tabs) */}
      <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 z-30 flex-shrink-0">
         {/* Brand */}
         <div className="flex items-center gap-3 w-64">
             <div className="relative w-9 h-9 flex items-center justify-center group cursor-pointer">
                 <div className="absolute inset-0 bg-blue-500/30 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                 <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-black dark:from-white dark:to-gray-200 rounded-lg flex items-center justify-center shadow-md border border-white/10 group-hover:scale-105 transition-transform duration-300">
                   <Aperture size={18} className="text-white dark:text-black" />
                 </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-gray-900 dark:text-white tracking-tight leading-none">Swaz</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mt-0.5">Profile Suite</span>
              </div>
         </div>

         {/* Navigation Tabs */}
         <nav className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => trigger(5)}
                  className={`relative px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? 'text-blue-600 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                   {isActive && (
                      <motion.div
                        layoutId="desktop-tab-bg"
                        className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-sm"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                   )}
                   <div className="relative z-10 flex items-center gap-2">
                       <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                       <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                   </div>
                </Link>
              );
            })}
         </nav>

         {/* Right Actions */}
         <div className="flex items-center justify-end gap-3 w-64">
             <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors" title="Log Out">
                <LogOut size={18} />
             </button>
             <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden border border-white/10">
                 <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Profile" className="w-full h-full object-cover" />
             </div>
         </div>
      </header>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/80 dark:bg-[#1c1c1e]/80 z-50 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/5 backdrop-blur-xl">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Aperture size={16} className="text-white dark:text-black" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Swaz</span>
         </div>

         <div className="flex items-center gap-2">
            {showPreviewToggle && (
              <button
                onClick={toggleMobileView}
                className={`p-2.5 rounded-full transition-all duration-300 ${mobileViewMode === 'preview' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white'}`}
              >
                {mobileViewMode === 'preview' ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
            <button className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white">
                <Share size={18} />
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative z-10 pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          {(mobileViewMode === 'editor' || !showPreviewToggle) ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="flex-1 overflow-y-auto no-scrollbar scroll-touch p-4 lg:p-8 scroll-smooth pb-24 lg:pb-8 w-full"
            >
              <div className="max-w-4xl mx-auto h-full">
                {children}
              </div>
            </motion.div>
          ) : (
             <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 bg-black z-40 lg:hidden overflow-hidden"
             >
                <PhonePreview mobileFullscreen />
             </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Preview Wrapper (Sticky on right) */}
        <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 relative items-center justify-center p-6 bg-gray-50/50 dark:bg-black/20 border-l border-gray-200 dark:border-white/5">
            <div className="absolute inset-8 xl:inset-10 bg-white/40 dark:bg-white/5 rounded-[48px] border border-white/20 dark:border-white/5 backdrop-blur-2xl shadow-2xl flex items-center justify-center">
                 <PhonePreview />
            </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-[84px] bg-white/90 dark:bg-[#1c1c1e]/90 border-t border-gray-200 dark:border-white/5 z-50 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item) => {
             const isActive = location.pathname === item.path;
             return (
               <Link
                 key={item.path}
                 to={item.path}
                 onClick={() => {
                    trigger(5);
                    setMobileViewMode('editor');
                 }}
                 className="flex flex-col items-center justify-center w-16 h-full space-y-1"
               >
                 <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'text-blue-500 dark:text-white scale-110' : 'text-gray-400 dark:text-gray-500'}`}>
                    <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                 </div>
                 <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-blue-500 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{item.label}</span>
               </Link>
             )
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
