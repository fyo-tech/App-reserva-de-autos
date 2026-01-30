
import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  title: string;
  data: ChartData[];
}

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-full">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">{title}</h3>
        {children}
    </div>
);

const EmptyState: React.FC = () => (
    <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">No hay suficientes datos para mostrar.</p>
    </div>
);

const barColors = ['#00A9E0', '#8CC63F', '#002B49', '#FDB913', '#E10600'];

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ title, data }) => {
  if (!data || data.length === 0) {
    return (
        <ChartContainer title={title}>
            <EmptyState />
        </ChartContainer>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <ChartContainer title={title}>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.label} className="group">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate pr-2">{item.label}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: barColors[index % barColors.length],
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};

export default HorizontalBarChart;
