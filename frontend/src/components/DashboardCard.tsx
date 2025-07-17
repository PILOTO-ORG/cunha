import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-500 text-blue-600 bg-blue-50',
  green: 'bg-green-500 text-green-600 bg-green-50',
  yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
  red: 'bg-red-500 text-red-600 bg-red-50',
  purple: 'bg-purple-500 text-purple-600 bg-purple-50',
  indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50',
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  onClick
}) => {
  const [bgColor, , cardBg] = colorClasses[color].split(' ');

  return (
    <div 
      className={`${cardBg} p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs. mês anterior</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-full`}>
          <span className="text-2xl text-white">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
