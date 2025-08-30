"use client";

import { Provider } from 'react-redux';
import store from '../store';
import { useEffect } from 'react';
import { me } from '../store/slices/authSlice';

function InitAuth({ children }) {
	useEffect(() => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
		if (token) {
			store.dispatch(me());
		}
	}, []);
	return children;
}

export default function Providers({ children }) {
	return (
		<Provider store={store}>
			<InitAuth>{children}</InitAuth>
		</Provider>
	);
} 