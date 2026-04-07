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

  const pulseItems = [
    {
      label: 'Market Reach',
      value: summary.activeListings > 0 ? 'Visible to buyers' : 'No live reach',
      tone: summary.activeListings > 0 ? 'positive' : 'warning'
    },
    {
      label: 'Order Queue',
      value: summary.incomingOrders > 0 ? `${summary.incomingOrders} active requests` : 'Queue is clear',
      tone: summary.incomingOrders > 0 ? 'accent' : 'neutral'
    },
    {
      label: 'Cash Outlook',
      value: summary.expectedPayout > 0 ? formatCurrency(summary.expectedPayout) : 'No pending payout',
      tone: summary.expectedPayout > 0 ? 'positive' : 'neutral'
    }
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

      <div className="dashboard-layout">
        <div className="dashboard-main-column">
          <div className="dashboard-card-grid">
            {cards.map((card) => (
              <article className="dashboard-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.value}</p>
              </article>
            ))}
          </div>

          <div className="dashboard-split">
            <article className="dashboard-summary dashboard-summary-highlight">
              <span className="dashboard-summary-label">Latest Order</span>
              <strong>
                {summary.latestOrder?.orderNumber
                  ? `${summary.latestOrder.orderNumber} (${summary.latestOrder.orderStatus})`
                  : `No recent orders in ${user?.townCity || 'your area'}.`}
              </strong>
              <p>Keep fulfilment status fresh so buyers trust your dispatch timelines.</p>
            </article>

            <article className="dashboard-summary">
              <span className="dashboard-summary-label">Quick Insight</span>
              <strong>Strong listing activity improves discoverability.</strong>
              <p>Higher listing quality and accurate stock data usually convert faster in the buyer marketplace.</p>
            </article>
          </div>

          <div className="dashboard-story-grid">
            <article className="dashboard-card dashboard-story-card">
              <div className="dashboard-story-head">
                <div>
                  <span className="dashboard-summary-label">Grower Focus</span>
                  <h3>Today&apos;s farm-side priorities</h3>
                </div>
              </div>
              <div className="dashboard-checklist">
                <div>
                  <strong>Refresh listing quantities</strong>
                  <p>Buyers rely on live available stock before placing grouped orders.</p>
                </div>
                <div>
                  <strong>Confirm pending orders quickly</strong>
                  <p>Fast responses reduce buyer churn and improve repeat procurement.</p>
                </div>
                <div>
                  <strong>Keep dispatch windows accurate</strong>
                  <p>Delivery confidence improves when the latest order state is up to date.</p>
                </div>
              </div>
            </article>

            <article className="dashboard-card dashboard-story-card">
              <span className="dashboard-summary-label">Territory Snapshot</span>
              <h3>{user?.county || 'Your county'} sourcing pulse</h3>
              <p>
                Inventory visibility around {user?.townCity || 'your base town'} looks strongest when listings stay active,
                image-ready, and priced consistently against quantity bands.
              </p>
            </article>
          </div>
        </div>

        <aside className="dashboard-side-column">
          <article className="dashboard-side-card dashboard-side-feature">
            <span className="dashboard-summary-label">Farm Pulse</span>
            <h3>Operational health</h3>
            <div className="dashboard-pulse-list">
              {pulseItems.map((item) => (
                <div className={`dashboard-pulse-item tone-${item.tone}`} key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-side-card">
            <span className="dashboard-summary-label">Next Best Move</span>
            <h3>Boost buyer confidence</h3>
            <p>Add fresh photos, tighten min-order quantities, and keep inactive stock out of the live catalog.</p>
          </article>

          <article className="dashboard-side-card">
            <span className="dashboard-summary-label">Region</span>
            <h3>{user?.townCity || 'Local hub'}</h3>
            <p>{user?.county || 'Primary region'} operations are ready for listing, dispatch, and status management.</p>
          </article>
        </aside>
      </div>
    </section>
  );
};

export default GrowerDashboard;
