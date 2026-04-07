import { useCallback, useEffect, useState } from 'react';
import { getBuyerOrders, getGrowerOrders, updateGrowerOrderStatus } from '../../../utils/authApi';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2
  }).format(value || 0);
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const GROWER_STATUSES = ['accepted', 'packed', 'in_transit', 'delivered', 'cancelled'];

const Orders = ({ token, role }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadOrders = useCallback(async () => {
    if (!token) {
      setError('Missing authentication token.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = role === 'grower' ? await getGrowerOrders(token) : await getBuyerOrders(token);
      const nextOrders = response?.data?.orders || [];
      setOrders(nextOrders);
      setStatusDrafts(
        nextOrders.reduce((acc, order) => {
          acc[order.id] = order.orderStatus;
          return acc;
        }, {})
      );
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [role, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onStatusSave = async (orderId) => {
    try {
      setBusyOrderId(orderId);
      setError('');
      setSuccess('');
      const response = await updateGrowerOrderStatus(token, orderId, { status: statusDrafts[orderId] });
      const updatedOrder = response?.data?.order;
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
      setSuccess(`Order ${updatedOrder?.orderNumber || orderId} updated successfully.`);
    } catch (updateError) {
      setError(updateError.message || 'Failed to update order.');
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>{role === 'grower' ? 'Incoming Orders' : 'Purchase Orders'}</h2>
          <p>
            {role === 'grower'
              ? 'Confirm, pack, and dispatch buyer orders while keeping delivery state current.'
              : 'Track payments, shipment progress, and fulfilled orders across growers.'}
          </p>
        </div>
        <span className="dashboard-chip">{orders.length} orders</span>
      </div>

      {loading ? <p className="dashboard-message">Loading orders...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}
      {success ? <p className="auth-message auth-message-success">{success}</p> : null}
      {!loading && orders.length === 0 ? <p className="dashboard-message">No orders found yet.</p> : null}

      <div className="commerce-stack">
        {orders.map((order) => (
          <article className="dashboard-card order-card" key={order.id}>
            <div className="commerce-card-head">
              <div>
                <h3>{order.orderNumber}</h3>
                <p>
                  {role === 'grower' ? `Buyer: ${order.buyerName}` : `Grower: ${order.growerName}`} • Placed {formatDate(order.placedAt)}
                </p>
              </div>
              <div className="order-status-wrap">
                <span className={`status-pill status-${order.orderStatus}`}>{order.orderStatus}</span>
                <span className={`status-pill status-${order.paymentStatus}`}>Payment {order.paymentStatus}</span>
              </div>
            </div>

            <div className="commerce-meta-grid">
              <p><strong>Subtotal:</strong> {formatCurrency(order.subtotalAmount)}</p>
              <p><strong>Delivery:</strong> {formatCurrency(order.deliveryFee)}</p>
              <p><strong>Tax:</strong> {formatCurrency(order.taxAmount)}</p>
              <p><strong>Total:</strong> {formatCurrency(order.totalAmount)}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Tracking:</strong> {order.shipment?.trackingNumber || 'Pending assignment'}</p>
              <p><strong>Shipment:</strong> {order.shipment?.shipmentStatus || '-'}</p>
              <p><strong>ETA:</strong> {formatDate(order.shipment?.estimatedDelivery)}</p>
            </div>

            {order.items?.length ? (
              <div className="order-items-list">
                {order.items.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <span>{item.productTitle}</span>
                    <span>{item.quantity} {item.unit}</span>
                    <span>{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {order.notes ? <p className="order-note"><strong>Notes:</strong> {order.notes}</p> : null}

            {role === 'grower' ? (
              <div className="order-actions">
                <select
                  value={statusDrafts[order.id] || order.orderStatus}
                  onChange={(event) => setStatusDrafts((prev) => ({ ...prev, [order.id]: event.target.value }))}
                  disabled={busyOrderId === order.id}
                >
                  {GROWER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => onStatusSave(order.id)} disabled={busyOrderId === order.id}>
                  {busyOrderId === order.id ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
};

export default Orders;
