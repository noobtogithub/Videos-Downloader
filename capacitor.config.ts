import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.14ee64a3269b4780baea53a01e4f7274',
  appName: 'Video Downloader',
  webDir: 'dist',
  server: {
    url: 'https://14ee64a3-269b-4780-baea-53a01e4f7274.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;