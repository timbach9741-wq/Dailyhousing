import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
                return get().items.reduce((total, item) => total + (item.product.price * item.qty), 0);
            }
        }),
        {
            name: 'flooring-cart-storage', // unique name for localStorage
        }
    )
);
