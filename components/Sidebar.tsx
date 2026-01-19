
import React from 'react';

interface SidebarProps {
  activeSection: 'home' | 'shorts';
  onHomeClick: () => void;
  onShortsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onHomeClick, onShortsClick }) => {
  const items = [
    { 
      name: 'Início', 
      id: 'home',
      icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M4 21V10.08l8-6.92 8 6.92V21h-7v-6h-2v6H4z"/></svg>,
      action: onHomeClick
    },
    { 
      name: 'Shorts', 
      id: 'shorts',
      icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M17.77 10.32l-1.2-.5L18 8.82a3.74 3.74 0 00-3.5-5.66 3.7 3.7 0 00-1.3.27l-6.23 2.61a3.72 3.72 0 00-1.8 4.93l1.2 2.5L4 14.53a3.74 3.74 0 003.5 5.66 3.7 3.7 0 001.3-.27l6.23-2.61a3.72 3.72 0 001.8-4.93l-1.2-2.5 1.25.54a3.74 3.74 0 004.9-2.1zM10 14.5v-5l4.5 2.5-4.5 2.5z"/></svg>,
      action: onShortsClick
    },
    { name: 'Inscrições', icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M18.7 8.7H5.3V7h13.4v1.7zm-1.7-5H7v1.7h10V3.7zm3.3 8.3v11H3.7V12h16.6zm-1.7 1.7H5.3v7.6h11.7v-7.6zm-6.7 5.1V15l3.8 1.9-3.8 1.9z"/></svg> },
    { divider: true },
    { name: 'Você', icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9zm0 16.5c-4.14 0-7.5-3.36-7.5-7.5S7.86 4.5 12 4.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zM10.5 15l5-3-5-3v6z"/></svg> },
    { name: 'Histórico', icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M14.97 16.95L10 13.87V7h2v5.76l4.03 2.49-1.06 1.7zM22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10zm-1 0c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9 9-4.03 9-9z"/></svg> },
    { divider: true },
    { name: 'Em Alta', icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M17.53 11.2c-.23-.3-.5-.56-.76-.82-.65-.6-1.4-1.03-2.03-1.66-1.46-1.46-1.78-3.87-.85-5.72-.03 0-.06.04-.09.04-2.32 1.25-3.19 3.98-2.62 6.39.01.06.03.1.03.16-.49-.34-.95-.71-1.32-1.15-.88-.93-1.41-2.05-1.49-3.2-.02-.26-.23-.45-.47-.45-.04 0-.07 0-.1.01-1.25.26-2.33 1-2.98 2.01-1.42 2.23-1.39 5.31.11 7.6 1.15 1.75 3.01 2.63 4.85 2.63 1.28 0 2.57-.42 3.63-1.28.6-.48 1.1-.1.97.05-.28.32-.58.61-.9.89-.96.84-2.14 1.34-3.4 1.49-.24.03-.4.26-.35.49.03.19.2.32.39.32.03 0 .07 0 .1-.01 1.76-.2 3.39-.99 4.61-2.23 2.26-2.31 2.82-5.71 1.35-8.58z"/></svg> },
    { name: 'Música', icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg> },
  ];

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-18 md:w-60 bg-[#0f0f0f] hidden sm:block overflow-y-auto z-40 px-2 py-4 border-r border-zinc-800/50">
      {items.map((item, idx) => {
        if (item.divider) return <div key={idx} className="my-3 border-t border-[#303030]" />;
        const isActive = item.id === activeSection;
        return (
          <div 
            key={idx} 
            onClick={item.action}
            className={`flex flex-col md:flex-row items-center gap-4 p-3 hover:bg-[#272727] rounded-xl cursor-pointer transition-all active:scale-95 group ${isActive ? 'bg-[#272727]' : ''}`}
          >
            {item.icon && (
              <item.icon 
                className={`w-6 h-6 group-hover:scale-110 transition-transform ${isActive ? 'fill-white' : 'fill-white/70 group-hover:fill-white'}`} 
              />
            )}
            <span className={`text-[10px] md:text-sm ${isActive ? 'font-bold text-white' : 'font-medium text-white/70 group-hover:text-white'}`}>
              {item.name}
            </span>
          </div>
        );
      })}
    </aside>
  );
};

export default Sidebar;
