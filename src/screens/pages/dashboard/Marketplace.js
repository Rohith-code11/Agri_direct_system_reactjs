import { useCallback, useEffect, useState } from 'react';
import { addCartItem, getMarketplaceListings } from '../../../utils/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faFilter, faLocationDot, faTag } from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const Marketplace = ({ token }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    county: '',
    minPrice: '',
    maxPrice: ''
  });
  const [options, setOptions] = useState({ categories: [], counties: [] });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quantities, setQuantities] = useState({});
  const [busyListingId, setBusyListingId] = useState(null);

  const loadListings = useCallback(async (activeFilters) => {
    if (!token) {
      setError('Missing authentication token.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await getMarketplaceListings(token, activeFilters);
      const nextListings = response?.data?.listings || [];
      setListings(nextListings);
      setOptions(response?.data?.options || { categories: [], counties: [] });
      setQuantities((prev) => {
        const next = { ...prev };
        nextListings.forEach((item) => {
          if (!next[item.id]) {
            next[item.id] = String(item.minOrderQty || 1);
          }
        });
        return next;
      });
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load marketplace.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadListings({ search: '', category: '', county: '', minPrice: '', maxPrice: '' });
  }, [loadListings]);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onApplyFilters = (event) => {
    event.preventDefault();
    loadListings(filters);
  };

  const onResetFilters = () => {
    const reset = { search: '', category: '', county: '', minPrice: '', maxPrice: '' };
    setFilters(reset);
    loadListings(reset);
  };

  const onAddToCart = async (listingId) => {
    try {
      setBusyListingId(listingId);
      setError('');
      setSuccess('');
      await addCartItem(token, {
        listingId,
        quantity: Number(quantities[listingId] || 1)
      });
      setSuccess('Listing added to cart successfully.');
    } catch (cartError) {
      setError(cartError.message || 'Failed to add item to cart.');
    } finally {
      setBusyListingId(null);
    }
  };

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Marketplace</h2>
          <p>Discover fresh farm produce, compare growers, and place orders with live pricing, quantity, and location filters.</p>
        </div>
      </div>

      <form className="marketplace-filters" onSubmit={onApplyFilters}>
        <input
          name="search"
          placeholder="Search listing title or description"
          value={filters.search}
          onChange={onInputChange}
        />
        <select name="category" value={filters.category} onChange={onInputChange}>
          <option value="">All categories</option>
          {options.categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="county" value={filters.county} onChange={onInputChange}>
          <option value="">All counties</option>
          {options.counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
        <input
          name="minPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={onInputChange}
        />
        <input
          name="maxPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={onInputChange}
        />
        <button type="submit">Apply</button>
        <button type="button" className="secondary-btn" onClick={onResetFilters}>
          Reset
        </button>
      </form>

      {loading ? <p className="dashboard-message">Loading marketplace...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}
      {success ? <p className="auth-message auth-message-success">{success}</p> : null}
      {!loading && !error && listings.length === 0 ? (
        <p className="dashboard-message">No listings match your filters.</p>
      ) : null}

      {!loading && !error && listings.length > 0 ? (
        <div className="marketplace-grid">
          {listings.map((item) => (
            <article className="dashboard-card marketplace-card" key={item.id}>
              <div className="marketplace-image-wrap">
                <span className="status-pill status-active marketplace-status-pill">Available</span>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="marketplace-image" />
                ) : (
                  <div className="marketplace-image-placeholder">No Image</div>
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description || 'No description available.'}</p>
              <p><strong><FontAwesomeIcon icon={faTag} /> Category:</strong> {item.categoryName || '-'}</p>
              <p><strong>Grower:</strong> {item.growerName}</p>
              <p><strong><FontAwesomeIcon icon={faLocationDot} /> Location:</strong> {item.townCity}, {item.county}</p>
              <p><strong>Price:</strong> {formatCurrency(item.pricePerUnit)} / {item.unit}</p>
              <p><strong>Available Qty:</strong> {item.quantityAvailable} {item.unit}</p>
              <p><strong>Min Order:</strong> {item.minOrderQty} {item.unit}</p>
              <label className="marketplace-qty-field">
                Order Qty
                <input
                  type="number"
                  min={item.minOrderQty}
                  max={item.quantityAvailable}
                  step="0.01"
                  value={quantities[item.id] || item.minOrderQty}
                  onChange={(event) => setQuantities((prev) => ({ ...prev, [item.id]: event.target.value }))}
                />
              </label>
              <div className="marketplace-card-foot">
                <button type="button" className="marketplace-add-btn" onClick={() => onAddToCart(item.id)} disabled={busyListingId === item.id}>
                  <FontAwesomeIcon icon={faCartPlus} />
                  {busyListingId === item.id ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Marketplace;
      <div className="section-icon-row">
        <span><FontAwesomeIcon icon={faFilter} /> Smart filters active</span>
      </div>
