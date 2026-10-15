
import { GroceryItem } from './types';

export const INITIAL_ITEMS: GroceryItem[] = [
  {
    id: '1',
    name: 'Milk',
    note: '2% or whole',
    purchased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Eggs',
    note: 'one dozen',
    purchased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Rice',
    note: 'basmati if available',
    purchased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Tomatoes',
    purchased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Dish soap',
    note: 'lemon scent',
    purchased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const STORAGE_KEY = 'quickcart_items_v1';
