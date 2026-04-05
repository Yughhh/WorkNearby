import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, MessageSquare, Briefcase, MapIcon, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = ({ active, user }) => {
  const navigate = useNavigate();
  const isAdmin = user && user.email === 'admin@worknearby.com';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully. See you soon!');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 shadow-2xl border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-all duration-300">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic group-hover:text-primary transition-colors">WorkNearby</h1>
        </Link>
        
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {isAdmin && (
            <Link 
              to="/admin/payments" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${active === 'admin' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-rose-500 hover:bg-rose-500/10'}`}
            >
              <Shield size={18} /> <span className="hidden lg:inline uppercase tracking-widest text-[10px]">Admin</span>
            </Link>
          )}

          <Link 
            to="/home" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${active === 'home' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MapIcon size={18} /> <span className="hidden lg:inline uppercase tracking-widest text-[10px]">Explore</span>
          </Link>
          
          <Link 
            to="/chat" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${active === 'chat' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MessageSquare size={18} /> <span className="hidden lg:inline uppercase tracking-widest text-[10px]">Chats</span>
          </Link>

          <Link 
            to={user.role === 'client' ? '/dashboard' : '/profile'} 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${active === 'dashboard' || active === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {user.role === 'client' ? <Briefcase size={18} /> : <User size={18} />} 
            <span className="hidden lg:inline uppercase tracking-widest text-[10px]">{user.role === 'client' ? 'Gigs' : 'Portfolio'}</span>
          </Link>

          {user.role === 'freelancer' && (
            <Link 
              to="/buy-credits" 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${active === 'buy-credits' ? 'bg-secondary text-slate-950 shadow-lg shadow-secondary/20' : 'text-secondary hover:bg-secondary/10'}`}
            >
              <Zap size={18} /> <span className="hidden lg:inline uppercase tracking-widest text-[10px]">Credits</span>
            </Link>
          )}
          
          <div className="w-px h-6 bg-slate-800 mx-1" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-rose-500 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
