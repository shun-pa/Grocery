
import React, { useState } from 'react';
import { GroceryItem as GroceryItemType } from '../types';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string, note?: string) => void;
}

const GroceryItem: React.FC<GroceryItemProps> = ({ item, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editNote, setEditNote] = useState(item.note || '');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(item.id, editName.trim(), editNote.trim() || undefined);
      setIsEditing(false);
    }
  };

  const timeString = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isEditing) {
    return (
      <div className="p-4 bg-slate-900 border border-blue-500 rounded-xl shadow-2xl space-y-3 animate-fade-in">
        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Editing Item</label>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          autoFocus
        />
        <textarea
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[60px]"
          placeholder="Note..."
        />
        <div className="flex gap-4 justify-end items-center pt-1">
          <button 
            onClick={() => setIsEditing(false)} 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex flex-col p-4 bg-white rounded-xl shadow-sm border transition-all duration-200 ${
      item.purchased ? 'border-slate-100 bg-slate-50 opacity-75' : 'border-slate-200 hover:border-blue-200'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={() => onToggle(item.id)}
          className="mt-1.5 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium leading-tight truncate ${item.purchased ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {item.name}
          </h3>
          {item.note && (
            <p className={`mt-1 text-sm ${item.purchased ? 'text-slate-400' : 'text-slate-500 italic'}`}>
              {item.note}
            </p>
          )}
          <span className="text-[10px] text-slate-400 mt-2 block">
            Added {timeString}
          </span>
        </div>

        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!item.purchased && (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Edit item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button 
            onClick={() => setShowConfirmDelete(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showConfirmDelete && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 animate-fade-in">
          <p className="text-xs text-red-700 font-medium mb-2">Are you sure you want to delete this?</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowConfirmDelete(false)} className="text-xs px-2 py-1 text-slate-500 hover:text-slate-700">Cancel</button>
            <button onClick={() => onDelete(item.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded font-bold">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryItem;
