import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { fetchNearbyJobs, fetchNearbyFreelancers, applyToJob, fetchMyApplications } from '../services/marketplaceService';
import { startConversation } from '../services/messageService';
import ReviewModal from '../components/ReviewModal';
import MapView from '../components/MapView';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { JobSkeleton } from '../components/Skeleton';
import { LogOut, User, MapPin, Briefcase, Filter, Search, IndianRupee, Clock, Loader2, Send, Map as MapIcon, List, MessageSquare, CheckCircle2, Star, Sparkles, Zap } from 'lucide-react';

const Home = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(10);
  const [viewMode, setViewMode] = useState('list');
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposal, setProposal] = useState('');
  const [applying, setApplying] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      setCoords({ lat: currentUser.lat, lng: currentUser.lng });
      loadNearbyData(currentUser, currentUser.lat, currentUser.lng, radius);
      if (currentUser.role === 'freelancer') {
        loadMyApplications();
      }
    }
  }, [navigate]);

  const loadNearbyData = async (currUser, lat, lng, rad) => {
    setLoading(true);
    try {
      let data;
      if (currUser.role === 'freelancer') {
        data = await fetchNearbyJobs(lat, lng, rad);
      } else {
        data = await fetchNearbyFreelancers(lat, lng, rad);
      }
      setJobs(data);
    } catch (err) {
      toast.error('Failed to load nearby data.');
    } finally {
      setLoading(false);
    }
  };

  const loadMyApplications = async () => {
    try {
      const data = await fetchMyApplications();
      setMyApplications(data);
    } catch (err) {
      console.error('Failed to load applications');
    }
  };

  const handleSearchArea = (newCoords) => {
    setCoords(newCoords);
    loadNearbyData(user, newCoords.lat, newCoords.lng, radius);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applyToJob(selectedJob._id, proposal);
      toast.success('Proposal sent! Check My Applications below.');
      setSelectedJob(null);
      setProposal('');
      loadMyApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const handleStartChat = async (otherUserId, appId) => {
    try {
      const conv = await startConversation(otherUserId);
      navigate(`/chat?id=${conv._id}`);
    } catch (err) {
      toast.error('Failed to start chat.');
    }
  };

  const openReviewModal = (toUser, jobId) => {
    setTargetUser({ ...toUser, jobId });
    setIsReviewOpen(true);
  };

  const formatDistance = (m) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km away`;
    return `${Math.round(m)} m away`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 font-outfit">
      <Navbar active="home" user={user} />
      
      <main className="max-w-7xl mx-auto py-12 px-6">
        {user && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Discover Nearby {user.role === 'freelancer' ? 'Gigs' : 'Talent'}</h1>
                <p className="text-slate-400 font-medium">Find local opportunities within <span className="text-primary font-bold">{radius} km</span> of your current location.</p>
                {user.role === 'freelancer' && (
                  <div className="mt-4 flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-xl w-fit">
                    <Zap size={14} className="text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{user.credits || 0} Credits Remaining</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 self-start md:self-center">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <List size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <MapIcon size={20} />
                </button>
                <div className="w-px h-8 bg-slate-800 mx-2" />
                <select 
                  className="bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest text-slate-400 pr-4 cursor-pointer"
                  value={radius}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setRadius(r);
                    loadNearbyData(user, coords.lat, coords.lng, r);
                  }}
                >
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-8 py-10">
                <JobSkeleton />
                <JobSkeleton />
                <JobSkeleton />
              </div>
            ) : viewMode === 'map' ? (
              <div className="h-[600px] w-full rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl relative">
                 <MapView 
                  userLocation={coords} 
                  items={jobs} 
                  type={user.role === 'freelancer' ? 'jobs' : 'freelancers'} 
                  radius={radius}
                  onSearchArea={handleSearchArea}
                />
              </div>
            ) : jobs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 border-dashed rounded-[3rem] p-24 text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
                <div className="bg-primary/10 p-8 rounded-full w-fit mx-auto mb-8 text-primary border border-primary/20 relative z-10">
                  <Sparkles size={64} className="animate-pulse" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Neighborhood is Quiet...</h3>
                <p className="text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">No {user.role === 'freelancer' ? 'jobs' : 'freelancers'} found in this radius. Try widening your search or check back later!</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {jobs.map((job, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={job._id} 
                    className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-primary/40 transition-all group relative shadow-2xl shadow-slate-950/50"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block border border-primary/10">
                          {user.role === 'freelancer' ? job.category : (job.skills?.[0] || 'Member')}
                        </span>
                        <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors pr-4">{user.role === 'freelancer' ? job.title : job.name}</h3>
                      </div>
                      <div className="text-right">
                        {user.role === 'freelancer' ? (
                          <>
                            <p className="text-2xl font-black text-secondary">₹{job.budget}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Budget</p>
                          </>
                        ) : (
                          <>
                            <p className="text-2xl font-black text-secondary">⭐ {job.averageRating?.toFixed(1) || '0.0'}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{job.reviewCount || 0} Reviews</p>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-400 line-clamp-2 mb-8 font-medium leading-relaxed italic">"{job.description || job.bio || 'No details shared yet.'}"</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-800/50 pt-8 mt-auto">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                        <MapPin size={14} className="text-rose-500" />
                        {formatDistance(job.distance)}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                        <Clock size={14} className="text-secondary" />
                        {user.role === 'freelancer' ? new Date(job.createdAt).toLocaleDateString() : 'Active'}
                      </div>
                    </div>

                    <button 
                      onClick={() => user.role === 'freelancer' ? setSelectedJob(job) : navigate(`/profile/${job._id}`)}
                      className="absolute bottom-8 right-8 px-8 py-3 bg-primary rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-xl shadow-primary/30 uppercase tracking-widest"
                    >
                      {user.role === 'freelancer' ? 'Apply Now' : 'View Profile'}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* My Applications (Freelancer Only) */}
            {user.role === 'freelancer' && myApplications.length > 0 && (
              <div className="mt-24">
                <h2 className="text-3xl font-black mb-8 flex items-center gap-4 px-2">
                  <CheckCircle2 size={32} className="text-secondary" /> ACTIVE GIGS & APPLICATIONS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myApplications.map((app, idx) => (
                    <motion.div 
                      key={app._id} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl transition-all hover:border-slate-700"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="font-extrabold text-xl text-slate-100 leading-tight">{app.jobId.title}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border shrink-0 ${
                          app.status === 'Accepted' ? 'border-secondary/30 bg-secondary/10 text-secondary' :
                          app.status === 'Rejected' ? 'border-rose-500/20 bg-rose-500/10 text-rose-500' :
                          'border-slate-700 bg-slate-950 text-slate-500'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-8 font-black uppercase tracking-widest border-b border-slate-800 pb-6">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <User size={14} className="text-primary" /> {app.clientId.name}
                        </span>
                        <span className="text-slate-800">|</span>
                        <span className="flex items-center gap-1.5 text-secondary">
                           ₹{app.jobId.budget}
                        </span>
                      </div>
                      
                      <div className="flex gap-3">
                        {app.status === 'Accepted' && (
                          <button 
                            onClick={() => handleStartChat(app.clientId._id, app._id)}
                            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest"
                          >
                            <MessageSquare size={18} /> Chat
                          </button>
                        )}
                        {app.jobId.status === 'Completed' && (
                          <button 
                            onClick={() => openReviewModal(app.clientId, app.jobId._id)}
                            className="p-4 bg-amber-500/10 text-amber-500 border border-amber-500/40 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-xl group"
                            title="Rate Client"
                          >
                            <Star size={18} className="group-hover:fill-white transition-all" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        jobId={targetUser?.jobId}
        toUserId={targetUser?._id}
        toUserName={targetUser?.name}
      />

      {/* Application Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <h3 className="text-3xl font-black mb-1 leading-tight">Apply for <span className="text-secondary tracking-tight">"{selectedJob.title}"</span></h3>
              <p className="text-slate-400 mb-8 font-medium">Elevate your chances. Why are you the right fit?</p>

              <form onSubmit={handleApply} className="space-y-8">
                <textarea
                  required
                  className="w-full h-48 px-6 py-5 bg-slate-950 border border-slate-800 rounded-[2rem] focus:ring-2 focus:ring-primary outline-none transition-all resize-none font-medium text-slate-100 shadow-inner"
                  placeholder="Share your experience, portfolio links, or local availability..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                ></textarea>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 py-5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={applying}
                    className="flex-[2] py-5 bg-primary hover:opacity-90 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex justify-center items-center gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {applying ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    Submit Vision
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
