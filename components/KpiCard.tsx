import React from 'react';

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-5">
      <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-4 rounded-full">
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
};

export default KpiCard;
