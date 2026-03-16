/**
 * Clinic API Service
 * Handles all communication with the backend API
 */

const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Make a fetch request with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Response data
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== Appointments API ====================

/**
 * Create a new appointment
 * @param {object} appointmentData - Appointment details
 * @returns {Promise<object>} - Created appointment
 */
export async function createAppointment(appointmentData) {
  return fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
}

/**
 * Get appointments with optional filtering
 * @param {object} params - Query parameters (page, limit, status, etc.)
 * @returns {Promise<object>} - Appointments list with pagination
 */
export async function getAppointments(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
  return fetchAPI(endpoint, { method: 'GET' });
}

/**
 * Get a single appointment by ID
 * @param {number} id - Appointment ID
 * @returns {Promise<object>} - Appointment details
 */
export async function getAppointmentById(id) {
  return fetchAPI(`/appointments/${id}`, { method: 'GET' });
}

/**
 * Update appointment status
 * @param {number} id - Appointment ID
 * @param {string} status - New status (requested, confirmed, completed, cancelled)
 * @returns {Promise<object>} - Updated appointment
 */
export async function updateAppointmentStatus(id, status) {
  return fetchAPI(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ==================== Contact API ====================

/**
 * Submit a contact message
 * @param {object} contactData - Contact form data
 * @returns {Promise<object>} - Created contact message
 */
export async function submitContact(contactData) {
  return fetchAPI('/contact', {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
}

/**
 * Get all contact messages
 * @param {object} params - Query parameters (page, limit)
 * @returns {Promise<object>} - Contact messages with pagination
 */
export async function getContacts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/contacts?${queryString}` : '/contacts';
  return fetchAPI(endpoint, { method: 'GET' });
}

/**
 * Get a single contact message by ID
 * @param {number} id - Contact message ID
 * @returns {Promise<object>} - Contact message details
 */
export async function getContactById(id) {
  return fetchAPI(`/contacts/${id}`, { method: 'GET' });
}

// ==================== Health Check ====================

/**
 * Check API health status
 * @returns {Promise<object>} - Health status
 */
export async function checkHealth() {
  return fetchAPI('/health', { method: 'GET' });
}

// Export default API object for convenience
export default {
  // Appointments
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  // Contacts
  submitContact,
  getContacts,
  getContactById,
  // Health
  checkHealth,
};

