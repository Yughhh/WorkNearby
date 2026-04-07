import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import { fetchClientJobs, fetchJobApplications, updateApplicationStatus } from '../services/marketplaceService';
import { startConversation } from '../services/messageService';
import { markJobCompleted } from '../services/reviewService';
import ReviewModal from '../components/ReviewModal';
import Navbar from '../components/Navbar';
import { JobSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogOut, User, Briefcase, IndianRupee, Users, ArrowRight, Check, X, Loader2, ChevronRight, MessageSquare, CheckCircle2, Star, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'client') {
      navigate('/home');
    } else {
      setUser(currentUser);
      loadMyJobs();
    }
  }, [navigate]);

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchClientJobs();
      setJobs(data);
      if (data.length > 0) {
        handleViewApplicants(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load your gigs.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setAppLoading(true);
    try {
      const data = await fetchJobApplications(job._id);
      setApplicants(data);
    } catch (err) {
      toast.error('Failed to load applicants.');
    } finally {
      setAppLoading(false);
    }
  };

  const handleAction = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      toast.success(`Applicant ${status} successfully! ✨`);
      handleViewApplicants(selectedJob);
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const handleStartChat = async (freelancerId, appId) => {
    try {
      const conv = await startConversation(freelancerId);
      navigate(`/chat?id=${conv._id}`);
    } catch (err) {
      toast.error('Failed to start chat.');
    }
  };

  const handleCompleteJob = async (jobId) => {
    if (!window.confirm('Mark this job as fully completed? This will allow reviews.')) return;
    try {
      await markJobCompleted(jobId);
      toast.success('Gig marked as COMPLETED! 🎉');
      loadMyJobs();
    } catch (err) {
      toast.error('Failed to update job status.');
    }
  };

  const openReviewModal = (freelancer, jobId) => {
    setTargetUser({ ...freelancer, jobId });
    setIsReviewOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'border-secondary/20 bg-secondary/5 text-secondary';
      case 'InProgress': return 'border-primary/30 bg-primary/10 text-primary';
      case 'Completed': return 'border-amber-500/20 bg-amber-500/10 text-amber-500';
      default: return 'border-slate-700 bg-slate-800 text-slate-500';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 font-outfit">
      <Navbar active="dashboard" user={user} />

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Job List */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-center justify-between px-2 mb-4">
              <h2 className="text-3xl font-black flex items-center gap-4">
                <Briefcase size={32} className="text-primary" /> Active Gigs
              </h2>
              <Link to="/post-job" className="p-3 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg border border-primary/20">
                <Plus size={20} />
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-6">
                <JobSkeleton />
                <JobSkeleton />
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-[3rem] p-16 text-center">
                <div className="bg-primary/5 p-8 rounded-full w-fit mx-auto mb-6 text-primary/30">
                  <Sparkles size={48} />
                </div>
                <p className="text-slate-500 font-bold mb-6">No active gigs found.</p>
                <Link to="/post-job" className="inline-block py-4 px-8 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">Create New Gig</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={job._id}
                    onClick={() => handleViewApplicants(job)}
                    className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all relative overflow-hidden group shadow-2xl ${
                      selectedJob?._id === job._id 
                      ? 'bg-slate-900 border-primary shadow-primary/10' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      <p className="text-xl font-black text-secondary tracking-tighter">₹{job.budget}</p>
                    </div>
                    <h3 className="font-extrabold text-xl mb-4 group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 pt-4 border-t border-slate-800/50">
                      <span className="flex items-center gap-1.5"><Users size={14} className="text-primary" /> {job.applicationsCount || 0} Applicants</span>
                      <span className="text-slate-800">|</span>
                      <span className="flex items-center gap-1 text-slate-300">DETAILS <ChevronRight size={14} /></span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Details / Applicants Area */}
          <div className="lg:col-span-2">
            {!selectedJob ? (
              <div className="h-full bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 p-16 min-h-[500px]">
                <Users size={80} className="mb-6 opacity-5" />
                <p className="text-xl font-black uppercase tracking-widest opacity-20">Select a gig to manage applicants</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
                <div className="p-10 bg-slate-800/20 border-b border-slate-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Briefcase size={120} />
                   </div>
                   
                   <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10 font-bold mb-8">
                      <div className="flex-1">
                        <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">{selectedJob.title}</h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium line-clamp-3">"{selectedJob.description}"</p>
                      </div>
                      <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 text-center min-w-[160px] shadow-2xl">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Budget</p>
                        <p className="text-3xl font-black text-secondary tracking-tighter">₹{selectedJob.budget}</p>
                      </div>
                   </div>
                   
                   {selectedJob.status === 'InProgress' && (
                     <button 
                       onClick={() => handleCompleteJob(selectedJob._id)}
                       className="w-full py-5 bg-secondary text-slate-950 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-secondary/20 uppercase tracking-widest"
                     >
                       <CheckCircle2 size={20} /> Mark Gig as Fully Completed
                     </button>
                   )}
                </div>

                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-sm font-black mb-10 flex items-center gap-3 uppercase tracking-[0.3em] text-slate-500">
                    <Users size={20} className="text-primary" /> {selectedJob.status === 'Completed' ? 'Hired Freelancer' : `TALENT PIPELINE (${applicants.length})`}
                  </h3>

                  {appLoading ? (
                    <div className="flex-1 flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>
                  ) : applicants.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-[2.5rem] border border-slate-800 border-dashed">
                      <Sparkles size={48} className="text-slate-700 mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for local responses...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {applicants
                        .filter(app => selectedJob.status !== 'Completed' || app.status === 'Accepted')
                        .map((app, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={app._id} 
                          className="p-8 bg-slate-950 rounded-[2.5rem] border border-slate-800 hover:border-primary/20 transition-all relative group shadow-xl"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/20 p-4 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
                                <User size={24} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-2xl text-white">{app.freelancerId.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Star size={14} className="text-secondary fill-secondary" />
                                  <span className="text-xs text-slate-400 font-black uppercase tracking-widest">
                                    {app.freelancerId.averageRating?.toFixed(1) || '0.0'} • {app.freelancerId.reviewCount || 0} REVIEWS
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {app.status === 'Pending' ? (
                              <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                  onClick={() => handleAction(app._id, 'Rejected')}
                                  className="flex-1 md:flex-none p-4 bg-slate-900 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-slate-800 hover:border-rose-500 shadow-lg"
                                >
                                  <X size={20} />
                                </button>
                                <button 
                                  onClick={() => handleAction(app._id, 'Accepted')}
                                  className="flex-[2] md:flex-none bg-secondary text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-secondary/30 hover:scale-[1.02]"
                                >
                                  <Check size={20} /> Hire Talent
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                <span className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border text-center ${
                                  app.status === 'Accepted' ? 'border-secondary/40 bg-secondary/10 text-secondary' : 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                                }`}>
                                  {app.status}
                                </span>
                                {app.status === 'Accepted' && (
                                  <div className="flex gap-3">
                                    <button 
                                      onClick={() => handleStartChat(app.freelancerId._id, app._id)}
                                      className="p-4 bg-primary text-white rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                                      title="Open Chat"
                                    >
                                      <MessageSquare size={20} />
                                    </button>
                                    {selectedJob.status === 'Completed' && (
                                      <button 
                                        onClick={() => openReviewModal(app.freelancerId, selectedJob._id)}
                                        className="p-4 bg-amber-500 text-slate-950 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-500/30"
                                        title="Rate Talent"
                                      >
                                        <Star size={20} className="fill-slate-950" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-900 p-6 rounded-3xl mb-8 relative border border-slate-800 shadow-inner">
                            <div className="absolute -top-3 left-6 px-3 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">Proposal Message</div>
                            <p className="text-slate-300 font-medium italic leading-relaxed">"{app.proposal}"</p>
                          </div>

                          {app.freelancerId.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {app.freelancerId.skills.map(skill => (
                                <span key={skill} className="text-[10px] bg-slate-950 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-800 font-black uppercase tracking-tighter shadow-sm">{skill}</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        jobId={targetUser?.jobId}
        toUserId={targetUser?._id}
        toUserName={targetUser?.name}
      />
    </div>
  );
};

// Helper for 'Plus' icon missing in imports
const Plus = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default Dashboard;
