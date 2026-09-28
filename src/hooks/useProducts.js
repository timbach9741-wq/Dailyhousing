import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { isVisibleProduct } from '../config/hiddenBrands';

/**
 * Custom hook to fetch products
 * Currently uses Zustand mock data, but architected to swap out to real API fetch.
 */
export function useFetchProducts(categoryId) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { getProductsByCategory } = useProductStore();

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                // Future Backend Integration:
                // const data = await apiClient(`/products?category=${categoryId}`);
                // setProducts(data);

                // Simulated network delay for mock data
                await new Promise(resolve => setTimeout(resolve, 500));

                // For now, it just loads from Zustand synchronously but acts like async
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (categoryId) {
            fetchProducts();
        }
    }, [categoryId]);

    // Return the actual mock data alongside loading states
    const data = getProductsByCategory(categoryId).filter(isVisibleProduct);

    return { data, isLoading, error };
}
