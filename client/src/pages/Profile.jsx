import { updateProfile as apiUpdateProfile } from '../services/marketplaceService';
import { fetchUserReviews } from '../services/reviewService';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Tag, Briefcase, Camera, Loader2, Save, Star, MapPin, Calendar, Clock } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    skills: '',
    bio: '',
    pricing: 0
  });
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        skills: currentUser.skills?.join(', ') || '',
        bio: currentUser.bio || '',
        pricing: currentUser.pricing || 0
      });
      loadReviews(currentUser._id);
    }
  }, []);

  const loadReviews = async (userId) => {
    try {
      const data = await fetchUserReviews(userId);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      const updatedUser = await apiUpdateProfile({ ...formData, skills: skillsArray });
      
      const existing = JSON.parse(localStorage.getItem('user'));
      const newUser = { ...existing, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error('Update failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-6 pb-32"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 text-center md:text-left">
              <div className="bg-primary/20 p-6 rounded-[2rem] shadow-xl shadow-primary/10 border border-primary/20">
                <User size={64} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight mb-1">{user.name}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                       <MapPin size={14} className="text-rose-500" /> {user.locationName} • {user.role}
                    </p>
                  </div>
                  <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <Star className="text-secondary fill-secondary" size={24} />
                    <div className="text-left leading-tight">
                      <p className="text-xl font-black text-white">{user.averageRating?.toFixed(1) || '0.0'}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{user.reviewCount || 0} REVIEWS</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {user.skills?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {user.role === 'freelancer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Tag size={14} className="text-primary" /> Skills
                    </label>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                      placeholder="Web Dev, React, Python..."
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Briefcase size={14} className="text-secondary" /> Starting Price (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                      value={formData.pricing}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">About Me</label>
                <textarea
                  rows="4"
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-3xl focus:ring-2 focus:ring-primary outline-none resize-none transition-all font-medium leading-relaxed"
                  placeholder="Share your story and services..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                ></textarea>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                  <Camera size={14} /> Portfolio Gallery
                </label>
                <div className="border-2 border-dashed border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-slate-500 bg-slate-950/20 group hover:border-primary/40 transition-all cursor-default">
                  <Camera size={40} className="mb-4 opacity-20 group-hover:opacity-40 transition-all" />
                  <p className="font-bold">Showcase your work</p>
                  <p className="text-[10px] uppercase tracking-tighter mt-1 font-black">Visual Portfolio coming soon</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary hover:opacity-90 rounded-[1.5rem] text-white font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                Update Vision
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Reviews Wall */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-3 ml-2">
            <Star className="text-secondary" /> Feedback Wall
          </h3>
          
          {reviewsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : reviews.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-10 text-center">
              <p className="text-slate-500 font-bold">No reviews yet.</p>
              <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-black">COMPLETE GIGS TO UNLOCK TRUST</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {reviews.map((rev, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={rev._id} 
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg shadow-slate-950/50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black text-xs">
                        {rev.fromUserId.name[0]}
                      </div>
                      <span className="font-bold text-sm">{rev.fromUserId.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-secondary">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={10} className="fill-secondary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs italic leading-relaxed font-medium">"{rev.comment}"</p>
                  <p className="text-[9px] text-slate-600 mt-4 uppercase tracking-widest font-black flex items-center gap-1">
                    <Clock size={8} /> {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
