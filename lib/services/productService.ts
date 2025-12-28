import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Product } from '@/lib/types';

export const productService = {
    // Get all products
    async getAllProducts(): Promise<Product[]> {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const products = await res.json();
        return products.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt)
        }));
    },

    // Get products by category
    async getProductsByCategory(category: string): Promise<Product[]> {
        const products = await this.getAllProducts();
        return products.filter(p => p.category === category);
    },

    // Get single product
    async getProduct(id: string): Promise<Product | null> {
        const products = await this.getAllProducts();
        return products.find(p => p.id === id) || null;
    },

    // Create product (Admin only)
    async createProduct(
        productData: Omit<Product, 'id' | 'createdAt' | 'images'>,
        imageFiles: File[]
    ): Promise<string> {
        // Upload images to Firebase Storage
        const imageUrls: string[] = [];

        for (const file of imageFiles) {
            const timestamp = Date.now();
            const storageRef = ref(storage, `products/${timestamp}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            imageUrls.push(url);
        }

        // Create product document
        const docRef = await addDoc(collection(db, 'products'), {
            ...productData,
            images: imageUrls,
            createdAt: Timestamp.now(),
        });

        return docRef.id;
    },

    // Update product (Admin only)
    async updateProduct(
        id: string,
        productData: Partial<Omit<Product, 'id' | 'createdAt' | 'images'>>,
        newImageFiles?: File[]
    ): Promise<void> {
        const updateData: any = { ...productData };

        // If new images are provided, upload them
        if (newImageFiles && newImageFiles.length > 0) {
            const imageUrls: string[] = [];

            for (const file of newImageFiles) {
                const timestamp = Date.now();
                const storageRef = ref(storage, `products/${timestamp}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                imageUrls.push(url);
            }

            updateData.images = imageUrls;
        }

        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, updateData);
    },

    // Delete product (Admin only)
    async deleteProduct(id: string): Promise<void> {
        // Get product to delete images from storage
        const product = await this.getProduct(id);

        if (product && product.images.length > 0) {
            // Delete images from storage
            for (const imageUrl of product.images) {
                try {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                } catch (error) {
                    console.error('Error deleting image:', error);
                }
            }
        }

        // Delete product document
        const docRef = doc(db, 'products', id);
        await deleteDoc(docRef);
    },

    // Upload customization image
    async uploadCustomizationImage(file: File): Promise<string> {
        const timestamp = Date.now();
        const storageRef = ref(storage, `customizations/${timestamp}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
    },
};
