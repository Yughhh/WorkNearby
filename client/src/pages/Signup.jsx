import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../services/authService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { getCurrentLocation, getAddressFromCoords } from '../services/locationService';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'freelancer',
    lat: null,
    lng: null,
    locationName: ''
  });
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const navigate = useNavigate();

  const handleFetchLocation = async () => {
    setLocLoading(true);
    try {
      const coords = await getCurrentLocation();
      const areaName = await getAddressFromCoords(coords.lat, coords.lng);
      setFormData(prev => ({ 
        ...prev, 
        lat: coords.lat, 
        lng: coords.lng, 
        locationName: areaName 
      }));
      toast.success('Location detected! 📍');
    } catch (err) {
      toast.error('Could not get location. Please allow GPS.');
    } finally {
      setLocLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      return toast.error('Location is required to connect with nearby people.');
    }
    setLoading(true);
    try {
      await signupUser(formData);
      toast.success('Account created! Welcome to WorkNearby. ✨');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">WorkNearby</h1>
          <p className="text-slate-400 font-medium tracking-tight">Hyperlocal focus. Global talent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-500" size={18} />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-500" size={18} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-500" size={18} />
            <input
              type="password"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">I want to...</label>
            <div className="flex gap-4">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-bold ${
                  formData.role === 'client' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
                onClick={() => setFormData({ ...formData, role: 'client' })}
              >
                Hire Talent
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-bold ${
                  formData.role === 'freelancer' ? 'border-secondary bg-secondary/10 text-secondary shadow-lg shadow-secondary/10' : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
                onClick={() => setFormData({ ...formData, role: 'freelancer' })}
              >
                Find Work
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Location Required</label>
            <button
              type="button"
              onClick={handleFetchLocation}
              disabled={locLoading}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all text-sm font-bold shadow-inner"
            >
              {locLoading ? <Loader2 className="animate-spin text-primary" /> : <MapPin className={formData.locationName ? 'text-secondary' : 'text-slate-500'} />}
              <span className={formData.locationName ? 'text-white' : 'text-slate-500'}>
                {formData.locationName || 'Detect My Location'}
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary hover:opacity-90 rounded-[1.5rem] text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ArrowRight size={22} /> Enter Marketplace</>}
          </button>
        </form>

        <p className="text-center mt-10 text-slate-400 font-medium tracking-tight">
          Already have an account? <Link to="/login" className="text-primary font-black hover:underline underline-offset-4 transition-all">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
