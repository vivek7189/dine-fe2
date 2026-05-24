/**
 * Capacitor ECR Plugin Bridge
 * Handles Android App-to-App Intent communication with NAPS payment terminal app
 * Falls back to network call if Intent is not available
 */

import { registerPlugin } from '@capacitor/core';

class EcrPluginWeb {
  async sendRequest() {
    throw new Error('ECR App-to-App not implemented on web. Use network proxy instead.');
  }
}

const EcrPlugin = registerPlugin('EcrPlugin', {
  web: () => new EcrPluginWeb(),
});

export default EcrPlugin;
