import { motion } from 'framer-motion';
import { PackageOpen, Sparkles, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "Nothing Here Yet", 
  message = "It looks like there's no data to show right now.", 
  actionText, 
  actionLink 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center justify-center py-24 px-6 text-center"
    >
      <div className="max-w-md w-full relative">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10 translate-y-12" />
        
        <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-700 shadow-2xl rotate-3">
          <Icon size={48} strokeWidth={1.5} />
        </div>
        
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Sparkles size={14} className="text-primary" /> System ID: EMPTY_STATE
        </div>
        
        <h2 className="text-3xl font-black mb-4 tracking-tight uppercase text-slate-100">{title}</h2>
        <p className="text-slate-500 font-medium mb-12 leading-relaxed italic">
          "{message}"
        </p>

        {actionText && actionLink && (
          <Link 
            to={actionLink}
            className="inline-flex items-center gap-3 bg-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            {actionText} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
