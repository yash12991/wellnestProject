import React from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Weight,
  Heart,
  Flame,
  Activity,
  TrendingUp,
} from "lucide-react";
import MetricCard from "./MetricCard.jsx";

const MetricsDashboard = () => {
  const metrics = [
    {
      title: "Water",
      value: "2500ml",
      goal: "Goal: 3L",
      progress: 83,
      icon: Droplets,
      color: "blue",
    },
    {
      title: "Weight",
      value: "62kg",
      goal: "Goal: 56kg",
      progress: 75,
      icon: Weight,
      color: "yellow",
    },
    {
      title: "BPM",
      value: "95bpm",
      subtitle: "15min ago",
      progress: 0,
      icon: Heart,
      color: "green",
    },
    {
      title: "Calories",
      value: "320kcal",
      goal: "Left 1950",
      progress: 14,
      icon: Flame,
      color: "pink",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} index={index} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Activity</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
          >
            View all
          </motion.button>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Daily Intake</p>
                <p className="text-sm text-gray-500">Track your progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">300</p>
                <p className="text-xs text-gray-500">calories</p>
              </div>
              <div className="relative w-12 h-12">
                <svg
                  className="w-12 h-12 transform -rotate-90"
                  viewBox="0 0 48 48"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="stroke-gray-200"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="stroke-purple-500"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 20}
                    initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - 0.3) }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Goals this week</p>
                <p className="text-sm text-gray-500">You're on track!</p>
              </div>
            </div>
            <div className="text-green-600 font-semibold">85%</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MetricsDashboard;
