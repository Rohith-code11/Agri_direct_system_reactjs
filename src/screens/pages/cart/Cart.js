import { useCallback, useEffect, useState } from 'react';
import { checkoutCart, getMyCart, removeCartItem, updateCartItem } from '../../../utils/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2
  }).format(value || 0);
};

const Cart = ({ token, onCheckoutComplete }) => {
  const [cart, setCart] = useState({ items: [], summary: { itemCount: 0, totalUnits: 0, subtotal: 0 } });
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCart = useCallback(async () => {
    if (!token) {
      setError('Missing authentication token.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getMyCart(token);
      setCart(response?.data || { items: [], summary: { itemCount: 0, totalUnits: 0, subtotal: 0 } });
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const onQuantityChange = async (itemId, quantity) => {
    try {
      setBusyItemId(itemId);
      setError('');
      setSuccess('');
      const response = await updateCartItem(token, itemId, { quantity: Number(quantity) });
      setCart(response?.data || cart);
    } catch (updateError) {
      setError(updateError.message || 'Failed to update quantity.');
    } finally {
      setBusyItemId(null);
    }
  };

  const onRemove = async (itemId) => {
    try {
      setBusyItemId(itemId);
      setError('');
      setSuccess('');
      const response = await removeCartItem(token, itemId);
      setCart(response?.data || cart);
    } catch (removeError) {
      setError(removeError.message || 'Failed to remove item.');
    } finally {
      setBusyItemId(null);
    }
  };

  const onCheckout = async (event) => {
    event.preventDefault();

    try {
      setCheckingOut(true);
      setError('');
      setSuccess('');
      const response = await checkoutCart(token, { paymentMethod, notes });
      const orderCount = response?.data?.orders?.length || 0;
      setSuccess(`Checkout completed. ${orderCount} order${orderCount === 1 ? '' : 's'} created.`);
      setCart({ items: [], summary: { itemCount: 0, totalUnits: 0, subtotal: 0 } });
      setNotes('');

      if (typeof onCheckoutComplete === 'function') {
        onCheckoutComplete();
      }
    } catch (checkoutError) {
      setError(checkoutError.message || 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = Number(cart?.summary?.subtotal || 0);
  const deliveryFee = subtotal >= 1000 ? 0 : cart.items.length > 0 ? 40 : 0;
  const taxAmount = Number((subtotal * 0.05).toFixed(2));
  const total = subtotal + deliveryFee + taxAmount;

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Cart & Checkout</h2>
          <p>Review quantities, validate pricing, and place grouped orders with growers.</p>
        </div>
        <span className="dashboard-chip">{cart?.summary?.itemCount || 0} items</span>
      </div>

      {loading ? <p className="dashboard-message">Loading cart...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}
      {success ? <p className="auth-message auth-message-success">{success}</p> : null}

      {!loading && cart.items.length === 0 ? (
        <p className="dashboard-message">Your cart is empty. Add produce from the marketplace to begin checkout.</p>
      ) : null}

      {!loading && cart.items.length > 0 ? (
        <div className="commerce-layout">
          <div className="commerce-stack">
            {cart.items.map((item) => (
              <article className="dashboard-card commerce-card" key={item.itemId}>
                <div className="commerce-card-head">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.growerName} • {item.townCity}, {item.county}</p>
                  </div>
                  <span className="status-pill status-active">In Cart</span>
                </div>

                <div className="commerce-meta-grid">
                  <p><strong>Unit price:</strong> {formatCurrency(item.unitPrice)} / {item.unit}</p>
                  <p><strong>Available:</strong> {item.quantityAvailable} {item.unit}</p>
                  <p><strong>Minimum order:</strong> {item.minOrderQty} {item.unit}</p>
                  <p><strong>Line total:</strong> {formatCurrency(item.lineTotal)}</p>
                </div>

                <div className="cart-item-actions">
                  <label>
                    Quantity
                    <input
                      type="number"
                      min={item.minOrderQty}
                      max={item.quantityAvailable}
                      step="0.01"
                      defaultValue={item.quantity}
                      onBlur={(event) => onQuantityChange(item.itemId, event.target.value)}
                      disabled={busyItemId === item.itemId}
                    />
                  </label>
                  <button type="button" className="secondary-btn" onClick={() => onRemove(item.itemId)} disabled={busyItemId === item.itemId}>
                    <FontAwesomeIcon icon={faTrashCan} />
                    {busyItemId === item.itemId ? 'Working...' : 'Remove'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="dashboard-card commerce-summary">
            <h3>Checkout Summary</h3>
            <p><strong>Items:</strong> {cart.summary.itemCount}</p>
            <p><strong>Total units:</strong> {cart.summary.totalUnits}</p>
            <p><strong>Subtotal:</strong> {formatCurrency(subtotal)}</p>
            <p><strong>Delivery:</strong> {formatCurrency(deliveryFee)}</p>
            <p><strong>Tax:</strong> {formatCurrency(taxAmount)}</p>
            <p className="commerce-total"><strong>Total:</strong> {formatCurrency(total)}</p>

            <form className="checkout-form" onSubmit={onCheckout}>
              <label>
                Payment Method
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </label>
              <label>
                Order Notes
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Delivery timings, handling instructions, or procurement notes"
                />
              </label>
              <button type="submit" className="profile-save-btn" disabled={checkingOut}>
                <FontAwesomeIcon icon={faCreditCard} />
                {checkingOut ? 'Placing Orders...' : 'Checkout'}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
};

export default Cart;
