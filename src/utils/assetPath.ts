// Utility to handle asset paths for both development and production
export const getAssetPath = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, Vite serves public assets from /
  // In production, assets are served from /assets/
  if (import.meta.env.DEV) {
    return `/${cleanPath}`;
  }
  
  return `/${cleanPath}`;
};

// Specific helper for common asset paths
export const assets = {
  lightSwitch: {
    video: getAssetPath('assets/light_switch/video.mp4'),
    light1: getAssetPath('assets/light_switch/light_1.jpg'),
    light2: getAssetPath('assets/light_switch/light2.jpg'),
    light3: getAssetPath('assets/light_switch/light3.jpg'),
    light4: getAssetPath('assets/light_switch/light4.jpg'),
    light5: getAssetPath('assets/light_switch/light5.jpg'),
    light6: getAssetPath('assets/light_switch/light6.jpg'),
    engraving: getAssetPath('assets/light_switch/engreving.png'),
    gang1: getAssetPath('assets/light_switch/1gang.png'),
    gang2: getAssetPath('assets/light_switch/2gang.png'),
    gang3: getAssetPath('assets/light_switch/3gang.png'),
  },
  mechanicalSwitch: {
    video: getAssetPath('assets/light_switch/mechanical_switch/video.mp4'),
    mechanical1: getAssetPath('assets/light_switch/mechanical_switch/mechanical1.jpg'),
    mechanical2: getAssetPath('assets/light_switch/mechanical_switch/mechanical2.jpg'),
    mechanical3: getAssetPath('assets/light_switch/mechanical_switch/mechanical3.jpg'),
    mechanical4: getAssetPath('assets/light_switch/mechanical_switch/mechanical4.jpg'),
    mechanical5: getAssetPath('assets/light_switch/mechanical_switch/mechanical5.jpg'),
    mechanical6: getAssetPath('assets/light_switch/mechanical_switch/mechanical6.jpg'),
    gang1: getAssetPath('assets/light_switch/mechanical_switch/1gang.png'),
    gang2: getAssetPath('assets/light_switch/mechanical_switch/2 gang.png'),
    gang3: getAssetPath('assets/light_switch/mechanical_switch/3 gang.png'),
  },
  sliderCurtain: {
    slider1: getAssetPath('assets/slider_curtain/slider1.jpg'),
    slider2: getAssetPath('assets/slider_curtain/slider2.jpg'),
    slider3: getAssetPath('assets/slider_curtain/slider3.jpg'),
    slider4: getAssetPath('assets/slider_curtain/slider4.jpg'),
    slider5: getAssetPath('assets/slider_curtain/slider5.jpg'),
    slider6: getAssetPath('assets/slider_curtain/slider6.jpg'),
  },
  rollerCurtain: {
    roller1: getAssetPath('assets/roller_curtain/roller1.jpg'),
    roller2: getAssetPath('assets/roller_curtain/roller2.jpg'),
    roller3: getAssetPath('assets/roller_curtain/roller3.jpg'),
    roller4: getAssetPath('assets/roller_curtain/roller4.jpg'),
    roller5: getAssetPath('assets/roller_curtain/roller5.jpg'),
    roller6: getAssetPath('assets/roller_curtain/roller6.jpg'),
  },
  common: {
    battery: getAssetPath('assets/battary.png'),
    withoutBattery: getAssetPath('assets/without_battary.png'),
    navbarLogo: getAssetPath('assets/navbar_imgaes.png'),
    footerLogo: getAssetPath('assets/footer_logo.png'),
    paymentMethods: getAssetPath('assets/footer/payment.png'),
  }
};