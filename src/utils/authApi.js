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
