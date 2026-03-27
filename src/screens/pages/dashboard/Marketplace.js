import { useCallback, useEffect, useState } from 'react';
import { getMarketplaceListings } from '../../../utils/authApi';

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

  const loadListings = useCallback(async (activeFilters) => {
    if (!token) {
      setError('Missing authentication token.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getMarketplaceListings(token, activeFilters);
      setListings(response?.data?.listings || []);
      setOptions(response?.data?.options || { categories: [], counties: [] });
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

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Marketplace</h2>
          <p>Source verified produce from growers with smart filters and live listing data.</p>
        </div>
        <span className="dashboard-chip">Buyer View</span>
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
      {!loading && !error && listings.length === 0 ? (
        <p className="dashboard-message">No listings match your filters.</p>
      ) : null}

      {!loading && !error && listings.length > 0 ? (
        <div className="marketplace-grid">
          {listings.map((item) => (
            <article className="dashboard-card marketplace-card" key={item.id}>
              <div className="marketplace-image-wrap">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="marketplace-image" />
                ) : (
                  <div className="marketplace-image-placeholder">No Image</div>
                )}
              </div>
              <span className="status-pill status-active">Available</span>
              <h3>{item.title}</h3>
              <p>{item.description || 'No description available.'}</p>
              <p><strong>Category:</strong> {item.categoryName || '-'}</p>
              <p><strong>Grower:</strong> {item.growerName}</p>
              <p><strong>Location:</strong> {item.townCity}, {item.county}</p>
              <p><strong>Price:</strong> {formatCurrency(item.pricePerUnit)} / {item.unit}</p>
              <p><strong>Available Qty:</strong> {item.quantityAvailable} {item.unit}</p>
              <p><strong>Min Order:</strong> {item.minOrderQty} {item.unit}</p>
              <div className="marketplace-card-foot">
                <button type="button">View Details</button>
                <button type="button" className="secondary-btn">Add to Cart</button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Marketplace;
