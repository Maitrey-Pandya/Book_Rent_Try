export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  export const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  export const validateForm = (data, fields) => {
    const errors = {};
    
    fields.forEach(field => {
      if (!data[field] && data[field] !== 0) {
        errors[field] = 'This field is required';
      }
    });
  
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Invalid email address';
    }
  
    if (data.phone && !/^\+?[\d\s-]{10,}$/.test(data.phone)) {
      errors.phone = 'Invalid phone number';
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  export const getErrorMessage = (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Something went wrong';
  };
  
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };