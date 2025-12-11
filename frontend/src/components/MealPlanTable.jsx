import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FireIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  CalendarDaysIcon,
  StarIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, API_URL } from "../utils/api";
import axios from "axios";
import CompareApplyModal from "./CompareApplyModal.jsx";
// Styles for card view
const cardViewStyles = `
  .meal-plan-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    padding: 1rem;
  }

  .day-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .day-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .day-card.today {
    background: linear-gradient(135deg, #e6fffa, #b2f5ea);
    border: 2px solid #81e6d9;
  }

  .day-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .day-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .today-badge {
    background: #10b981;
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .meals-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .meal-card {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.3s ease;
  }

  .meal-card:hover {
    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .meal-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .meal-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .meal-label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }

  .meal-actions {
    display: flex;
    gap: 0.25rem;
  }

  .action-btn {
    padding: 0.5rem;
    border: none;
    background: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(156, 163, 175, 0.2);
  }

  .action-btn.favorited {
    color: #ef4444;
  }


  .meal-content {
    margin-bottom: 1rem;
  }

  .meal-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }


  .meal-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .calories {
    font-weight: 500;
  }

  .prep-time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .view-recipe-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    justify-content: center;
  }

  .view-recipe-btn:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
    transform: translateY(-1px);
  }

  .recipe-details {
    margin-top: 1rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .recipe-content h5 {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }

  .recipe-content p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .recipe-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .recipe-meta span {
    padding: 0.25rem 0.75rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
  }

  @media (max-width: 768px) {
    .meal-plan-cards {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 0.5rem;
    }

    .day-card {
      padding: 1rem;
    }

    .day-title {
      font-size: 1.25rem;
    }

    .meal-card {
      padding: 1rem;
    }
  }

  /* Mobile Table Responsive Styles */
  @media (max-width: 768px) {
    .meal-table-container {
      overflow-x: hidden !important;
      padding: 1rem !important;
    }

    .meal-table-wrapper {
      display: block !important;
      overflow-x: hidden !important;
      width: 100% !important;
    }

    .meal-plan-table {
      display: block !important;
      width: 100% !important;
      border-spacing: 0 !important;
    }

    .meal-plan-table thead {
      display: none !important;
    }

    .meal-plan-table tbody {
      display: block !important;
      width: 100% !important;
    }

    .meal-plan-table tr {
      display: block !important;
      margin-bottom: 1.5rem !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 12px !important;
      padding: 1rem !important;
      background: white !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }

    .meal-plan-table td {
      display: block !important;
      width: 100% !important;
      padding: 0.75rem 0 !important;
      border: none !important;
    }

    .meal-plan-table td:first-child {
      font-size: 1.25rem !important;
      font-weight: 700 !important;
      margin-bottom: 1rem !important;
      padding-bottom: 0.75rem !important;
      border-bottom: 2px solid #e5e7eb !important;
      text-align: center !important;
    }

    .mobile-meal-label {
      display: flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      font-weight: 600 !important;
      color: #374151 !important;
      margin-bottom: 0.5rem !important;
      font-size: 0.875rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }

    .lg\\:hidden {
      display: flex !important;
    }
  }
`;

// Inject styles
if (
  typeof document !== "undefined" &&
  !document.getElementById("meal-plan-card-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "meal-plan-card-styles";
  styleSheet.textContent = cardViewStyles;
  document.head.appendChild(styleSheet);
}

// shared API_URL from utils

const fetchMealPlan = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("accessToken");
    if (!user?._id || !token) return [];
    const res = await fetch(API_ENDPOINTS.MEALPLAN.LATEST(user._id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.week) ? data.week : [];
  } catch {
    return [];
  }
};

