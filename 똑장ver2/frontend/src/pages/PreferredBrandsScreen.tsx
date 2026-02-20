import { useState, useEffect } from 'react';
import { useApp } from '../app/store/AppContext';
import { PreferencesAPI } from '../api';
import { ArrowLeft, Plus, X, ThumbsUp, Loader2 } from 'lucide-react';

export default function PreferredBrandsScreen() {
  const { setCurrentScreen } = useApp();
  const [brands, setBrands] = useState<{ id: string; name: string; category: string }[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 초기 로딩
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await PreferencesAPI.getBrands('like');
      // 백엔드는 문자열 리스트만 반환하므로 객체 형태로 매핑 (id는 임시 생성)
      const mapped = res.brands.map((b: string, idx: number) => ({
        id: `brand-${idx}-${Date.now()}`,
        name: b,
        category: '선호' // 카테고리 정보가 없으므로 고정
      }));
      setBrands(mapped);
    } catch (e) {
      console.error("Failed to fetch brands", e);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBrand = async (id: string, name: string) => {
    // Optimistic Update
    setBrands(prev => prev.filter(b => b.id !== id));
    try {
      await PreferencesAPI.removeBrand(name, 'like');
    } catch (e) {
      console.error("Failed to remove brand", e);
      fetchBrands(); // Rollback
    }
  };

  const addBrand = async () => {
    if (!newBrandName.trim()) return;

    // UI 즉시 반영
    const tempId = Date.now().toString();
    const newBrand = { id: tempId, name: newBrandName, category: '선호' };
    setBrands(prev => [...prev, newBrand]);
    setNewBrandName('');
    setShowAddModal(false);

    try {
      await PreferencesAPI.addBrand(newBrand.name, 'like');
      // fetchBrands(); // 굳이 다시 불러올 필요 없으면 생략
    } catch (e) {
      console.error("Failed to add brand", e);
      setBrands(prev => prev.filter(b => b.id !== tempId)); // Rollback
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
          <h1 className="font-bold text-lg text-gray-900">선호 브랜드 관리</h1>
          <p className="text-xs text-gray-500 mt-0.5">자주 구매하는 브랜드를 추가하세요</p>
        </div>
        <div className="bg-green-100 px-3 py-1.5 rounded-full">
          <span className="text-sm font-bold text-green-700">{brands.length}개</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-3">
          {isLoading && brands.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : brands.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                아직 등록된 선호 브랜드가 없습니다
              </p>
              <p className="text-gray-400 text-xs mt-1">
                자주 구매하는 브랜드를 추가해보세요
              </p>
            </div>
          ) : (
            brands.map(brand => (
              <div
                key={brand.id}
                className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-lg">
                    <ThumbsUp size={18} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{brand.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeBrand(brand.id, brand.name)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={18} className="text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Button */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-[#59A22F] hover:bg-[#4a8a26] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-200"
        >
          <Plus size={20} />
          브랜드 추가하기
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">선호 브랜드 추가</h3>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBrand()}
              placeholder="브랜드 이름을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#59A22F] transition-colors"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowAddModal(false); setNewBrandName(''); }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={addBrand}
                className="flex-1 bg-[#59A22F] hover:bg-[#4a8a26] text-white font-semibold py-3 rounded-xl transition-colors"
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
