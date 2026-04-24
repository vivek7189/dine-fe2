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
  plugins: {},
};

export default config;
