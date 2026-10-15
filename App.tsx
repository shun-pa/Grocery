
import React, { useState, useEffect, useMemo } from 'react';
import { GroceryItem as GroceryItemType, FilterStatus } from './types';
import { storageService } from './services/storageService';
import { getSmartSuggestions } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { INITIAL_ITEMS } from './constants';
import GroceryForm from './components/GroceryForm';
import GroceryItem from './components/GroceryItem';
import FilterBar from './components/FilterBar';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [items, setItems] = useState<GroceryItemType[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Items from Supabase
  const fetchItems = async () => {
    if (!session) return;
    setIsSyncing(true);
    const { data, error } = await supabase
      .from('groceries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching groceries:', error);
    } else if (data) {
      const mapped: GroceryItemType[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        note: d.note,
        purchased: d.purchased,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));
      setItems(mapped);
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    if (session) {
      fetchItems();
    }
  }, [session]);

  // Actions
  const addItem = async (name: string, note?: string) => {
    if (!session) return;
    setIsSyncing(true);
    const { data, error } = await supabase
      .from('groceries')
      .insert([{ 
        name, 
        note, 
        purchased: false, 
        user_id: session.user.id 
      }])
      .select();

    if (!error && data) {
      const newItem: GroceryItemType = {
        id: data[0].id,
        name: data[0].name,
        note: data[0].note,
        purchased: data[0].purchased,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setIsSyncing(false);
  };

  const seedSampleItems = async () => {
    if (!session) return;
    setIsSyncing(true);
    const samples = INITIAL_ITEMS.map(item => ({
      name: item.name,
      note: item.note,
      purchased: false,
      user_id: session.user.id
    }));

    const { error } = await supabase
      .from('groceries')
      .insert(samples);

    if (!error) {
      fetchItems();
    }
    setIsSyncing(false);
  };

  const togglePurchased = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    setIsSyncing(true);
    const { error } = await supabase
      .from('groceries')
      .update({ purchased: !item.purchased, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, purchased: !i.purchased, updatedAt: new Date().toISOString() } : i
        )
      );
    }
    setIsSyncing(false);
  };

  const deleteItem = async (id: string) => {
    setIsSyncing(true);
    const { error } = await supabase
      .from('groceries')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    setIsSyncing(false);
  };

  const editItem = async (id: string, name: string, note?: string) => {
    setIsSyncing(true);
    const { error } = await supabase
      .from('groceries')
      .update({ name, note, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, name, note, updatedAt: new Date().toISOString() } : item
        )
      );
    }
    setIsSyncing(false);
  };

  const clearPurchased = async () => {
    const purchasedIds = items.filter(i => i.purchased).map(i => i.id);
    if (purchasedIds.length === 0) return;

    setIsSyncing(true);
    const { error } = await supabase
      .from('groceries')
      .delete()
      .in('id', purchasedIds);

    if (!error) {
      setItems((prev) => prev.filter((item) => !item.purchased));
    }
    setIsSyncing(false);
  };

  const clearAll = async () => {
    if (window.confirm('Are you absolutely sure you want to delete EVERYTHING for the family?')) {
      setIsSyncing(true);
      const { error } = await supabase
        .from('groceries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

      if (!error) {
        setItems([]);
      }
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // AI Suggestions
  const handleFetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    const result = await getSmartSuggestions(items.map(i => i.name));
    setSuggestions(result);
    setIsLoadingSuggestions(false);
  };

  // Filtering & Sorting
  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesFilter = 
          filter === 'All' ? true :
          filter === 'Active' ? !item.purchased :
          item.purchased;
        
        const lowerQuery = searchQuery.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(lowerQuery) || 
          (item.note?.toLowerCase().includes(lowerQuery));

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        if (a.purchased !== b.purchased) {
          return a.purchased ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [items, filter, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Q</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">QuickCart</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{session.user.email}</p>
            </div>
            {isSyncing && (
              <div className="ml-2 animate-pulse">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
             <button 
              onClick={() => storageService.exportToJSON(items)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Export List"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        <GroceryForm 
          onAdd={addItem} 
          existingNames={items.map(i => i.name)} 
        />

        <FilterBar 
          filter={filter} 
          setFilter={setFilter} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          totalCount={filteredAndSortedItems.length}
        />

        <div className="flex gap-3 mb-6">
          <button 
            onClick={clearPurchased}
            className="flex-1 py-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Clear Purchased
          </button>
          <button 
            onClick={handleFetchSuggestions}
            disabled={isLoadingSuggestions}
            className="flex-1 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isLoadingSuggestions ? 'Thinking...' : '✨ Family Suggestions'}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Suggested for your family</h3>
              <button onClick={() => setSuggestions([])} className="text-blue-400 hover:text-blue-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    addItem(s);
                    setSuggestions(prev => prev.filter(p => p !== s));
                  }}
                  className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="text-slate-200 mb-4 flex justify-center">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-600">Your list is empty</h3>
              <p className="text-slate-400 text-sm mt-1 mb-6">Start adding items or load some samples.</p>
              <button
                onClick={seedSampleItems}
                disabled={isSyncing}
                className="px-6 py-2 border-2 border-blue-100 text-blue-600 font-bold rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all text-sm"
              >
                Load Sample Items
              </button>
            </div>
          ) : (
            filteredAndSortedItems.map((item) => (
              <GroceryItem
                key={item.id}
                item={item}
                onToggle={togglePurchased}
                onDelete={deleteItem}
                onEdit={editItem}
              />
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <button 
            onClick={clearAll}
            className="w-full mt-10 py-3 text-sm text-slate-400 hover:text-red-500 font-medium border border-dashed border-slate-200 rounded-lg transition-colors"
          >
            Reset Family List
          </button>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 py-12 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} QuickCart - Family Sync Enabled</p>
      </footer>
    </div>
  );
};

export default App;
