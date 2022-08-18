import '../src/renderer/index.css';
import tailwindConfig from '../tailwind.config';

const tailwindViewports = Object.keys(tailwindConfig.theme.screens).reduce(
  (viewports, screen) => {
    return {
      ...viewports,
      [screen]: {
        name: screen,
        styles: {
          height: '100vh',
          width: tailwindConfig.theme.screens[screen],
        },
      },
    };
  },
  {}
);

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
