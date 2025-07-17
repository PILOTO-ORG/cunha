import React from 'react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  onClick: () => void;
}

const colorClasses = {
  blue: 'bg-blue-500 hover:bg-blue-600 text-blue-600 bg-blue-50',
  green: 'bg-green-500 hover:bg-green-600 text-green-600 bg-green-50',
  yellow: 'bg-yellow-500 hover:bg-yellow-600 text-yellow-600 bg-yellow-50',
  purple: 'bg-purple-500 hover:bg-purple-600 text-purple-600 bg-purple-50',
};

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  color,
  onClick
}) => {
  const [bgColor, hoverColor, , cardBg] = colorClasses[color].split(' ');

  return (
    <button
      onClick={onClick}
      className={`${cardBg} p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all text-left w-full group`}
    >
      <div className="flex items-start space-x-3">
        <div className={`${bgColor} ${hoverColor} p-2 rounded-lg transition-colors group-hover:scale-105`}>
          <span className="text-lg text-white">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default QuickAction;
