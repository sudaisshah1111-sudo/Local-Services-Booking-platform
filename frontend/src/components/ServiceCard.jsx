import { Link } from 'react-router-dom';

function ServiceCard({ service }) {
  return (
    <Link
      to={`/provider/${service.providerId._id}`}
      className="block bg-bg-card border border-white/10 rounded-xl p-5 hover:border-brand-purple/50 transition group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white font-semibold">
          {service.providerId.name?.charAt(0) || 'P'}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{service.providerId.name}</p>
          <p className="text-gray-500 text-xs">{service.category}</p>
        </div>
      </div>
      <h3 className="text-white font-semibold group-hover:text-brand-purple transition mb-1">
        {service.title}
      </h3>
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{service.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-brand-teal font-semibold">Rs. {service.price}</span>
        <span className="text-gray-500 text-xs">{service.durationMinutes} min</span>
      </div>
    </Link>
  );
}

export default ServiceCard;