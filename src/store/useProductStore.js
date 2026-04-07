import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// We'll load products dynamically to avoid bloating the initial bundle.
let LXZIN_PRODUCTS = [];

export const useProductStore = create(
    persist(
        (set, get) => ({
            products: [],
            recentProducts: [],
            isLoaded: false,

            // New action to load products
            initProducts: async () => {
                if (get().isLoaded) return;
                const module = await import('../data/lxzin-products');
                LXZIN_PRODUCTS = module.LXZIN_PRODUCTS;

                // Sort functionality to match LX Z:IN website hierarchy
                const getSortWeight = (p) => {
                    const fullText = (p.subCategory + (p.subtitle || '') + (p.title || '')).toLowerCase();
                    
                    // 1. 에디톤 (Highest priority) - subCategory 기반으로 정확히 판별
                    if (fullText.includes('에디톤') || fullText.includes('editon') || p.subCategory === '에디톤 스톤' || p.subCategory === '에디톤 우드' || p.subCategory === '에디톤 스퀘어') {
                        return 10;
                    }
                    
                    // 4. 강마루 프리미엄 합판 (Lowest among flooring categories)
                    if (fullText.includes('강마루 프리미엄 합판')) {
                        return 40;
                    }

                    // 2. 마루 (Standard Maru)
                    if (p.subCategory === '마루') {
                        return 20;
                    }

                    // 2.5 시트 스탠다드 계열 (은행목/뉴청맥) - 신제품 태그 무시, 원래 순서 유지
                    if (fullText.includes('시트 스탠다드') || fullText.includes('은행목') || fullText.includes('뉴청맥')) {
                        return 45;
                    }

                    // 3. 신규제품 (Sorted by newness prefix/tag)
                    if (fullText.includes('[new]') || (p.tags && p.tags.includes('신제품'))) {
                        return 30;
                    }

                    return 50; // Other categories (LVT, Sheet, etc.)
                };

                const indexedProducts = LXZIN_PRODUCTS.map((p, i) => [p, i]);
                indexedProducts.sort((a, b) => {
                    const weightA = getSortWeight(a[0]);
                    const weightB = getSortWeight(b[0]);
                    
                    if (weightA !== weightB) {
                        return weightA - weightB;
                    }
                    
                    // 같은 weight 내에서는 원래 배열 순서 유지 (공식 사이트 순서)
                    return a[1] - b[1];
                });
                const sortedProducts = indexedProducts.map(([p]) => p);

                set({
                    products: sortedProducts,
                    isLoaded: true
                });
            },

            getProductsByCategory: (categoryId) => {
                return get().products.filter(p => p.categoryId === categoryId);
            },

            getProductById: (id) => {
                return get().products.find(p => p.id === id);
            },

            getProductsByCollection: (collectionId) => {
                return get().products.filter(p => p.collectionId === collectionId);
            },

            addRecentProduct: (id) => {
                set((state) => {
                    const newList = [id, ...state.recentProducts.filter(pId => pId !== id)].slice(0, 5);
                    return { recentProducts: newList };
                });
            },

            removeRecentProduct: (id) => {
                set((state) => ({
                    recentProducts: state.recentProducts.filter(pId => pId !== id)
                }));
            },

            // 관리자: 제품 추가 (즉시 반영)
            addProduct: (product) => {
                set((state) => ({
                    products: [...state.products, product]
                }));
            },

            // 관리자: 제품 수정 (즉시 반영) - ID 타입 불일치 방지
            updateProduct: (id, updates) => {
                const targetId = String(id);
                set((state) => ({
                    products: state.products.map(p => 
                        String(p.id) === targetId ? { ...p, ...updates } : p
                    )
                }));
            },

            // 관리자: 제품 삭제 (즉시 반영) - ID 타입 불일치 방지
            removeProduct: (id) => {
                const targetId = String(id);
                set((state) => ({
                    products: state.products.filter(p => String(p.id) !== targetId)
                }));
            },

            getFilteredProducts: (categoryId, filters = {}) => {
                let list = get().getProductsByCategory(categoryId);

                if (filters.thickness && filters.thickness.length > 0) {
                    list = list.filter(p => filters.thickness.includes(`${p.thickness}mm`));
                }

                if (filters.pattern && filters.pattern.length > 0) {
                    list = list.filter(p => p.patterns.some(pattern => filters.pattern.includes(pattern)));
                }

                if (filters.subCategory && filters.subCategory.length > 0) {
                    list = list.filter(p => filters.subCategory.includes(p.subCategory));
                }

                if (filters.sortBy === 'price_desc') {
                    list.sort((a, b) => b.price - a.price);
                } else if (filters.sortBy === 'price_asc') {
                    list.sort((a, b) => a.price - b.price);
                } else if (filters.sortBy === 'rating') {
                    list.sort((a, b) => b.rating - a.rating);
                }

                return list;
            }
        }),
        {
            name: 'recent-products-storage', // name of item in the storage (must be unique)
            partialize: (state) => ({ recentProducts: state.recentProducts }), // only save recentProducts
        }
    )
);
