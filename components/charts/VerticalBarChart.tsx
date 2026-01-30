
import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface VerticalBarChartProps {
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

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ title, data }) => {
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
      <div className="flex justify-around items-end h-64 gap-4">
        {data.map((item, index) => (
          <div key={item.label} className="flex flex-col items-center justify-end flex-1 h-full w-0 min-w-0">
            <div
                className="w-full rounded-t-md transition-all duration-700 ease-out flex items-start justify-center pt-1"
                style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: barColors[index % barColors.length],
                }}
            >
                <span className="text-xs font-bold text-white">{item.value}</span>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-2 text-center break-words w-full h-8">{item.label}</p>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};

export default VerticalBarChart;
