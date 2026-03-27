import { useState } from 'react';
import AuthForm from '../../../reusable-components/AuthForm';
import FeatureList from '../../../reusable-components/FeatureList';
import { getAuthPayload, initialAuthForm } from '../../../utils/authHelpers';

const HomeAuthentication = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState(initialAuthForm);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const payload = getAuthPayload(mode, formData);
    // Placeholder for API call integration.
    console.log(`${mode} payload`, payload);
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
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
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
        />
      </div>
    </section>
  );
};

export default HomeAuthentication;
