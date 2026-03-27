const AuthForm = ({ mode, formData, onInputChange, onSubmit }) => {
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
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            Password
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
          <label>
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            Mobile Number
            <input
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            User Type
            <select
              name="userType"
              value={formData.userType}
              onChange={onInputChange}
              required
            >
              <option value="">Select role</option>
              <option value="grower">Grower</option>
              <option value="buyer">Buyer</option>
              <option value="distributor">Distributor</option>
            </select>
          </label>

          <label>
            County
            <input
              type="text"
              name="county"
              placeholder="Enter county"
              value={formData.county}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            Town/City
            <input
              type="text"
              name="townCity"
              placeholder="Enter town or city"
              value={formData.townCity}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            Postcode
            <input
              type="text"
              name="postcode"
              placeholder="Enter postcode"
              value={formData.postcode}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={onInputChange}
              required
            />
          </label>

          <label>
            Confirm Password
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

      <button type="submit">{isLogin ? 'Sign in' : 'Sign up'}</button>
    </form>
  );
};

export default AuthForm;
