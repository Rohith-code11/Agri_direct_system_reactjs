export const initialAuthForm = {
  name: '',
  mobile: '',
  email: '',
  userType: '',
  county: '',
  townCity: '',
  postcode: '',
  password: '',
  confirmPassword: ''
};

export const getAuthPayload = (mode, formData) => {
  if (mode === 'login') {
    return {
      email: formData.email,
      password: formData.password
    };
  }

  return formData;
};
