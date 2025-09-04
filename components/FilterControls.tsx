
import React from 'react';
import type { Filters } from '../types';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../constants';
import { SearchIcon } from './Icons';

interface FilterControlsProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, setFilters, searchTerm, setSearchTerm }) => {
    
    const handleFilterChange = <K extends keyof Filters,>(key: K, value: Filters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg space-y-6">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Filters & Search</h3>
            
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value as Filters['status'])}
                        className="w-full p-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    >
                        <option value="all">All</option>
                        <option value="todo">To Do</option>
                        <option value="done">Done</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Priority</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value as Filters['priority'])}
                        className="w-full p-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    >
                        <option value="all">All</option>
                        {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Category</label>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value as Filters['category'])}
                        className="w-full p-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    >
                        <option value="all">All</option>
                        {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterControls;
