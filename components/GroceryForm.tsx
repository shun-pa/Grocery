
import React, { useState } from 'react';

interface GroceryFormProps {
  onAdd: (name: string, note?: string) => void;
  existingNames: string[];
}

const GroceryForm: React.FC<GroceryFormProps> = ({ onAdd, existingNames }) => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), note.trim() || undefined);
      setName('');
      setNote('');
      setShowNote(false);
    }
  };

  const isDuplicate = existingNames.some(
    (existing) => existing.toLowerCase() === name.trim().toLowerCase()
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Add item (e.g., Bread)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Grocery item name"
          />
          {isDuplicate && name.trim().length > 0 && (
            <p className="text-xs text-amber-600 mt-1 absolute -bottom-5 left-1">
              ⚠️ This item is already on your list.
            </p>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
            showNote ? 'bg-slate-200 border-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {showNote ? 'Hide Note' : 'Add Note'}
        </button>

        <button
          type="submit"
          disabled={!name.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          Add Item
        </button>
      </div>

      {showNote && (
        <div className="animate-fade-in">
          <textarea
            placeholder="Optional note (e.g., specific brand, quantity)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] text-sm"
            aria-label="Optional note"
          />
        </div>
      )}
    </form>
  );
};

export default GroceryForm;
