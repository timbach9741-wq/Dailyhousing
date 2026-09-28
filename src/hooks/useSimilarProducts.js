import { useMemo } from 'react';
import { useProductStore } from '../store/useProductStore';
import { isVisibleProduct } from '../config/hiddenBrands';

export function useSimilarProducts(productId, maxResults = 4) {
    const products = useProductStore(state => state.products);
    const getProductById = useProductStore(state => state.getProductById);

    return useMemo(() => {
        const currentProduct = getProductById(productId);

        if (!currentProduct) {
            return { similarProducts: [], isOutOfStock: false, isLowStock: false };
        }

        const inventory = currentProduct.inventory;
        const isOutOfStock = inventory != null && inventory <= 0;
        const isLowStock = inventory != null && inventory > 0 && inventory <= 5;

        if (!isOutOfStock && !isLowStock) {
            return { similarProducts: [], isOutOfStock, isLowStock };
        }

        const getColorFamily = (product) => {
            const text = (product.colorText || product.specifications?.color || product.title || '').toLowerCase();

            if (text.includes('white') || text.includes('cream') || text.includes('ivory')) return 'white';
            if (text.includes('gray') || text.includes('grey') || text.includes('ash') || text.includes('concrete')) return 'gray';
            if (text.includes('brown') || text.includes('oak') || text.includes('walnut') || text.includes('wood') || text.includes('maple')) return 'brown';
            if (text.includes('beige') || text.includes('sand') || text.includes('natural')) return 'beige';
            if (text.includes('dark') || text.includes('black') || text.includes('charcoal')) return 'dark';
            return 'other';
        };

        const currentColorFamily = getColorFamily(currentProduct);
        const currentPatterns = currentProduct.patterns || [];
        const currentPrice = currentProduct.price || 0;

        const scored = products
            .filter(isVisibleProduct)
            .filter(p => {
                if (p.id === currentProduct.id) return false;
                if (p.categoryId !== currentProduct.categoryId) return false;
                if (p.inventory == null || p.inventory <= 0) return false;
                return true;
            })
            .map(p => {
                let score = 0;

                if (p.subCategory === currentProduct.subCategory) {
                    score += 15;
                }

                if (p.thickness && currentProduct.thickness && p.thickness === currentProduct.thickness) {
                    score += 10;
                }

                if (p.patterns && p.patterns.length > 0 && currentPatterns.length > 0) {
                    const overlap = p.patterns.some(pat => currentPatterns.includes(pat));
                    if (overlap) score += 5;
                }

                if (getColorFamily(p) === currentColorFamily) {
                    score += 3;
                }

                if (p.price && currentPrice > 0) {
                    const priceDiff = Math.abs(p.price - currentPrice) / currentPrice;
                    if (priceDiff <= 0.2) score += 2;
                }

                const inv = p.inventory || 0;
                if (inv >= 50) score += 3;
                else if (inv >= 20) score += 2;
                else if (inv >= 5) score += 1;

                return { product: p, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);

        return {
            similarProducts: scored.map(s => ({
                ...s.product,
                similarityScore: s.score,
                similarityPercent: Math.min(100, Math.round((s.score / 38) * 100))
            })),
            isOutOfStock,
            isLowStock
        };
    }, [productId, products, getProductById, maxResults]);
}
