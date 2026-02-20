import { useState } from 'react';
import { useApp } from '../app/store/AppContext';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

import { useToast } from '../shared/ui/ToastProvider';
import { getItemEmoji } from '../utils/productVisual';

export default function CartViewScreen() {
  const { setCurrentScreen, cartItems, updateCartItemQuantity, removeCartItem, addToCart, selectedPlan } = useApp();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  // const [newItemPrice, setNewItemPrice] = useState(''); // Price is not managed by user in API mode
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState<'개' | 'g'>('개');

  // Calculate total price
  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach(item => {
      // Extract numeric price from string
      const priceMatch = item.price.match(/[\d,]+/);
      if (priceMatch) {
        const price = parseInt(priceMatch[0].replace(/,/g, ''));
        if (item.unit === 'g') {
          // For items sold by weight (100g unit)
          total += (price * item.quantity) / 100;
        } else {
          // For items sold by piece
          total += price * item.quantity;
        }
      }
    });
    return total;
  };

  const handleQuantityChange = (id: string, name: string, delta: number, currentQuantity: number, unit: string) => {
    let newQuantity = currentQuantity + delta;

    // For gram items, change by 100g increments
    if (unit === 'g') {
      if (newQuantity < 100) newQuantity = 100;
    } else {
      if (newQuantity < 1) newQuantity = 1;
    }

    updateCartItemQuantity(id, name, newQuantity);
  };

  const handleAddItem = () => {
    if (newItemName && newItemQuantity) {
      addToCart(newItemName, parseInt(newItemQuantity), newItemUnit === 'g' ? 'g' : undefined);
      setShowAddModal(false);
      setNewItemName('');
      // setNewItemPrice('');
      setNewItemQuantity('1');
      setNewItemUnit('개');
      showToast(`${newItemName}이(가) 추가되었습니다`, 'success');
    }
  };

  const estimatedDeliveryFee = selectedPlan
    ? Math.max(selectedPlan.estimated_total - selectedPlan.items.reduce((sum, item) => sum + item.price, 0), 0)
    : null;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('HOME')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-gray-900">이번주 장바구니</h1>
            <p className="text-xs text-gray-500 mt-0.5">총 {cartItems.length}개 상품</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isEditing
            ? 'bg-[#59A22F] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {isEditing ? '완료' : '편집'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-semibold">
              장바구니가 비어있습니다
            </p>
            <p className="text-gray-400 text-xs mt-2">
              AI와 대화하여 장보기를 시작해보세요
            </p>
            <button
              onClick={() => setCurrentScreen('HOME')}
              className="mt-6 px-6 py-3 bg-[#59A22F] text-white font-semibold rounded-xl hover:bg-[#4a8a26] transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cartItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                style={{ backgroundColor: item.bgColor }}
              >
                <div className="flex items-start gap-3">
                  {/* Product Image Placeholder */}
                  <div className="w-20 h-20 bg-white/80 rounded-xl flex items-center justify-center shrink-0 border border-gray-200">
                    <span className="text-2xl">{getItemEmoji(item.name)}</span>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-[15px] mb-1">
                      {item.brand ? `${item.brand} ${item.name}` : item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.price}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.sizeLabel ? `규격 ${item.sizeLabel}` : "규격 미지정"}
                    </p>

                    {/* Quantity Controls */}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white rounded-lg border border-gray-300 shadow-sm">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.name,
                                item.unit === 'g' ? -100 : -1,
                                item.quantity,
                                item.unit
                              )
                            }
                            className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                          >
                            <Minus size={16} className="text-gray-600" />
                          </button>
                          <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[80px] text-center">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.name,
                                item.unit === 'g' ? 100 : 1,
                                item.quantity,
                                item.unit
                              )
                            }
                            className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                          >
                            <Plus size={16} className="text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            removeCartItem(item.id, item.name);
                            showToast(`${item.name} 삭제됨`, 'info');
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-block bg-white/80 px-3 py-1.5 rounded-lg border border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Product Button - shown in editing mode */}
            {isEditing && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center justify-center gap-2 hover:border-[#59A22F] hover:bg-green-50 transition-colors"
              >
                <Plus size={20} className="text-gray-400" />
                <span className="text-gray-500 font-semibold text-sm">상품 추가하기</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Summary */}
      {cartItems.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-6 shrink-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">예상 총 금액</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateTotal().toLocaleString()}원
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">배송비</p>
              <p className="text-sm font-semibold text-[#59A22F]">
                {estimatedDeliveryFee === null
                  ? "플랜 계산 후 표시"
                  : estimatedDeliveryFee === 0
                  ? "무료"
                  : `${estimatedDeliveryFee.toLocaleString()}원`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen('MODE_SELECTION')}
            className="w-full bg-[#59A22F] hover:bg-[#4a8a26] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-green-200"
          >
            플랜 비교하기
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            * 실제 금액은 결제 시 확인됩니다
          </p>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">상품 추가</h3>

            {/* Product Name */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">상품명</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="예: 국내산 삼겹살"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#59A22F] transition-colors"
                autoFocus
              />
            </div>

            {/* Price - Not needed for API integration
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">가격</label>
              <input
                type="text"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="예: 100g당 2,580원 또는 2,980원"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#59A22F] transition-colors"
              />
            </div>
            */}

            {/* Quantity and Unit */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">수량</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  min={newItemUnit === 'g' ? "100" : "1"}
                  step={newItemUnit === 'g' ? "100" : "1"}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#59A22F] transition-colors"
                />
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value as '개' | 'g')}
                  className="px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#59A22F] transition-colors bg-white"
                >
                  <option value="개">개</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItemName('');
                  // setNewItemPrice('');
                  setNewItemQuantity('1');
                  setNewItemUnit('개');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItemName || !newItemQuantity}
                className="flex-1 bg-[#59A22F] hover:bg-[#4a8a26] text-white font-semibold py-3 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
