import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react' // Added useState import
import './PlansPage.css'

const PlanCard = ({ plan, index, navigate }) => {
    const [expanded, setExpanded] = useState(index === 0)

    return (
        <div
            className={`plan-card card animate-fade-in ${index === 0 ? 'best' : ''} ${expanded ? 'expanded' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            {index === 0 && <div className="best-match-tag">BEST MATCH</div>}
            <div className="plan-card-body" onClick={() => setExpanded(!expanded)}>
                <div className="plan-rank-info">
                    <span className={`plan-rank ${index === 0 ? 'rank-1' : ''}`}>
                        {index + 1}위
                    </span>
                    <span className="plan-divider">│</span>
                    <span className="plan-name">{plan.mart_name}</span>
                </div>
                <div className={`plan-price ${index === 0 ? 'highlight' : ''}`}>
                    {plan.estimated_total.toLocaleString()}원
                </div>

                <div className="plan-coverage">
                    <div className="coverage-bar">
                        <div
                            className="coverage-fill"
                            style={{ width: `${(plan.coverage / plan.total_basket_items) * 100}%` }}
                        ></div>
                    </div>
                    <span className="coverage-text">
                        {plan.coverage}/{plan.total_basket_items}개 보유
                    </span>
                </div>

                {plan.badges.length > 0 && (
                    <div className="plan-badges">
                        {plan.badges.map((b, j) => (
                            <span key={j} className="plan-badge">{b}</span>
                        ))}
                    </div>
                )}

                {index === 0 && plan.explanation && !expanded && (
                    <div className="plan-explanation">
                        {plan.explanation}
                    </div>
                )}
                <div className="expand-hint">{expanded ? '닫기 ↑' : '상세 품목 보기 ↓'}</div>
            </div>

            {expanded && (
                <div className="plan-details-list animate-slide-up">
                    <div className="details-header">품목 상세 결과</div>
                    {plan.items.map((item, idx) => (
                        <div key={idx} className={`detail-item ${item.available ? 'available' : 'unavailable'}`}>
                            <div className="detail-status">
                                {item.available ? '✓' : '✕'}
                            </div>
                            <div className="detail-info">
                                <div className="detail-meta">
                                    <span className={`status-badge ${item.available ? 'in-stock' : 'out-stock'}`}>
                                        {item.available ? '보유' : '미보유'}
                                    </span>
                                    {item.brand && <span className="item-brand">{item.brand}</span>}
                                </div>
                                <div className="detail-name">{item.product_name}</div>
                                {item.available ? (
                                    <div className="detail-price">{item.price.toLocaleString()}원</div>
                                ) : (
                                    <div className="detail-msg">이 마트에서는 판매하지 않거나 일시 품절입니다.</div>
                                )}
                            </div>
                        </div>
                    ))}
                    <button
                        className="btn btn-primary btn-checkout"
                        onClick={() => navigate('/checkout/guide', { state: { plan } })}
                    >
                        장바구니 담기 도우미 시작
                    </button>
                </div>
            )}

            <div className="plan-icon">{plan.mart_icon || '🛒'}</div>
        </div>
    )
}

export default function PlansPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { plans } = location.state || {}

    // 데이터가 없으면 로딩 중이거나 잘못된 접근
    if (!plans) {
        return (
            <div className="page error-page">
                <div className="error-content">
                    <p>분석 결과가 없습니다.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/basket')}>
                        장바구니로 돌아가기
                    </button>
                </div>
            </div>
        )
    }

    const { top3, alternatives, headline, last_updated } = plans

    return (
        <div className="page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/basket')}>←</button>
                <h1>쇼핑 추천</h1>
            </div>

            <div className="page-content">
                {/* AI Optimized 배지 */}
                <div className="ai-badge-header animate-fade-in">
                    <span className="badge badge-ai">✨ AI OPTIMIZED</span>
                </div>

                <h2 className="plans-headline animate-fade-in">
                    {headline}
                </h2>
                <p className="plans-desc animate-fade-in">
                    설정하신 선호 마트와 브랜드 상품을 모두 포함하여 실시간 최저가를 분석했습니다.
                </p>

                {/* 추천 Top 3 */}
                <div className="plans-section">
                    <div className="plans-section-header">
                        <h3>추천 Top 3</h3>
                        <span className="last-update">최근 업데이트: {last_updated}</span>
                    </div>

                    {top3.map((plan, i) => (
                        <PlanCard key={i} plan={plan} index={i} navigate={navigate} />
                    ))}
                </div>

                {/* 더 저렴한 대안 */}
                {alternatives && alternatives.length > 0 && (
                    <div className="alt-section animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="alt-header">
                            <h3>이런 대안도 있어요</h3>
                            <span className="info-icon">ℹ️</span>
                        </div>
                        {alternatives.map((alt, i) => (
                            <div
                                key={i}
                                className="alt-card card"
                                onClick={() => navigate('/checkout/guide', { state: { plan: alt } })}
                            >
                                <div className="alt-card-body">
                                    <div className="alt-name">{alt.mart_name}</div>
                                    <div className="alt-info">
                                        {alt.coverage}/{alt.total_basket_items}개 보유
                                    </div>
                                    <div className="alt-divider"></div>
                                    <p className="alt-desc">
                                        {alt.explanation || '일부 품목이 없지만 더 저렴할 수 있어요.'}
                                    </p>
                                </div>
                                <div className="alt-prices">
                                    <span className="alt-discount">{alt.estimated_total.toLocaleString()}원</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 하단 내비게이션 */}
            <nav className="bottom-nav">
                <a href="/" className="bottom-nav-item"><span>🏠</span> 홈</a>
                <a href="#" className="bottom-nav-item"><span>🔍</span> 검색</a>
                <a href="/plans" className="bottom-nav-item active"><span>🌟</span> 추천</a>
                <a href="#" className="bottom-nav-item"><span>❤️</span> 찜</a>
                <a href="#" className="bottom-nav-item"><span>👤</span> MY</a>
            </nav>
        </div>
    )
}
