"use client";

import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RequireAuth({ children }) {
	const user = useSelector((s) => s.auth.user);
	const token = useSelector((s) => s.auth.token);
	const router = useRouter();

	useEffect(() => {
		if (!token || !user) {
			router.replace('/login');
		}
	}, [token, user, router]);

	if (!token || !user) return null;
	return children;
} 