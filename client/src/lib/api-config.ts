// API Configuration for both web and mobile environments

export const getApiBaseUrl = (): string => {
  // Check if we're running in a Capacitor mobile app
  const isCapacitor = !!(window as any).Capacitor;
  
  if (isCapacitor) {
    // In mobile app - use the production API or localhost for development
    return window.location.hostname === 'localhost' 
      ? 'http://10.0.2.2:5000'  // Android emulator localhost
      : window.location.origin;
  }
  
  // In web browser
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  
  return window.location.origin;
};

export const buildApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  return path.startsWith('http') ? path : `${baseUrl}${path}`;
};