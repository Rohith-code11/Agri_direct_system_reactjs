import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { createGrowerListing, deleteGrowerListing, getGrowerInventory, getMarketplaceListings, updateGrowerListing } from '../../../utils/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faLeaf, faPenToSquare, faPlus, faSeedling, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';

const initialListingForm = {
  title: '',
  description: '',
  categoryId: '',
  unit: 'kg',
  pricePerUnit: '',
  quantityAvailable: '',
  minOrderQty: '1',
  isOrganic: false,
  harvestDate: '',
  availableFrom: '',
  availableTo: '',
  county: '',
  townCity: '',
  postcode: '',
  listingStatus: 'active',
  images: []
};

const buildListingFormData = (formData) => {
  const payload = new FormData();
  payload.append('title', formData.title);
  payload.append('description', formData.description);
  payload.append('categoryId', formData.categoryId);
  payload.append('unit', formData.unit);
  payload.append('pricePerUnit', formData.pricePerUnit);
  payload.append('quantityAvailable', formData.quantityAvailable);
  payload.append('minOrderQty', formData.minOrderQty);
  payload.append('isOrganic', formData.isOrganic ? 'true' : 'false');
  payload.append('harvestDate', formData.harvestDate);
  payload.append('availableFrom', formData.availableFrom);
  payload.append('availableTo', formData.availableTo);
  payload.append('county', formData.county);
  payload.append('townCity', formData.townCity);
  payload.append('postcode', formData.postcode);
  payload.append('listingStatus', formData.listingStatus || 'active');
  formData.images.forEach((file) => payload.append('images', file));
  return payload;
};

