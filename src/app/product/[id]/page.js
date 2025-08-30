"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../lib/api";
import { addToCart } from "../../../store/slices/cartSlice";
import { getImageUrl } from "../../../lib/utils";
export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items); // Access cart items from Redux state
  const [quantity, setQuantity] = useState(1);

  const router = useRouter();
  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);

        console.log(cart, "--", data?._id);

        const cartItem = cart.find((item) => item.product?._id === data?._id);
        console.log("cartItem: ", cartItem);
        setQuantity(cartItem ? cartItem.quantity : 0);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <div className="p-8 text-gray-600">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!product) return null;

  const handleAddToCart = () => {
    const cartItem = cart.find((item) => item.product._id === product._id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    if (quantity <= product.stock) {
      dispatch(addToCart({ productId: product._id, quantity: quantity }));
    } else {
      alert("Cannot add more than available stock!");
    }
  };
  // Quantity handlers

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, product.stock));
  };
  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Section */}
        <div className="flex justify-center">
          {product.image || (product.images && product.images.length > 0) ? (
            <img
              src={getImageUrl(product.image || product.images[0])}
              alt={product.name}
              className="w-full max-w-md md:max-w-lg rounded-xl border border-gray-200 bg-white shadow-sm object-cover"
            />
          ) : (
            <div className="w-full max-w-sm aspect-square rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
              No image available
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            {product.name}
          </h1>

          {product.category && (
            <p className="text-sm text-gray-500 mb-2">
              Category:{" "}
              <span className="font-medium text-gray-700">
                {product?.category.name}
              </span>
            </p>
          )}

          {product.price != null && (
            <p className="text-2xl font-bold text-gray-800 mb-4">
              ${product.price}
            </p>
          )}

          <p className="text-gray-700 leading-relaxed mb-6">
            {product.description}
          </p>

          <p className="text-sm text-gray-500 mb-8">
            In stock:{" "}
            <span className="font-medium text-green-600">{product.stock}</span>
            {/* Quantity Controls */}
            <div className="flex items-center gap-4 my-4">
              <button
                onClick={decreaseQuantity}
                disabled={quantity === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                -
              </button>

              <span className="w-8 text-center">{quantity}</span>

              <button
                onClick={increaseQuantity}
                disabled={quantity === product.stock}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
              >
                +
              </button>
            </div>
          </p>

          <div className="flex gap-4">
            <button
              className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
            <button
              onClick={()=>router.push("/cart")}
              className="px-6 py-3 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