const fetchCompletedMeals = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("accessToken");
    if (!user?._id || !token) return [];
    const res = await fetch(`${API_URL}/v1/api/mealplan/${user._id}/completed-meals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.completedMeals) ? data.completedMeals : [];
  } catch {
    return [];
  }
};

const saveMealPlan = async (week) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("accessToken");
    if (!user?._id || !token) return { error: "Not logged in" };
    const res = await fetch(API_ENDPOINTS.MEALPLAN.SAVE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user._id, week }),
    });
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (e) {
    return { error: e.message };
  }
};

const emailMealPlan = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("accessToken");
    if (!user?._id || !token) return { error: "Not logged in" };

    const res = await fetch(API_ENDPOINTS.MEALPLAN.EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user._id }),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message, email: data.email };
    } else {
      return { error: data.message || "Failed to send email" };
    }
  } catch (e) {
    return { error: e.message };
  }
};

const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const getTotalCalories = (mealPlan) =>
  mealPlan.reduce(
    (sum, d) =>
      sum +
      (d.breakfast?.calories || 0) +
      (d.lunch?.calories || 0) +
      (d.dinner?.calories || 0),
    0
  );

const getDailyCalories = (dayEntry) => {
  return (
    (dayEntry.breakfast?.calories || 0) +
    (dayEntry.lunch?.calories || 0) +
    (dayEntry.dinner?.calories || 0)
  );
};

const getWeeklyCalories = (mealPlan) => {
  return mealPlan.reduce((total, dayEntry) => {
    return total + getDailyCalories(dayEntry);
  }, 0);
};

const getConsumedCalories = (completedMeals) => {
  return completedMeals.reduce((total, meal) => {
    return total + (meal.calories || 0);
  }, 0);
};

const MealPlanTable = () => {
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [expandedRows, setExpandedRows] = useState({}); // track expanded recipe cells
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [completedMeals, setCompletedMeals] = useState([]);
  // AI Modal states
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedMealForAI, setSelectedMealForAI] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  useEffect(() => {
    const loadData = async () => {
      try {
        const [plan, completed] = await Promise.all([
          fetchMealPlan(),
          fetchCompletedMeals()
        ]);
        setMealPlan(plan);
        setCompletedMeals(completed);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`${API_URL}/v1/api/${userId}/favourites`);
        const favDishNames = res.data.favourites.map((f) => f.dishName);

        // Map dish names to mealIds by scanning the meal plan
        const favMealIds = new Set();
        mealPlan.forEach((dayEntry) => {
          ["breakfast", "lunch", "dinner"].forEach((mealKey) => {
            const meal = dayEntry[mealKey];
            if (meal && favDishNames.includes(meal.dish)) {
              favMealIds.add(`${dayEntry.day}-${mealKey}`);
            }
          });
        });
        setFavorites(favMealIds);
      } catch (err) {
        console.error("Error fetching favourites:", err);
      }
    };
    if (mealPlan.length > 0 && userId) {
      fetchFavorites();
    }
  }, [mealPlan, userId]);

  const handleGenerateAndSave = async () => {
    try {
      setLoading(true);
      setSaved(false);
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");
      if (!user?._id || !token) throw new Error("Not logged in");
      
      const res = await fetch(
        `${API_URL}/v1/api/message/mealplan/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json().catch(() => ({}));
      console.log("Generated meal plan data:", data); // Debug log
      const week = Array.isArray(data?.week) ? data.week : [];
      console.log("Extracted week data:", week); // Debug log
      if (week.length === 0) throw new Error("No plan generated");
      
      // Reset all state for new meal plan
      setMealPlan(week);
      setFavorites(new Set()); // Reset favorites to avoid stale references
      setExpandedRows({}); // Reset expanded recipe rows
      
      // Refresh favorites for the new meal plan
      setTimeout(() => {
        const fetchFavorites = async () => {
          try {
            const res = await axios.get(`${API_URL}/v1/api/${user._id}/favourites`);
            const favDishNames = res.data.favourites.map((f) => f.dishName);
            const favMealIds = new Set();
            week.forEach((dayEntry) => {
              ["breakfast", "lunch", "dinner"].forEach((mealKey) => {
                const meal = dayEntry[mealKey];
                if (meal && favDishNames.includes(meal.dish)) {
                  favMealIds.add(`${dayEntry.day}-${mealKey}`);
                }
              });
            });
            setFavorites(favMealIds);
          } catch (err) {
            console.error("Error fetching favourites:", err);
          }
        };
        fetchFavorites();
      }, 100);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (day, mealKey) => {
    const rowKey = `${day}-${mealKey}`;
    setExpandedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  const toggleFavorite = async (day, mealKey, mealData) => {
    const mealId = `${day}-${mealKey}`;
    const isFavorite = favorites.has(mealId);

    // ✅ Get userId from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;
    if (!userId) return;

    // ✅ Optimistic UI update
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (isFavorite) newFavorites.delete(mealId);
      else newFavorites.add(mealId);
      return newFavorites;
    });

    try {
      if (isFavorite) {
        // ✅ DELETE request to remove favourite (with encodeURIComponent to avoid dish name issues)
        await axios.delete(
          `${API_URL}/v1/api/${userId}/favourites/${encodeURIComponent(mealData.dish)}`
        );
      } else {
        // ✅ POST request to add favourite
        await axios.post(`${API_URL}/v1/api/${userId}/favourites`, {
          dishName: mealData.dish,
          calories: mealData.calories,
          recipe: mealData.recipe,
          // ✅ Allow tags even if mealData didn’t have them
          tags:
            mealData.tags && mealData.tags.length > 0
              ? mealData.tags
              : ["uncategorized"],
          day,
          mealType: mealKey, // ✅ Helps backend know which meal (optional but useful)
        });
      }
    } catch (err) {
      console.error("Error syncing favorite:", err);

      // ✅ Rollback UI state if API fails
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (isFavorite) newFavorites.add(mealId);
        else newFavorites.delete(mealId);
        return newFavorites;
      });
    }
  };

  // Listen for meal logging events from Dashboard
  useEffect(() => {
    const handleMealLogged = () => {
      fetchCompletedMeals().then(setCompletedMeals);
    };

    window.addEventListener('mealLogged', handleMealLogged);
    window.addEventListener('storage', handleMealLogged);

    return () => {
      window.removeEventListener('mealLogged', handleMealLogged);
      window.removeEventListener('storage', handleMealLogged);
    };
  }, []);
  const handleEmailMealPlan = async () => {
    try {
      setEmailSending(true);
      const result = await emailMealPlan();

      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        console.error("Failed to send email:", result.error);
        alert(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error("Email error:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };
  const openAiModal = (day, mealType, mealData) => {
    setSelectedMealForAI({
      originalMeal: mealData,
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      mealType: mealType,
    });
    setAiModalOpen(true);
  };

  const refreshMealPlan = async () => {
    try {
      const plan = await fetchMealPlan();
      setMealPlan(plan);
    } catch (error) {
      console.error("Error refreshing meal plan:", error);
    }
  };

  const exportToPDF = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "User";
    const totalCalories = getTotalCalories(mealPlan);
    const avgCalories = Math.round(totalCalories / 7);

    // Create a printable version of the meal plan with simple, clean design
    const printWindow = window.open("", "_blank");
    const mealPlanHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Weekly Meal Plan - ${username}</title>
        <style>
          @page { size: A4; margin: 0.6in; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1a202c;
            line-height: 1.6;
            background: white;
          }
          
          .header {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            margin-bottom: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
          }
          
          .header h1 {
            font-size: 36px;
            color: white;
            margin-bottom: 8px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          
          .header p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 15px;
            margin: 0;
            font-weight: 500;
          }
          
          .info-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          
          .info-item {
            text-align: center;
            padding: 18px;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            transition: transform 0.2s;
          }
          
          .info-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
          }
          
          .info-value {
            font-size: 22px;
            color: #10b981;
            font-weight: 800;
            margin-top: 4px;
          }
          
          .section-header {
            font-size: 20px;
            font-weight: 700;
            color: #1a202c;
            margin: 25px 0 15px 0;
            padding-left: 12px;
            border-left: 4px solid #10b981;
          }
          
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            border-radius: 8px;
            overflow: hidden;
          }
          
          th {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 14px 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
            background: white;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          tr:hover td {
            background: #f8fafc;
          }
          
          .day-cell {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            font-weight: 700;
            color: #065f46;
            width: 12%;
            border-right: 2px solid #10b981;
          }
          
          .meal-name {
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 6px;
            font-size: 14px;
          }
          
          .calories {
            display: inline-block;
            background: #10b981;
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 12px;
          }
          
          .page-break {
            page-break-before: always;
            margin-top: 40px;
          }
          
          .tips-page {
            margin-top: 0;
          }
          
          .tips-header {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            margin-bottom: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
          }
          
          .tips-header h2 {
            font-size: 32px;
            color: white;
            margin-bottom: 8px;
            font-weight: 700;
          }
          
          .tips-header p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 15px;
            margin: 0;
          }
          
          .tips-section {
            margin-bottom: 30px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
          }
          
          .tips-section h3 {
            color: #1a202c;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px solid #10b981;
          }
          
          .tips-section ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .tips-section li {
            padding: 12px 15px;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
            border-left: 4px solid #10b981;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .tips-section li strong {
            color: #10b981;
          }
          
          .footer {
            margin-top: 30px;
            padding: 20px;
            border-top: 3px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
            background: #f8fafc;
            border-radius: 8px;
          }
          
          @media print {
            body { margin: 0; padding: 10px; }
            .page-break { page-break-before: always; }
            table { page-break-inside: avoid; }
            .tips-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <!-- Page 1: Meal Plan -->
        <div class="header">
          <h1>🌱 WellNest</h1>
          <p>Your Personalized Weekly Meal Plan</p>
        </div>

        <div class="info-bar">
          <div class="info-item">
            <div class="info-label">👤 Prepared For</div>
            <div class="info-value" style="font-size: 18px; color: #1a202c;">${username}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📅 Date</div>
            <div class="info-value" style="font-size: 18px; color: #1a202c;">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <div class="info-item">
            <div class="info-label">🔥 Weekly Total</div>
            <div class="info-value">${totalCalories.toLocaleString()}</div>
          </div>
          <div class="info-item">
            <div class="info-label">📊 Daily Avg</div>
            <div class="info-value">${avgCalories.toLocaleString()}</div>
          </div>
        </div>

        <div class="section-header">📅 Your Weekly Schedule</div>

        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>🌅 Breakfast</th>
              <th>🍽️ Lunch</th>
              <th>🌙 Dinner</th>
            </tr>
          </thead>
          <tbody>
            ${dayNames.map((day) => {
              const entry = mealPlan.find((d) => d.day === day) || {};
              return \`
                <tr>
                  <td class="day-cell">\${day.charAt(0).toUpperCase() + day.slice(1)}</td>
                  <td>
                    <div class="meal-name">\${entry.breakfast?.dish || "No meal planned"}</div>
                    \${entry.breakfast?.calories ? \`<div class="calories">\${entry.breakfast.calories} kcal</div>\` : ""}
                  </td>
                  <td>
                    <div class="meal-name">\${entry.lunch?.dish || "No meal planned"}</div>
                    \${entry.lunch?.calories ? \`<div class="calories">\${entry.lunch.calories} kcal</div>\` : ""}
                  </td>
                  <td>
                    <div class="meal-name">\${entry.dinner?.dish || "No meal planned"}</div>
                    \${entry.dinner?.calories ? \`<div class="calories">\${entry.dinner.calories} kcal</div>\` : ""}
                  </td>
                </tr>
              \`;
            }).join("")}
          </tbody>
        </table>

        <div class="footer">
          Generated by WellNest AI Nutrition System | © 2025 WellNest | wellnest.sbs
        </div>

        <!-- Page 2: Tips & Recommendations -->
        <div class="page-break"></div>
        
        <div class="tips-page">
          <div class="tips-header">
            <h2>💡 Your Nutrition Guide</h2>
            <p>Tips & Recommendations</p>
          </div>

          <div class="tips-section">
            <h3>Essential Guidelines</h3>
            <ul>
              <li><strong>Stay Hydrated:</strong> Drink 8-10 glasses of water throughout the day for optimal metabolism and digestion.</li>
              <li><strong>Consistent Timing:</strong> Eat meals at regular intervals to regulate your body's metabolism and energy levels.</li>
              <li><strong>Portion Control:</strong> Listen to your body and adjust portion sizes based on your hunger levels and daily activity.</li>
              <li><strong>Meal Prep:</strong> Prepare ingredients in advance on weekends to save time during busy weekdays.</li>
              <li><strong>Flexibility:</strong> Feel free to swap similar meals within the same category based on your preferences.</li>
            </ul>
          </div>

          <div class="tips-section">
            <h3>Quick Tips</h3>
            <ul>
              <li><strong>Pre-workout:</strong> Eat a light snack with carbs and protein 30-60 minutes before exercise.</li>
              <li><strong>Post-workout:</strong> Consume protein within 30 minutes after exercise for muscle recovery.</li>
              <li><strong>Snacking:</strong> Choose fruits, nuts, or yogurt for healthy snacks between meals.</li>
              <li><strong>Sleep:</strong> Avoid heavy meals 2-3 hours before bedtime for better sleep quality.</li>
              <li><strong>Variety:</strong> Try to include different colors of fruits and vegetables for diverse nutrients.</li>
            </ul>
          </div>

          <div class="footer">
            For support, visit wellnest.sbs | Consult a healthcare professional before making significant dietary changes
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(mealPlanHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Card View Component
  const CardView = () => (
    <div className="meal-plan-cards">
      {dayNames.map((day) => {
        const entry = mealPlan.find((d) => d.day === day) || {};
        const today = new Date()
          .toLocaleDateString("en-US", { weekday: "long" })
          .toLowerCase();
        const isToday = day === today;

        const meals = [
          {
            key: "breakfast",
            icon: <SunIcon className="h-5 w-5 text-yellow-500" />,
            data: entry.breakfast,
            label: "Breakfast",
          },
          {
            key: "lunch",
            icon: <FireIcon className="h-5 w-5 text-orange-500" />,
            data: entry.lunch,
            label: "Lunch",
          },
          {
            key: "dinner",
            icon: <MoonIcon className="h-5 w-5 text-indigo-500" />,
            data: entry.dinner,
            label: "Dinner",
          },
        ];

        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * dayNames.indexOf(day) }}
            className={`day-card ${isToday ? "today" : ""}`}
          >
            <div className="day-header">
              <h3 className="day-title">
                {day.charAt(0).toUpperCase() + day.slice(1)}
                {isToday && <span className="today-badge">Today</span>}
              </h3>
            </div>

            <div className="meals-grid">
              {meals.map((meal) => {
                const mealId = `${day}-${meal.key}`;
                const isFavorite = favorites.has(mealId);
                const rowKey = `${day}-${meal.key}`;

                return (
                  <div key={meal.key} className="meal-card">
                    <div className="meal-card-header">
                      <div className="meal-type">
                        {meal.icon}
                        <span className="meal-label">{meal.label}</span>
                      </div>
                      <div className="meal-actions">
                        <button
                          onClick={() => openAiModal(day, meal.key, meal.data)}
                          className="action-btn"
                          title="AI Suggest"
                        >
                          <SparklesIcon className="h-4 w-4 text-purple-500" />
                        </button>
                        <button
                          onClick={() =>
                            toggleFavorite(day, meal.key, meal.data)
                          }
                          className={`action-btn ${
                            isFavorite ? "favorited" : ""
                          }`}
                        >
                          <HeartIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="meal-content">
                      <h4 className="meal-name">
                        {meal.data?.dish || "No meal planned"}
                      </h4>
                      <div className="meal-info">
                        <div className="flex flex-col gap-1">
                          <span className="calories">
                            {meal.data?.calories
                              ? `${meal.data.calories} kcal`
                              : "No calories info"}
                          </span>
                          <div className="flex gap-2 text-xs text-gray-500">
                            <span>P: {meal.data?.protein || 0}g</span>
                            <span>F: {meal.data?.fats || 0}g</span>
                            <span>C: {meal.data?.carbs || 0}g</span>
                          </div>
                        </div>
                        <span className="prep-time">30 min</span>
                      </div>
                    </div>

                    {meal.data?.dish && (
                      <button
                        onClick={() => toggleRow(day, meal.key)}
                        className="view-recipe-btn"
                      >
                        {expandedRows[rowKey] ? (
                          <>
                            <ChevronDownIcon className="h-4 w-4" />
                            Hide Recipe
                          </>
                        ) : (
                          <>
                            <ChevronRightIcon className="h-4 w-4" />
                            View Recipe
                          </>
                        )}
                      </button>
                    )}

                    <AnimatePresence>
                      {expandedRows[rowKey] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="recipe-details"
                        >
                          <div className="recipe-content">
                            <h5>Recipe Instructions</h5>
                            <p>
                              {meal.data?.recipe ||
                                "Recipe instructions will be available soon. This meal has been carefully selected to meet your nutritional needs and taste preferences."}
                            </p>
                            <div className="recipe-meta">
                              <span>Prep: 15 min</span>
                              <span>Easy</span>
                              <span>{meal.data?.calories || "0"} kcal</span>
                              <span>P: {meal.data?.protein || 0}g</span>
                              <span>F: {meal.data?.fats || 0}g</span>
                              <span>C: {meal.data?.carbs || 0}g</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      // B&W: from-white to-gray-50, subtle shadow, dark border
      className="w-full bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
    >
      {/* Enhanced Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              {/* B&W Icon Container: Black background, white icon */}
              <div className="bg-gray-900 p-3 rounded-xl shadow-lg">
                <FireIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                {/* Modern Typography: Extrabold, slightly larger text */}
                <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                  Your Weekly Meal Plan
                </h2>
                <p className="text-gray-500 text-lg mt-1 font-light">
                  Balanced, delicious, and tailored for your week
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - Now more minimalist and side-by-side */}
          <div className="flex flex-wrap gap-4 justify-start md:justify-end">
            <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                {/* B&W Accent: Orange/Fire replaced with a strong Gray/Black for emphasis */}
                <FireIcon className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Calories
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {getTotalCalories(mealPlan)} kcal
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                {/* B&W Accent: Orange/Fire replaced with a strong Gray/Black for emphasis */}
                <FireIcon className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Calories Consumed
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {getConsumedCalories(completedMeals)} kcal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-start">
          {/* Purple Static Button: Change the dish Recommended by AI */}
          <button
            className="bg-purple-300  text-black font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 text-sm md:text-base cursor-not-allowed opacity-75"
            disabled
          >
            <SparklesIcon className="h-5 w-5" />
            Recommended by AI
          </button>

          {/* Secondary Button: White/Light Gray outline - COMMENTED OUT CARD VIEW */}
          {/* <button
            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-sm border border-gray-300 transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
          >
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            {viewMode === "table" ? "Card View" : "Table View"}
          </button> */}

          {/* Mail Me Button */}
          <button
            onClick={handleEmailMealPlan}
            disabled={emailSending || mealPlan.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
            title="Send meal plan to your email with PDF attachment"
          >
            <EnvelopeIcon className="h-5 w-5" />
            {emailSending ? "Generating PDF..." : "Email PDF"}
          </button>

          {/* Tertiary Button: Accent color (a subtle gray or a pop of color for emphasis like PDF) */}
          <button
            onClick={exportToPDF}
            disabled={mealPlan.length === 0}
            className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Confirmation/Alert Messages */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center mb-6 p-3 bg-green-50 rounded-lg text-green-700 font-semibold border border-green-200"
          >
            <StarIcon className="h-5 w-5 mr-2 text-green-500" />
            Meal plan saved successfully!
          </motion.div>
        )}
        {emailSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center mb-6 p-4 bg-blue-50 rounded-lg text-blue-700 font-semibold border border-blue-200"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2 text-blue-500" />
            <div className="text-center">
              <div>Meal plan sent to your email successfully!</div>
              <div className="text-sm font-normal mt-1">
                📎 PDF attachment included for download & print
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditional Rendering */}
      {loading ? (
        <div className="text-center text-gray-500 py-12 text-lg">
          <svg
            className="animate-spin mx-auto h-8 w-8 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-3">Loading meal plan...</p>
        </div>
      ) : mealPlan.length === 0 ? (
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-xl border border-red-200 py-8">
          <p className="font-medium text-lg">No meal plan available.</p>
          <p className="text-sm text-red-400 mt-1">
            Click "Generate New Plan" to get started.
          </p>
        </div>
      ) : /* viewMode === "card" ? (
        <CardView />
      ) : */ (
        // Split layout: Meal Plan (left) + Favorites (right)
        <div className="w-full flex flex-col lg:flex-row gap-6 mt-6">
          {/* Left Side: Meal Plan Table */}
          <div className="flex-1 lg:flex-[3] meal-table-container bg-white rounded-2xl shadow-lg border border-gray-200 p-4 lg:p-0">
            <div className="meal-table-wrapper">
              <table className="meal-plan-table min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-3 rounded-tl-2xl text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    <div className="flex items-center gap-1">
                      <CalendarDaysIcon className="h-4 w-4 text-gray-600" />
                      Day
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    <div className="flex items-center gap-1">
                      <SunIcon className="h-4 w-4 text-yellow-600" />
                      Breakfast
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    <div className="flex items-center gap-1">
                      <FireIcon className="h-4 w-4 text-orange-600" />
                      Lunch
                    </div>
                  </th>
                  <th className="px-3 py-3 rounded-tr-2xl text-left font-bold text-gray-700 uppercase text-xs tracking-wider">
                    <div className="flex items-center gap-1">
                      <MoonIcon className="h-4 w-4 text-indigo-600" />
                      Dinner
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dayNames.map((day) => {
                  const entry = mealPlan.find((d) => d.day === day) || {};
                  const today = new Date()
                    .toLocaleDateString("en-US", { weekday: "long" })
                    .toLowerCase();
                  const isToday = day === today;

                  const meals = [
                    {
                      key: "breakfast",
                      icon: <SunIcon className="h-4 w-4 text-yellow-500" />,
                      data: entry.breakfast,
                    },
                    {
                      key: "lunch",
                      icon: <FireIcon className="h-4 w-4 text-orange-500" />,
                      data: entry.lunch,
                    },
                    {
                      key: "dinner",
                      icon: <MoonIcon className="h-4 w-4 text-indigo-500" />,
                      data: entry.dinner,
                    },
                  ];

                  return (
                    <React.Fragment key={day}>
                      <motion.tr
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * dayNames.indexOf(day) }}
                        className={`hover:bg-gray-50 transition-all duration-300 ${
                          isToday ? "bg-gray-50 border-l-4 border-gray-900" : ""
                        }`}
                      >
                        {/* Day column */}
                        <td className="font-semibold px-3 py-3 capitalize text-sm">
                          <div
                            className={
                              isToday
                                ? "text-gray-900 font-extrabold"
                                : "text-gray-700"
                            }
                          >
                            {day}
                            {isToday && (
                              <span className="ml-2 bg-gray-900 text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-md">
                                Today
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Meal columns */}
                        {meals.map((meal) => {
                          const rowKey = `${day}-${meal.key}`;
                          const mealId = `${day}-${meal.key}`;
                          const isFavorite = favorites.has(mealId);
                          
                          // Check if this meal is completed
                          const isCompleted = completedMeals.some(
                            (completedMeal) => 
                              completedMeal.day === day && completedMeal.mealType === meal.key
                          );

                          return (
                            <td key={meal.key} className="px-2 py-2 align-top">
                              {/* Mobile Label - Hidden on Desktop */}
                              <div className="mobile-meal-label lg:hidden flex items-center gap-2">
                                {meal.icon}
                                {meal.key.charAt(0).toUpperCase() + meal.key.slice(1)}
                              </div>
                              {/* Meal Card */}
                              <div className={`rounded-lg p-2 shadow-md border hover:shadow-lg transition-all duration-300 ${
                                isCompleted 
                                  ? "bg-green-50 border-green-200" 
                                  : "bg-white border-gray-100"
                              }`}>
                                <div className="flex items-start justify-between mb-1">
                                  {/* Meal dish name and expand toggle */}
                                  <div
                                    className="flex items-center gap-2 font-medium text-gray-900 cursor-pointer flex-1 group"
                                    onClick={() => toggleRow(day, meal.key)}
                                  >
                                    <div className="text-gray-500 group-hover:text-gray-700 transition-colors">
                                      {expandedRows[rowKey] ? (
                                        <ChevronDownIcon className="h-4 w-4" />
                                      ) : (
                                        <ChevronRightIcon className="h-4 w-4" />
                                      )}
                                    </div>
                                    <span className={`text-sm line-clamp-1 ${
                                      isCompleted ? "text-green-700 font-semibold" : "text-gray-800"
                                    }`}>
                                      {meal.data?.dish || "No Dish"}
                                    </span>
                                  </div>

                                  {/* Action icons */}
                                  <div className="flex items-center gap-1">
                                    {/* AI Suggest Button */}
                                    <button
                                      onClick={() =>
                                        openAiModal(day, meal.key, meal.data)
                                      }
                                      className="p-1 rounded-full hover:bg-purple-50 transition-colors"
                                      title="AI Suggest"
                                    >
                                      <SparklesIcon className="h-3 w-3 text-purple-500 hover:text-purple-600" />
                                    </button>

                                    {/* Favorite Button */}
                                    <button
                                      onClick={() =>
                                        toggleFavorite(day, meal.key, meal.data)
                                      }
                                      className="p-1 rounded-full hover:bg-red-50 transition-colors"
                                      title="Favorite"
                                    >
                                      <HeartIcon
                                        className={`h-3 w-3 transition-colors ${
                                          isFavorite
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-400 hover:text-red-500"
                                        }`}
                                      />
                                    </button>

                                  </div>
                                </div>

                                {/* Calories + Time */}
                                <div className="flex items-center justify-between text-xs mt-1">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-gray-500 font-medium text-sm">
                                      {meal.data?.calories
                                        ? `${meal.data.calories} kcal`
                                        : "No kcal"}
                                    </span>
                                    <div className="flex gap-1 text-xs text-gray-400">
                                      <span>P:{meal.data?.protein || 0}g</span>
                                      <span>F:{meal.data?.fats || 0}g</span>
                                      <span>C:{meal.data?.carbs || 0}g</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5 text-gray-400">
                                    <ClockIcon className="h-2.5 w-2.5" />
                                    <span className="text-xs">30m</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </motion.tr>

                      {/* Expanded Recipe Row */}
                      <tr>
                        <td colSpan={1}></td>
                        {meals.map((meal) => {
                          const rowKey = `${day}-${meal.key}`;
                          return (
                            <td
                              key={meal.key}
                              colSpan={1}
                              className="px-4 py-1.5"
                            >
                              <AnimatePresence>
                                {expandedRows[rowKey] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-900 shadow-inner"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="bg-gray-200 p-2 rounded-lg flex-shrink-0">
                                        <FireIcon className="h-4 w-4 text-gray-800" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 mb-2 text-sm">
                                          Recipe Instructions
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-snug">
                                          {meal.data?.recipe ||
                                            "Recipe instructions will be available soon. This meal has been carefully selected to meet your nutritional needs and taste preferences."}
                                        </p>

                                        {/* Recipe Meta-data */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-600 font-medium">
                                          <span className="flex items-center gap-1">
                                            <ClockIcon className="h-3 w-3 text-gray-500" />{" "}
                                            Prep: 15 min
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <StarIcon className="h-3 w-3 text-yellow-500" />{" "}
                                            Easy
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <FireIcon className="h-3 w-3 text-gray-500" />{" "}
                                            {meal.data?.calories || "0"} kcal
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="text-gray-500">P: {meal.data?.protein || 0}g</span>
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="text-gray-500">F: {meal.data?.fats || 0}g</span>
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="text-gray-500">C: {meal.data?.carbs || 0}g</span>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right Side: Favorites Column */}
          <div className="w-full lg:w-80 lg:max-w-sm bg-gray-50 rounded-2xl shadow-md border border-gray-200 p-4 h-fit sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <HeartIcon className="h-5 w-5 text-red-500" /> Your Favorites
            </h3>

            {Array.from(favorites).length === 0 ? (
              <p className="text-gray-500 text-sm">No favorite meals yet.</p>
            ) : (
              <ul className="space-y-2">
                {Array.from(favorites).map((favId) => {
                  const [day, mealKey] = favId.split("-");
                  const dayData = mealPlan.find((d) => d.day === day);
                  const mealData = dayData?.[mealKey];

                  if (!mealData) return null;

                  return (
                    <li
                      key={favId}
                      className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all"
                    >
                      <p className="font-semibold text-gray-800 text-sm">
                        {mealData.dish}
                      </p>

                      <div className="flex items-center flex-wrap gap-1 mt-1 text-sm text-gray-500">
                        <span>{mealData.calories} kcal</span>
                        <span>•</span>
                        <span>
                          {day.charAt(0).toUpperCase() + day.slice(1)} {mealKey}
                        </span>
                      </div>

                      {/* ✅ Tags section */}
                      {Array.isArray(mealData.tags) &&
                        mealData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mealData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ✨ AI Assistant Card */}
            <div className="mt-6 bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-xl shadow-lg p-4 text-white flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Decorative Glow */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl"></div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-1 flex items-center justify-center gap-1">
                  ✨ Try Something New
                </h3>
                <p className="text-sm text-gray-300 mb-3 max-w-xs mx-auto">
                  Explore personalized meal ideas and nutrition insights powered
                  by our AI Assistant.
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => navigate("/dashboard/AI")}
                  className="bg-white text-gray-900 font-semibold px-3 py-2 rounded-lg shadow-md hover:bg-gray-200 transition-all duration-300 flex items-center gap-1 mx-auto text-sm"
                >
                  <span>Ask AI</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12l-3.75 3.75M21 12H3"
                    />
                  </svg>
                </button>

                {/* Optional Quick Action Chips */}
                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {["Suggest meal", "Calorie analysis", "Diet plan"].map(
                    (item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 bg-gray-700 text-white rounded-lg text-xs cursor-pointer hover:bg-gray-600 transition"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 bg-white rounded-xl shadow-lg p-4 text-gray-900 flex flex-col space-y-4 relative overflow-hidden">
              {/* Decorative Gradient Accents - only keeping one soft circle for style */}
              <div className="absolute -bottom-20 -left-16 w-44 h-44 bg-gradient-to-r from-indigo-400 to-indigo-200 rounded-full blur-3xl"></div>

              {/* Card Header */}
              <div className="relative z-10 text-center">
                <h3 className="text-xl font-bold mb-1">Healthy Tips</h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                  Boost your wellness with these simple daily habits.
                </p>
              </div>

              {/* Tips Row */}
              <div className="relative z-10 grid grid-cols-2 gap-2">
                {/* Tip 1 */}
                <div className="bg-green-500 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
                  <svg
                    className="w-4 h-4 mb-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <h4 className="font-semibold mb-0.5 text-white text-sm">
                    Stay Hydrated
                  </h4>
                  <p className="text-xs text-white/90">
                    Drink 2L water daily.
                  </p>
                </div>

                {/* Tip 2 */}
                <div className="bg-blue-500 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
                  <svg
                    className="w-4 h-4 mb-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <h4 className="font-semibold mb-0.5 text-white text-sm">
                    Eat Veggies
                  </h4>
                  <p className="text-xs text-white/90">
                    Include greens daily.
                  </p>
                </div>

                {/* Tip 3 */}
                <div className="bg-purple-500 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
                  <svg
                    className="w-4 h-4 mb-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 20l9-12H3l9 12z"
                    />
                  </svg>
                  <h4 className="font-semibold mb-0.5 text-white text-sm">Move Daily</h4>
                  <p className="text-xs text-white/90">
                    Take short walks.
                  </p>
                </div>

                {/* Tip 4 */}
                <div className="bg-red-500 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
                  <svg
                    className="w-4 h-4 mb-1 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"
                    />
                  </svg>
                  <h4 className="font-semibold mb-0.5 text-white text-sm">Sleep Well</h4>
                  <p className="text-xs text-white/90">
                    Get 7-8 hours sleep.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* AI Compare & Apply Modal */}
      <CompareApplyModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        originalMeal={selectedMealForAI?.originalMeal}
        dayOfWeek={selectedMealForAI?.dayOfWeek}
        mealType={selectedMealForAI?.mealType}
        onMealUpdated={refreshMealPlan}
      />
    </motion.div>
  );
};

export default MealPlanTable;
