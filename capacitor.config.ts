import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dineopen.pos',
  appName: 'DineOpen POS',
  webDir: 'dist',
  server: {
    // For emulator testing: 10.0.2.2 maps to host machine's localhost
    // For production: change to https://www.dineopen.com/login
    url: 'http://10.0.2.2:3002/login',
    cleartext: true, // Allow HTTP for local dev
  },
  android: {
    allowMixedContent: true, // Allow HTTP for local dev
    backgroundColor: '#ffffff',
    webContentsDebuggingEnabled: true,
  },
  plugins: {},
};

export default config;
