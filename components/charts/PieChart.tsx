import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  title: string;
  data: ChartData[];
}

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">{title}</h3>
        {children}
    </div>
);

const EmptyState: React.FC = () => (
    <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">No hay suficientes datos para mostrar.</p>
    </div>
);

const barColors = ['#00A9E0', '#8CC63F', '#002B49', '#FDB913', '#E10600', '#6F4E37', '#9F00FF'];

const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
  if (!data || data.length === 0) {
    return (
        <ChartContainer title={title}>
            <EmptyState />
        </ChartContainer>
    );
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);

  const PieSlice: React.FC<{ percentage: number; color: string; offset: number }> = ({ percentage, color, offset }) => {
    const r = 40;
    const circumference = 2 * Math.PI * r;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((offset / 100) * circumference);

    return (
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="transparent"
        stroke={color}
        strokeWidth="15"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 50 50)"
        className="transition-all duration-700"
      />
    );
  };
  
  let accumulatedPercentage = 0;

  return (
    <ChartContainer title={title}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {data.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        const slice = <PieSlice key={item.label} percentage={percentage} color={barColors[index % barColors.length]} offset={accumulatedPercentage} />;
                        accumulatedPercentage += percentage;
                        return slice;
                    })}
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{total}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{total === 1 ? 'Día en Total' : 'Días en Total'}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-x-6 gap-y-3">
                {data.map((item, index) => (
                    <div key={item.label} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: barColors[index % barColors.length] }}></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300 truncate pr-2">{item.label}</span>
                        <span className="ml-auto text-sm font-semibold text-slate-800 dark:text-white">{total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%</span>
                    </div>
                ))}
            </div>
        </div>
    </ChartContainer>
  );
};

export default PieChart;