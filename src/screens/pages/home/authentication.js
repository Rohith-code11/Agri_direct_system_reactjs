import { useState } from 'react';
import AuthForm from '../../../reusable-components/AuthForm';
import FeatureList from '../../../reusable-components/FeatureList';
import { getAuthPayload, initialAuthForm } from '../../../utils/authHelpers';
import { loginUser, registerUser } from '../../../utils/authApi';

const HomeAuthentication = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState(initialAuthForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onModeChange = (nextMode) => {
    setMode(nextMode);
    setErrorMessage('');
    setSuccessMessage('');
    setFormData(initialAuthForm);
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setErrorMessage('Password and confirm password must match.');
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = getAuthPayload(mode, formData);

      if (mode === 'login') {
        const response = await loginUser(payload);
        const token = response?.data?.token;
        const user = response?.data?.user;

        if (typeof onLoginSuccess === 'function' && token && user) {
          onLoginSuccess({ token, user });
          return;
        }

        setSuccessMessage(response.message || 'Login successful');
      } else {
        const response = await registerUser(payload);
        setSuccessMessage(response.message || 'Registration successful. Please sign in.');
        setMode('login');
        setFormData((prev) => ({
          ...initialAuthForm,
          email: prev.email
        }));
      }
    } catch (error) {
      setErrorMessage(error.message || 'Unable to process your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    'Direct grower-to-buyer marketplace',
    'Real-time crop availability and pricing updates',
    'Secure payments and delivery tracking'
  ];

  return (
    <section className="auth-layout">
      <FeatureList
        title="Farm-fresh Trade, Made Simple"
        subtitle="Manage sourcing, sales, and logistics from one streamlined AgriDirect platform."
        features={features}
      />

      <div className="auth-card-wrap">
        <div className="auth-card-intro">
          <span className="auth-card-badge">Operational Access</span>
          <p>Sign in to monitor stock movement, incoming demand, order fulfilment, and location-aware delivery updates.</p>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => onModeChange('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => onModeChange('register')}
          >
            Sign up
          </button>
          <span className={`auth-slider ${mode === 'register' ? 'right' : 'left'}`} />
        </div>

        <AuthForm
          mode={mode}
          formData={formData}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />
      </div>
    </section>
  );
};

export default HomeAuthentication;
