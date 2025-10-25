import React, { useState } from "react";
import Header from "../components/Header.jsx";
import MetricsDashboard from "../components/MetricsDashboard.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api";

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerateMealPlan = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");
      if (!user?._id || !token) {
        alert("You must be logged in to generate a meal plan.");
        navigate("/login");
        return;
      }
      const res = await axios.get(
  `${API_URL}/v1/api/message/mealplan/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        navigate("/meal-plan");
      } else {
        alert(res.data.message || "Failed to generate meal plan.");
      }
    } catch (err) {
      alert("Error generating meal plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="relative z-10 -mt-32 px-6 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Welcome back 👋
              </h2>
              <p className="text-gray-500">
                Explore your health metrics and meal plans.
              </p>
              <button
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors"
                onClick={handleGenerateMealPlan}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Meal Plan"}
              </button>
            </div>
          </div>
          <MetricsDashboard />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
