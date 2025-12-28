'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { productService } from '@/lib/services/productService';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Minus, Plus, Upload, ArrowLeft } from 'lucide-react';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Customization state
    const [customText, setCustomText] = useState('');
    const [customImage, setCustomImage] = useState<File | null>(null);
    const [customImagePreview, setCustomImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const fetchedProduct = await productService.getProduct(productId);
            setProduct(fetchedProduct);
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCustomImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        let customization = undefined;

        if (product.isCustomizable && (customText || customImage)) {
            let imageUrl = '';

            if (customImage) {
                setUploading(true);
                try {
                    imageUrl = await productService.uploadCustomizationImage(customImage);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload customization image');
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            customization = {
                text: customText || undefined,
                imageUrl: imageUrl || undefined,
            };
        }

        addToCart({
            productId: product.id,
            quantity,
            customization,
        });

        alert('Product added to cart!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold border-t-transparent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-luxury-gray mb-4">Product not found</p>
                    <button onClick={() => router.push('/shop')} className="btn-luxury">
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-luxury-gray hover:text-luxury-gold mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <div>
                        <div className="relative h-96 lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-4">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-9xl">
                                    🎁
                                </div>
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                            ? 'border-luxury-gold'
                                            : 'border-gray-200 hover:border-luxury-gold'
                                            }`}
                                    >
                                        <Image src={image} alt={`${product.title} ${index + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-luxury-black mb-4">
                            {product.title}
                        </h1>

                        <div className="flex items-center space-x-4 mb-6">
                            <span className="text-4xl font-bold text-luxury-gold">
                                ₹{product.price}
                            </span>
                            {product.isCustomizable && (
                                <span className="bg-luxury-gold text-white text-sm px-4 py-1 rounded-full font-semibold">
                                    Customizable
                                </span>
                            )}
                        </div>

                        <p className="text-luxury-gray text-lg leading-relaxed mb-8">
                            {product.description}
                        </p>

                        <div className="border-t border-gray-200 pt-8 mb-8">
                            <p className="text-sm text-luxury-gray mb-2">Category</p>
                            <p className="text-luxury-black font-medium">{product.category}</p>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-serif font-semibold mb-3 text-luxury-black">Key Features</h3>
                                <ul className="space-y-2">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start text-luxury-gray">
                                            <span className="mr-2 text-luxury-gold">•</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Customization Options */}
                        {product.isCustomizable && (
                            <div className="bg-luxury-cream p-6 rounded-lg mb-8">
                                <h3 className="text-xl font-serif font-semibold mb-4">Customize Your Product</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-luxury-black mb-2">
                                            Custom Text
                                        </label>
                                        <input
                                            type="text"
                                            value={customText}
                                            onChange={(e) => setCustomText(e.target.value)}
                                            placeholder="Enter your custom text..."
                                            className="input-luxury"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-luxury-black mb-2">
                                            Upload Image
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex-1 cursor-pointer">
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-luxury-gold transition-colors">
                                                    <Upload className="mx-auto mb-2 text-luxury-gray" size={24} />
                                                    <p className="text-sm text-luxury-gray">
                                                        {customImage ? customImage.name : 'Click to upload image'}
                                                    </p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        {customImagePreview && (
                                            <div className="mt-3 relative h-32 rounded-lg overflow-hidden">
                                                <Image
                                                    src={customImagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-luxury-black mb-3">
                                Quantity
                            </label>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 border border-gray-300 rounded-md hover:border-luxury-gold transition-colors"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-2 border border-gray-300 rounded-md hover:border-luxury-gold transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={uploading}
                            className="w-full btn-luxury flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <ShoppingCart size={20} />
                            <span>{uploading ? 'Uploading...' : 'Add to Cart'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
