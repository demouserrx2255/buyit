"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useRouter } from "next/navigation";
import { RiShoppingCartLine } from "react-icons/ri";
import Image from "next/image";
import { CgProfile } from "react-icons/cg";
import { RxDashboard } from "react-icons/rx";
import { TbShoppingCartCopy } from "react-icons/tb";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { useEffect } from "react";
import { fetchCart } from "@/store/slices/cartSlice";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, it) => sum + it.quantity, 0)
  );
  const cart = useSelector((s) => s.cart);
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    // router.push("/");
  };

  useEffect(() => {
    dispatch(fetchCart());
  }, []);
  return (
    <>
      {/* <header className="w-full border-b bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
          <nav className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/register" className="underline">
                  Register
                </Link>
                <Link href="/login" className="underline">
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link href="/orders" className="underline">
                  My Orders
                </Link>
                <Link href="/cart" className="underline">
                  Cart ({cartCount})
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {user.email || user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 underline"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      </header> */}
      <header className="sticky top-0 z-50 bg-white ">
        <div className="mx-auto max-w-[85rem] px-6 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="Go to homepage"
              >
                <Image
                  src="/buyit-logo.svg"
                  alt="BUYIT"
                  width={150}
                  height={50}
                  priority
                />
              </Link>

              {/* <nav className="hidden md:flex items-center gap-6 text-sm font-extrabold">
                  <Link href="/" className="hover:text-green-600">Home</Link>
                  <Link href="/products" className="hover:text-green-600">Products</Link>
             
              </nav> */}
            </div>
            {user ? (
              <>
                <div className="flex items-center gap-6 text-2xl font-extrabold">
                  <button
                    aria-label="Open cart"
                    onClick={() => router.push("/cart")}
                    className="relative"
                  >
                    <RiShoppingCartLine />
                    <span className="absolute -top-2 -right-3 text-xs bg-black text-white rounded-full px-2 py-0.5">
                      {cartCount || 0}
                    </span>
                  </button>
                  <Link href="/orders" className="underline">
                    <TbShoppingCartCopy></TbShoppingCartCopy>
                  </Link>
                  <Link href="/user" className="underline">
                    <CgProfile />
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="">
                      <RxDashboard></RxDashboard>
                    </Link>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLogout}
                      className=""
                    >
                      <RiLogoutBoxRLine></RiLogoutBoxRLine>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
             
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
