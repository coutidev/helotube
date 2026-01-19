
import React from 'react';

interface HeaderProps {
  onUploadClick: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUploadClick, onHomeClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#272727] rounded-full hidden md:block">
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M21 6H3V5h18v1m0 5H3V10h18v1m0 5H3v-1h18v1Z"/></svg>
        </button>
        <div 
          className="flex items-center gap-1 cursor-pointer" 
          onClick={onHomeClick}
        >
          <div className="bg-red-600 rounded-lg p-1">
             <svg className="w-6 h-4 fill-white" viewBox="0 0 24 24">
               <path d="M10 15l5.19-3L10 9v6zM24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z"/>
             </svg>
          </div>
          <span className="text-xl font-bold tracking-tighter">HeloTube</span>
          <span className="text-[10px] text-gray-400 self-start mt-1 ml-0.5">BR</span>
        </div>
      </div>

      <div className="flex-1 max-w-[720px] mx-4 hidden md:flex items-center">
        <div className="flex flex-1 items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 py-1.5 focus-within:border-blue-500">
          <input 
            type="text" 
            placeholder="Pesquisar" 
            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
          />
        </div>
        <button className="bg-[#222222] border border-l-0 border-[#303030] rounded-r-full px-5 py-1.5 hover:bg-[#272727]">
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onUploadClick}
          className="flex items-center gap-1.5 bg-[#272727] hover:bg-[#3f3f3f] px-3 py-1.5 rounded-full transition-colors group"
        >
          <svg className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h14V6zM2 5h16v14H2V5zm18 3h2v10h-2V8z"/>
          </svg>
          <span className="text-sm font-medium hidden sm:inline pr-1">Criar</span>
        </button>
        <button className="p-2 hover:bg-[#272727] rounded-full">
          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M10 20h4c0 1.1-.9 2-2 2s-2-.9-2-2zm10-2.65V19H4v-1.65l2-1.88v-5.15C6 7.4 8.56 4.89 11.5 4.14V3.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v.64c2.94.75 5.5 3.26 5.5 6.18v5.15l2 1.88z"/></svg>
        </button>
        <img 
          src="https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png" 
          className="w-8 h-8 rounded-full object-cover border border-zinc-700 ml-2" 
          alt="Avatar" 
        />
      </div>
    </header>
  );
};

export default Header;
