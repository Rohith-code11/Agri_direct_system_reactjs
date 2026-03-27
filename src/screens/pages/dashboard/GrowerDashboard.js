import { useEffect, useState } from 'react';
import { getGrowerDashboard } from '../../../utils/authApi';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const GrowerDashboard = ({ user, token }) => {
  const [summary, setSummary] = useState({
    activeListings: 0,
    incomingOrders: 0,
    expectedPayout: 0,
    latestOrder: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) {
        setError('Missing authentication token.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await getGrowerDashboard(token);
        setSummary(
          response?.data?.summary || {
            activeListings: 0,
            incomingOrders: 0,
            expectedPayout: 0,
            latestOrder: null
          }
        );
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load grower dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  const cards = [
    { title: 'Active Listings', value: `${summary.activeListings} lots` },
    { title: 'Incoming Orders', value: `${summary.incomingOrders} orders` },
    { title: 'Expected Payout', value: formatCurrency(summary.expectedPayout) }
  ];

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Grower Command Center</h2>
          <p>Track active inventory, demand signals, and upcoming payout value in one workspace.</p>
        </div>
        <span className="dashboard-chip">Role: Grower</span>
      </div>

      {loading ? <p className="dashboard-message">Loading dashboard data...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}

      <div className="dashboard-card-grid">
        {cards.map((card) => (
          <article className="dashboard-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.value}</p>
          </article>
        ))}
      </div>

      <div className="dashboard-split">
        <div className="dashboard-summary">
          <strong>Latest order:</strong>{' '}
          {summary.latestOrder?.orderNumber
            ? `${summary.latestOrder.orderNumber} (${summary.latestOrder.orderStatus})`
            : `No recent orders in ${user?.townCity || 'your area'}.`}
        </div>
        <div className="dashboard-summary">
          <strong>Quick insight:</strong>{' '}
          Strong listing activity improves discoverability in buyer marketplace searches.
        </div>
      </div>
    </section>
  );
};

export default GrowerDashboard;
