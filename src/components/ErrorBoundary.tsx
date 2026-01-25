/**
 * Error Boundary Component
 * Catches and handles React errors gracefully with enhanced recovery options
 */

import React, { Component, ErrorInfo, ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

// Error types for categorization
export type ErrorType = 'render' | 'network' | 'chunk' | 'unknown';

// Error context for nested boundaries
interface ErrorContextType {
  reportError: (error: Error, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useErrorContext = () => useContext(ErrorContext);

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  level?: 'page' | 'section' | 'component';
  name?: string;
}

interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  errorType: ErrorType;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  errorId: string | null;
  copied: boolean;
  showDetails: boolean;
}

// Classify error types for better UX
const classifyError = (error: Error): ErrorType => {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('loading chunk') || message.includes('dynamic import')) {
    return 'chunk';
  }
  if (message.includes('network') || message.includes('fetch') || name.includes('network')) {
    return 'network';
  }
  if (message.includes('render') || name.includes('invariant')) {
    return 'render';
  }
  return 'unknown';
};

// Generate unique error ID for tracking
const generateErrorId = (): string => {
  return `ERR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};

export class ErrorBoundary extends Component<Props, State> {
  readonly state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorType: 'unknown',
    errorId: null,
    copied: false,
    showDetails: false
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorType: classifyError(error),
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const boundaryName = this.props.name || 'Unknown';
    console.error(`ErrorBoundary [${boundaryName}] caught an error:`, error, errorInfo);

    this.setState({
      error,
      errorInfo,
      errorType: classifyError(error)
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      errorId: this.state.errorId,
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      boundaryName: this.props.name || 'Unknown',
      boundaryLevel: this.props.level || 'component',
      errorType: this.state.errorType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Report');
      console.log('Error ID:', errorData.errorId);
      console.log('Error Type:', errorData.errorType);
      console.log('Boundary:', errorData.boundaryName);
      console.log('Details:', errorData);
      console.groupEnd();
    }

    // Store in sessionStorage for persistence across reloads
    try {
      const existingErrors = JSON.parse(sessionStorage.getItem('errorLog') || '[]');
      existingErrors.push(errorData);
      sessionStorage.setItem('errorLog', JSON.stringify(existingErrors.slice(-10)));
    } catch {
      // Ignore storage errors
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      errorId: null,
      copied: false,
      showDetails: false
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '#/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleCopyError = async () => {
    const { error, errorInfo, errorId, errorType } = this.state;
    const errorReport = `
Error ID: ${errorId}
Error Type: ${errorType}
Error: ${error?.toString()}
Stack: ${error?.stack || 'N/A'}
Component Stack: ${errorInfo?.componentStack || 'N/A'}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorReport);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = errorReport;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  getErrorMessage = (): { title: string; description: string; suggestions: string[] } => {
    const { errorType } = this.state;

    switch (errorType) {
      case 'chunk':
        return {
          title: 'Failed to load page content',
          description: 'Some parts of the application failed to load. This usually happens due to a network issue or an outdated cached version.',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Clear your browser cache if the problem persists'
          ]
        };
      case 'network':
        return {
          title: 'Network connection issue',
          description: 'We couldn\'t connect to our servers. Please check your internet connection.',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Contact support if the problem persists'
          ]
        };
      case 'render':
        return {
          title: 'Display error',
          description: 'There was a problem displaying this content. Our team has been notified.',
          suggestions: [
            'Try refreshing the page',
            'Go back to the previous page',
            'Return to the home page'
          ]
        };
      default:
        return {
          title: 'Something went wrong',
          description: 'We encountered an unexpected error. Don\'t worry, your data is safe.',
          suggestions: [
            'Try the action again',
            'Refresh the page',
            'Contact support if needed'
          ]
        };
    }
  };

  renderCompactError = () => {
    const { error } = this.state;
    const { level = 'component' } = this.props;

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
        <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Failed to load {level}</span>
        </div>
        <button
          onClick={this.handleReset}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
        {process.env.NODE_ENV === 'development' && error && (
          <p className="mt-2 text-xs text-red-500 font-mono truncate max-w-xs mx-auto">
            {error.message}
          </p>
        )}
      </div>
    );
  };

  render() {
    const { hasError, error, errorInfo, errorId, errorType, copied, showDetails } = this.state;
    const { level = 'page', fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback({
            error: error!,
            errorInfo,
            resetError: this.handleReset,
            errorType
          });
        }
        return fallback;
      }

      // Compact error UI for component/section level
      if (level === 'component' || level === 'section') {
        return this.renderCompactError();
      }

      const { title, description, suggestions } = this.getErrorMessage();

      // Full-page error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-surface border border-border rounded-2xl shadow-2xl p-8 animate-fade-in">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            {/* Error Content */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-3">
                {title}
              </h1>
              <p className="text-secondary mb-4">
                {description}
              </p>

              {/* Error ID Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border border-border">
                <Bug className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-mono text-secondary">{errorId}</span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mb-6 p-4 bg-background rounded-xl border border-border">
              <h3 className="text-sm font-semibold text-primary mb-2">What you can try:</h3>
              <ul className="space-y-1.5">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-secondary flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Error Details (Development/Expanded) */}
            {(process.env.NODE_ENV === 'development' || showDetails) && error && (
              <div className="mb-6">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary mb-2"
                >
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Technical Details
                </button>
                {showDetails && (
                  <div className="bg-background border border-border rounded-lg p-4 text-xs font-mono overflow-auto max-h-48">
                    <div className="text-red-600 font-bold mb-2">{error.toString()}</div>
                    {error.stack && (
                      <pre className="text-[10px] text-secondary whitespace-pre-wrap mb-2">
                        {error.stack}
                      </pre>
                    )}
                    {errorInfo?.componentStack && (
                      <>
                        <div className="text-secondary font-bold mt-2 mb-1">Component Stack:</div>
                        <pre className="text-[10px] text-secondary whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="btn btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleGoBack}
                  className="btn py-3 rounded-xl font-medium text-secondary hover:text-primary border border-border hover:border-accent flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>

                <button
                  onClick={this.handleReload}
                  className="btn py-3 rounded-xl font-medium text-secondary hover:text-primary border border-border hover:border-accent flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={this.handleGoHome}
                  className="text-sm text-secondary hover:text-primary flex items-center gap-1"
                >
                  <Home className="w-3.5 h-3.5" />
                  Go to Home
                </button>

                <button
                  onClick={this.handleCopyError}
                  className="text-sm text-secondary hover:text-primary flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Error
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Error context provider for nested components
    const contextValue: ErrorContextType = {
      reportError: (error: Error, context?: string) => {
        console.error(`Error reported from ${context || 'unknown'}:`, error);
        // Could trigger error boundary or log externally
      }
    };

    return (
      <ErrorContext.Provider value={contextValue}>
        {this.props.children}
      </ErrorContext.Provider>
    );
  }
}

/**
 * Hook-based Error Handler
 * Allows functional components to throw errors to the nearest error boundary
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

/**
 * Async Error Handler with enhanced error tracking
 */
export const handleAsyncError = async <T,>(
  promise: Promise<T>,
  errorCallback?: (error: Error) => void
): Promise<[T | null, Error | null]> => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (errorCallback) {
      errorCallback(err);
    }
    return [null, err];
  }
};

/**
 * Route Error Boundary Wrapper
 * Specialized error boundary for route-level error handling
 */
interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName?: string;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({
  children,
  routeName = 'Page'
}) => {
  return (
    <ErrorBoundary
      level="page"
      name={`Route: ${routeName}`}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Section Error Boundary Wrapper
 * For wrapping specific sections that might fail independently
 */
interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
}

export const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({
  children,
  sectionName = 'Section',
  fallback
}) => {
  return (
    <ErrorBoundary
      level="section"
      name={`Section: ${sectionName}`}
      fallback={fallback}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Component Error Boundary Wrapper
 * For wrapping individual components
 */
interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName = 'Component',
  fallback
}) => {
  return (
    <ErrorBoundary
      level="component"
      name={`Component: ${componentName}`}
      fallback={fallback}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * useAsyncError hook
 * Enhanced hook for handling async errors with loading/error states
 */
interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const useAsyncError = <T,>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options?: {
    onError?: (error: Error) => void;
    throwToErrorBoundary?: boolean;
  }
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true
  });

  const throwError = useErrorHandler();

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await asyncFn();
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, error, isLoading: false });

      if (options?.onError) {
        options.onError(error);
      }

      if (options?.throwToErrorBoundary) {
        throwError(error);
      }

      return null;
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
    reset: () => setState({ data: null, error: null, isLoading: false })
  };
};

/**
 * withErrorBoundary HOC
 * Wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps} name={displayName}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

/**
 * ErrorFallback component
 * A reusable fallback UI component for error boundaries
 */
interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
  title?: string;
  showRetry?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  showRetry = true
}) => {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center max-w-md mx-auto my-4">
      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
      <p className="text-sm text-red-600 mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      {showRetry && resetError && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * Inline Error Display
 * For showing errors inline without disrupting layout
 */
interface InlineErrorProps {
  error: Error | null;
  onRetry?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  error,
  onRetry,
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm ${className}`}>
      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
      <span className="text-red-700 flex-1">{error.message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 hover:text-red-800 underline text-xs font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
};
