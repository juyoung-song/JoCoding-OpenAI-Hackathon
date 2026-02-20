import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ArrowLeft, Plus, X, ThumbsDown } from 'lucide-react';

export default function NonPreferredBrandsScreen() {
  const { setCurrentScreen } = useApp();
  const [brands, setBrands] = useState<{ id: string; name: string; category: string; reason?: string }[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandReason, setNewBrandReason] = useState('');

  const removeBrand = (id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
  };

  const addBrand = () => {
    if (newBrandName.trim()) {
      setBrands(prev => [...prev, {
        id: Date.now().toString(),
        name: newBrandName,
        category: '기타',
        reason: newBrandReason || undefined
      }]);
      setNewBrandName('');
      setNewBrandReason('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
        <button 
          onClick={() => setCurrentScreen('MY_PAGE')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg text-gray-900">비선호 브랜드 관리</h1>
          <p className="text-xs text-gray-500 mt-0.5">추천에서 제외할 브랜드를 추가하세요</p>
        </div>
        <div className="bg-red-100 px-3 py-1.5 rounded-full">
          <span className="text-sm font-bold text-red-700">{brands.length}개</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-3">
          {brands.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsDown size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                아직 등록된 비선호 브랜드가 없습니다
              </p>
              <p className="text-gray-400 text-xs mt-1">
                추천에서 제외하고 싶은 브랜드를 추가해보세요
              </p>
            </div>
          ) : (
            brands.map(brand => (
              <div
                key={brand.id}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-red-100 p-2.5 rounded-lg">
                    <ThumbsDown size={18} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                    {brand.reason ? (
                      <p className="text-xs text-gray-500 mt-0.5">{brand.reason}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">{brand.category}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeBrand(brand.id)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors ml-2"
                >
                  <X size={18} className="text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl p-4 mt-6 border border-blue-100">
          <div className="flex gap-3">
            <div className="bg-blue-100 p-2 rounded-lg h-fit">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-900 font-semibold mb-1">비선호 브랜드 안내</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                등록된 브랜드는 AI 추천 및 검색 결과에서 자동으로 제외됩니다. 언제든지 목록을 수정할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-200"
        >
          <Plus size={20} />
          브랜드 추가하기
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">비선호 브랜드 추가</h3>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="브랜드 이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-500 transition-colors mb-3"
              autoFocus
            />
            <input
              type="text"
              value={newBrandReason}
              onChange={(e) => setNewBrandReason(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBrand()}
              placeholder="제외 사유 (선택)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-red-500 transition-colors"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowAddModal(false); setNewBrandName(''); setNewBrandReason(''); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={addBrand}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
