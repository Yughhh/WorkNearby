import api from './api';

/** USER SERVICES **/
export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

/** JOB SERVICES **/
export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const fetchNearbyJobs = async (lat, lng, radius = 10) => {
  const response = await api.get(`/jobs/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  return response.data;
};

export const fetchNearbyFreelancers = async (lat, lng, radius = 10) => {
  const response = await api.get(`/users/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  return response.data;
};

export const fetchClientJobs = async () => {
  const response = await api.get('/jobs/client');
  return response.data;
};

/** APPLICATION SERVICES **/
export const applyToJob = async (applicationData) => {
  const response = await api.post('/applications', applicationData);
  return response.data;
};

export const fetchJobApplications = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

export const fetchUserApplications = async () => {
  const response = await api.get('/applications/user');
  return response.data;
};

export const fetchMyApplications = async () => {
  const response = await api.get('/applications/my');
  return response.data;
};

export const updateApplicationStatus = async (appId, status) => {
  const response = await api.put(`/applications/${appId}/status`, { status });
  return response.data;
};

