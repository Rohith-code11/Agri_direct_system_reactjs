import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../../../utils/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faHouse, faLocationDot, faPhone, faUser } from '@fortawesome/free-solid-svg-icons';

const Profile = ({ user, token, onUserRefresh }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    userType: user?.userType || '',
    county: user?.county || '',
    townCity: user?.townCity || '',
    postcode: user?.postcode || '',
    addressLabel: 'Primary',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    addressCounty: user?.county || '',
    addressPostcode: user?.postcode || '',
    country: 'India'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('Missing authentication token.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await getMyProfile(token);
        const profile = response?.data || {};
        const profileUser = profile.user || {};
        const address = profile.address || {};

        setFormData({
          name: profileUser.name || '',
          mobile: profileUser.mobile || '',
          email: profileUser.email || '',
          userType: profileUser.userType || '',
          county: profileUser.county || '',
          townCity: profileUser.townCity || '',
          postcode: profileUser.postcode || '',
          addressLabel: address.label || 'Primary',
          line1: address.line1 || '',
          line2: address.line2 || '',
          landmark: address.landmark || '',
          city: address.city || '',
          addressCounty: address.county || profileUser.county || '',
          addressPostcode: address.postcode || profileUser.postcode || '',
          country: address.country || 'India'
        });

        if (typeof onUserRefresh === 'function') {
          onUserRefresh(profileUser);
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, onUserRefresh]);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        county: formData.county.trim(),
        townCity: formData.townCity.trim(),
        postcode: formData.postcode.trim(),
        address: {
          label: formData.addressLabel.trim(),
          line1: formData.line1.trim(),
          line2: formData.line2.trim(),
          landmark: formData.landmark.trim(),
          city: formData.city.trim(),
          county: formData.addressCounty.trim(),
          postcode: formData.addressPostcode.trim(),
          country: formData.country.trim()
        }
      };

      const response = await updateMyProfile(token, payload);
      const profileUser = response?.data?.user;
      if (profileUser && typeof onUserRefresh === 'function') {
        onUserRefresh(profileUser);
      }
      setSuccess(response.message || 'Profile updated successfully.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="dashboard-panel">
      <div className="dashboard-hero">
        <div>
          <h2>Profile Settings</h2>
          <p>Manage account identity and complete address information used across orders and delivery.</p>
        </div>
        <span className="dashboard-chip">{formData.userType || 'Member'}</span>
      </div>

      {isLoading ? <p className="dashboard-message">Loading profile...</p> : null}
      {error ? <p className="dashboard-message dashboard-message-error">{error}</p> : null}
      {success ? <p className="auth-message auth-message-success">{success}</p> : null}

      {!isLoading ? (
        <form className="profile-form" onSubmit={onSubmit}>
          <div className="profile-grid">
            <article className="dashboard-card">
              <h3>Account Details</h3>
              <label>
                <span className="field-label"><FontAwesomeIcon icon={faUser} /> Name</span>
                <input name="name" value={formData.name} onChange={onInputChange} maxLength={120} required />
              </label>
              <label>
                <span className="field-label"><FontAwesomeIcon icon={faEnvelope} /> Email</span>
                <input name="email" value={formData.email} disabled />
              </label>
              <label>
                <span className="field-label"><FontAwesomeIcon icon={faPhone} /> Mobile</span>
                <input name="mobile" value={formData.mobile} onChange={onInputChange} maxLength={20} required />
              </label>
              <label>
                Role
                <input name="userType" value={formData.userType} disabled />
              </label>
              <label>
                <span className="field-label"><FontAwesomeIcon icon={faLocationDot} /> County</span>
                <input name="county" value={formData.county} onChange={onInputChange} maxLength={120} required />
              </label>
              <label>
                <span className="field-label"><FontAwesomeIcon icon={faLocationDot} /> Town/City</span>
                <input name="townCity" value={formData.townCity} onChange={onInputChange} maxLength={120} required />
              </label>
              <label>
                Postcode
                <input name="postcode" value={formData.postcode} onChange={onInputChange} maxLength={20} required />
              </label>
            </article>

            <article className="dashboard-card">
              <h3>Address Details</h3>
              <label>
                <span className="field-label"><FontAwesomeIcon icon={faHouse} /> Address Label</span>
                <input name="addressLabel" value={formData.addressLabel} onChange={onInputChange} maxLength={50} required />
              </label>
              <label>
                Address Line 1
                <input name="line1" value={formData.line1} onChange={onInputChange} maxLength={150} required />
              </label>
              <label>
                Address Line 2
                <input name="line2" value={formData.line2} onChange={onInputChange} maxLength={150} />
              </label>
              <label>
                Landmark
                <input name="landmark" value={formData.landmark} onChange={onInputChange} maxLength={120} />
              </label>
              <label>
                City
                <input name="city" value={formData.city} onChange={onInputChange} maxLength={120} required />
              </label>
              <label>
                County
                <input name="addressCounty" value={formData.addressCounty} onChange={onInputChange} maxLength={120} required />
              </label>
              <label>
                Postcode
                <input name="addressPostcode" value={formData.addressPostcode} onChange={onInputChange} maxLength={20} required />
              </label>
              <label>
                Country
                <input name="country" value={formData.country} onChange={onInputChange} maxLength={80} required />
              </label>
            </article>
          </div>

          <button type="submit" className="profile-save-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      ) : null}
    </section>
  );
};

export default Profile;
