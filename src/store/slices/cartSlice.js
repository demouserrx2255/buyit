import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
	const { data } = await api.get('/api/cart');
	return data.cart || [];
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }) => {
	const { data } = await api.post('/api/cart', { productId, quantity });
	return data.cart || [];
});

export const removeFromCart = createAsyncThunk('cart/remove', async (productId) => {
	const { data } = await api.delete(`/api/cart/${productId}`);
	return data.cart || [];
});

const cartSlice = createSlice({
	name: 'cart',
	initialState: { items: [], status: 'idle', error: null },
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCart.pending, (state) => { state.status = 'loading'; state.error = null; })
			.addCase(fetchCart.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
			.addCase(fetchCart.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
			.addCase(addToCart.fulfilled, (state, action) => { state.items = action.payload; })
			.addCase(removeFromCart.fulfilled, (state, action) => { state.items = action.payload; });
	},
});

export default cartSlice.reducer; 