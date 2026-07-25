import api from './axios';

export const getProviderServices = (providerId) => api.get('/services', { params: { providerId } });
export const getAvailability = (providerId) => api.get(`/availability/${providerId}`);
export const getReviews = (providerId) => api.get(`/reviews/${providerId}`);