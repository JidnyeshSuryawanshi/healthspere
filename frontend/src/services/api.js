import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If we get an authentication error and we thought we were logged in, log out
      if (localStorage.getItem('token')) {
        console.error('Authentication error:', error.response.data);
        
        // Don't auto-logout for "Only patients can book appointments" error
        if (error.response.data.message !== 'Only patients can book appointments') {
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error.response ? error.response.data : { message: 'Network error' });
  }
);

// Auth services
export const authService = {
  // Register a new user (patient or doctor)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // Store user data and token in localStorage for persistence
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

// Doctor services
export const doctorService = {
  // Get all doctors
  getAllDoctors: async () => {
    try {
      const response = await api.get('/doctors/all');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Get patients for the logged-in doctor
  getDoctorPatients: async () => {
    try {
      const response = await api.get('/doctors/my-patients');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Get appointment history for a specific patient
  getPatientHistory: async (patientId) => {
    try {
      const response = await api.get(`/doctors/patient-history/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

// Appointment services
export const appointmentService = {
  // Get appointments for current user (patient or doctor)
  getUserAppointments: async () => {
    try {
      const response = await api.get('/appointments/user');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Book a new appointment
  bookAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments/book', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Check available time slots for a doctor on a specific date
  getAvailableTimeSlots: async (doctorId, date) => {
    try {
      const response = await api.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

// Prescription services
export const prescriptionService = {
  // Create a new prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await api.post('/prescriptions/create', prescriptionData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Get prescriptions for doctor
  getDoctorPrescriptions: async () => {
    try {
      const response = await api.get('/prescriptions/doctor');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Get prescriptions for patient
  getPatientPrescriptions: async () => {
    try {
      const response = await api.get('/prescriptions/patient');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  },
  
  // Get a specific prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/public/${prescriptionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network error' };
    }
  }
};

export default api;
