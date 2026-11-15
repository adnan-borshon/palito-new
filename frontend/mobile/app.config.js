const fs = require('node:fs');
module.exports = ({ config }) => {
  if (process.env.EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED !== 'true') return config;
  const androidFile = process.env.GOOGLE_SERVICES_JSON;
  const iosFile = process.env.GOOGLE_SERVICES_PLIST;
  const androidPackage = process.env.PALITO_ANDROID_PACKAGE;
  const iosBundle = process.env.PALITO_IOS_BUNDLE;
  if (!androidPackage || !iosBundle || !androidFile || !iosFile || !fs.existsSync(androidFile) || !fs.existsSync(iosFile)) throw new Error('Native Firebase requires app identifiers and existing Android/iOS service files');
  if (!process.env.EXPO_PUBLIC_PALITO_API_ORIGIN?.startsWith('https://')) throw new Error('Native Firebase requires HTTPS API origin');
  return { ...config,
    android: { ...config.android, package: androidPackage, googleServicesFile: androidFile },
    ios: { ...config.ios, bundleIdentifier: iosBundle, googleServicesFile: iosFile },
    plugins: [...(config.plugins || []).filter(p => !['@react-native-firebase/app','@react-native-firebase/auth','expo-build-properties'].includes(Array.isArray(p)?p[0]:p)), ['@react-native-firebase/app', { ios: { disableSPM: true } }], '@react-native-firebase/auth', ['expo-build-properties', { ios: { useFrameworks: 'static' } }]],
  };
};
