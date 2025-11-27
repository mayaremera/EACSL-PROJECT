// Helper function to show toast from alert() calls
// This allows us to easily replace alert() with toast notifications
// Note: This file doesn't import toast directly - it receives the instance via setToastInstance()

let toastInstance = null;

export const setToastInstance = (instance) => {
  toastInstance = instance;
};

export const showToast = (message, type = 'info', title = null) => {
  if (!toastInstance) {
    // Fallback to alert if toast is not available
    console.warn('Toast not available, falling back to alert');
    alert(message);
    return;
  }

  const options = title ? { title } : {};
  
  switch (type) {
    case 'success':
      toastInstance.success(message, options);
      break;
    case 'error':
      toastInstance.error(message, options);
      break;
    case 'warning':
      toastInstance.warning(message, options);
      break;
    case 'info':
    default:
      toastInstance.info(message, options);
      break;
  }
};

// Helper to parse alert messages and determine type
export const parseAlertMessage = (message) => {
  if (!message) return { message: '', type: 'info' };
  
  const msg = String(message);
  
  // Check for success indicators
  if (msg.includes('✅') || msg.includes('Successfully') || msg.includes('success')) {
    return { message: msg.replace(/✅/g, '').trim(), type: 'success' };
  }
  
  // Check for error indicators
  if (msg.includes('❌') || msg.includes('Failed') || msg.includes('Error') || msg.includes('error')) {
    return { message: msg.replace(/❌/g, '').trim(), type: 'error' };
  }
  
  // Check for warning indicators
  if (msg.includes('⚠️') || msg.includes('Warning') || msg.includes('warning')) {
    return { message: msg.replace(/⚠️/g, '').trim(), type: 'warning' };
  }
  
  return { message: msg, type: 'info' };
};

