// Redux State Types
export interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  token: string | null;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface Order {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrdersState {
  items: Order[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  products: ProductsState;
  cart: CartState;
  orders: OrdersState;
}
