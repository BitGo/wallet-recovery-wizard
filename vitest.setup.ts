import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock localStorage if it is not fully defined in the test environment
if (typeof window !== 'undefined' && (!window.localStorage || typeof window.localStorage.getItem !== 'function')) {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      length: 0,
      key: (index: number) => Object.keys(store)[index] || null,
    };
  })();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
});

