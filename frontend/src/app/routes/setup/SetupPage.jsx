import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SetupPage.css'

const API_BASE = 'http://localhost:8000/api/v1'

const DEFAULT_MALL_INFO = {
    'naver': { name: '네이버 쇼핑', description: '가격 비교 및 최저가 검색', icon: '🟢', color: '#03C75A' },
    'coupang': { name: '쿠팡', description: '로켓 배송 & 와우 멤버십', icon: '🚀', color: '#E60B12' },
    'kurly': { name: '마켓컬리', description: '샛별 배송 & 프리미엄 식재료', icon: '💜', color: '#5F0080' },
    'emart': { name: '이마트몰', description: '쓱배송 (시간 지정 가능)', icon: '🟡', color: '#FFB900' },
    'homeplus': { name: '홈플러스', description: '당일 배송 & 행사 상품', icon: '🔴', color: '#D6001C' },
}

const TRANSPORT_OPTIONS = [
    { value: 'walk', label: '도보', icon: '🚶' },
    { value: 'transit', label: '대중교통', icon: '🚌' },
    { value: 'car', label: '자차', icon: '🚗' },
]

export default function SetupPage() {
    const navigate = useNavigate()

    // State: ShoppingContext
    const [location, setLocation] = useState({ address: '', lat: 0, lng: 0, source: 'unknown' })
    const [mobility, setMobility] = useState({ mode: 'transit', max_minutes: 30 })
    const [onlineMalls, setOnlineMalls] = useState({ 'naver': true, 'coupang': true, 'kurly': false })

    // UI State
    const [weather, setWeather] = useState({ summary: '--', temp: 0, icon: '☀️' })
    const [loading, setLoading] = useState(true)

    // Initial Load
    useEffect(() => {
        fetchContext()
    }, [])

    // Fetch Shopping Context
    const fetchContext = async () => {
        try {
            const res = await fetch(`${API_BASE}/settings/shopping-context`)
            if (res.ok) {
                const data = await res.json()
                if (data.location) setLocation(data.location)
                if (data.mobility) setMobility(data.mobility)
                if (data.online_malls) setOnlineMalls(data.online_malls)

                // If location exists, fetch weather
                if (data.location && data.location.lat !== 0) {
                    fetchWeather(data.location.lat, data.location.lng)
                }
            }
        } catch (e) {
            console.error('Failed to load settings:', e)
        } finally {
            setLoading(false)
        }
    }

    // Fetch Weather (Proxy)
    const fetchWeather = async (lat, lng) => {
        try {
            const res = await fetch(`${API_BASE}/settings/weather/current?lat=${lat}&lng=${lng}`)
            if (res.ok) {
                const data = await res.json()
                setWeather(data)
            }
        } catch (e) {
            console.error('Weather fetch failed:', e)
        }
    }

    // Handlers
    const handleAddressChange = (e) => {
        setLocation({ ...location, address: e.target.value, source: 'search' })
    }

    const handleGpsClick = () => {
        if (!navigator.geolocation) {
            alert('GPS를 지원하지 않는 브라우저입니다.')
            return
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords
            // Reverse Geocoding (Proxy)
            try {
                const res = await fetch(`${API_BASE}/settings/geo/reverse?lat=${latitude}&lng=${longitude}`)
                const data = await res.json()
                setLocation({
                    address: data.address,
                    lat: latitude,
                    lng: longitude,
                    source: 'gps'
                })
                fetchWeather(latitude, longitude)
            } catch (e) {
                console.error('Reverse geo failed:', e)
                setLocation({ ...location, lat: latitude, lng: longitude, source: 'gps' })
            }
        }, (err) => {
            alert('위치 정보를 가져올 수 없습니다.')
        })
    }

    const toggleMall = (key) => {
        setOnlineMalls(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleStart = async () => {
        // Save Context
        try {
            const payload = {
                location,
                mobility,
                online_malls: onlineMalls
            }
            const res = await fetch(`${API_BASE}/settings/shopping-context`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                navigate('/basket')
            } else {
                alert('설정 저장에 실패했습니다.')
            }
        } catch (e) {
            alert('네트워크 오류가 발생했습니다.')
        }
    }

    if (loading) return <div className="page setup-page center">Loading...</div>

    // Merge default mall info with state
    const mallList = Object.keys(DEFAULT_MALL_INFO).map(key => ({
        key,
        ...DEFAULT_MALL_INFO[key],
        enabled: onlineMalls[key] ?? false
    }))

    return (
        <div className="page setup-page">
            <header className="setup-header">
                <div className="logo-area">
                    <span className="logo-icon">🛒</span>
                    <h1>똑장 시작하기</h1>
                </div>
                <p className="setup-desc">
                    당신에게 딱 맞는 장보기 환경을 설정해주세요.<br />
                    AI가 최적의 장소와 상품을 찾아드립니다.
                </p>
            </header>

            <div className="page-content setup-content">
                {/* 1. Location Card */}
                <section className="setup-card animate-slide-up" style={{ animationDelay: '0s' }}>
                    <div className="card-header">
                        <span className="card-icon">📍</span>
                        <h2>배송/출발지 설정</h2>
                    </div>
                    <div className="card-body">
                        <div className="address-box">
                            <input
                                type="text"
                                value={location.address}
                                onChange={handleAddressChange}
                                className="address-input"
                                placeholder="주소를 입력하거나 GPS를 켜세요"
                            />
                            <button className="gps-btn" onClick={handleGpsClick}>
                                <span className="gps-icon">🧭</span> 현재 위치
                            </button>
                        </div>

                        <div className="map-preview">
                            <div className="map-visual">
                                <div className="map-pin-marker">
                                    <div className="pin-head">🏡</div>
                                    <div className="pin-point"></div>
                                </div>
                                <div className="map-overlay-info">
                                    <span className="weather-badge">
                                        {weather.icon} {weather.summary} {weather.temp}°C
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Transport & Time Card */}
                <section className="setup-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="card-header">
                        <span className="card-icon">⏱️</span>
                        <h2>이동 수단 및 시간</h2>
                    </div>
                    <div className="card-body">
                        <div className="transport-selector">
                            {TRANSPORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`transport-option ${mobility.mode === opt.value ? 'selected' : ''}`}
                                    onClick={() => setMobility({ ...mobility, mode: opt.value })}
                                >
                                    <span className="t-icon">{opt.icon}</span>
                                    <span className="t-label">{opt.label}</span>
                                    {mobility.mode === opt.value && <span className="check-mark">✓</span>}
                                </button>
                            ))}
                        </div>

                        <div className="time-slider-box">
                            <div className="slider-header">
                                <span>최대 이동 시간</span>
                                <span className="time-display">{mobility.max_minutes}분</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="60"
                                step="5"
                                value={mobility.max_minutes}
                                onChange={(e) => setMobility({ ...mobility, max_minutes: Number(e.target.value) })}
                                className="range-slider"
                                style={{ backgroundSize: `${((mobility.max_minutes - 10) * 100) / 50}% 100%` }}
                            />
                            <div className="slider-ticks">
                                <span>10분</span>
                                <span>30분</span>
                                <span>60분</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Mall Preference Card */}
                <section className="setup-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="card-header">
                        <span className="card-icon">🛍️</span>
                        <h2>자주 쓰는 쇼핑몰</h2>
                    </div>
                    <div className="card-body mall-list-body">
                        {mallList.map((mall) => (
                            <div key={mall.key} className={`mall-row ${mall.enabled ? 'enabled' : ''}`}>
                                <div className="mall-logo" style={{ backgroundColor: mall.enabled ? mall.color + '20' : '#f8f9fa' }}>
                                    {mall.icon}
                                </div>
                                <div className="mall-info">
                                    <div className="mall-name">{mall.name}</div>
                                    <div className="mall-desc">{mall.description}</div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={mall.enabled}
                                        onChange={() => toggleMall(mall.key)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="fixed-footer animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <button className="start-btn" onClick={handleStart}>
                    AI 에이전트 시작하기
                    <span className="btn-arrow">→</span>
                </button>
            </div>
        </div>
    )
}
