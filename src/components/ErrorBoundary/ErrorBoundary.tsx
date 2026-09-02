import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | undefined;
  componentStack: string;
};

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: undefined, componentStack: '' };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error), componentStack: '' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const stack = error.stack ?? error.message;
    console.error(
      `Unhandled renderer error:\n${stack}\nComponent stack:${errorInfo.componentStack}`
    );
    this.setState({ componentStack: errorInfo.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;

    const { error } = this.state;
    return (
      <main
        role="alert"
        aria-live="assertive"
        className="tw-flex tw-flex-col tw-gap-4 tw-p-8 tw-text-gray-900"
      >
        <h1 className="tw-text-heading-3 tw-font-semibold">
          Something went wrong
        </h1>
        <p>{error.message}</p>
        <details open>
          <summary className="tw-cursor-pointer tw-font-semibold">
            Stack trace
          </summary>
          <pre className="tw-mt-2 tw-overflow-auto tw-whitespace-pre-wrap tw-break-words tw-rounded tw-bg-gray-100 tw-p-4 tw-text-xs">
            {error.stack ?? error.message}
            {this.state.componentStack &&
              `\n\nComponent stack:${this.state.componentStack}`}
          </pre>
        </details>
        <button
          type="button"
          className="tw-self-start tw-rounded tw-bg-blue-600 tw-px-4 tw-py-2 tw-text-white"
          onClick={() => window.location.reload()}
        >
          Reload application
        </button>
      </main>
    );
  }
}
