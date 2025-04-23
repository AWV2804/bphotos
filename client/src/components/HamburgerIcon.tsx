import React from 'react';

interface HamburgerIconProps {
  toggleSidebar: () => void;
}

const HamburgerIcon: React.FC<HamburgerIconProps> = ({ toggleSidebar }) => {
  return (
    <button
      className="flex flex-col items-center justify-center w-10 h-10 space-y-1.5 focus:outline-none hover:outline-2 hover:outline-offset-2 hover:outline-zinc-400"
      onClick={toggleSidebar}
    >
      <div className="w-7 h-1 bg-white transition-transform duration-300 ease-in-out"></div>
      <div className="w-7 h-1 bg-white transition-opacity duration-300 ease-in-out"></div>
      <div className="w-7 h-1 bg-white transition-transform duration-300 ease-in-out"></div>
    </button>
  );
};

export default HamburgerIcon;