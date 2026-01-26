import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in component tree, displays fallback UI, and logs errors
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error);
            console.error('Error Info:', errorInfo.componentStack);
        }

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 text-center">
                        {/* Error Icon */}
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl font-bold text-primary mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-secondary mb-6">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>

                        {/* Development Details */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm font-semibold text-accent mb-2">
                                    Error Details
                                </summary>
                                <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-xs overflow-auto max-h-40">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-primary font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Home className="w-5 h-5" />
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook-based error boundary wrapper for functional components
 * Uses a class component internally but provides a simpler API
 *
 * @example
 * function MyComponent() {
 *   return (
 *     <WithErrorBoundary>
 *       <PotentiallyBrokenComponent />
 *     </WithErrorBoundary>
 *   );
 * }
 */
export function WithErrorBoundary({ children, fallback, onError }: Omit<Props, 'children'> & { children: ReactNode }) {
    return (
        <ErrorBoundary fallback={fallback} onError={onError}>
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;
