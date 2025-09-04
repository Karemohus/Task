import React from 'react';
import { CheckCircleIcon } from './Icons';
import { useSiteTitle } from '../hooks/useSiteTitle';

const Header: React.FC = () => {
  const { title, setTitle } = useSiteTitle();

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
      const newTitle = e.currentTarget.textContent || 'Modern To-Do';
      setTitle(newTitle.trim());
  };

  return (
    <header className="bg-white dark:bg-slate-800/50 shadow-md">
      <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center gap-3">
         <CheckCircleIcon className="w-8 h-8 text-sky-500 flex-shrink-0"/>
        <h1
          contentEditable
          suppressContentEditableWarning={true}
          onBlur={handleTitleChange}
          className="text-2xl font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 rounded-md px-1 min-w-[100px]"
        >
          {title}
        </h1>
      </div>
    </header>
  );
};

export default Header;
