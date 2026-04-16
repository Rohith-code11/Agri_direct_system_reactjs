import { useEffect, useState } from 'react';
import { getBuyerDashboard } from '../../../utils/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyCheckDollar, faTruck, faWarehouse } from '@fortawesome/free-solid-svg-icons';

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
    { title: 'Open Purchase Orders', value: `${summary.openOrders} pending`, icon: faWarehouse },
    { title: 'Deliveries In Transit', value: `${summary.inTransitOrders} shipments`, icon: faTruck },
    { title: 'Monthly Spend', value: formatCurrency(summary.monthlySpend), icon: faMoneyCheckDollar }
  ];

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Buyer Command Center</h2>
          <p>Monitor procurement pipeline, in-transit deliveries, and monthly sourcing spend.</p>
        </div>
      </div>

      {loading ? <p className="dashboard-message">Loading dashboard data...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}

      <div className="dashboard-layout">
        <div className="dashboard-main-column">
          <div className="dashboard-card-grid">
            {cards.map((card) => (
              <article className="dashboard-card" key={card.title}>
                <div className="card-icon-wrap"><FontAwesomeIcon icon={card.icon} /></div>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyerDashboard;
