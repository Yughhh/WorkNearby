import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Lazy Load Pages
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const PostJob = lazy(() => import('./pages/PostJob'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const BuyCredits = lazy(() => import('./pages/BuyCredits'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">WorkNearby</p>
    </motion.div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/buy-credits" element={<BuyCredits />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <div className="App dark selection:bg-primary selection:text-white">
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '1.5rem',
              border: '1px solid #1e293b',
              padding: '16px 24px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff',
              },
            },
          }} 
        />
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </div>
    </Router>
  );
}


export default App;
