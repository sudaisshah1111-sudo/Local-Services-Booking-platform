import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProviderServices, getAvailability, getReviews } from '../api/providers';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function ProviderProfile() {
  const { providerId } = useParams();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reviewData, setReviewData] = useState({ averageRating: null, count: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [providerId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [servicesRes, slotsRes, reviewsRes] = await Promise.all([
        getProviderServices(providerId),
        getAvailability(providerId),
        getReviews(providerId),
      ]);
      setServices(servicesRes.data);
      setSlots(slotsRes.data.filter((s) => !s.isBooked));
      setReviewData(reviewsRes.data);

      if (user?.role === 'customer') {
        const favRes = await api.get('/auth/favorites');
        setIsFavorite(favRes.data.some((f) => f._id === providerId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      await api.post(`/auth/favorites/${providerId}`);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const providerName = services[0]?.providerId?.name || 'Provider';

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <p className="text-gray-400 text-center mt-20">Loading provider...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white text-2xl font-bold">
              {providerName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{providerName}</h1>
              {reviewData.averageRating && (
                <p className="text-brand-orange text-sm">
                  ★ {reviewData.averageRating} ({reviewData.count} review{reviewData.count !== 1 ? 's' : ''})
                </p>
              )}
            </div>
          </div>

          {user?.role === 'customer' && (
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition ${
                isFavorite
                  ? 'bg-brand-pink/20 border-brand-pink text-brand-pink'
                  : 'bg-bg-card border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <span>{isFavorite ? '♥' : '♡'}</span>
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          )}
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {services.map((service) => (
            <div key={service._id} className="bg-bg-card border border-white/10 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-1">{service.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-brand-teal font-semibold">Rs. {service.price}</span>
                <Link
                  to={`/book/${service._id}`}
                  className="bg-gradient-to-r from-brand-purple to-brand-pink text-white text-sm rounded-lg px-4 py-1.5 hover:opacity-90 transition"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">Availability</h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {slots.length === 0 ? (
            <p className="text-gray-400 text-sm">No open slots right now.</p>
          ) : (
            slots.map((slot) => (
              <span
                key={slot._id}
                className="bg-brand-teal/10 border border-brand-teal/30 text-brand-teal text-sm rounded-lg px-3 py-1.5"
              >
                {slot.dayOfWeek} {slot.startTime}–{slot.endTime}
              </span>
            ))
          )}
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">Reviews</h2>
        <div className="space-y-4">
          {reviewData.reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet.</p>
          ) : (
            reviewData.reviews.map((review) => (
              <div key={review._id} className="bg-bg-card border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{review.customerId.name}</span>
                  <span className="text-brand-orange text-sm">★ {review.rating}</span>
                </div>
                <p className="text-gray-400 text-sm">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProviderProfile;