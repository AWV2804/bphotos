import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <div
      className={`fixed top-16 left-0 h-full bg-gray-800 text-white flex flex-col p-4 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: '250px' }}
    >
      <h2 className="text-2xl font-bold mb-4">Menu</h2>
      <Link to="/upload" className="mb-2 px-4 py-2 bg-blue-600 rounded-md text-center">
        Upload
      </Link>
      <Link to="/search" className="mb-2 px-4 py-2 bg-blue-600 rounded-md text-center">
        Search
      </Link>
    </div>
  );
};

export default Sidebar;