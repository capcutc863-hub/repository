// This file is no longer the source of truth for data.
// Data is now fetched from Supabase.
// This file can be kept for reference or removed.

import type { Product, Customer, SalesRep, User } from './types';

// Use fixed, non-random IDs for initial data to ensure consistency.
export const INITIAL_USERS: User[] = [];

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [];

export const INITIAL_SALES_REPS: SalesRep[] = [];

export const INITIAL_CUSTOMERS: Omit<Customer, 'id'>[] = [];

    