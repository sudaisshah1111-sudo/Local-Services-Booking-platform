import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const statusColors = {
  pending: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  confirmed: 'bg-brand-teal/10 border-brand-teal/30 text-brand-teal',
  completed: 'bg-brand-purple/10 border-brand-purple/30 text-brand-purple',
  declined: 'bg-red-500/10 border-red-500/30 text-red-400',
  cancelled: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/me');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-400">You haven't made any bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-bg-card border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{booking.serviceId?.title}</h3>
                    <p className="text-gray-400 text-sm">
                      with {booking.providerId?.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium rounded-full px-3 py-1 border ${statusColors[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  {booking.slotId?.dayOfWeek} {booking.slotId?.startTime}–{booking.slotId?.endTime}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-teal font-semibold">Rs. {booking.serviceId?.price}</span>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="text-red-400 text-sm hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;