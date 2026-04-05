import api from './api';

export const fetchConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const fetchMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const startConversation = async (receiverId, applicationId) => {
  const response = await api.post('/messages/start', { receiverId, applicationId });
  return response.data;
};

