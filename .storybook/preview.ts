import '../src/assets/styles/index.css';

const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

const tailwindViewports = Object.keys(screens).reduce((viewports, screen) => {
  return {
    ...viewports,
    [screen]: {
      name: screen,
      styles: {
        height: '100vh',
        width: screens[screen],
      },
    },
  };
}, {});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewport: {
    viewports: {
      xs: {
        name: 'xs',
        styles: {
          width: '360px',
          height: '100vh',
        },
      },
      ...tailwindViewports,
    },
  },
};
