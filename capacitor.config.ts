import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dineopen.pos',
  appName: 'DineOpen POS',
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
    scheme: 'DineOpen POS',
  },
  plugins: {},
};

export default config;
