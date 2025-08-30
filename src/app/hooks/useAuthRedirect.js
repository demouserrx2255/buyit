"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';

export const useAuthRedirect = () => {
  const { user, token, status } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're on an auth page
    const isAuthPage = pathname === '/login' || pathname === '/register';
    
    if (isAuthPage) {
      // If we have a token but no user yet, wait for the user data to load
      if (token && !user && status === 'loading') {
        return;
      }
      
      // If we have user data or token, redirect immediately
      if (user || token) {
        router.replace('/');
      }
    }
  }, [user, token, pathname, router, status]);

  return { 
    user, 
    token, 
    isLoading: status === 'loading' || (token && !user)
  };
};
