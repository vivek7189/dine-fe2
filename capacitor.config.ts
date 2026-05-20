import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dineopen.dashboard',
  appName: 'DineOpen Dashboard',
  webDir: 'dist',
  server: {
    url: 'https://www.dineopen.com/login',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  ios: {
    backgroundColor: '#ffffff',
    contentInset: 'automatic',
    scheme: 'DineOpen Dashboard',
  },
  plugins: {},
};

export default config;
