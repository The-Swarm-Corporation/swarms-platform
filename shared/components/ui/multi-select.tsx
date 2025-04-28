import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

type Option = {
  id: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selectedValues?: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: number;
  className?: string;
};

export default function MultiSelect({
  options,
  selectedValues = [],
  onChange,
  placeholder = 'Select options',
  disabled = false,
  maxHeight = 250,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedValues);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayOptions = options.filter((option) => option.id !== 'all');
  const hasAllOption = options.some((option) => option.id === 'all');
  const allOption = options.find((option) => option.id === 'all');

  useEffect(() => {
    setSelected(selectedValues);
  }, [selectedValues]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (id: string) => {
    let updatedSelection: string[];

    if (id === 'all') {
      if (displayOptions.every((option) => selected.includes(option.id))) {
        updatedSelection = [];
      } else {
        updatedSelection = displayOptions.map((option) => option.id);
      }
    } else {
      if (selected.includes(id)) {
        updatedSelection = selected.filter((item) => item !== id);
      } else {
        updatedSelection = [...selected, id];
      }

      const allRegularOptionsSelected = displayOptions.every((option) =>
        updatedSelection.includes(option.id),
      );
    }

    setSelected(updatedSelection);
    onChange(updatedSelection);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected([]);
    onChange([]);
  };

  const allSelected =
    displayOptions.length > 0 &&
    displayOptions.every((option) => selected.includes(option.id));

  const selectedLabels = options
    .filter((option) => selected.includes(option.id) && option.id !== 'all')
    .map((option) => option.label);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={cn(
          'flex items-center justify-between w-full p-2 rounded-md bg-transparent outline-0',
          className,
          isOpen
            ? 'border-primary/50 ring-2 ring-primary/20'
            : 'border-gray-300',
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'cursor-pointer',
        )}
        onClick={toggleDropdown}
      >
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {selected.length > 0 ? (
            <span className="text-sm truncate">
              {selectedLabels.join(', ')}
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center">
          {selected.length > 0 && !disabled && (
            <button
              onClick={clearAll}
              className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          )}
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 p-2 border rounded-md bg-[#1e1e1e] outline-0 shadow-lg">
          <div className="py-1 max-h-64 overflow-y-auto" style={{ maxHeight }}>
            {hasAllOption && allOption && (
              <div
                key="all"
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-primary/40"
                onClick={() => toggleOption('all')}
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 border rounded mr-2 ${allSelected ? 'bg-primary/50 border-primary/50' : 'border-gray-300'}`}
                >
                  {allSelected && <Check size={16} className="text-white" />}
                </div>
                <span>{allOption.label}</span>
              </div>
            )}

            {displayOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-primary/40"
                onClick={() => toggleOption(option.id)}
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 border rounded mr-2 ${selected.includes(option.id) ? 'bg-primary/50 border-primary/50' : 'border-gray-300'}`}
                >
                  {selected.includes(option.id) && (
                    <Check size={16} className="text-white" />
                  )}
                </div>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
