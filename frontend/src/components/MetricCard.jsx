import React from 'react';
import { motion } from 'framer-motion';

const colorToClass = {
  blue: 'from-blue-50 to-sky-50 text-blue-700',
  yellow: 'from-yellow-50 to-amber-50 text-yellow-700',
  green: 'from-green-50 to-emerald-50 text-green-700',
  pink: 'from-pink-50 to-rose-50 text-pink-700',
};

const MetricCard = ({ title, value, goal, subtitle, icon: Icon, color = 'blue', index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className={`p-4 rounded-2xl bg-gradient-to-br ${colorToClass[color] || colorToClass.blue} shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
          {goal && <div className="text-xs text-gray-500 mt-1">{goal}</div>}
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;


