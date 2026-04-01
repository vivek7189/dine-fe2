'use client';

import { useState, useRef, useEffect } from 'react';

export default function ComboBox({ options = [], value, onChange, placeholder, label, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = value ? value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(filter.toLowerCase())
  );

  const showCreateNew = filter.trim() && !options.some(
    opt => opt.toLowerCase() === filter.trim().toLowerCase()
  );

  function formatLabel(cat) {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  function handleSelect(cat) {
    onChange(cat);
    setFilter('');
    setIsOpen(false);
  }

  function handleCreateNew() {
    const newCat = filter.trim().toLowerCase().replace(/\s+/g, '_');
    onChange(newCat);
    setFilter('');
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || 'Search or type new...'}
        value={isOpen ? filter : displayValue}
        onChange={(e) => {
          setFilter(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setFilter('');
        }}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 placeholder:text-gray-400 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {filtered.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                value === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {formatLabel(cat)}
            </button>
          ))}
          {showCreateNew && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 border-t border-gray-100 font-medium cursor-pointer"
            >
              + Create &ldquo;{filter.trim()}&rdquo;
            </button>
          )}
          {!filtered.length && !showCreateNew && (
            <div className="px-3 py-2 text-sm text-gray-400">No categories found</div>
          )}
        </div>
      )}
    </div>
  );
}
