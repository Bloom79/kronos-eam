/**
 * Simple toast notification system
 * Can be replaced with a more robust solution like react-toastify
 */

export const toast = {
  success: (message: string) => {
    console.log('✅ Success:', message);
    // In production, this would show a proper toast notification
    // For now, we'll use console.log
    const event = new CustomEvent('toast', { 
      detail: { type: 'success', message } 
    });
    window.dispatchEvent(event);
  },
  
  error: (message: string) => {
    console.error('❌ Error:', message);
    const event = new CustomEvent('toast', { 
      detail: { type: 'error', message } 
    });
    window.dispatchEvent(event);
  },
  
  info: (message: string) => {
    console.info('ℹ️ Info:', message);
    const event = new CustomEvent('toast', { 
      detail: { type: 'info', message } 
    });
    window.dispatchEvent(event);
  },
  
  warning: (message: string) => {
    console.warn('⚠️ Warning:', message);
    const event = new CustomEvent('toast', { 
      detail: { type: 'warning', message } 
    });
    window.dispatchEvent(event);
  }
};