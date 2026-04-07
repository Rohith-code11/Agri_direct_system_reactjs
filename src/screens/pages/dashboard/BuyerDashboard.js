import { useEffect, useState } from 'react';
import { getBuyerDashboard } from '../../../utils/authApi';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const BuyerDashboard = ({ user, token }) => {
  const [summary, setSummary] = useState({
    openOrders: 0,
    inTransitOrders: 0,
    monthlySpend: 0,
    latestDelivery: null
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
        const response = await getBuyerDashboard(token);
        setSummary(
          response?.data?.summary || {
            openOrders: 0,
            inTransitOrders: 0,
            monthlySpend: 0,
            latestDelivery: null
          }
        );
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load buyer dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  const cards = [
    { title: 'Open Purchase Orders', value: `${summary.openOrders} pending` },
    { title: 'Deliveries In Transit', value: `${summary.inTransitOrders} shipments` },
    { title: 'Monthly Spend', value: formatCurrency(summary.monthlySpend) }
  ];

  const sourcingItems = [
    {
      label: 'Open Orders',
      value: summary.openOrders > 0 ? `${summary.openOrders} awaiting closure` : 'No backlog',
      tone: summary.openOrders > 0 ? 'accent' : 'neutral'
    },
    {
      label: 'Transit Flow',
      value: summary.inTransitOrders > 0 ? `${summary.inTransitOrders} moving now` : 'No active transit',
      tone: summary.inTransitOrders > 0 ? 'positive' : 'warning'
    },
    {
      label: 'Spend Pace',
      value: summary.monthlySpend > 0 ? formatCurrency(summary.monthlySpend) : 'No monthly spend yet',
      tone: summary.monthlySpend > 0 ? 'positive' : 'neutral'
    }
  ];

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Buyer Command Center</h2>
          <p>Monitor procurement pipeline, in-transit deliveries, and monthly sourcing spend.</p>
        </div>
        <span className="dashboard-chip">Role: Buyer</span>
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
              <span className="dashboard-summary-label">Latest Delivery</span>
              <strong>
                {summary.latestDelivery?.trackingNumber
                  ? `${summary.latestDelivery.trackingNumber} (${summary.latestDelivery.shipmentStatus})`
                  : `No live deliveries in ${user?.county || 'your procurement zone'}.`}
              </strong>
              <p>Tracking visibility helps your team coordinate receiving windows and warehouse staffing.</p>
            </article>

            <article className="dashboard-summary">
              <span className="dashboard-summary-label">Quick Insight</span>
              <strong>Use filters to lower per-unit sourcing costs.</strong>
              <p>Compare county, category, and quantity thresholds before sending repeat volume through the marketplace.</p>
            </article>
          </div>

          <div className="dashboard-story-grid">
            <article className="dashboard-card dashboard-story-card">
              <span className="dashboard-summary-label">Buyer Workflow</span>
              <h3>Procurement rhythm</h3>
              <div className="dashboard-checklist">
                <div>
                  <strong>Review cart composition</strong>
                  <p>Group compatible listings to reduce fragmented orders and delivery overhead.</p>
                </div>
                <div>
                  <strong>Track shipments proactively</strong>
                  <p>Update receiving teams before in-transit orders hit the final mile.</p>
                </div>
                <div>
                  <strong>Watch price movement</strong>
                  <p>Marketplace filters help you compare alternatives before committing spend.</p>
                </div>
              </div>
            </article>

            <article className="dashboard-card dashboard-story-card">
              <span className="dashboard-summary-label">Procurement Zone</span>
              <h3>{user?.county || 'Regional view'}</h3>
              <p>
                Buyers in {user?.townCity || 'your city'} can use orders, cart, and notifications together to keep sourcing
                decisions visible from search to delivery.
              </p>
            </article>
          </div>
        </div>

        <aside className="dashboard-side-column">
          <article className="dashboard-side-card dashboard-side-feature">
            <span className="dashboard-summary-label">Sourcing Pulse</span>
            <h3>Right now</h3>
            <div className="dashboard-pulse-list">
              {sourcingItems.map((item) => (
                <div className={`dashboard-pulse-item tone-${item.tone}`} key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-side-card">
            <span className="dashboard-summary-label">Recommended Action</span>
            <h3>Keep procurement lean</h3>
            <p>Review in-transit orders before placing fresh ones so spend stays aligned with inbound stock.</p>
          </article>

          <article className="dashboard-side-card">
            <span className="dashboard-summary-label">Coverage</span>
            <h3>{user?.townCity || 'Active city hub'}</h3>
            <p>{user?.county || 'Primary county'} remains your live marketplace and delivery coordination zone.</p>
          </article>
        </aside>
      </div>
    </section>
  );
};

export default BuyerDashboard;
