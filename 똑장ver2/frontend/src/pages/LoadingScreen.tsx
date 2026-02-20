import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, Search, ShoppingBag, MapPin } from 'lucide-react';

interface LoadingStep {
    id: number;
    message: string;
    icon: React.ReactNode;
}

const STEPS: LoadingStep[] = [
    { id: 1, message: "장바구니 품목 분석 중...", icon: <ShoppingBag size={20} /> },
    { id: 2, message: "주변 마트 가격 비교 중...", icon: <Search size={20} /> },
    { id: 3, message: "이동 경로 최적화 중...", icon: <MapPin size={20} /> },
];

export default function LoadingScreen() {
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const timer1 = setTimeout(() => setCurrentStep(2), 1500);
        const timer2 = setTimeout(() => setCurrentStep(3), 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-white px-6">
            {/* Main Spinner & Logo */}
            <div className="relative mb-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-[#59A22F]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#59A22F]">똑장</span>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">최적의 플랜을 찾고 있어요</h2>
            <p className="text-sm text-gray-500 mb-10 text-center">
                조금만 기다려주시면<br />똑똑한 장보기 계획을 알려드릴게요
            </p>

            {/* Trust UX Steps */}
            <div className="w-full max-w-xs space-y-4">
                {STEPS.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0.5, y: 10 }}
                            animate={{
                                opacity: isActive || isCompleted ? 1 : 0.4,
                                y: 0,
                                scale: isActive ? 1.02 : 1
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors border ${isActive ? 'bg-green-50 border-green-200' : 'bg-transparent border-transparent'
                                }`}
                        >
                            <div className={`p-2 rounded-full shrink-0 transition-colors ${isCompleted ? 'bg-[#59A22F] text-white' :
                                    isActive ? 'bg-white text-[#59A22F] border border-[#59A22F]' :
                                        'bg-gray-100 text-gray-400'
                                }`}>
                                {isCompleted ? <Check size={16} strokeWidth={3} /> :
                                    isActive ? <Loader2 size={16} className="animate-spin" /> :
                                        step.icon}
                            </div>
                            <span className={`text-sm font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                {step.message}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
