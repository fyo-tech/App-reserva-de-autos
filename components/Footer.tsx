import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white/70 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-700 mt-auto py-3">
      <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>&copy; {currentYear} FYO. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;