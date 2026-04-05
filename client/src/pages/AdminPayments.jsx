import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { fetchAdminPayments, verifyPayment } from '../services/paymentService';
import { fetchGrowthStats } from '../services/adminService';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Shield, CreditCard, User, ExternalLink, Check, X, Loader2, Image as ImageIcon, AlertCircle, IndianRupee, Clock, History, BarChart3, Users, Briefcase, Zap } from 'lucide-react';

const AdminPayments = () => {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [filter, setFilter] = useState('Pending');

  const navigate = useNavigate();

  useEffect(() => {
    const currUser = getCurrentUser();
    if (!currUser || currUser.email !== 'admin@worknearby.com') {
      navigate('/home');
    } else {
      setUser(currUser);
      loadInitialData();
    }
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [paymentsData, statsData] = await Promise.all([
        fetchAdminPayments(),
        fetchGrowthStats()
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to load portal data.');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await fetchAdminPayments();
      setPayments(data);
    } catch (err) {
      toast.error('Failed to refresh payments.');
    }
  };

  const handleVerify = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this payment?`)) return;
    
    setSubmitting(true);
    try {
      await verifyPayment(id, status);
      toast.success(`Payment ${status} Successfully!`);
      loadInitialData(); // Refresh both
    } catch (err) {
      toast.error('Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const filteredPayments = payments.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-slate-950 font-outfit text-white pb-20">
      <Navbar active="admin" user={user} />

      <main className="max-w-7xl mx-auto py-12 px-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded-full text-rose-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <Shield size={14} /> Admin Intelligence Hub
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-2 tracking-tighter">OPERATIONS</h1>
            <p className="text-slate-500 font-medium tracking-tight">System overview and manual revenue verification.</p>
          </div>
          
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {['Pending', 'Approved', 'Rejected'].map(status => (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status ? 'bg-primary shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </header>

        {/* Growth Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <StatCard 
            icon={Users} 
            label="Total Users" 
            value={stats?.summary.totalUsers || 0} 
            trend={stats?.trends.recentSignups} 
            trendLabel="New this week"
          />
          <StatCard 
            icon={Briefcase} 
            label="Live Gigs" 
            value={stats?.summary.totalJobs || 0} 
            trend={stats?.trends.recentJobs} 
            trendLabel="Posted recently"
          />
          <StatCard 
            icon={Zap} 
            label="Applications" 
            value={stats?.summary.totalApplications || 0} 
          />
          <StatCard 
            icon={IndianRupee} 
            label="Total Revenue" 
            value={stats?.summary.totalRevenue || 0} 
            color="text-secondary"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] p-24 text-center">
            <div className="bg-slate-800 p-8 rounded-full w-fit mx-auto mb-6 text-slate-700">
               <History size={64} />
            </div>
            <p className="text-slate-500 font-extrabold uppercase tracking-widest">No {filter.toLowerCase()} payments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPayments.map((p) => (
              <motion.div 
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col group relative"
              >
                <div className="h-64 relative bg-slate-950 flex items-center justify-center overflow-hidden cursor-zoom-in" onClick={() => setSelectedImg(p.screenshotUrl)}>
                  <img src={p.screenshotUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" alt="Screenshot" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                    <ImageIcon size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">View Full Proof</span>
                  </div>
                </div>

                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-extrabold text-xl text-slate-100">{p.userId?.name || 'Unknown'}</h3>
                      <p className="text-xs text-slate-500 font-black tracking-tight">{p.userId?.email || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-secondary">₹{p.amount}</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.creditsRequested} Credits</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-t border-slate-800/50 pt-6 mt-auto">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(p.createdAt).toLocaleDateString()}</span>
                    <span className="text-slate-800">|</span>
                    <span className={`px-3 py-1 rounded-full border ${
                        p.status === 'Approved' ? 'border-secondary/20 text-secondary' :
                        p.status === 'Rejected' ? 'border-rose-500/20 text-rose-500' :
                        'border-slate-700 text-slate-500 font-black'
                    }`}>{p.status}</span>
                  </div>
                </div>

                {p.status === 'Pending' && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => handleVerify(p._id, 'Rejected')}
                      className="p-3 bg-red-950/80 backdrop-blur-md text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={() => handleVerify(p._id, 'Approved')}
                      className="p-3 bg-emerald-950/80 backdrop-blur-md text-emerald-500 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                    >
                      <Check size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImg && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedImg(null)}>
             <motion.img 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               src={selectedImg} 
               className="max-w-full max-h-full rounded-2xl shadow-2xl border-4 border-slate-800" 
             />
             <button className="absolute top-10 right-10 p-5 text-white/50 hover:text-white"><X size={40} /></button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, trendLabel, color = "text-white" }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
    <div className="flex items-center gap-3 text-slate-500 mb-4 tracking-widest text-[10px] font-black uppercase">
      <div className="p-2 bg-slate-800 rounded-lg"><Icon size={16} /></div>
      {label}
    </div>
    <div className={`text-3xl font-black mb-2 ${color}`}>{value}</div>
    {trend !== undefined && (
      <div className="text-[9px] font-black uppercase text-secondary tracking-widest flex items-center gap-1">
        <Sparkles size={10} /> +{trend} {trendLabel}
      </div>
    )}
  </div>
);

const Sparkles = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
);

export default AdminPayments;
