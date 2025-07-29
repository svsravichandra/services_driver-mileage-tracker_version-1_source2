
import React from 'react';
import { View } from '../types';
import { HomeIcon, ChartBarIcon } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const navItems = [
    { view: View.MAIN, label: 'Home', icon: <HomeIcon /> },
    { view: View.DASHBOARD, label: 'Dashboard', icon: <ChartBarIcon /> },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-900 text-gray-100 font-sans shadow-2xl">
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </main>
      <nav className="flex justify-around items-center bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 shadow-t-lg">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-16 transition-colors duration-200 ${
              currentView === item.view ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-6 h-6 mb-1">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
