import React from 'react';

interface ViewControlsProps {
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'name' | 'size' | 'dateTaken';
  sortOrder: 'asc' | 'desc';
  isSelectionMode: boolean;
  selectedCount: number;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (sort: 'date' | 'name' | 'size' | 'dateTaken') => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onSelectionModeChange: (isSelectionMode: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSearch: (query: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom: number;
  maxZoom: number;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  viewMode,
  sortBy,
  sortOrder,
  isSelectionMode,
  selectedCount,
  onViewModeChange,
  onSortChange,
  onSortOrderChange,
  onSelectionModeChange,
  onSelectAll,
  onClearSelection,
  onSearch,
  zoom,
  onZoomChange,
  minZoom,
  maxZoom,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* View Mode Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Selection Mode Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectionModeChange(!isSelectionMode)}
              className={`p-2 rounded-md ${
                isSelectionMode
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={isSelectionMode ? "Exit Selection Mode" : "Enter Selection Mode"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </button>
            {isSelectionMode && (
              <>
                <button
                  onClick={onSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedCount === 0 ? "Select All" : "Deselect All"}
                </button>
                {selectedCount > 0 && (
                  <button
                    onClick={onClearSelection}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Selection
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, tags, date..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'date' | 'name' | 'size' | 'dateTaken')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="dateTaken">Date Taken</option>
              <option value="date">Upload Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    sortOrder === 'asc'
                      ? 'M5 15l7-7 7 7'
                      : 'M19 9l-7 7-7-7'
                  }
                />
              </svg>
            </button>
          </div>
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Magnifying glass with minus icon */}
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
              <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
            </svg>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              value={maxZoom - (zoom - minZoom)}
              onChange={(e) => onZoomChange(maxZoom - (Number(e.target.value) - minZoom))}
              className="w-32"
              title="Adjust thumbnail size"
            />
            {/* Magnifying glass with plus icon */}
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
              <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" />
              <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewControls; 