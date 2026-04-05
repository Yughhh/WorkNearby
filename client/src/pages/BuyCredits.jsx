import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { submitPaymentRequest, fetchMyPayments } from '../services/paymentService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { CreditCard, Smartphone, QrCode, Upload, CheckCircle2, Clock, AlertCircle, IndianRupee, ArrowRight, Loader2, Copy, Sparkles } from 'lucide-react';

const BuyCredits = () => {
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(1); // 1: Plan, 2: Pay, 3: Proof
  
  const navigate = useNavigate();
  const UPI_ID = import.meta.env.VITE_UPI_ID || 'yugh.rana.11@okaxis';


  const plans = [
    { title: 'Starter Pack', amount: 50, credits: 10, color: 'slate' },
    { title: 'Pro Booster', amount: 100, credits: 25, color: 'primary', popular: true },
    { title: 'Best Value', amount: 200, credits: 60, color: 'green' }
  ];

  useEffect(() => {
    const currUser = getCurrentUser();
    if (!currUser) navigate('/login');
    setUser(currUser);
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchMyPayments();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateUPILink = (amount) => {
    return `upi://pay?pa=${UPI_ID}&pn=WorkNearby&am=${amount}&cu=INR`;
  };

  const getQRCodeUrl = (amount) => {
    const upiLink = generateUPILink(amount);
    return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(upiLink)}&choe=UTF-8`;
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID Copied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) return toast.error('Please upload payment proof');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', selectedPlan.amount);
      formData.append('creditsRequested', selectedPlan.credits);
      formData.append('screenshot', screenshot);

      await submitPaymentRequest(formData);
      toast.success('Payment submitted for review! ✨');
      setStep(1);
      setSelectedPlan(null);
      setScreenshot(null);
      loadHistory();
    } catch (err) {
      toast.error('Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 font-outfit text-white">
      <Navbar active="buy-credits" user={user} />

      <main className="max-w-4xl mx-auto py-12 px-6">
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} /> Power Up Your Search
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight mb-4">GIG CREDITS</h1>
          <p className="text-slate-400 font-medium max-w-md mx-auto">Purchase credits to unlock job applications and connect with local clients instantly.</p>
        </header>

        {/* Steps Progress */}
        <div className="flex justify-center gap-4 mb-12">
            {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-16 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-800'}`} />
            ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {plans.map((plan) => (
                <div 
                  key={plan.amount}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setStep(2);
                  }}
                  className={`relative cursor-pointer p-8 rounded-[2.5rem] border-2 transition-all hover:scale-105 active:scale-95 group shadow-2xl ${
                    plan.popular ? 'bg-slate-900 border-primary' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Most Popular</div>
                  )}
                  <h3 className="font-extrabold text-xl mb-1 text-slate-100">{plan.title}</h3>
                  <div className="text-4xl font-black mb-6 text-secondary tracking-tighter">₹{plan.amount}</div>
                  <div className="space-y-3 mb-10">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary"><Check size={12} strokeWidth={4} /></div>
                      {plan.credits} Application Credits
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-600"><Check size={12} strokeWidth={4} /></div>
                      Lifetime Validity
                    </div>
                  </div>
                  <button className="w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-primary group-hover:border-primary transition-all">Select Plan</button>
                </div>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12">
                <QrCode size={160} />
              </div>
              <button onClick={() => setStep(1)} className="text-slate-500 font-black text-xs hover:text-white mb-6 flex items-center gap-2 uppercase tracking-widest"><ArrowRight size={14} className="rotate-180" /> Change Plan</button>
              
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black mb-6">Complete Payment</h2>
                  <p className="text-slate-400 font-medium mb-8">Scan the QR code or click the button below to pay <span className="text-secondary font-black">₹{selectedPlan.amount}</span> via any UPI app.</p>
                  
                  <div className="space-y-4">
                    <a 
                      href={generateUPILink(selectedPlan.amount)}
                      onClick={() => toast.success('Opening UPI Apps...')}
                      className="flex items-center justify-center gap-3 w-full bg-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Smartphone size={20} /> Pay via UPI App
                    </a>
                    
                    <button 
                      onClick={handleCopyUPI}
                      className="flex items-center justify-center gap-3 w-full bg-slate-950 border border-slate-800 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                      <Copy size={18} /> Copy UPI ID: {UPI_ID}
                    </button>

                    <button 
                      onClick={() => setStep(3)}
                      className="w-full text-secondary font-black text-xs uppercase tracking-[0.2em] pt-4 hover:underline"
                    >
                      Paid? Upload Screenshot <ArrowRight size={14} className="inline ml-1" />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-primary/5 border-8 border-slate-950">
                  <img 
                    src={getQRCodeUrl(selectedPlan.amount)} 
                    alt="Payment QR" 
                    className="w-56 h-56"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scan to pay ₹{selectedPlan.amount}</p>
                    <p className="text-[10px] font-black text-slate-900 mt-1 uppercase">Powered by WorkNearby</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl"
            >
              <button onClick={() => setStep(2)} className="text-slate-500 font-black text-xs hover:text-white mb-6 flex items-center gap-2 uppercase tracking-widest"><ArrowRight size={14} className="rotate-180" /> Back to Payment</button>
              
              <h2 className="text-3xl font-black mb-2">Upload Proof</h2>
              <p className="text-slate-400 font-medium mb-10">Upload your transaction screenshot for manual verification.</p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div 
                  onClick={() => document.getElementById('screenshot').click()}
                  className="w-full h-80 border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden group"
                >
                  {screenshot ? (
                    <img src={URL.createObjectURL(screenshot)} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Preview" />
                  ) : (
                    <>
                      <div className="p-6 bg-slate-900 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={40} className="text-slate-500 group-hover:text-primary transition-colors" />
                      </div>
                      <p className="font-black text-xs uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">Tap to select Image</p>
                    </>
                  )}
                  <input 
                    id="screenshot" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    className="hidden" 
                  />
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl flex items-start gap-4 border border-slate-800">
                  <AlertCircle size={24} className="text-amber-500 shrink-0" />
                  <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-tighter">
                   Your credits will be unlocked after our team verifies the transaction. This usually takes <span className="text-white font-black">15-30 minutes</span> during business hours.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !screenshot}
                  className="w-full py-5 bg-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                  Complete Submission
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment History */}
        <div className="mt-20">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <Clock size={24} className="text-slate-500" /> Transaction History
          </h2>
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="p-10 border border-slate-800 border-dashed rounded-3xl text-center text-slate-600 font-black uppercase text-xs tracking-widest bg-slate-900/20">No transactions yet</div>
            ) : (
              history.map((p, idx) => (
                <div key={p._id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-black text-lg ${
                      p.status === 'Approved' ? 'bg-secondary/10 border-secondary text-secondary' :
                      p.status === 'Rejected' ? 'bg-rose-500/10 border-rose-500 text-rose-500' :
                      'bg-slate-800 border-slate-700 text-slate-500'
                    }`}>
                      {p.status === 'Approved' ? '🗸' : p.status === 'Rejected' ? '✕' : '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-lg text-slate-200">₹{p.amount}</span>
                        <span className="text-slate-800">/</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.creditsRequested} Credits</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()} at {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    p.status === 'Approved' ? 'border-secondary/30 bg-secondary/10 text-secondary' :
                    p.status === 'Rejected' ? 'border-rose-500/10 bg-rose-500 text-rose-500' :
                    'border-slate-800 bg-slate-950 text-slate-500'
                  }`}>
                    {p.status === 'Pending' ? 'Under Review' : p.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Check for missing Check icon
const Check = ({ size, strokeWidth }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default BuyCredits;
