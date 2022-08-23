/// <reference types="vitest" />
/// <reference types="vite/client" />

import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/*'],
  },
});
