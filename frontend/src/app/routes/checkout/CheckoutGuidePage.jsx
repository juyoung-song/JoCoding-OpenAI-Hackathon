import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './CheckoutGuidePage.css'

export default function CheckoutGuidePage() {
    const location = useLocation()
    const navigate = useNavigate()

    // 이전 페이지(Analysis/Plans)에서 전달받은 Plan 객체
    const { plan } = location.state || {}

    // 상태: 현재 단계 (0부터 시작)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [completedItems, setCompletedItems] = useState([])
    const [isFinished, setIsFinished] = useState(false)

    useEffect(() => {
        if (!plan) {
            alert("잘못된 접근입니다. 플랜 정보가 없습니다.")
            navigate('/basket')
            return
        }
        // 초기화
        setCompletedItems(new Array(plan.items.length).fill(false))
    }, [plan, navigate])

    if (!plan) return null

    const currentItem = plan.items[currentIndex]
    const totalItems = plan.items.length
    const progress = ((currentIndex) / totalItems) * 100

    // 링크 열기 핸들러
    const handleOpenLink = () => {
        if (currentItem.link) {
            window.open(currentItem.link, '_blank')
        } else {
            alert("상품 링크가 없습니다. (오프라인 전용 상품일 수 있습니다)")
        }
    }

    // 다음 단계로 이동
    const handleNext = () => {
        // 현재 아이템 완료 처리
        const newCompleted = [...completedItems]
        newCompleted[currentIndex] = true
        setCompletedItems(newCompleted)

        if (currentIndex < totalItems - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            setIsFinished(true)
        }
    }

    // 설명 텍스트
    const getStepDescription = () => {
        if (isFinished) return "모든 상품을 확인했습니다!"
        return `${currentItem.product_name} 상품을 담아주세요.`
    }

    // 최종 완료 화면
    if (isFinished) {
        return (
            <div className="checkout-page">
                <div className="checkout-header">
                    <h1>담기 완료!</h1>
                </div>
                <div className="checkout-content finished-content">
                    <div className="finished-icon">🎉</div>
                    <h2>장바구니 담기가 끝났어요.</h2>
                    <p>이제 마트 앱으로 이동해서 결제를 진행해주세요.</p>

                    <div className="summary-card">
                        <h3>{plan.mart_name}</h3>
                        <p>총 {totalItems}개 품목</p>
                        <p className="total-price">예상 합계 {plan.estimated_total.toLocaleString()}원</p>
                    </div>

                    <div className="action-buttons">
                        {plan.cart_url ? (
                            <button
                                className="btn-primary btn-lg"
                                onClick={() => window.open(plan.cart_url, '_blank')}
                            >
                                장바구니로 이동하기 (%MALL%)
                            </button>
                        ) : (
                            <button
                                className="btn-primary btn-lg"
                                onClick={() => navigate('/')}
                            >
                                홈으로 돌아가기
                            </button>
                        )}
                        <button className="btn-text" onClick={() => navigate('/')}>
                            처음으로
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page">
            <div className="checkout-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <h1>담기 도우미</h1>
                <div className="step-indicator">{currentIndex + 1} / {totalItems}</div>
            </div>

            {/* 진행바 */}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="checkout-content">
                <div className="guide-card">
                    <div className="guide-text">
                        <p className="sub-text">마트 앱/웹이 열리면 장바구니에 담고 돌아오세요.</p>
                        <h2>{getStepDescription()}</h2>
                    </div>

                    <div className="item-preview">
                        <div className="item-info">
                            <span className="brand">{currentItem.brand}</span>
                            <div className="name">{currentItem.product_name}</div>
                            <div className="price">{currentItem.price.toLocaleString()}원</div>
                        </div>
                    </div>

                    <div className="action-area">
                        <button className="btn-open-link" onClick={handleOpenLink}>
                            🔗 상품 보러가기
                        </button>
                    </div>
                </div>
            </div>

            <div className="checkout-footer">
                <div className="check-area">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={completedItems[currentIndex]}
                            onChange={(e) => {
                                const newCompleted = [...completedItems]
                                newCompleted[currentIndex] = e.target.checked
                                setCompletedItems(newCompleted)
                            }}
                        />
                        <span>장바구니에 담았습니다</span>
                    </label>
                </div>
                <button
                    className="btn-primary btn-next"
                    disabled={!completedItems[currentIndex]} // 체크해야 넘어감 (옵션)
                    onClick={handleNext}
                >
                    {currentIndex === totalItems - 1 ? "완료하기" : "다음 상품 >"}
                </button>
            </div>
        </div>
    )
}
