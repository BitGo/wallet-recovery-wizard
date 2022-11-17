import { rmSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-electron-plugin';
import { customStart, loadViteEnv } from 'vite-electron-plugin/plugin';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';

rmSync(path.join(__dirname, 'dist-electron'), { recursive: true, force: true });

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '~': path.join(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    electron({
      include: ['electron', 'preload'],
      transformOptions: {
        sourcemap: !!process.env.VSCODE_DEBUG,
      },
      plugins: [
        ...(process.env.VSCODE_DEBUG || process.env.NODE_ENV === 'test'
          ? [
              // Will start Electron via VSCode Debug
              customStart(
                debounce(() => {
                  console.log(
                    /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
                  );
                })
              ),
            ]
          : []),
        // Allow use `import.meta.env.VITE_SOME_KEY` in Electron-Main
        loadViteEnv(),
      ],
    }),
    renderer({
      nodeIntegration: true,
    }),
  ],
  clearScreen: false,
});

function debounce<Fn extends (...args: any[]) => void>(fn: Fn, delay = 299) {
  let t: NodeJS.Timeout;
  return ((...args: Parameters<Fn>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  }) as Fn;
}
