
export interface GroceryItem {
  id: string;
  name: string;
  note?: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FilterStatus = 'All' | 'Active' | 'Purchased';

export interface AppState {
  items: GroceryItem[];
  filter: FilterStatus;
  searchQuery: string;
}
