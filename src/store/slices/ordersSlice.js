import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const placeOrder = createAsyncThunk('orders/place', async (shippingAddress = {}) => {
	const { data } = await api.post('/api/orders', { shippingAddress });
	return data;
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async () => {
	const { data } = await api.get('/api/orders');
	return data;
});

const ordersSlice = createSlice({
	name: 'orders',
	initialState: { items: [], lastOrder: null, status: 'idle', error: null },
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(placeOrder.pending, (state) => { state.status = 'loading'; state.error = null; })
			.addCase(placeOrder.fulfilled, (state, action) => { state.status = 'succeeded'; state.lastOrder = action.payload; })
			.addCase(placeOrder.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
			.addCase(fetchMyOrders.pending, (state) => { state.status = 'loading'; state.error = null; })
			.addCase(fetchMyOrders.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
			.addCase(fetchMyOrders.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; });
	},
});

export default ordersSlice.reducer; 