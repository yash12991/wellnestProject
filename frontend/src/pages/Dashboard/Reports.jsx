import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import DashNav from "../../components/DashNav.jsx";
import { API_URL } from "../../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  FireIcon,
  HeartIcon,
  ChartBarIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

const COLORS = ["#10B981", "#F59E0B", "#3B82F6"];

const Reports = () => {
  const [dailyCalories, setDailyCalories] = useState([]);
  const [completedMeals, setCompletedMeals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [nutrientTotals, setNutrientTotals] = useState({
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [mealPlan, setMealPlan] = useState([]);
  const [stats, setStats] = useState({
    averageCalories: 0,
    completionPercent: 0,
    mostCommonTag: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("accessToken");

  const fetchData = async () => {
    try {
      const [caloriesRes, completedRes, favRes] = await Promise.all([
        axios.get(`${API_URL}/v1/api/mealplan/${user._id}/dailyCalories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/v1/api/mealplan/${user._id}/completed-meals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/v1/api/${user._id}/favourites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      console.log("Calories Response:", caloriesRes.data);
      console.log("Completed Meals Response:", completedRes.data);
      console.log("Favorites Response:", favRes.data);

      const caloriesData = caloriesRes.data.dailyCalories || [];
      const completedData = completedRes.data.completedMeals || [];
      const favData = favRes.data.favourites || [];
      const mealPlanRes = await axios.get(
        `${API_URL}/v1/api/mealplan/latest/${user._id}`
      );
      setMealPlan(mealPlanRes.data.week || []);
      setDailyCalories(caloriesData);
      setCompletedMeals(completedData);
      setFavorites(favData);

      const nutrients = completedData.reduce(
        (acc, meal) => {
          acc.protein += meal.protein || 0;
          acc.carbs += meal.carbs || 0;
          acc.fats += meal.fats || 0;
          return acc;
        },
        { protein: 0, carbs: 0, fats: 0 }
      );
      console.log("Nutrient Totals:", nutrients);
      setNutrientTotals(nutrients);

      const avgCalories =
        caloriesData.length > 0
          ? (
              caloriesData.reduce((sum, d) => sum + d.totalCalories, 0) /
              caloriesData.length
            ).toFixed(1)
          : 0;

      const totalMeals = 7 * 3;
      const completionPercent = (
        (completedData.length / totalMeals) *
        100
      ).toFixed(1);

      const tagCounts = {};
      favData.forEach((meal) => {
        (meal.tags || []).forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const mostCommonTag =
        Object.keys(tagCounts).length > 0
          ? Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0][0]
          : "None";

      setStats({
        averageCalories: avgCalories,
        completionPercent,
        mostCommonTag,
      });
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    }
  };

  useEffect(() => {
    if (!user?._id || !token) return;
    fetchData();
  }, [user?._id, token]);

  // Listen for meal logged events to refresh data in real-time
  useEffect(() => {
    const handleMealLogged = () => {
      if (user?._id && token) {
        fetchData();
      }
    };

    window.addEventListener('mealLogged', handleMealLogged);

    return () => {
      window.removeEventListener('mealLogged', handleMealLogged);
    };
  }, [user?._id, token]);

  const favoriteCounts = favorites.reduce((acc, meal) => {
    acc[meal.dishName] = (acc[meal.dishName] || 0) + 1;
    return acc;
  }, {});
  const favoriteData = Object.entries(favoriteCounts).map(([name, count]) => ({
    name,
    count,
  }));

  console.log("Completed Meals:", completedMeals);

  const calculateStreak = (completedMeals, mealPlan) => {
    if (!completedMeals || !mealPlan || mealPlan.length === 0)
      return { current: 0, longest: 0 };

    const completedSet = new Set(
      completedMeals.map(
        (m) => `${m.day?.toLowerCase()}-${m.mealType?.toLowerCase()}`
      )
    );

    let streak = 0;
    let maxStreak = 0;

    for (const dayEntry of mealPlan) {
      const dayName = dayEntry.day?.toLowerCase();
      const mealObject = dayEntry.meals ? dayEntry.meals : dayEntry;
      const mealKeys = Object.keys(mealObject).filter(
        (k) => k !== "day" && typeof mealObject[k] === "object"
      );

      const allCompleted = mealKeys.every((mealKey) =>
        completedSet.has(`${dayName}-${mealKey.toLowerCase()}`)
      );

      console.log(dayName, mealKeys, Array.from(completedSet));

      if (allCompleted) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 0;
      }
    }
    return { current: streak, longest: maxStreak };
  };

  const streakData = calculateStreak(completedMeals, mealPlan);
  console.log("Streak Data:", streakData);

  const dailyGoal = 2000;
  const totalCalories = mealPlan.reduce((acc, day) => {
    const dayCalories = Object.keys(day)
      .filter((k) => k !== "day")
      .reduce((sum, key) => sum + (day[key]?.calories || 0), 0);
    return acc + dayCalories;
  }, 0);

  const avgCalories = Math.round(totalCalories / mealPlan.length);
  const percentage = Math.min((avgCalories / dailyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-white">
      <DashNav />

      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-16 px-6 mt-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <ChartBarIcon className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Track your nutrition journey with detailed insights
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-12">
        {/* Quick Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Average Calories Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <FireIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Daily Avg
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageCalories}
            </h3>
            <p className="text-gray-500 text-sm">kcal per day</p>
          </div>

          {/* Completion Rate Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Completion
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.completionPercent}%
            </h3>
            <p className="text-gray-500 text-sm">of weekly meals</p>
          </div>

          {/* Favorite Tag Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Top Tag
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stats.mostCommonTag}
            </h3>
            <p className="text-gray-500 text-sm">most common preference</p>
          </div>
        </motion.div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Calorie Intake Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                <FireIcon className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Daily Calorie Intake
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyCalories}>
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalCalories"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Meal Completion Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
                <StarIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Weekly Progress
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-48 h-48 mb-4">
                <CircularProgressbar
                  value={stats.completionPercent}
                  text={`${stats.completionPercent}%`}
                  styles={buildStyles({
                    textSize: "16px",
                    textColor: "#111827",
                    pathColor: "#10B981",
                    trailColor: "#F3F4F6",
                    pathTransitionDuration: 0.5,
                  })}
                />
              </div>
              <p className="text-gray-600 text-center max-w-xs">
                You've completed{" "}
                <span className="font-bold text-emerald-600">
                  {stats.completionPercent}%
                </span>{" "}
                of your weekly meal plan
              </p>
            </div>
          </motion.div>

          {/* Favorite Meals Section (Vertical List) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg">
                <HeartIcon className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Top Favorite Meals
              </h2>
            </div>

            {favoriteData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <HeartIcon className="h-16 w-16 mb-3 opacity-30" />
                <p className="text-sm">No favorites added yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                {favoriteData.map((fav, index) => (
                  <motion.div
                    key={fav.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <HeartIcon className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {fav.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Added {fav.count}×
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Streak Tracker */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <TrophyIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">Streak Tracker</h2>
            </div>
            <p className="text-amber-100 mb-8">Keep the momentum going!</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <div className="text-5xl font-bold mb-2">
                  {streakData.current}
                </div>
                <div className="text-amber-100 text-sm uppercase tracking-wide">
                  Current Streak
                </div>
                <div className="text-xs text-amber-200 mt-1">days</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                <div className="text-5xl font-bold mb-2">
                  {streakData.longest}
                </div>
                <div className="text-amber-100 text-sm uppercase tracking-wide">
                  Best Streak
                </div>
                <div className="text-xs text-amber-200 mt-1">days</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Calorie Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Calorie Goal Progress
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Average daily intake compared to your target goal
          </p>
          <div className="relative w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
            ></motion.div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Goal
              </p>
              <p className="text-lg font-bold text-gray-900">
                {dailyGoal} kcal
              </p>
            </div>
            <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">
                {Math.round(percentage)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Average
              </p>
              <p className="text-lg font-bold text-gray-900">
                {avgCalories} kcal
              </p>
            </div>
          </div>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold">Weekly Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">
                Average Calories
              </p>
              <p className="text-3xl font-bold">{stats.averageCalories}</p>
              <p className="text-gray-400 text-xs mt-1">kcal/day</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">
                Most Common Tag
              </p>
              <p className="text-3xl font-bold">{stats.mostCommonTag}</p>
              <p className="text-gray-400 text-xs mt-1">preference</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">
                Completed Meals
              </p>
              <p className="text-3xl font-bold">{completedMeals.length}</p>
              <p className="text-gray-400 text-xs mt-1">this week</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
