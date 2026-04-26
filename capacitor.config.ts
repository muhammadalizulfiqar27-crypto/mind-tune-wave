import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.51ec7db1ac954b5d88752437a7b35e40',
  appName: 'mind-tune-wave',
  webDir: 'dist',
  server: {
    url: 'https://51ec7db1-ac95-4b5d-8875-2437a7b35e40.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#14d7ca',
    },
  },
};

export default config;
