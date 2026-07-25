import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const statusColors = {
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-700',
  confirmed: 'bg-teal-100 border-teal-300 text-teal-700',
  completed: 'bg-purple-100 border-purple-300 text-purple-700',
  declined: 'bg-red-100 border-red-300 text-red-700',
  cancelled: 'bg-gray-100 border-gray-300 text-gray-600',
};

const tabIcons = {
  bookings: '📋',
  services: '🛠️',
  availability: '🗓️',
};

const PIE_COLORS = ['#eab308', '#14b8a6', '#a855f7', '#ef4444', '#9ca3af'];

function Dashboard() {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newService, setNewService] = useState({ title: '', description: '', category: '', durationMinutes: '', price: '' });
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 'Monday', startTime: '', endTime: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.get('/bookings/me'),
        api.get('/services'),
      ]);
      setBookings(bookingsRes.data);
      const me = JSON.parse(localStorage.getItem('user'));
      const mine = servicesRes.data.filter((s) => s.providerId._id === me.id);
      setServices(mine);
      if (mine.length > 0) {
        const slotsRes = await api.get(`/availability/${me.id}`);
        setSlots(slotsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/services', {
        ...newService,
        durationMinutes: Number(newService.durationMinutes),
        price: Number(newService.price),
      });
      setNewService({ title: '', description: '', category: '', durationMinutes: '', price: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service');
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/availability', newSlot);
      setNewSlot({ dayOfWeek: 'Monday', startTime: '', endTime: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create slot');
    }
  };

  const tabs = [
    { key: 'bookings', label: 'Booking Requests' },
    { key: 'services', label: 'Services' },
    { key: 'availability', label: 'Availability' },
  ];

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const declinedCount = bookings.filter((b) => b.status === 'declined').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const totalEarnings = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.serviceId?.price || 0), 0);

  const pieData = [
    { name: 'Pending', value: pendingCount },
    { name: 'Confirmed', value: confirmedCount },
    { name: 'Completed', value: completedCount },
    { name: 'Declined', value: declinedCount },
    { name: 'Cancelled', value: cancelledCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back, <span className="bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-transparent">Provider</span>
          </h1>
          <p className="text-gray-500 text-sm mb-6">Here's what's happening with your business today</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="grid grid-cols-2 gap-4 lg:col-span-2">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-gray-500 text-xs mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-gray-500 text-xs mb-1">Confirmed</p>
                <p className="text-2xl font-bold text-teal-600">{confirmedCount}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-gray-500 text-xs mb-1">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{completedCount}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-gray-500 text-xs mb-1">Earnings</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
                  Rs. {totalEarnings}
                </p>
              </div>
            </div>

            {/* Pie chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <p className="text-gray-500 text-xs mb-2">Booking Breakdown</p>
              {pieData.length === 0 ? (
                <p className="text-gray-400 text-sm">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-8">
        {/* Sidebar nav */}
        <div className="sm:w-48 flex sm:flex-col gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                tab === t.key
                  ? 'bg-gradient-to-r from-brand-purple/10 to-brand-pink/10 border border-brand-purple/30 text-brand-purple'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>{tabIcons[t.key]}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <>
              {tab === 'bookings' && (
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <p className="text-gray-500">No booking requests yet.</p>
                  ) : (
                    bookings.map((b) => (
                      <div
                        key={b._id}
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white text-sm font-semibold">
                              {b.customerId?.name?.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-gray-900 font-semibold">{b.serviceId?.title}</h3>
                              <p className="text-gray-500 text-sm">from {b.customerId?.name}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium rounded-full px-3 py-1 border ${statusColors[b.status]}`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3 ml-12">
                          {b.slotId?.dayOfWeek} {b.slotId?.startTime}–{b.slotId?.endTime}
                        </p>
                        {b.status === 'pending' && (
                          <div className="flex gap-2 ml-12">
                            <button
                              onClick={() => handleStatusChange(b._id, 'confirmed')}
                              className="bg-gradient-to-r from-brand-teal to-brand-purple text-white text-sm font-medium rounded-lg px-4 py-1.5 hover:opacity-90 transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusChange(b._id, 'declined')}
                              className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-1.5 hover:bg-red-100 transition"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(b._id, 'completed')}
                            className="ml-12 bg-purple-50 border border-purple-300 text-purple-600 text-sm rounded-lg px-4 py-1.5 hover:bg-purple-100 transition"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'services' && (
                <div>
                  <form onSubmit={handleCreateService} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 space-y-3 shadow-sm">
                    <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-gradient-to-b from-brand-purple to-brand-pink rounded-full" />
                      Add a Service
                    </h3>
                    <input
                      type="text" placeholder="Title" required
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-purple focus:outline-none"
                    />
                    <input
                      type="text" placeholder="Description" required
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-purple focus:outline-none"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text" placeholder="Category" required
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-purple focus:outline-none"
                      />
                      <input
                        type="number" placeholder="Duration (min)" required
                        value={newService.durationMinutes}
                        onChange={(e) => setNewService({ ...newService, durationMinutes: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-purple focus:outline-none"
                      />
                      <input
                        type="number" placeholder="Price" required
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-purple focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="bg-gradient-to-r from-brand-purple to-brand-pink text-white text-sm font-semibold rounded-lg px-5 py-2 hover:opacity-90 transition">
                      + Add Service
                    </button>
                  </form>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <div key={s._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
                        <h4 className="text-gray-900 font-medium">{s.title}</h4>
                        <p className="text-gray-500 text-sm mb-2">{s.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-teal-600 font-semibold">Rs. {s.price}</span>
                          <span className="text-gray-400 text-xs">{s.durationMinutes} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'availability' && (
                <div>
                  <form onSubmit={handleCreateSlot} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 space-y-3 shadow-sm">
                    <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-gradient-to-b from-brand-teal to-brand-purple rounded-full" />
                      Add Availability Slot
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={newSlot.dayOfWeek}
                        onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-teal focus:outline-none"
                      >
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input
                        type="time" required
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-teal focus:outline-none"
                      />
                      <input
                        type="time" required
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-brand-teal focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="bg-gradient-to-r from-brand-teal to-brand-purple text-white text-sm font-semibold rounded-lg px-5 py-2 hover:opacity-90 transition">
                      + Add Slot
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <span
                        key={slot._id}
                        className={`text-sm rounded-full px-4 py-2 border ${
                          slot.isBooked
                            ? 'bg-gray-100 border-gray-300 text-gray-500'
                            : 'bg-teal-50 border-teal-300 text-teal-700'
                        }`}
                      >
                        {slot.dayOfWeek} {slot.startTime}–{slot.endTime} {slot.isBooked && '· booked'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;