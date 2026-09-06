// Utility functions for Firebase Authentication

/**
 * Extracts the action code from Firebase password reset URLs
 * Firebase can send reset links in different formats, so we need to handle all of them
 */
export const extractActionCodeFromURL = (): string | null => {
  // Method 1: Check URL search parameters
  const urlParams = new URLSearchParams(window.location.search);
  let actionCode = urlParams.get('oobCode') || urlParams.get('actionCode');
  
  if (actionCode) {
    return actionCode;
  }

  // Method 2: Check URL hash parameters (Firebase sometimes puts it in the hash)
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    actionCode = hashParams.get('oobCode') || hashParams.get('actionCode');
    
    if (actionCode) {
      return actionCode;
    }
  }

  // Method 3: Check for Firebase's continue URL format
  const continueUrl = urlParams.get('continueUrl');
  if (continueUrl) {
    try {
      const continueUrlParams = new URLSearchParams(new URL(continueUrl).search);
      actionCode = continueUrlParams.get('oobCode') || continueUrlParams.get('actionCode');
      
      if (actionCode) {
        return actionCode;
      }
    } catch (error) {
      console.error('Error parsing continue URL:', error);
    }
  }

  // Method 4: Check for Firebase's state parameter
  const state = urlParams.get('state');
  if (state) {
    try {
      const stateParams = new URLSearchParams(state);
      actionCode = stateParams.get('oobCode') || stateParams.get('actionCode');
      
      if (actionCode) {
        return actionCode;
      }
    } catch (error) {
      console.error('Error parsing state parameter:', error);
    }
  }

  return null;
};

/**
 * Creates action code settings for password reset emails
 */
export const createActionCodeSettings = () => {
  return {
    url: `${window.location.origin}/reset-password`,
    handleCodeInApp: true
  };
};

/**
 * Validates if the current URL is a Firebase password reset link
 */
export const isPasswordResetLink = (): boolean => {
  return extractActionCodeFromURL() !== null;
};

/**
 * Cleans up the URL after successful password reset
 */
export const cleanupResetURL = () => {
  // Remove the reset parameters from the URL
  const url = new URL(window.location.href);
  url.searchParams.delete('oobCode');
  url.searchParams.delete('actionCode');
  url.searchParams.delete('continueUrl');
  url.searchParams.delete('state');
  url.hash = '';
  
  // Update the URL without the reset parameters
  window.history.replaceState({}, document.title, url.pathname);
}; 