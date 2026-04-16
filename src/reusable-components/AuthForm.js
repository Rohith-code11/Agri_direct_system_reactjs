import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faKey,
  faLocationDot,
  faMobileScreen,
  faUser,
  faUserTag
} from '@fortawesome/free-solid-svg-icons';

const AuthForm = ({ mode, formData, onInputChange, onSubmit, isSubmitting, errorMessage, successMessage }) => {
  const isLogin = mode === 'login';

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <h2>{isLogin ? 'Sign in' : 'Create account'}</h2>
      <p className="auth-form-subtitle">
        {isLogin
          ? 'Access your dashboard and manage orders in one place.'
          : 'Sign up to connect growers and buyers directly.'}
      </p>

      {isLogin ? (
        <>
          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faEnvelope} /> Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faKey} /> Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={onInputChange}
              required
            />
          </label>
        </>
      ) : (
        <div className="auth-grid">
          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faUser} /> Full Name</span>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faMobileScreen} /> Mobile Number</span>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={onInputChange}
              maxLength={20}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faEnvelope} /> Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faUserTag} /> User Type</span>
            <select
              name="userType"
              value={formData.userType}
              onChange={onInputChange}
              required
            >
              <option value="">Select role</option>
              <option value="grower">Grower</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faLocationDot} /> County</span>
            <input
              type="text"
              name="county"
              placeholder="Enter county"
              value={formData.county}
              onChange={onInputChange}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faLocationDot} /> Town/City</span>
            <input
              type="text"
              name="townCity"
              placeholder="Enter town or city"
              value={formData.townCity}
              onChange={onInputChange}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faLocationDot} /> Postcode</span>
            <input
              type="text"
              name="postcode"
              placeholder="Enter postcode"
              value={formData.postcode}
              onChange={onInputChange}
              maxLength={20}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faKey} /> Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={onInputChange}
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label"><FontAwesomeIcon icon={faKey} /> Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={onInputChange}
              required
            />
          </label>
        </div>
      )}

      {errorMessage ? <p className="auth-message auth-message-error">{errorMessage}</p> : null}
      {successMessage ? <p className="auth-message auth-message-success">{successMessage}</p> : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Sign up'}
      </button>
    </form>
  );
};

export default AuthForm;
