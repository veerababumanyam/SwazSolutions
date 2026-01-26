import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** Callback when confirmed */
    onConfirm: () => void | Promise<void>;
    /** Title of the dialog */
    title: string;
    /** Description message */
    message: string;
    /** Type of dialog */
    variant?: 'danger' | 'warning' | 'info' | 'success';
    /** Confirm button text */
    confirmText?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Whether confirmation is loading */
    isLoading?: boolean;
}

/**
 * Confirmation Dialog Component
 * Accessible modal dialog for confirming destructive actions
 *
 * @example
 * <ConfirmDialog
 *   open={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Playlist?"
 *   message="This action cannot be undone."
 *   variant="danger"
 * />
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    variant = 'danger',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle escape key press
    useEffect(() => {
        if (!open) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isProcessing) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose, isProcessing]);

    // Focus management
    const confirmRef = React.useRef<HTMLButtonElement>(null);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open) {
            // Focus on cancel button by default (safer)
            cancelRef.current?.focus();
        }
    }, [open]);

    const handleConfirm = useCallback(async () => {
        if (isProcessing || isLoading) return;

        setIsProcessing(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Confirm action failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [onConfirm, onClose, isProcessing, isLoading]);

    if (!open) return null;

    const variantStyles = {
        danger: {
            icon: <AlertTriangle className="w-6 h-6" />,
            iconBg: 'bg-red-100 dark:bg-red-900/20',
            iconColor: 'text-red-600 dark:text-red-400',
            confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6" />,
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        },
        info: {
            icon: <Info className="w-6 h-6" />,
            iconBg: 'bg-blue-100 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        },
        success: {
            icon: <CheckCircle className="w-6 h-6" />,
            iconBg: 'bg-green-100 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400',
            confirmBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        }
    };

    const style = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={!isProcessing && !isLoading ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div className="relative bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isProcessing || isLoading}
                    className="absolute top-4 right-4 text-muted hover:text-primary transition-colors disabled:opacity-50"
                    aria-label="Close dialog"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${style.iconBg} mb-4`}>
                    <div className={style.iconColor}>{style.icon}</div>
                </div>

                {/* Title */}
                <h2
                    id="dialog-title"
                    className="text-xl font-semibold text-primary mb-2"
                >
                    {title}
                </h2>

                {/* Message */}
                <p
                    id="dialog-description"
                    className="text-secondary mb-6"
                >
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <button
                        ref={cancelRef}
                        onClick={onClose}
                        disabled={isProcessing || isLoading}
                        className="px-4 py-2 text-secondary hover:text-primary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmRef}
                        onClick={handleConfirm}
                        disabled={isProcessing || isLoading}
                        className={`px-4 py-2 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 ${style.confirmBg}`}
                    >
                        {(isProcessing || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Hook for using confirmation dialogs
 * Provides a simple API for showing confirmation dialogs
 *
 * @example
 * const { confirm, ConfirmDialogComponent } = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete this item?',
 *     message: 'This action cannot be undone.',
 *     variant: 'danger'
 *   });
 *
 *   if (confirmed) {
 *     // Perform delete action
 *   }
 * };
 */
interface UseConfirmDialogOptions {
    title?: string;
    message?: string;
    variant?: ConfirmDialogProps['variant'];
    confirmText?: string;
    cancelText?: string;
}

export function useConfirmDialog() {
    const [dialogState, setDialogState] = React.useState<{
        open: boolean;
        options: UseConfirmDialogOptions;
        resolve: (confirmed: boolean) => void;
    }>({
        open: false,
        options: {},
        resolve: () => {}
    });

    const confirm = useCallback((options: UseConfirmDialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({ open: true, options, resolve });
        });
    }, []);

    const handleClose = useCallback(() => {
        setDialogState(prev => ({ ...prev, open: false }));
        dialogState.resolve(false);
    }, [dialogState]);

    const handleConfirm = useCallback(async () => {
        setDialogState(prev => ({ ...prev, open: false }));
        dialogState.resolve(true);
    }, [dialogState]);

    const ConfirmDialogComponent = useCallback(() => (
        <ConfirmDialog
            open={dialogState.open}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title={dialogState.options.title || 'Confirm'}
            message={dialogState.options.message || 'Are you sure?'}
            variant={dialogState.options.variant || 'info'}
            confirmText={dialogState.options.confirmText}
            cancelText={dialogState.options.cancelText}
        />
    ), [dialogState, handleClose, handleConfirm]);

    return {
        confirm,
        ConfirmDialogComponent
    };
}

/**
 * HOC for confirming actions
 * Wraps a component with confirmation before action
 */
export function withConfirm<T extends object>(
    Component: React.ComponentType<T>,
    getConfirmOptions: (props: T) => UseConfirmDialogOptions | null
) {
    return function WrappedComponent(props: T) {
        const { confirm, ConfirmDialogComponent } = useConfirmDialog();

        const [options, setOptions] = React.useState<UseConfirmDialogOptions | null>(null);
        const [action, setAction] = React.useState<(() => void) | null>(null);

        const enhancedProps = {
            ...props,
            confirmAction: async (callback: () => void) => {
                const confirmOptions = getConfirmOptions ? getConfirmOptions(props) : null;
                if (confirmOptions) {
                    const confirmed = await confirm(confirmOptions);
                    if (confirmed) {
                        callback();
                    }
                } else {
                    callback();
                }
            }
        } as T & { confirmAction: (callback: () => void) => void };

        return (
            <>
                <Component {...enhancedProps} />
                <ConfirmDialogComponent />
            </>
        );
    };
}

export default ConfirmDialog;
