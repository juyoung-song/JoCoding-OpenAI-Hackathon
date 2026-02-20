import { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetContextType {
    openSheet: (content: ReactNode, title?: string) => void;
    closeSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sheetContent, setSheetContent] = useState<ReactNode | null>(null);
    const [sheetTitle, setSheetTitle] = useState<string>('');

    const openSheet = (content: ReactNode, title: string = '') => {
        setSheetContent(content);
        setSheetTitle(title);
        setIsOpen(true);
    };

    const closeSheet = () => {
        setIsOpen(false);
        setTimeout(() => {
            setSheetContent(null);
            setSheetTitle('');
        }, 300);
    };

    return (
        <BottomSheetContext.Provider value={{ openSheet, closeSheet }}>
            {children}

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeSheet}
                            className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm"
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-xl max-w-md mx-auto overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1" onClick={closeSheet}>
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                            </div>

                            {/* Header */}
                            {sheetTitle && (
                                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                                    <h3 className="font-bold text-lg text-gray-900">{sheetTitle}</h3>
                                    <button onClick={closeSheet} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>
                            )}

                            {/* Content */}
                            <div className="overflow-y-auto p-6 pt-2 pb-10">
                                {sheetContent}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </BottomSheetContext.Provider>
    );
};

export const useBottomSheet = () => {
    const context = useContext(BottomSheetContext);
    if (!context) {
        throw new Error('useBottomSheet must be used within a BottomSheetProvider');
    }
    return context;
};
