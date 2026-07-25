import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getServiceById } from '../api/services';
import { getAvailability } from '../api/providers';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function BookingCheckout() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const serviceRes = await getServiceById(serviceId);
      setService(serviceRes.data);
      const slotsRes = await getAvailability(serviceRes.data.providerId._id || serviceRes.data.providerId);
      setSlots(slotsRes.data.filter((s) => !s.isBooked));
    } catch (err) {
      console.error(err);
      setError('Could not load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/bookings', { serviceId, slotId: selectedSlot._id });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <p className="text-gray-400 text-center mt-20">Loading...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-teal/20 border border-brand-teal flex items-center justify-center text-brand-teal text-3xl mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Booking Requested!</h1>
          <p className="text-gray-400 mb-6">
            Your request has been sent to the provider. You'll be notified once it's confirmed.
          </p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-lg px-6 py-2.5 hover:opacity-90 transition"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">Confirm Your Booking</h1>

        <div className="bg-bg-card border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-white font-semibold text-lg mb-1">{service.title}</h2>
          <p className="text-gray-400 text-sm mb-3">{service.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-brand-teal font-semibold text-lg">Rs. {service.price}</span>
            <span className="text-gray-500 text-sm">{service.durationMinutes} min</span>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-3">Select a Time Slot</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {slots.length === 0 ? (
          <p className="text-gray-400 text-sm mb-6">No available slots for this provider right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {slots.map((slot) => (
              <button
                key={slot._id}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium border transition ${
                  selectedSlot?._id === slot._id
                    ? 'bg-brand-purple/20 border-brand-purple text-brand-purple'
                    : 'bg-bg-card border-white/10 text-gray-300 hover:border-white/30'
                }`}
              >
                {slot.dayOfWeek}
                <br />
                {slot.startTime}–{slot.endTime}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={submitting || slots.length === 0}
          className="w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-lg py-3 hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

export default BookingCheckout;