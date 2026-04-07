import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

/**
 * 제품의 유효 가격을 반환 (사업자는 businessPrice, 일반은 price)
 */
export function getEffectivePrice(product, isBusiness = false) {
    if (!product) return 0;
    if (isBusiness && product.businessPrice) return product.businessPrice;
    return product.price || 0;
}

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            addToCart: (product, qty = 1, option = '기본 옵션') => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (item) => item.product.id === product.id && item.option === option
                    );

                    if (existingItemIndex >= 0) {
                        // Update quantity immutably
                        const updatedItems = [...state.items];
                        updatedItems[existingItemIndex] = {
                            ...updatedItems[existingItemIndex],
                            qty: updatedItems[existingItemIndex].qty + qty
                        };
                        return { items: updatedItems };
                    } else {
                        // Add new item
                        return { items: [...state.items, { product, qty, option }] };
                    }
                });
            },

            // 바로구매용: 기존 수량을 교체(덮어쓰기)하는 함수 (누적하지 않음)
            setCartItem: (product, qty = 1, option = '기본 옵션') => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (item) => item.product.id === product.id && item.option === option
                    );

                    if (existingItemIndex >= 0) {
                        const updatedItems = [...state.items];
                        updatedItems[existingItemIndex] = {
                            ...updatedItems[existingItemIndex],
                            qty: qty  // 누적이 아닌 교체
                        };
                        return { items: updatedItems };
                    } else {
                        return { items: [...state.items, { product, qty, option }] };
                    }
                });
            },

            removeFromCart: (productId, option) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.product.id === productId && item.option === option)
                    ),
                }));
            },

            updateQuantity: (productId, option, newQty) => {
                if (newQty < 1) return;
                set((state) => ({
                    items: state.items.map((item) =>
                        item.product.id === productId && item.option === option
                            ? { ...item, qty: newQty }
                            : item
                    )
                }));
            },

            clearCart: () => set({ items: [] }),

            // Selectors
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.qty, 0);
            },

            getTotalPrice: () => {
                const user = useAuthStore.getState().user;
                const isBusiness = user?.role === 'business';
                return get().items.reduce((total, item) => {
                    const price = getEffectivePrice(item.product, isBusiness);
                    return total + (price * item.qty);
                }, 0);
            }
        }),
        {
            name: 'flooring-cart-storage', // unique name for localStorage
        }
    )
);
