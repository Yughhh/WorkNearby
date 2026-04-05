import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../services/marketplaceService';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Briefcase, IndianRupee, Tag, FileText, Send, Loader2, ArrowLeft } from 'lucide-react';

const PostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    category: 'Web Development'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "Web Development", "App Development", "Graphic Design", "Video Editing",
    "Content Writing", "Digital Marketing", "Social Media Management",
    "Photography", "Tutoring", "Data Entry", "Electrician", "Plumber",
    "Home Cleaning", "AC Repair", "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createJob(formData);
      toast.success('Job posted successfully! 🎯');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      
      <main className="max-w-3xl mx-auto py-12 px-6 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-all font-bold mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-primary/20 p-4 rounded-2xl shadow-xl shadow-primary/10 border border-primary/20">
              <Briefcase size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-1">Post a New Gig</h2>
              <p className="text-slate-400 font-medium tracking-tight uppercase text-[10px] tracking-widest">Connect with nearby talent instantly.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Gig Title</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="e.g. Need a Web Developer for 1 week"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-4 text-slate-500" size={18} />
                  <select
                    className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Price / Budget (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-4 text-slate-500" size={18} />
                  <input
                    type="number"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                    placeholder="e.g. 5000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Requirement Details</label>
              <textarea
                required
                className="w-full h-40 px-5 py-4 bg-slate-950 border border-slate-800 rounded-3xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none font-medium leading-relaxed shadow-inner"
                placeholder="Briefly describe what you need, your expectations, and timelines..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary hover:opacity-90 rounded-[1.5rem] text-white font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Send size={22} /> Broadcast Gig</>}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default PostJob;
