import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './AnalysisPage.css'

const STEPS = [
    { label: '장바구니 확인', status: 'done' },
    { label: '주요 마트 가격 검색 (이마트/홈플러스/컬리)', status: 'loading' },
    { label: '몰별 총액 및 배송 분석', status: 'waiting' },
    { label: '최저가 순위 선정', status: 'waiting' },
]

export default function AnalysisPage() {
    const navigate = useNavigate()
    const [progress, setProgress] = useState(0)
    const [steps, setSteps] = useState(STEPS)
    const [error, setError] = useState(null)
    const apiCallRef = useRef(null)

    useEffect(() => {
        // API 호출과 애니메이션 병렬 시작
        startAnalysis()

        return () => {
            if (apiCallRef.current) clearTimeout(apiCallRef.current)
        }
    }, [])

    async function startAnalysis() {
        try {
            // 1. 애니메이션 시작 (최소 3초 보장)
            animateProgress()

            // 2. 실제 API 호출
            const res = await fetch('http://localhost:8000/api/v1/plans/generate', {
                method: 'POST',
            })

            if (!res.ok) throw new Error('분석 실패')

            const data = await res.json()

            // 3. 완료 처리 (애니메이션 동기화)
            finishAnalysis(data)

        } catch (e) {
            console.error(e)
            setError('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
            setProgress(0)
        }
    }

    function animateProgress() {
        // 단계별 상태 업데이트 시뮬레이션
        setTimeout(() => updateStepStatus(1, 'done', 2, 'loading'), 1500)
        setTimeout(() => updateStepStatus(2, 'done', 3, 'loading'), 3000)

        // 진행률 바
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval)
                    return 90
                }
                return prev + 1.5 // 60fps frame
            })
        }, 50)
        apiCallRef.current = interval
    }

    function updateStepStatus(doneIdx, doneStatus, nextIdx, nextStatus) {
        setSteps(prev => prev.map((s, i) => {
            if (i === doneIdx) return { ...s, status: doneStatus }
            if (i === nextIdx) return { ...s, status: nextStatus }
            return s
        }))
    }

    function finishAnalysis(data) {
        if (apiCallRef.current) clearInterval(apiCallRef.current)

        // 모든 단계 완료 표시
        setSteps(STEPS.map(s => ({ ...s, status: 'done' })))
        setProgress(100)

        // 잠시 후 이동
        setTimeout(() => {
            navigate('/plans', { state: { plans: data } })
        }, 800)
    }

    return (
        <div className="page analysis-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/basket')}>←</button>
                <h1>최적의 경로 분석</h1>
            </div>

            <div className="analysis-content">
                {error ? (
                    <div className="error-message animate-fade-in">
                        <div className="error-icon">⚠️</div>
                        <p>{error}</p>
                        <button className="btn btn-secondary" onClick={() => navigate('/basket')}>
                            장바구니로 돌아가기
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 아이콘 */}
                        <div className="analysis-hero animate-fade-in">
                            <div className="analysis-icon-wrapper">
                                <div className="analysis-icon">📊</div>
                            </div>
                            <h2>최적의 경로 분석 중...</h2>
                            <p className="analysis-subtitle">
                                {progress < 50 ? '이마트, 홈플러스, 컬리 가격을 찾고 있어요' : '몰별 총액과 배송 혜택을 비교하고 있어요'}
                            </p>
                        </div>

                        {/* 단계 표시 */}
                        <div className="analysis-steps">
                            {steps.map((step, i) => (
                                <div key={i} className={`step-item ${step.status}`}>
                                    <div className="step-indicator">
                                        {step.status === 'done' && <span className="step-check">✓</span>}
                                        {step.status === 'loading' && <span className="step-spinner">↻</span>}
                                        {step.status === 'waiting' && <span className="step-wait">○</span>}
                                        {i < steps.length - 1 && <div className="step-line"></div>}
                                    </div>
                                    <div className="step-content">
                                        <div className="step-label">{step.label}</div>
                                        <div className="step-status-text">
                                            {step.status === 'done' && '완료'}
                                            {step.status === 'loading' && '진행 중...'}
                                            {step.status === 'waiting' && '대기 중'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 하단 진행률 */}
            {!error && (
                <div className="analysis-footer">
                    <div className="progress-info">
                        <span>전체 분석 진행률</span>
                        <span className="eta">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <button
                        className={`btn btn-primary ${progress < 100 ? 'disabled' : ''}`}
                        disabled={progress < 100}
                    >
                        {progress === 100 ? '분석 완료!' : '분석 중입니다...'}
                    </button>
                </div>
            )}
        </div>
    )
}
