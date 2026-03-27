const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:7000/api';

const parseResponse = async (response) => {
  let body = null;

  try {
    body = await response.json();
  } catch (error) {
    body = null;
  }

  if (!response.ok || !body?.success) {
    throw new Error(body?.message || 'Request failed');
  }

  return body;
};

export const registerUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
};

export const loginUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
};

const getAuthorizedResponse = async (endpoint, token) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseResponse(response);
};

export const getGrowerDashboard = async (token) => {
  return getAuthorizedResponse('/dashboard/grower', token);
};

export const getBuyerDashboard = async (token) => {
  return getAuthorizedResponse('/dashboard/buyer', token);
};

export const getGrowerInventory = async (token) => {
  return getAuthorizedResponse('/dashboard/grower/inventory', token);
};

export const getMyProfile = async (token) => {
  return getAuthorizedResponse('/profile/me', token);
};

export const updateMyProfile = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
};

export const getMarketplaceListings = async (token, filters = {}) => {
  const query = new URLSearchParams();

  if (filters.search) query.set('search', filters.search);
  if (filters.category) query.set('category', filters.category);
  if (filters.county) query.set('county', filters.county);
  if (filters.minPrice) query.set('minPrice', filters.minPrice);
  if (filters.maxPrice) query.set('maxPrice', filters.maxPrice);

  const queryString = query.toString();
  const endpoint = `/listings/marketplace${queryString ? `?${queryString}` : ''}`;
  return getAuthorizedResponse(endpoint, token);
};

export const createGrowerListing = async (token, formData) => {
  const response = await fetch(`${API_BASE_URL}/listings/grower`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  return parseResponse(response);
};
