import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, children }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white flex flex-col p-4 transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: '250px' }}
    >
      <h2 className="text-2xl font-bold mb-4">Menu</h2>
      {children}
    </div>
  );
};

export default Sidebar;