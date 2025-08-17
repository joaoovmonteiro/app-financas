import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.financeapp',
  appName: 'Finance App',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f0f14",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    },
    CapacitorHttp: {
      enabled: true,
    }
  }
};

export default config;