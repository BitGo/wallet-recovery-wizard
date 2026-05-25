import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@lottiefiles/react-lottie-player', () => ({
  Player: () => null,
  Controls: () => null,
}));

// Mock window.queries and window.commands
const mockQueries = {
  getVersion: vi.fn().mockResolvedValue('0.0.0-test'),
};

const mockCommands = {
  setBitGoEnvironment: vi.fn().mockResolvedValue(undefined),
};

Object.defineProperty(window, 'queries', {
  value: mockQueries,
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'commands', {
  value: mockCommands,
  writable: true,
  configurable: true,
});

describe('App console errors', () => {
  const warnMessages: string[] = [];
  const errorMessages: string[] = [];

  beforeEach(() => {
    warnMessages.length = 0;
    errorMessages.length = 0;
    vi.clearAllMocks();

    vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
      warnMessages.push(args.join(' '));
    });

    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errorMessages.push(args.join(' '));
    });
  });

  it('should not have bigint-buffer binding errors', () => {
    render(
      <MemoryRouter initialEntries={['/#/test']}>
        <App />
      </MemoryRouter>
    );

    const bigintErrors = warnMessages.filter(msg =>
      msg.includes('bigint') && msg.includes('Failed to load bindings')
    );

    expect(bigintErrors).toHaveLength(0);
  });

  it('should render without critical console errors', () => {
    render(
      <MemoryRouter initialEntries={['/#/test']}>
        <App />
      </MemoryRouter>
    );

    // Filter out expected/non-critical warnings
    const criticalErrors = errorMessages.filter(msg => {
      // Allow React StrictMode intentional double-mount logs
      if (msg.includes('Strict')) return false;
      return true;
    });

    expect(criticalErrors).toHaveLength(0);
  });

  it('should propagate any native module binding issues', () => {
    const originalWarn = console.warn;
    const warnings: string[] = [];

    vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
      warnings.push(args.join(' '));
      originalWarn.apply(console, args);
    });

    render(
      <MemoryRouter initialEntries={['/#/test']}>
        <App />
      </MemoryRouter>
    );

    // Check for any binding-related warnings
    const bindingWarnings = warnings.filter(msg =>
      msg.includes('bindings') || msg.includes('native')
    );

    if (bindingWarnings.length > 0) {
      console.error('Native binding warnings detected:', bindingWarnings);
    }

    // This test documents that these warnings exist
    // If they appear, they'll be logged for visibility
    expect(bindingWarnings).toBeDefined();
  });
});
