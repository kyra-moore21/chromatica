import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chromatica.app',
  appName: 'chromatica',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Preferences: {
    }
  }
};

export default config;
