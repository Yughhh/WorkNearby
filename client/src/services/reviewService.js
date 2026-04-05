import api from './api';

export const submitReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const fetchUserReviews = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

export const markJobCompleted = async (jobId) => {
  const response = await api.put(`/jobs/${jobId}/complete`, {});
  return response.data;
};