const Inventory = ({ token }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [busyListingId, setBusyListingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialListingForm);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantityAvailable || 0), 0),
    [items]
  );
  const activeCount = items.filter((item) => item.listingStatus === 'active').length;
  const categoryLabelMap = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category.name])),
    [categories]
  );

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
      const inventoryCategories = response?.data?.categories || [];
      if (inventoryCategories.length > 0) {
        setCategories(inventoryCategories);
      } else {
        const marketplaceResponse = await getMarketplaceListings(token);
        const marketplaceCategories = response?.data?.options?.categories || marketplaceResponse?.data?.options?.categories || [];
        setCategories(
          marketplaceCategories.map((category, index) => ({
            id: category.id ?? category.slug ?? String(index),
            name: category.name,
          }))
        );
      }
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const resetFormState = () => {
    setFormData(initialListingForm);
    setFormError('');
  };

  const openCreateModal = () => {
    resetFormState();
    setEditingItem(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormError('');
    setFormData({
      title: item.title || '',
      description: item.description || '',
      categoryId: String(item.categoryId || ''),
      unit: item.unit || 'kg',
      pricePerUnit: String(item.pricePerUnit || ''),
      quantityAvailable: String(item.quantityAvailable || ''),
      minOrderQty: String(item.minOrderQty || 1),
      isOrganic: Boolean(item.isOrganic),
      harvestDate: item.harvestDate ? String(item.harvestDate).slice(0, 10) : '',
      availableFrom: item.availableFrom ? String(item.availableFrom).slice(0, 10) : '',
      availableTo: item.availableTo ? String(item.availableTo).slice(0, 10) : '',
      county: item.county || '',
      townCity: item.townCity || '',
      postcode: item.postcode || '',
      listingStatus: item.listingStatus || 'active',
      images: []
    });
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingItem(null);
    resetFormState();
  };

  const onInputChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, images: Array.from(files || []) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!String(formData.title || '').trim() || String(formData.pricePerUnit || '').trim() === '' || String(formData.quantityAvailable || '').trim() === '' || !String(formData.county || '').trim() || !String(formData.townCity || '').trim() || !String(formData.postcode || '').trim()) {
      return 'Please fill all required fields.';
    }

    return '';
  };

  const onCreateListing = async (event) => {
    event.preventDefault();
    const validationError = validate();
    setFormError(validationError);
    setFormSuccess('');
    if (validationError) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createGrowerListing(token, buildListingFormData(formData));
      setFormSuccess(response.message || 'Listing created.');
      closeModal();
      await loadInventory();
    } catch (submitError) {
      setFormError(submitError.message || 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateListing = async (event) => {
    event.preventDefault();
    const validationError = validate();
    setFormError(validationError);
    setFormSuccess('');
    if (validationError || !editingItem) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateGrowerListing(token, editingItem.id, buildListingFormData(formData));
      setFormSuccess(`Listing ${formData.title} updated.`);
      closeModal();
      await loadInventory();
    } catch (updateError) {
      setFormError(updateError.message || 'Failed to update listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteListing = async (itemId) => {
    try {
      setBusyListingId(itemId);
      setError('');
      setFormSuccess('');
      await deleteGrowerListing(token, itemId);
      setFormSuccess('Listing deleted successfully.');
      await loadInventory();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete listing.');
    } finally {
      setBusyListingId(null);
    }
  };

  const isModalOpen = isCreateOpen || Boolean(editingItem);
  const modalMarkup = isModalOpen ? (
    <div className="inventory-modal-overlay" role="presentation" onClick={closeModal}>
      <div className="inventory-modal" role="dialog" aria-modal="true" aria-label={editingItem ? 'Update listing' : 'Create listing'} onClick={(event) => event.stopPropagation()}>
        <div className="inventory-modal-head">
          <div>
            <span className="dashboard-summary-label">{editingItem ? 'Update Listing' : 'Create Listing'}</span>
            <h3>{editingItem ? 'Edit produce listing' : 'Add a new produce listing'}</h3>
          </div>
          <button type="button" className="inventory-modal-close" onClick={closeModal}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form className="inventory-modal-form" onSubmit={editingItem ? onUpdateListing : onCreateListing}>
          <div className="inventory-form-grid">
            <input name="title" placeholder="Title *" value={formData.title} onChange={onInputChange} />
            <input name="description" placeholder="Description" value={formData.description} onChange={onInputChange} />
            <select name="categoryId" value={formData.categoryId} onChange={onInputChange}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select name="unit" value={formData.unit} onChange={onInputChange}>
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="ton">ton</option>
              <option value="piece">piece</option>
              <option value="box">box</option>
            </select>
            <input name="pricePerUnit" type="number" step="0.01" min="0" placeholder="Price *" value={formData.pricePerUnit} onChange={onInputChange} />
            <input name="quantityAvailable" type="number" step="0.01" min="0" placeholder="Qty *" value={formData.quantityAvailable} onChange={onInputChange} />
            <input name="minOrderQty" type="number" step="0.01" min="0" placeholder="Min order" value={formData.minOrderQty} onChange={onInputChange} />
            <input name="harvestDate" type="date" value={formData.harvestDate} onChange={onInputChange} />
            <input name="availableFrom" type="date" value={formData.availableFrom} onChange={onInputChange} />
            <input name="availableTo" type="date" value={formData.availableTo} onChange={onInputChange} />
            <input name="county" placeholder="County *" value={formData.county} onChange={onInputChange} />
            <input name="townCity" placeholder="Town/City *" value={formData.townCity} onChange={onInputChange} />
            <input name="postcode" placeholder="Postcode *" value={formData.postcode} onChange={onInputChange} />
            <label className="inventory-check">
              <input type="checkbox" name="isOrganic" checked={formData.isOrganic} onChange={onInputChange} />
              Organic
            </label>
            {editingItem ? (
              <select name="listingStatus" value={formData.listingStatus} onChange={onInputChange}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="sold_out">sold_out</option>
              </select>
            ) : null}
            <label className="field-block inventory-upload-field">
              <span>{editingItem ? 'Add more images' : 'Upload images'}</span>
              <input type="file" name="images" multiple accept="image/*" onChange={onInputChange} />
            </label>
          </div>

          {formError ? <p className="dashboard-message dashboard-message-error">{formError}</p> : null}

          <div className="inventory-modal-actions">
            <button type="button" className="secondary-btn" onClick={closeModal}>Cancel</button>
            <button type="submit" className="inventory-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (editingItem ? 'Updating...' : 'Creating...') : editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Inventory Studio</h2>
          <p>Create listings, update stock, and manage your live produce catalog from one place.</p>
        </div>
        <div className="inventory-hero-actions">
          <span className="dashboard-chip">Live Listings</span>
          <button type="button" className="inventory-create-btn" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faPlus} />
            Create Listing
          </button>
        </div>
      </div>

      <div className="dashboard-card-grid">
        <article className="dashboard-card">
          <div className="card-icon-wrap"><FontAwesomeIcon icon={faBoxOpen} /></div>
          <h3>Total Listings</h3>
          <p>{items.length}</p>
        </article>
        <article className="dashboard-card">
          <div className="card-icon-wrap"><FontAwesomeIcon icon={faLeaf} /></div>
          <h3>Active Listings</h3>
          <p>{activeCount}</p>
        </article>
        <article className="dashboard-card">
          <div className="card-icon-wrap"><FontAwesomeIcon icon={faSeedling} /></div>
          <h3>Total Quantity</h3>
          <p>{Number.isFinite(totalQuantity) ? totalQuantity.toFixed(2) : '0.00'}</p>
        </article>
      </div>

      {formSuccess ? <p className="auth-message auth-message-success inventory-feedback">{formSuccess}</p> : null}
      {loading ? <p className="dashboard-message">Loading inventory...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="dashboard-message">No listings found yet. Create your first listing to start selling.</p>
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
                <th>Min Order</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong className="inventory-product-title">{item.title}</strong>
                    <br />
                    <small>{item.categoryName || categoryLabelMap.get(String(item.categoryId || '')) || 'Uncategorized'}</small>
                  </td>
                  <td>
                    <span className={`status-pill status-${item.listingStatus || 'draft'}`}>{item.listingStatus}</span>
                  </td>
                  <td>{item.quantityAvailable}</td>
                  <td>{item.unit}</td>
                  <td>{item.pricePerUnit}</td>
                  <td>{item.minOrderQty || 1}</td>
                  <td>
                    {item.townCity}, {item.county}
                    <br />
                    <small>{item.postcode || '-'}</small>
                  </td>
                  <td>
                    <div className="inventory-action-stack inventory-action-inline">
                      <button type="button" onClick={() => openEditModal(item)} disabled={busyListingId === item.id}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                        Update
                      </button>
                      <button type="button" className="secondary-btn" onClick={() => onDeleteListing(item.id)} disabled={busyListingId === item.id}>
                        <FontAwesomeIcon icon={faTrashCan} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {typeof document !== 'undefined' && modalMarkup ? createPortal(modalMarkup, document.body) : null}
    </section>
  );
};

export default Inventory;
