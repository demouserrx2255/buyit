import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

function buildQuery(params = {}) {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== '') searchParams.append(k, String(v));
	});
	return searchParams.toString();
}

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}) => {
	const qs = buildQuery(params);
	const url = qs ? `/api/products?${qs}` : '/api/products';
	const { data } = await api.get(url);
	return {
		items: data.items || [],
		page: data.page || 1,
		pages: data.pages || 1,
		total: data.total || (data.items ? data.items.length : 0),
		params,
	};
});

const productsSlice = createSlice({
	name: 'products',
	initialState: { items: [], status: 'idle', error: null, page: 1, pages: 1, total: 0, params: {} },
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProducts.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.items = action.payload.items;
				state.page = action.payload.page;
				state.pages = action.payload.pages;
				state.total = action.payload.total;
				state.params = action.payload.params || {};
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	},
});

export default productsSlice.reducer; 