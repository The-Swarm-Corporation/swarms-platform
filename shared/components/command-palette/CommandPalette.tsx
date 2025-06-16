"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NAV_LINKS, SIDE_BAR_MENU } from '../panel-layout/components/const';
import { Blocks, CircleGauge, LayoutDashboard, LockKeyhole, Settings, User, Building2, LogOut, FileText, FileSpreadsheet, GripVertical, MessageSquareMore, Atom, Lightbulb } from 'lucide-react';
import Discord from '../icons/Discord';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Combine all navigation items into a single array
  const allItems = [
    ...SIDE_BAR_MENU.platform || [],
    ...SIDE_BAR_MENU.base || [],
    ...NAV_LINKS.account || [],
    ...NAV_LINKS.external || [],
  ];

  // Filter items based on search
  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-4 bg-black/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-gray-800">
        <div className="p-4 border-b border-gray-800 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="w-full bg-gray-900/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 border border-gray-800 placeholder-gray-500"
            autoFocus
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <span className="text-xs text-gray-500">Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 rounded border border-gray-700">esc</kbd> to exit</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Close command palette"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.link) {
                  router.push(item.link);
                }
                onClose();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-900/50 transition-colors duration-200 border-b border-gray-800 last:border-b-0 group"
            >
              <div className="text-gray-400 group-hover:text-white transition-colors duration-200">
                {item.icon}
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors duration-200">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette; 