import axios from 'axios';

// URL của backend API
const API_URL = process.env.REACT_APP_API_URL;

export const register = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, credentials, {
      headers: {
        'Content-Type': 'application/json', // Đảm bảo header này có mặt
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Đăng ký thất bại',
    };
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Đăng nhập thất bại',
    };
  }
};

export const sendOtpToEmailRegister = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/send_mail/register`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Đăng nhập thất bại',
    };
  }
};

export const sendOtpToEmailResetPass = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/send_mail/fogot_password`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Đăng nhập thất bại',
    };
  }
};

export const verifyResetPass = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/send_mail/verify_fogot_password`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Đăng nhập thất bại',
    };
  }
};
