import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Loader2 } from 'lucide-react';
import { submitReview } from '../services/reviewService';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, onClose, jobId, toUserId, toUserName }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a star rating.');
    
    setSubmitting(true);
    try {
      await submitReview({ jobId, toUserId, rating, comment });
      toast.success('Review submitted successfully! ⭐');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="bg-primary/10 p-5 rounded-full w-fit mx-auto mb-4 border border-primary/20">
                <Star size={32} className="text-primary fill-primary" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">Rate your experience</h3>
              <p className="text-slate-400 font-medium">How was your collaboration with <span className="text-white font-bold">{toUserName}</span>?</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Star Rating Section */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-all hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      size={40} 
                      className={`transition-colors ${
                        (hover || rating) >= star 
                        ? 'text-secondary fill-secondary' 
                        : 'text-slate-700'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              {/* Comment Section */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Your Feedback</label>
                <textarea
                  required
                  placeholder="Share a few words about the work, quality, and professionalism..."
                  className="w-full h-32 px-5 py-4 bg-slate-950 border border-slate-800 rounded-3xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-primary hover:opacity-90 rounded-[1.5rem] text-white font-black text-lg flex justify-center items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                Submit Review
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
