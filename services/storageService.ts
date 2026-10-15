
import { GroceryItem } from '../types';
import { STORAGE_KEY, INITIAL_ITEMS } from '../constants';

export const storageService = {
  saveItems: (items: GroceryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save items to storage:', error);
    }
  },

  loadItems: (): GroceryItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return INITIAL_ITEMS;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load items from storage:', error);
      return INITIAL_ITEMS;
    }
  },

  exportToJSON: (items: GroceryItem[]) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `grocery_list_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
};
