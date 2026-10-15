
import React from 'react';
import { FilterStatus } from '../types';

interface FilterBarProps {
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter, searchQuery, setSearchQuery, totalCount }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sticky top-0 bg-[#f8fafc] z-10 py-2">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search items or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex bg-slate-200 p-1 rounded-lg">
          {(['All', 'Active', 'Purchased'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
        </span>
      </div>
    </div>
  );
};

export default FilterBar;
