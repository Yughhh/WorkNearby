import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-outfit text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-500">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-3xl font-black mb-4 tracking-tight uppercase">Something went wrong</h1>
            <p className="text-slate-400 font-medium mb-10 leading-relaxed">
              An unexpected error occurred. Don't worry, your data is safe. Please try refreshing the page.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                <RefreshCw size={18} /> Refresh Page
              </button>
              
              <button 
                onClick={() => window.location.href = '/home'}
                className="w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
              >
                <Home size={18} /> Back to Safety
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
