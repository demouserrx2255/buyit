import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAuthToken } from '../../lib/api';

// =======================
// Thunks
// =======================

// Register
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/register', { name, email, password });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/login', { email, password });
      return data;
    } catch (err) {
      console.log('err: ', err);
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// Get current user
export const me = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/me');
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);

// =======================
// Initial state
// =======================
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (initialToken) setAuthToken(initialToken);

const initialState = {
  user: null,
  status: 'idle',   // idle | loading | succeeded | failed
  error: null,
  token: initialToken,
};

// =======================
// Slice
// =======================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.token = null;
      if (typeof window !== 'undefined') localStorage.removeItem('token');
      setAuthToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (typeof window !== 'undefined') localStorage.setItem('token', action.payload.token);
        setAuthToken(action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        if (typeof window !== 'undefined') localStorage.setItem('token', action.payload.token);
        setAuthToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Me
      .addCase(me.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(me.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

// =======================
// Exports
// =======================
export const { logout } = authSlice.actions;
export default authSlice.reducer;
