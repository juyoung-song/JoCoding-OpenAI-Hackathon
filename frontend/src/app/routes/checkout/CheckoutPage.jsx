import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './CheckoutPage.css'

export default function CheckoutPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { plan } = location.state || {}
    const [isExpanded, setIsExpanded] = useState(false)

    if (!plan) {
        return (
            <div className="page error-page">
                <div className="error-content">
                    <p>선택된 플랜 정보가 없습니다.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/plans')}>
                        플랜 목록으로 돌아가기
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <h1>장바구니 완료</h1>
            </div>

            <div className="page-content checkout-content">
                {/* 성공 아이콘 */}
                <div className="checkout-hero animate-fade-in">
                    <div className="success-icon-wrapper">
                        <div className="success-icon">✓</div>
                        <div className="confetti">🎉</div>
                    </div>
                    <h2>모든 상품을<br />성공적으로 담았습니다!</h2>
                    <p>이제 {plan.mart_name}에서<br />결제를 진행해 주세요.</p>
                </div>

                {/* 마트 장바구니 요약 카드 */}
                <div className="checkout-mart-card card animate-slide-up">
                    <div className="mart-card-inner">
                        <div className="mart-thumb">{plan.mart_icon || '🛒'}</div>
                        <div className="mart-info">
                            <div className="mart-name">{plan.mart_name} 장바구니</div>
                            <div className="mart-desc">
                                총 {plan.coverage}개 품목 / {plan.estimated_total.toLocaleString()}원
                            </div>
                        </div>
                        <span className="mart-arrow">›</span>
                    </div>


                    {/* 포함된 상품 리스트 (간략히) */}
                    <div className="checkout-items-list">
                        {plan.items.slice(0, isExpanded ? undefined : 3).map((item, i) => (
                            <div key={i} className="checkout-item-row">
                                <span className="item-check">✓</span>
                                <span className="item-name">{item.product_name}</span>
                                <span className="item-price">{item.price.toLocaleString()}원</span>
                            </div>
                        ))}
                        {plan.items.length > 3 && (
                            <div
                                className="checkout-more"
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{ cursor: 'pointer', color: '#888', textAlign: 'center', padding: '10px 0', fontSize: '0.9rem' }}
                            >
                                {isExpanded ? '접기 ▲' : `외 ${plan.items.length - 3}개 품목 더보기 ▼`}
                            </div>
                        )}
                    </div>
                </div>

                <div className="checkout-warning">
                    ⚠️ 실제 결제 금액은 마트 정책에 따라 달라질 수 있어요.
                </div>
            </div>

            {/* CTA */}
            <div className="checkout-footer">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        // 실제 앱/웹 링크가 있다면 이동 (현재는 alert)
                        alert(`${plan.mart_name} 앱으로 이동합니다! (데모)`)
                    }}
                >
                    🛒 {plan.mart_name} 바로가기
                </button>
                <button className="btn btn-secondary btn-full" onClick={() => navigate('/')}>
                    똑장으로 돌아가기
                </button>
            </div>

            {/* 하단 내비게이션 */}
            <nav className="bottom-nav">
                <a href="/" className="bottom-nav-item"><span>🏠</span> 홈</a>
                <a href="#" className="bottom-nav-item"><span>🔍</span> 검색</a>
                <a href="#" className="bottom-nav-item"><span>❤️</span> 찜</a>
                <a href="#" className="bottom-nav-item active"><span>👤</span> 마이</a>
            </nav>
        </div>
    )
}
