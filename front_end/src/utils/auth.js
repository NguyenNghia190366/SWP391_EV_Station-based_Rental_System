// Authentication utility functions

/**
 * Clear all user-related data from localStorage
 * Use this when user logs out or session expires
 */
export const clearUserData = () => {
  const keysToRemove = [
    'currentUser',
    'isLoggedIn',
    'authToken',
    'userId',
    'userRole',
    'myBookings',
    // Add any other user-related keys here
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('✅ User data cleared from localStorage');
};

/**
 * Save user data to localStorage
 * @param {Object} userData - User object from backend
 */
export const saveUserData = (userData) => {
  if (!userData) {
    console.error('❌ Cannot save null user data');
    return;
  }

  try {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    
    if (userData.token) {
      localStorage.setItem('authToken', userData.token);
    }
    
    if (userData.userId || userData.id) {
      localStorage.setItem('userId', userData.userId || userData.id);
    }
    
    if (userData.role) {
      localStorage.setItem('userRole', userData.role);
    }

    console.log('✅ User data saved to localStorage');
  } catch (err) {
    console.error('❌ Error saving user data:', err);
  }
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true' && userStr) {
      return JSON.parse(userStr);
    }
    
    return null;
  } catch (err) {
    console.error('❌ Error getting current user:', err);
    return null;
  }
};

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export const isUserLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * Get auth token from localStorage
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Check if user has a valid integer userId (not temporary)
 * @returns {boolean}
 */
export const hasValidUserId = () => {
  const user = getCurrentUser();
  if (!user) return false;

  const userId = user.id || user.userId || user.renterId;
  
  // Check if userId is a number or a numeric string
  if (typeof userId === 'number') {
    return userId > 0;
  }
  
  if (typeof userId === 'string') {
    // Numeric string like "123" is valid
    if (/^\d+$/.test(userId)) {
      const numId = parseInt(userId, 10);
      return numId > 0;
    }
    // String like "temp_f_..." is invalid
    return false;
  }
  
  return false;
};

/**
 * Get validated integer userId
 * @returns {number|null} - Integer userId or null if invalid
 */
export const getValidUserId = () => {
  const user = getCurrentUser();
  if (!user) return null;

  const rawUserId = user.id || user.userId || user.renterId;
  
  if (typeof rawUserId === 'number' && rawUserId > 0) {
    return rawUserId;
  }
  
  if (typeof rawUserId === 'string' && /^\d+$/.test(rawUserId)) {
    const numId = parseInt(rawUserId, 10);
    return numId > 0 ? numId : null;
  }
  
  return null;
};
