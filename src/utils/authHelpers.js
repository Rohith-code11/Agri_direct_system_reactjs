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

  return {
    name: formData.name,
    mobile: formData.mobile,
    email: formData.email,
    userType: formData.userType,
    county: formData.county,
    townCity: formData.townCity,
    postcode: formData.postcode,
    password: formData.password
  };
};
