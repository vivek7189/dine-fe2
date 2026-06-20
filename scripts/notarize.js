const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  // Only notarize macOS builds
  if (context.electronPlatformName !== 'darwin') return;

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD || process.env.APPLE_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log('[notarize] Skipping — set APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID to enable');
    return;
  }

  const appPath = `${context.appOutDir}/${context.packager.appInfo.productFilename}.app`;

  console.log(`[notarize] Submitting ${appPath} to Apple for notarization...`);
  console.log('[notarize] This may take several minutes. Please wait...');

  await notarize({
    appPath,
    appleId,
    appleIdPassword,
    teamId,
  });

  console.log('[notarize] Notarization complete! App is approved by Apple.');
};
