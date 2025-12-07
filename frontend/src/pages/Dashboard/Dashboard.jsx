import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashNav from "../../components/DashNav";
import LogHistory from "../../components/LogHistory";
import {
  Check,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  Utensils,
  MessageCircle,
  ShoppingCart,
  Zap,
  Droplet,
  Percent,
  Star,
  TrendingUp,
  Activity,
  Moon,
} from "lucide-react";
import loaderGif from "../../assets/loader.gif";
import { API_ENDPOINTS, API_URL } from "../../utils/api";
import axios from "axios";

// --- Improved MetricItem ---
const MetricItem = ({ title, value, color, icon, trend, progress }) => (
  <div className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-gray-200/50">
    <div className="flex items-center gap-2.5">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
          {title}
        </span>
        {trend && (
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp size={10} className="text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">{trend}</span>
          </div>
        )}
        {progress && (
          <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
    <div className="text-right">
      <span className={`text-lg font-bold ${color} tracking-tight group-hover:scale-105 transition-transform duration-300`}>
        {value}
      </span>
    </div>
  </div>
);

// --- Modern MetricsDashboard ---
const MetricsDashboard = ({ userMetrics }) => {
  const calculateBMI = (weight, heightCm) => {
    if (!weight || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const getBMIClassification = (bmi) => {
    if (!bmi) return "-";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Fit";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const getBMIColor = (bmi) => {
    if (!bmi) return "text-gray-500";
    if (bmi < 18.5) return "text-red-500";
    if (bmi < 25) return "text-emerald-500";
    if (bmi < 30) return "text-amber-500";
    return "text-red-600";
  };

  const getBMIIcon = (bmi) => {
    if (!bmi) return <Activity size={18} className="text-gray-400" />;
    if (bmi < 18.5) return <Activity size={18} className="text-red-500" />;
    if (bmi < 25) return <Activity size={18} className="text-emerald-500" />;
    if (bmi < 30) return <Activity size={18} className="text-amber-500" />;
    return <Activity size={18} className="text-red-600" />;
  };

  const bmiValue = calculateBMI(
    userMetrics?.currentWeight,
    userMetrics?.height
  );
  const bmiClassification = getBMIClassification(bmiValue);
  const bmiColor = getBMIColor(bmiValue);
  const bmiIcon = getBMIIcon(bmiValue);

  // Calculate weight progress
  const weightProgress = userMetrics?.currentWeight && userMetrics?.goalWeight 
    ? Math.min(100, Math.abs((userMetrics.currentWeight / userMetrics.goalWeight) * 100))
    : null;

  return (
    <div className="relative bg-gradient-to-br from-white via-white to-purple-50/30 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-purple-200/20 border border-purple-100/50 overflow-hidden group hover:shadow-3xl hover:shadow-purple-300/30 transition-all duration-500 sticky top-4">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        {/* Compact Header */}
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gradient-to-r from-purple-200/70 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              Health Stats
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              Your wellness metrics
            </p>
          </div>
        </div>

        {/* Compact Metrics Grid */}
        <div className="space-y-3">
          <MetricItem
            title="Current Weight"
            value={userMetrics?.currentWeight ? `${userMetrics.currentWeight} kg` : "-"}
            color="text-emerald-600"
            icon={<Target size={16} className="text-emerald-600" />}
            progress={weightProgress}
          />
          
          <MetricItem
            title="Target Weight"
            value={userMetrics?.goalWeight ? `${userMetrics.goalWeight} kg` : "-"}
            color="text-purple-600"
            icon={<Target size={16} className="text-purple-600" />}
          />
          
          <MetricItem
            title="Height"
            value={userMetrics?.height ? `${userMetrics.height} cm` : "-"}
            color="text-blue-600"
            icon={<Activity size={16} className="text-blue-600" />}
          />
          
          <MetricItem
            title="BMI"
            value={`${bmiValue} (${bmiClassification})`}
            color={bmiColor}
            icon={bmiIcon}
            trend={(() => {
              if (!bmiValue) return "Set your height & weight";
              if (bmiValue < 18.5) return "Underweight - consider gaining";
              if (bmiValue < 25) return "Healthy range - keep it up!";
              if (bmiValue < 30) return "Overweight - time to focus";
              return "Obese - needs immediate attention";
            })()}
          />
        </div>

        {/* Compact BMI Progress Ring */}
        {bmiValue && (
          <div className="mt-4 pt-4 border-t border-purple-200/70">
            <div className="flex items-center justify-center">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-purple-200"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={bmiValue < 25 ? "text-emerald-500" : bmiValue < 30 ? "text-amber-500" : "text-red-500"}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${Math.min(100, (bmiValue / 30) * 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${bmiColor}`}>
                    {bmiValue}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-semibold text-gray-700">BMI Score</p>
                <p className="text-xs text-gray-500">Optimal: 18.5-24.9</p>
              </div>
            </div>
          </div>
        )}

        {/* Compact Footer */}
        <div className="mt-4 pt-3 border-t border-purple-200/70">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-500 font-medium">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ActionCard ---
const ActionCard = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  loading,
  disabled = false,
}) => (
  <div className={`group relative bg-gradient-to-br from-white via-white to-purple-50/30 rounded-3xl p-8 shadow-xl shadow-purple-100/50 transition-all duration-500 border border-purple-100/50 overflow-hidden ${
    disabled ? 'opacity-75' : 'hover:shadow-2xl hover:shadow-purple-200/50'
  }`}>
    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-500 -mr-20 -mt-20"></div>
    <div className="relative z-10">
      <div className="text-purple-600 mb-5 transform group-hover:scale-100 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-gray-900 tracking-tight">
        {title}
      </h3>
      <p className="text-gray-600 mb-7 text-base leading-relaxed">
        {description}
      </p>
      <button
        className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 text-base font-semibold rounded-2xl transition-all duration-300 
          ${
            loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : disabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300"
              : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-400/50 hover:-translate-y-0.5"
          }
        `}
        onClick={onClick || (() => {})}
        disabled={loading || disabled}
      >
        <span>{buttonText}</span>
        {!loading && !disabled && (
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        )}
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
        )}
        {disabled && !loading && (
          <span className="text-green-600 font-bold">✓</span>
        )}
      </button>
    </div>
  </div>
);

// --- GoalProgressWidget ---
const GoalProgressWidget = ({ goal, progress, units, totalDays, daysElapsed, realisticWeeks, weeksElapsed }) => {
  const circumference = 2 * Math.PI * 55;
  const offset = circumference - (progress / 100) * circumference;

  // Use Today's Focus card colors for consistency
  const getGradientColors = () => {
    return "from-purple-600 via-purple-700 to-indigo-700";
  };

  const getProgressColor = () => {
    if (progress >= 80) return "text-emerald-300";
    if (progress >= 50) return "text-yellow-300";
    return "text-red-300";
  };

  return (
    <div className={`relative bg-gradient-to-br ${getGradientColors()} rounded-3xl p-6 shadow-2xl shadow-purple-500/30 overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-purple-200" />
          <h3 className="text-base font-bold text-white">{goal} Progress</h3>
        </div>
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-white/20"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="56"
              cy="56"
            />
            <circle
              className="text-white transition-all duration-1000"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="56"
              cy="56"
              style={{
                filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getProgressColor()}`}>{progress}%</span>
            <span className="text-xs text-purple-200 mt-0.5 font-medium">
              Achieved
            </span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-base font-bold text-white flex items-center gap-1 justify-center">
            <TrendingUp size={18} />
            {units} to go
          </p>
          {goal === "Set Your Goal" ? (
            <p className="text-sm text-gray-300 mt-1">
              Set your weight goals in profile
            </p>
          ) : (
            <div className="text-sm text-purple-200 mt-1">
              <p>Based on meal completion</p>
              {totalDays && daysElapsed !== undefined && (
                <p className="text-xs mt-0.5">
                  Day {daysElapsed} of {totalDays} ({Math.round((daysElapsed / totalDays) * 100)}% of timeline)
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DailyMetricWidget ---
const DailyMetricWidget = ({ title, current, max, unit, icon, color, loading = false }) => {
  const progress = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const colorMap = {
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      bar: "bg-red-500",
      ring: "ring-red-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      bar: "bg-purple-500",
      ring: "ring-purple-100",
    },
    yellow: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      bar: "bg-amber-500",
      ring: "ring-amber-100",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      bar: "bg-emerald-500",
      ring: "ring-emerald-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      bar: "bg-blue-500",
      ring: "ring-blue-100",
    },
  };
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="group bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2.5 rounded-xl ring-4 ring-gray-100">
            {icon}
          </div>
          <h4 className="text-base font-bold text-gray-900">{title}</h4>
        </div>
        <div className="flex justify-between items-end mb-3">
          <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className="animate-pulse bg-gray-200 h-2.5 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`${colors.text} ${colors.bg} p-2.5 rounded-xl ring-4 ${colors.ring} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h4 className="text-base font-bold text-gray-900">{title}</h4>
      </div>
      <div className="flex justify-between items-end mb-3">
        <p className="text-2xl font-bold text-gray-900 tracking-tight">
          {current}
          <span className="text-sm font-medium text-gray-500 ml-1">
            / {max} {unit}
          </span>
        </p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${colors.bar} transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- TodaysFocusCard ---
const TodaysFocusCard = ({
  mealTitle,
  calories,
  mealType,
  ctaText,
  onClick,
}) => (
  <div
    className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white rounded-3xl p-8 shadow-2xl shadow-purple-500/40 overflow-hidden group cursor-pointer"
    onClick={onClick}
  >
    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div>
        <Star size={28} className="text-amber-300 mb-3 animate-pulse" />
        <p className="text-sm font-semibold mb-2 text-purple-200">
          Today's Highest Calorie{" "}
          {mealType
            ? mealType.charAt(0).toUpperCase() + mealType.slice(1)
            : "Meal"}
        </p>
        <h3 className="text-xl font-bold mb-2 leading-tight">{mealTitle}</h3>
        {calories && (
          <p className="text-base text-purple-200 mb-4">{calories} calories</p>
        )}
      </div>
      <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 bg-white text-gray-900 hover:bg-gray-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 self-start">
        <span>{ctaText}</span>
        <ArrowRight
          size={16}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
    </div>
  </div>
);

// --- EcosystemCard ---
const EcosystemCard = ({
  title,
  description,
  icon,
  ctaText,
  color,
  onClick,
}) => {
  const colorMap = {
    indigo: {
      border: "border-indigo-400",
      text: "text-indigo-600",
      hover: "hover:text-indigo-700",
      bg: "bg-indigo-50",
      ring: "ring-indigo-100",
    },
    green: {
      border: "border-emerald-400",
      text: "text-emerald-600",
      hover: "hover:text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
    },
  };
  const colors = colorMap[color];

  return (
    <div
      className={`group bg-white rounded-2xl p-7 shadow-lg shadow-gray-200/50 border-t-4 ${colors.border} transition-all duration-300 hover:shadow-2xl hover:shadow-gray-300/50 hover:-translate-y-1 cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`${colors.text} ${colors.bg} p-3 rounded-xl inline-flex ring-4 ${colors.ring} mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
        {title}
      </h4>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        {description}
      </p>
      <button
        className={`text-sm font-semibold ${colors.text} ${colors.hover} flex items-center gap-2 group-hover:gap-3 transition-all`}
      >
        <span>{ctaText}</span>
        <ArrowRight
          size={16}
          className="group-hover:translate-x-1 transition-transform"
        />
      </button>
    </div>
  );
};

// --- Main Dashboard ---
function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(() => {
    // Check localStorage for existing generation status
    const stored = localStorage.getItem('mealPlanGenerated');
    const generatedDate = localStorage.getItem('mealPlanGeneratedDate');
    
    if (stored === 'true' && generatedDate) {
      // Check if generation was within the last 7 days
      const generationDate = new Date(generatedDate);
      const now = new Date();
      const daysDiff = Math.floor((now - generationDate) / (1000 * 60 * 60 * 24));
      
      // If more than 7 days old, allow regeneration
      if (daysDiff > 7) {
        localStorage.removeItem('mealPlanGenerated');
        localStorage.removeItem('mealPlanGeneratedDate');
        return false;
      }
      
      return true;
    }
    
    return false;
  });
  const [user, setUser] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [highestCalorieMeals, setHighestCalorieMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });
  const [nutritionalData, setNutritionalData] = useState({
    calories: { current: 0, max: 2000, unit: "kcal" },
    protein: { current: 0, max: 150, unit: "g" },
    fat: { current: 0, max: 60, unit: "g" },
    carbs: { current: 0, max: 220, unit: "g" },
  });
  const [nutritionalLoading, setNutritionalLoading] = useState(true);
  const [mealPlanGoals, setMealPlanGoals] = useState({
    calories: 2000,
    protein: 150,
    fats: 60,
    carbs: 220,
  });
  const [weightProgress, setWeightProgress] = useState({
    goal: "Weight Loss",
    progress: 0,
    units: "0 kg",
    isWeightLoss: true,
    currentWeight: 0,
    targetWeight: 0,
    weightToGo: 0,
  });
  const [dailyCalories, setDailyCalories] = useState([]);
  const navigate = useNavigate();
  const todayRef = useRef(null);
  const historyRef = useRef(null);

  const mockData = {
    goal: "Weight Loss",
    progress: 0,
    units: "10 kg (Dummy)",
    calories: { current: 1550, max: 2000, unit: "kcal" },
    protein: { current: 85, max: 150, unit: "g" },
    fat: { current: 45, max: 60, unit: "g" },
    carbs: { current: 180, max: 220, unit: "g" },
    water: { current: 2.5, max: 3, unit: "L" },
    focusMeal: "Fish Curry and Jeera Rice (Demo)",
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.user);
        } else {
          throw new Error(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        toast.error("Failed to fetch profile. Please login again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setFetching(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // --- Today's meals state & helpers ---
  const [todayMeals, setTodayMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayCompleted, setTodayCompleted] = useState(new Set());

  const fetchTodayMeals = async () => {
    try {
      setTodayLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");
      if (!storedUser?._id || !token) return;
      const res = await fetch(API_ENDPOINTS.MEALPLAN.LATEST(storedUser._id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const week = Array.isArray(data?.week) ? data.week : [];
      const today = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const entry = week.find((d) => d.day === today) || {};
      setTodayMeals({
        breakfast: entry.breakfast || null,
        lunch: entry.lunch || null,
        dinner: entry.dinner || null,
      });
    } catch (err) {
      console.error("Error fetching today meals:", err);
    } finally {
      setTodayLoading(false);
    }
  };

  // Function to calculate total nutritional goals from meal plan
  const calculateNutritionalGoals = (mealPlan) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const todaysMeals = mealPlan.find((day) => day.day.toLowerCase() === today);
    
    if (!todaysMeals) {
      return { calories: 0, protein: 0, fats: 0, carbs: 0 };
    }
    
    const goals = { calories: 0, protein: 0, fats: 0, carbs: 0 };
    
    // Calculate totals from breakfast, lunch, and dinner
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = todaysMeals[mealType];
      if (meal) {
        goals.calories += meal.calories || 0;
        goals.protein += meal.protein || 0;
        goals.fats += meal.fats || 0;
        goals.carbs += meal.carbs || 0;
      }
    });
    
    return goals;
  };

  // Function to calculate weight progress based on user metrics and meal completion
  const calculateWeightProgress = (userMetrics, completedMeals, dailyCalories = []) => {
    console.log("=== Weight Progress Calculation ===");
    console.log("User metrics for weight calculation:", userMetrics);
    console.log("Current weight:", userMetrics?.currentWeight);
    console.log("Goal weight:", userMetrics?.goalWeight);
    console.log("Profile object:", userMetrics?.profile);
    console.log("Profile currentWeight:", userMetrics?.profile?.currentWeight);
    console.log("Profile goalWeight:", userMetrics?.profile?.goalWeight);
    console.log("Completed meals count:", completedMeals?.length || 0);
    
    // Try different possible field names for weight data - check both direct user fields and populated profile
    const currentWeight = userMetrics?.currentWeight || userMetrics?.profile?.currentWeight || userMetrics?.weight || userMetrics?.current_weight;
    const targetWeight = userMetrics?.goalWeight || userMetrics?.profile?.goalWeight || userMetrics?.targetWeight || userMetrics?.goal_weight || userMetrics?.target_weight;
    
    console.log("Resolved current weight:", currentWeight);
    console.log("Resolved target weight:", targetWeight);
    
    if (!currentWeight || !targetWeight) {
      // If no weight data, show a sample progress based on meal completion
      const totalPossibleMeals = 7 * 3;
      const completedMealCount = completedMeals?.length || 0;
      const completionRate = totalPossibleMeals > 0 ? (completedMealCount / totalPossibleMeals) * 100 : 0;
      
      return {
        goal: "Set Your Goal",
        progress: Math.round(completionRate),
        units: "Set weight goals",
        isWeightLoss: true,
        currentWeight: 0,
        targetWeight: 0,
        weightToGo: 0,
      };
    }
    
    // Ensure weights are numbers
    const currentWeightNum = parseFloat(currentWeight);
    const targetWeightNum = parseFloat(targetWeight);
    const isWeightLoss = currentWeightNum > targetWeightNum;
    const weightDifference = Math.abs(currentWeightNum - targetWeightNum);
    
    console.log("=== Weight Comparison ===");
    console.log("Current weight (parsed):", currentWeightNum);
    console.log("Target weight (parsed):", targetWeightNum);
    console.log("Is weight loss?", isWeightLoss);
    console.log("Weight difference:", weightDifference);
    
    // Calculate realistic timeframes for weight goals
    const getRealisticTimeframe = (weightDifference, isWeightLoss) => {
      if (isWeightLoss) {
        // Weight loss: 0.5-1kg per week (2-4kg per month)
        if (weightDifference <= 2) return 2; // 2 weeks for small goals
        if (weightDifference <= 5) return 4; // 1 month for medium goals
        if (weightDifference <= 10) return 8; // 2 months for larger goals
        return 12; // 3 months for very large goals
      } else {
        // Weight gain: 0.25-0.5kg per week (1-2kg per month)
        if (weightDifference <= 2) return 4; // 1 month for small goals
        if (weightDifference <= 5) return 8; // 2 months for medium goals
        if (weightDifference <= 10) return 16; // 4 months for larger goals
        return 24; // 6 months for very large goals
      }
    };
    
    const realisticWeeks = getRealisticTimeframe(weightDifference, isWeightLoss);
    const totalDays = realisticWeeks * 7; // Total days in the realistic timeframe
    const totalPossibleMeals = totalDays * 3; // Total possible meals in timeframe
    
    // Calculate actual days elapsed since first meal was logged
    const getDaysElapsed = (completedMeals) => {
      if (!completedMeals || completedMeals.length === 0) return 0;
      
      // Group meals by date
      const mealsByDate = {};
      completedMeals.forEach(meal => {
        const date = meal.date ? new Date(meal.date).toDateString() : new Date().toDateString();
        if (!mealsByDate[date]) {
          mealsByDate[date] = [];
        }
        mealsByDate[date].push(meal);
      });
      
      // Count only days where 3 meals were completed
      const completedDays = Object.values(mealsByDate).filter(dayMeals => dayMeals.length >= 3);
      
      return completedDays.length;
    };
    
    const completedMealCount = completedMeals?.length || 0;
    const daysElapsed = getDaysElapsed(completedMeals);
    const completionRate = totalPossibleMeals > 0 ? (completedMealCount / totalPossibleMeals) * 100 : 0;
    
    // Calculate calorie adherence from daily calories data
    const avgCalorieIntake = dailyCalories.length > 0 
      ? dailyCalories.reduce((sum, day) => sum + (day.totalCalories || 0), 0) / dailyCalories.length 
      : 0;
    
    // Estimate target calories based on weight goal (simplified)
    const targetCalories = isWeightLoss ? 1500 : 2500; // Basic calorie targets
    const calorieAdherence = targetCalories > 0 ? Math.min(100, (avgCalorieIntake / targetCalories) * 100) : 0;
    
    // Combine meal completion and calorie adherence for progress calculation
    const combinedProgress = (completionRate * 0.6) + (calorieAdherence * 0.4);
    
    // Calculate realistic weight progress based on actual days elapsed vs total timeframe
    const timeProgress = (daysElapsed / totalDays) * 100;
    
    // For realistic progress, use primarily time-based calculation
    // Only add small bonus for excellent adherence (max 5% bonus)
    const adherenceBonus = Math.min(5, Math.max(0, (combinedProgress - 80) * 0.1)); // Only bonus if >80% adherence
    const progress = Math.min(100, timeProgress + adherenceBonus);
    
    console.log("=== Progress Calculation ===");
    console.log("Days elapsed:", daysElapsed);
    console.log("Total days:", totalDays);
    console.log("Time progress:", timeProgress.toFixed(1) + "%");
    console.log("Combined adherence:", combinedProgress.toFixed(1) + "%");
    console.log("Adherence bonus:", adherenceBonus.toFixed(1) + "%");
    console.log("Final progress:", progress.toFixed(1) + "%");
    
    // Calculate remaining weight based on realistic timeline
    const estimatedWeightChange = (timeProgress / 100) * weightDifference;
    const weightToGo = Math.max(0, weightDifference - estimatedWeightChange);
    
    return {
      goal: isWeightLoss ? "Weight Loss" : "Weight Gain",
      progress: Math.round(progress),
      units: `${weightToGo.toFixed(1)} kg`,
      isWeightLoss,
      currentWeight: currentWeightNum,
      targetWeight: targetWeightNum,
      weightToGo: Math.round(weightToGo * 10) / 10,
      realisticWeeks: realisticWeeks,
      totalDays: totalDays,
      daysElapsed: daysElapsed,
      weeksElapsed: Math.ceil(daysElapsed / 7),
    };
  };

  const fetchDailyCalories = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");
      if (!storedUser?._id || !token) return [];

      const res = await fetch(`${API_URL}/v1/api/mealplan/${storedUser._id}/dailyCalories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) return [];
      const data = await res.json();
      return data.dailyCalories || [];
    } catch (err) {
      console.error("Error fetching daily calories:", err);
      return [];
    }
  };

  const fetchTodaysCompleted = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");
      if (!storedUser?._id || !token) return;
      
      // Fetch completed meals, meal plan, and daily calories in parallel
      const [completedRes, mealPlanRes, dailyCaloriesData] = await Promise.all([
        fetch(`${API_URL}/v1/api/mealplan/${storedUser._id}/completed-meals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.MEALPLAN.LATEST(storedUser._id), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetchDailyCalories()
      ]);
      
      if (!completedRes.ok || !mealPlanRes.ok) return;
      
      const [completedData, mealPlanData] = await Promise.all([
        completedRes.json(),
        mealPlanRes.json()
      ]);
      
      const completedIds = new Set(
        (completedData.completedMeals || []).map((m) => `${m.day}-${m.mealType}`)
      );
      setTodayCompleted(completedIds);
      
      // Calculate nutritional totals from completed meals
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const todayMeals = (completedData.completedMeals || []).filter(meal => meal.day === today);
      
      const consumedTotals = todayMeals.reduce((acc, meal) => {
        acc.calories += meal.calories || 0;
        acc.protein += meal.protein || 0;
        acc.fats += meal.fats || 0;
        acc.carbs += meal.carbs || 0;
        return acc;
      }, { calories: 0, protein: 0, fats: 0, carbs: 0 });
      
      // Calculate total goals from meal plan
      const week = Array.isArray(mealPlanData?.week) ? mealPlanData.week : [];
      const totalGoals = calculateNutritionalGoals(week);
      
      // Update meal plan goals for loading state
      setMealPlanGoals({
        calories: totalGoals.calories,
        protein: totalGoals.protein,
        fats: totalGoals.fats,
        carbs: totalGoals.carbs,
      });
      
      setNutritionalData({
        calories: { current: consumedTotals.calories, max: totalGoals.calories, unit: "kcal" },
        protein: { current: consumedTotals.protein, max: totalGoals.protein, unit: "g" },
        fat: { current: consumedTotals.fats, max: totalGoals.fats, unit: "g" },
        carbs: { current: consumedTotals.carbs, max: totalGoals.carbs, unit: "g" },
      });
      
      // Set daily calories data
      setDailyCalories(dailyCaloriesData);
      
      // Calculate weight progress based on completed meals, user metrics, and daily calories
      // Use the user state which contains the health stats, not storedUser from localStorage
      const weightProgressData = calculateWeightProgress(user, completedData.completedMeals || [], dailyCaloriesData);
      setWeightProgress(weightProgressData);
      
      setNutritionalLoading(false);
    } catch (err) {
      console.error("Error fetching completed meals:", err);
      setNutritionalLoading(false);
    }
  };

  const fetchHighestCalorieMeals = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");
      if (!storedUser?._id || !token) return;

      const res = await fetch(API_ENDPOINTS.MEALPLAN.LATEST(storedUser._id), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch meal plan");

      const data = await res.json();
      const week = Array.isArray(data?.week) ? data.week : [];

      // Get today's day name
      const today = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Find today's meals from the week array
      const todaysMeals = week.find((day) => day.day.toLowerCase() === today);

      if (todaysMeals) {
        // Create meal objects with their types and calorie info
        const meals = {
          breakfast: todaysMeals.breakfast
            ? {
                type: "breakfast",
                name: todaysMeals.breakfast.dish,
                calories: todaysMeals.breakfast.calories,
              }
            : null,
          lunch: todaysMeals.lunch
            ? {
                type: "lunch",
                name: todaysMeals.lunch.dish,
                calories: todaysMeals.lunch.calories,
              }
            : null,
          dinner: todaysMeals.dinner
            ? {
                type: "dinner",
                name: todaysMeals.dinner.dish,
                calories: todaysMeals.dinner.calories,
              }
            : null,
        };

        setHighestCalorieMeals(meals);
        
        // Update nutritional goals when meal plan changes
        const totalGoals = calculateNutritionalGoals(week);
        setMealPlanGoals({
          calories: totalGoals.calories,
          protein: totalGoals.protein,
          fats: totalGoals.fats,
          carbs: totalGoals.carbs,
        });
      } else {
        setHighestCalorieMeals({
          breakfast: null,
          lunch: null,
          dinner: null,
        });
        
        // Reset goals when no meal plan
        setMealPlanGoals({
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching meal plan:", err);
    }
  };

  useEffect(() => {
    if (!fetching) {
      fetchTodayMeals();
      fetchTodaysCompleted();
      fetchHighestCalorieMeals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetching, user]);

  // Recalculate weight progress when user data or completed meals change
  useEffect(() => {
    if (user && dailyCalories.length >= 0) {
      // This will be calculated in fetchTodaysCompleted, but we can also calculate it here
      // if we have the data available
    }
  }, [user, dailyCalories]);

  const handleLogMeal = async (mealKey) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?._id;
      if (!userId) return toast.error("Please login to log meals");
      const token = localStorage.getItem("accessToken");
      if (!token) return toast.error("Please login to log meals");

      const meal = todayMeals[mealKey];
      if (!meal) return toast.info("No meal planned for this slot");

      // optimistic
      const day = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const mealId = `${day}-${mealKey}`;
      setTodayCompleted((prev) => new Set(prev).add(mealId));

      await axios.post(
        `${API_URL}/v1/api/mealplan/${userId}/meal/complete`,
        {
          day,
          mealType: mealKey,
          dishName: meal.dish || `${mealKey} meal`,
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fats: meal.fats || 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // refresh completed set and nutritional data
      fetchTodaysCompleted();

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('mealLogged', { 
        detail: { mealKey, day, meal } 
      }));

      toast.success(
        `${mealKey.charAt(0).toUpperCase() + mealKey.slice(1)} logged!`
      );
    } catch (err) {
      console.error("Error logging meal:", err);
      // rollback optimistic
      const day = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const mealId = `${day}-${mealKey}`;
      setTodayCompleted((prev) => {
        const s = new Set(prev);
        s.delete(mealId);
        return s;
      });
      toast.error("Failed to log meal");
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!user?._id) {
      toast.error("Please log in to generate a meal plan");
      return;
    }
    if (hasGenerated) return;

    setLoading(true);
    setGenerationStatus("Generating your personalized meal plan...");
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${API_URL}/v1/api/message/mealplan/${user._id}`,
        {
          method: 'GET',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('mealPlanGenerated', 'true');
        localStorage.setItem('mealPlanGeneratedDate', new Date().toISOString());
        setHasGenerated(true);
        navigate("/meal-plan");
      } else {
        throw new Error(data.message || "Failed to generate meal plan");
      }
    } catch (err) {
      console.error("Meal plan generation error:", err);
      toast.error(err.message || "Failed to generate meal plan");
      setHasGenerated(false);
    } finally {
      setLoading(false);
      setGenerationStatus("");
    }
  };

  const handleViewRecipe = () => navigate("/meal-plan");

  // Reset generation state (for testing - can be removed in production)
  const resetGeneration = () => {
    setHasGenerated(false);
    setGenerationStatus("");
    setIsGenerating(false);
    setLoading(false);
    // Clear localStorage
    localStorage.removeItem('mealPlanGenerated');
    localStorage.removeItem('mealPlanGeneratedDate');
  };

  if (fetching)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <img src={loaderGif} alt="Loading..." className="w-20 h-20" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30 font-inter">
      <DashNav />
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 pt-20 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-8 lg:space-y-12">
            {/* Modern Welcome Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 relative bg-gradient-to-br from-white via-white to-purple-50/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-purple-200/20 border border-purple-100/50 overflow-hidden group hover:shadow-3xl hover:shadow-purple-300/30 transition-all duration-500">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Activity size={24} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 tracking-tight group-hover:text-purple-900 transition-colors duration-300">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {user?.username?.split(" ")[0] || "User"}
                        </span>
                        !
                      </h1>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 leading-relaxed mb-8 font-medium">
                    Dive into your personalized nutrition plan and track your wellness journey with AI-powered insights.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() =>
                        todayRef.current?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="group/btn flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-400/50 hover:-translate-y-1"
                    >
                      <Utensils size={20} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span>Log Your Meal</span>
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </button>
                    <button 
                      onClick={() =>
                        historyRef.current?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="group/btn flex items-center gap-3 px-6 py-3.5 bg-white/80 text-gray-700 font-semibold rounded-2xl hover:bg-white transition-all duration-300 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 border border-gray-200/50"
                    >
                      <Clock size={20} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span>View History</span>
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>

              <TodaysFocusCard
                mealTitle={(() => {
                  const meals = [
                    highestCalorieMeals.breakfast,
                    highestCalorieMeals.lunch,
                    highestCalorieMeals.dinner,
                  ].filter((meal) => meal && meal.calories);

                  if (meals.length === 0) return "No meals planned for today";

                  const highestCalorieMeal = meals.reduce((max, meal) =>
                    !max || meal.calories > max.calories ? meal : max
                  );

                  return highestCalorieMeal.name;
                })()}
                calories={(() => {
                  const calories = [
                    highestCalorieMeals.breakfast?.calories || 0,
                    highestCalorieMeals.lunch?.calories || 0,
                    highestCalorieMeals.dinner?.calories || 0,
                  ];
                  const maxCalories = Math.max(...calories);
                  return maxCalories > 0 ? maxCalories : null;
                })()}
                mealType={(() => {
                  const meals = [
                    {
                      type: "breakfast",
                      calories: highestCalorieMeals.breakfast?.calories || 0,
                    },
                    {
                      type: "lunch",
                      calories: highestCalorieMeals.lunch?.calories || 0,
                    },
                    {
                      type: "dinner",
                      calories: highestCalorieMeals.dinner?.calories || 0,
                    },
                  ];

                  return meals.reduce((max, meal) =>
                    !max || meal.calories > max.calories ? meal : max
                  ).type;
                })()}
                ctaText="View Recipe"
                onClick={handleViewRecipe}
              />
            </div>

            {/* Modern Today's Meals Section */}
            <div ref={todayRef} className="md:col-span-3 mt-6">
              <div className="relative bg-gradient-to-br from-white via-white to-gray-50/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-gray-200/30 border border-gray-200/50 overflow-hidden group hover:shadow-3xl hover:shadow-gray-300/40 transition-all duration-500">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <Utensils size={20} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                      Today's Meals
                    </h3>
                  </div>
                  
                  {todayLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
                        <p className="text-gray-600 font-medium">Loading today's meals...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {["breakfast", "lunch", "dinner"].map((key) => {
                        const meal = todayMeals[key];
                        const icon =
                          key === "breakfast" ? (
                            <Clock size={20} />
                          ) : key === "lunch" ? (
                            <Utensils size={20} />
                          ) : (
                            <Moon size={20} />
                          );
                        const day = new Date()
                          .toLocaleDateString("en-US", { weekday: "long" })
                          .toLowerCase();
                        const mealId = `${day}-${key}`;
                        const isLogged = todayCompleted.has(mealId);

                        return (
                          <div
                            key={key}
                            className={`group/meal relative bg-gradient-to-br from-white to-gray-50/80 p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full ${
                              isLogged ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {/* Status indicator */}
                            {isLogged && (
                              <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check size={16} className="text-white" />
                              </div>
                            )}
                            
                            <div className="flex items-start gap-4 mb-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover/meal:scale-110 ${
                                isLogged ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                              }`}>
                                {icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wide mb-1">
                                  {key}
                                </p>
                                <h4 className={`text-lg font-bold leading-tight ${
                                  isLogged ? "text-emerald-700" : "text-gray-900"
                                }`}>
                                  {meal?.dish || "No meal planned"}
                                </h4>
                                {meal?.calories && (
                                  <p className="text-sm text-gray-500 mt-1 font-medium">
                                    {meal.calories} calories
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1 mb-6">
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                {meal?.recipe
                                  ? meal.recipe.length > 120
                                    ? `${meal.recipe.slice(0, 120)}...`
                                    : meal.recipe
                                  : "Recipe will appear here."}
                              </p>
                            </div>

                            <div className="flex gap-3 mt-auto">
                              <button
                                onClick={() => handleLogMeal(key)}
                                disabled={isLogged}
                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                  isLogged
                                    ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                }`}
                              >
                                {isLogged ? "✓ Logged" : "Log Meal"}
                              </button>
                              <button
                                onClick={() => {
                                  if (!meal)
                                    return toast.info("No recipe available");
                                  navigate("/meal-plan", {
                                    state: { recipe: meal },
                                  });
                                }}
                                className="px-4 py-3 rounded-xl text-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5"
                              >
                                View Recipe
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action and Progress Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ActionCard
                  title="Generate Next Week's Plan"
                  description="Use AI to instantly create a highly personalized, goal-driven meal plan based on your latest metrics."
                  icon={<BookOpen size={36} />}
                  buttonText={hasGenerated ? "Meal Plan Generated" : (loading ? generationStatus : "Generate Plan Now")}
                  onClick={hasGenerated ? null : handleGenerateMealPlan}
                  loading={loading}
                  disabled={hasGenerated}
                />
              </div>
              <GoalProgressWidget
                goal={weightProgress.goal}
                progress={weightProgress.progress}
                units={weightProgress.units}
                totalDays={weightProgress.totalDays}
                daysElapsed={weightProgress.daysElapsed}
                realisticWeeks={weightProgress.realisticWeeks}
                weeksElapsed={weightProgress.weeksElapsed}
              />
            </div>

            {/* Modern Daily Nutrition */}
            <div className="relative mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Daily Nutrition Snapshot
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Track your daily macro and micronutrient intake
                  </p>
                </div>
              </div>
              {nutritionalLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <DailyMetricWidget
                    title="Calories"
                    current={0}
                    max={mealPlanGoals.calories}
                    unit="kcal"
                    icon={<Zap size={20} />}
                    color="red"
                    loading={true}
                  />
                  <DailyMetricWidget
                    title="Protein"
                    current={0}
                    max={mealPlanGoals.protein}
                    unit="g"
                    icon={<Percent size={20} />}
                    color="purple"
                    loading={true}
                  />
                  <DailyMetricWidget
                    title="Fat"
                    current={0}
                    max={mealPlanGoals.fats}
                    unit="g"
                    icon={<Percent size={20} />}
                    color="yellow"
                    loading={true}
                  />
                  <DailyMetricWidget
                    title="Carbs"
                    current={0}
                    max={mealPlanGoals.carbs}
                    unit="g"
                    icon={<Percent size={20} />}
                    color="green"
                    loading={true}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <DailyMetricWidget
                  title="Calories"
                  current={nutritionalData.calories.current}
                  max={nutritionalData.calories.max}
                  unit={nutritionalData.calories.unit}
                  icon={<Zap size={20} />}
                  color="red"
                  loading={nutritionalLoading}
                />
                <DailyMetricWidget
                  title="Protein"
                  current={nutritionalData.protein.current}
                  max={nutritionalData.protein.max}
                  unit={nutritionalData.protein.unit}
                  icon={<Percent size={20} />}
                  color="purple"
                  loading={nutritionalLoading}
                />
                <DailyMetricWidget
                  title="Fat"
                  current={nutritionalData.fat.current}
                  max={nutritionalData.fat.max}
                  unit={nutritionalData.fat.unit}
                  icon={<Percent size={20} />}
                  color="yellow"
                  loading={nutritionalLoading}
                />
                <DailyMetricWidget
                  title="Carbs"
                  current={nutritionalData.carbs.current}
                  max={nutritionalData.carbs.max}
                  unit={nutritionalData.carbs.unit}
                  icon={<Percent size={20} />}
                  color="green"
                  loading={nutritionalLoading}
                />
                </div>
              )}
            </div>

            {/* Modern Meal Log History Section */}
            <div ref={historyRef} className="relative mt-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Recent Meal Logs
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Your meals from today and yesterday
                  </p>
                </div>
              </div>
              
              {user?._id && (
                <div className="relative bg-gradient-to-br from-white via-white to-amber-50/30 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-amber-200/20 border border-amber-100/50 overflow-hidden group hover:shadow-3xl hover:shadow-amber-300/30 transition-all duration-500">
                  {/* Background decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <LogHistory userId={user._id} />
                  </div>
                </div>
              )}
            </div>

            {/* Modern Ecosystem Section */}
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Star size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Wellnest Ecosystem
                  </h2>
                  <p className="text-gray-600 font-medium mt-1">
                    Explore our comprehensive wellness platform
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EcosystemCard
                  title="Ask an AI Chatbot"
                  description="Chat instantly with a certified professional for personalized guidance on complex issues or plateau busting."
                  icon={<MessageCircle size={30} />}
                  ctaText="Start Chat Now"
                  color="indigo"
                  onClick={() => navigate("/dashboard/AI")}
                />
                <EcosystemCard
                  title="Shop Health Products"
                  description="Browse curated supplements, tools, and healthy ingredients directly optimized for your meal plan."
                  icon={<ShoppingCart size={30} />}
                  ctaText="Go to Wellnest Store"
                  color="green"
                  onClick={() => navigate("/dashboard/shop")}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <MetricsDashboard userMetrics={user} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
