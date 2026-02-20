import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-24 left-0 right-0 z-[100] px-4 flex flex-col items-center gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm w-full
                ${toast.type === 'success' ? 'bg-white border-green-100 text-green-800' : ''}
                ${toast.type === 'error' ? 'bg-white border-red-100 text-red-800' : ''}
                ${toast.type === 'info' ? 'bg-white border-blue-100 text-blue-800' : ''}
              `}
                        >
                            <div className={`p-1 rounded-full shrink-0
                ${toast.type === 'success' ? 'bg-green-100 text-green-600' : ''}
                ${toast.type === 'error' ? 'bg-red-100 text-red-600' : ''}
                ${toast.type === 'info' ? 'bg-blue-100 text-blue-600' : ''}
              `}>
                                {toast.type === 'success' && <Check size={16} strokeWidth={3} />}
                                {toast.type === 'error' && <AlertCircle size={16} strokeWidth={3} />}
                                {toast.type === 'info' && <Info size={16} strokeWidth={3} />}
                            </div>

                            <p className="text-sm font-medium text-gray-900 flex-1">{toast.message}</p>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
