import api from './api';

export const submitPaymentRequest = async (formData) => {
  const res = await api.post('/payments/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const fetchMyPayments = async () => {
  const res = await api.get('/payments/my');
  return res.data;
};

export const fetchAdminPayments = async () => {
  const res = await api.get('/payments/admin/all');
  return res.data;
};

export const verifyPayment = async (paymentId, status) => {
  const res = await api.put(`/payments/admin/verify/${paymentId}`, { status });
  return res.data;
};

