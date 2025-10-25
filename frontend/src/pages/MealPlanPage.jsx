import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import MealPlanTable from "../components/MealPlanTable.jsx";
import DashNav from "../components/DashNav.jsx";

const MealPlanPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => setRefreshKey(k => k + 1);
    window.addEventListener('mealplan:updated', handler);
    return () => window.removeEventListener('mealplan:updated', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30">
      <DashNav />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 w-full"
      >
        <div className="w-full">
          <MealPlanTable key={`mealplan-${refreshKey}`} />
        </div>
      </motion.main>
    </div>
  );
};

export default MealPlanPage;
