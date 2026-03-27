import { useCallback, useEffect, useState } from 'react';
import { createGrowerListing, getGrowerInventory } from '../../../utils/authApi';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const Inventory = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    unit: 'kg',
    pricePerUnit: '',
    quantityAvailable: '',
    minOrderQty: '1',
    isOrganic: false,
    county: '',
    townCity: '',
    postcode: '',
    images: []
  });
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantityAvailable || 0), 0);
  const activeCount = items.filter((item) => item.listingStatus === 'active').length;

  const loadInventory = useCallback(async () => {
    if (!token) {
      setError('Missing authentication token.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getGrowerInventory(token);
      setItems(response?.data?.inventory || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const onInputChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'checkbox') {
      setNewListing((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === 'file') {
      setNewListing((prev) => ({ ...prev, images: Array.from(files || []) }));
      return;
    }
    setNewListing((prev) => ({ ...prev, [name]: value }));
  };

  const onCreateListing = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newListing.title || !newListing.pricePerUnit || !newListing.quantityAvailable || !newListing.county || !newListing.townCity || !newListing.postcode) {
      setFormError('Please fill all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', newListing.title);
      formData.append('description', newListing.description);
      formData.append('unit', newListing.unit);
      formData.append('pricePerUnit', newListing.pricePerUnit);
      formData.append('quantityAvailable', newListing.quantityAvailable);
      formData.append('minOrderQty', newListing.minOrderQty);
      formData.append('isOrganic', newListing.isOrganic ? 'true' : 'false');
      formData.append('county', newListing.county);
      formData.append('townCity', newListing.townCity);
      formData.append('postcode', newListing.postcode);
      newListing.images.forEach((file) => formData.append('images', file));

      const response = await createGrowerListing(token, formData);
      setFormSuccess(response.message || 'Listing created.');
      setNewListing({
        title: '',
        description: '',
        unit: 'kg',
        pricePerUnit: '',
        quantityAvailable: '',
        minOrderQty: '1',
        isOrganic: false,
        county: '',
        townCity: '',
        postcode: '',
        images: []
      });
      await loadInventory();
    } catch (submitError) {
      setFormError(submitError.message || 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Inventory Studio</h2>
          <p>Create listings, upload produce images, and monitor current stock health.</p>
        </div>
        <span className="dashboard-chip">Live Listings</span>
      </div>

      <div className="dashboard-card-grid">
        <article className="dashboard-card">
          <h3>Total Listings</h3>
          <p>{items.length}</p>
        </article>
        <article className="dashboard-card">
          <h3>Active Listings</h3>
          <p>{activeCount}</p>
        </article>
        <article className="dashboard-card">
          <h3>Total Quantity</h3>
          <p>{Number.isFinite(totalQuantity) ? totalQuantity.toFixed(2) : '0.00'}</p>
        </article>
      </div>

      <form className="inventory-create-form" onSubmit={onCreateListing}>
        <h3>Add New Listing</h3>
        <div className="inventory-form-grid">
          <input name="title" placeholder="Title *" value={newListing.title} onChange={onInputChange} />
          <input name="description" placeholder="Description" value={newListing.description} onChange={onInputChange} />
          <select name="unit" value={newListing.unit} onChange={onInputChange}>
            <option value="kg">kg</option>
            <option value="quintal">quintal</option>
            <option value="ton">ton</option>
            <option value="piece">piece</option>
            <option value="box">box</option>
          </select>
          <input name="pricePerUnit" type="number" step="0.01" min="0" placeholder="Price *" value={newListing.pricePerUnit} onChange={onInputChange} />
          <input name="quantityAvailable" type="number" step="0.01" min="0" placeholder="Qty *" value={newListing.quantityAvailable} onChange={onInputChange} />
          <input name="minOrderQty" type="number" step="0.01" min="0" placeholder="Min order" value={newListing.minOrderQty} onChange={onInputChange} />
          <input name="county" placeholder="County *" value={newListing.county} onChange={onInputChange} />
          <input name="townCity" placeholder="Town/City *" value={newListing.townCity} onChange={onInputChange} />
          <input name="postcode" placeholder="Postcode *" value={newListing.postcode} onChange={onInputChange} />
          <label className="inventory-check">
            <input type="checkbox" name="isOrganic" checked={newListing.isOrganic} onChange={onInputChange} />
            Organic
          </label>
          <input type="file" name="images" multiple accept="image/*" onChange={onInputChange} />
        </div>
        {formError ? <p className="dashboard-message dashboard-message-error">{formError}</p> : null}
        {formSuccess ? <p className="auth-message auth-message-success">{formSuccess}</p> : null}
        <button type="submit" className="profile-save-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading...' : 'Create Listing'}
        </button>
      </form>

      {loading ? <p className="dashboard-message">Loading inventory...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="dashboard-message">No listings found yet.</p>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>
                    <span className={`status-pill status-${item.listingStatus || 'draft'}`}>
                      {item.listingStatus}
                    </span>
                  </td>
                  <td>{item.quantityAvailable}</td>
                  <td>{item.unit}</td>
                  <td>{formatCurrency(item.pricePerUnit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default Inventory;
