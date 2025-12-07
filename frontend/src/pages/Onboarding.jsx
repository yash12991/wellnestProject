import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../utils/api";
import "./Onboarding.css";
import ForestBg from "../assets/Forest.jpg";
import { 
  User, 
  Heart, 
  Activity, 
  Clock, 
  Zap, 
  Target, 
  Ruler, 
  Scale, 
  Utensils, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Circle,
  Check
} from "lucide-react";

function Onboarding() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    gender: "",
    allergies: [],
    height: "",
    age: "",
    currentWeight: "",
    goalWeight: "",
    meatPreference: "",
    proteinVariety: [], // NEW: Multiple protein sources
    activityLevel: "",
    fatigueTime: "",
    digestiveUpset: "",
    cravingsFrequency: "",
    cravingType: "",
    goals: "",
    preferences: "",
    medicalConditions: "",
    foodsToAvoid: "",
    specificDayPreferences: "", // NEW: Like "No chicken on Monday, Wednesday, Friday"
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("accessToken");

      if (!user?._id || !token) {
        showToast("You must be logged in to complete onboarding.", "error");
        navigate("/login");
        return;
      }

      // Check required fields (medicalConditions, foodsToAvoid, and specificDayPreferences are optional)
      const requiredFields = [
        "gender",
        "age",
        "height",
        "currentWeight",
        "goalWeight",
        "proteinVariety", // Changed from meatPreference to match the actual field name
        "activityLevel",
        "fatigueTime",
        "digestiveUpset",
        "cravingsFrequency",
        "cravingType",
        "goals",
        "preferences",
      ];
      const missing = requiredFields.filter((f) => {
        const value = formData[f];
        // For arrays (like proteinVariety), check if it has at least one item
        if (Array.isArray(value)) {
          return value.length === 0;
        }
        // For other fields, check if they're truthy
        return !value;
      });
      if (missing.length > 0) {
        console.log('Missing fields:', missing);
        showToast(
          "Please fill all fields before finishing onboarding.",
          "error"
        );
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${API_URL}/v1/api/auth/onboarding`,
        {
          ...formData,
          userId: user._id,
          age: Number(formData.age),
          height: Number(formData.height),
          currentWeight: Number(formData.currentWeight),
          goalWeight: Number(formData.goalWeight),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Onboarding saved:", response.data);
      showToast("Onboarding completed successfully!", "success");

      const updatedUser = { ...user, isOnboardingComplete: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(
        "Error saving onboarding:",
        err.response?.data || err.message
      );
      showToast("Failed to save onboarding. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Glassmorphism Button Component ---
const ObButton = ({ children, onClick, disabled, primary, icon, className = "", selected = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative px-6 py-4 rounded-xl font-medium text-sm backdrop-blur-sm
        ${primary
          ? "bg-black text-white shadow-lg"
          : selected
          ? "bg-black text-white shadow-lg"
          : "bg-white/20 text-gray-800 border border-white/40 shadow-md backdrop-blur-md"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        <span>{children}</span>
        {primary && !disabled && (
          <ArrowRight size={16} />
        )}
      </div>
    </button>
  );
};


  // --- Minimalist Toast Component ---
  const Toast = ({ message, type, visible }) => {
    if (!message) return null;
    const bgColor =
      type === "success"
        ? "bg-black text-white"
        : "bg-red-500 text-white";
    return (
      <div
        className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg flex items-center space-x-3 transform transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
        } ${bgColor}`}
      >
        <div className="flex items-center space-x-2">
          {type === "success" ? (
            <CheckCircle size={18} className="text-white" />
          ) : (
            <AlertTriangle size={18} className="text-white" />
          )}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={() => setToast({ message: "", type: "", visible: false })}
          className="ml-2 font-bold text-lg hover:scale-110 transition-transform duration-200"
        >
          ×
        </button>
      </div>
    );
  };

  // --- Minimalist Steps Data ---
  const steps = [
    {
      key: "gender",
      title: "Let's Start with Your Gender",
      description: "This helps us personalize your nutrition plan perfectly for you.",
      icon: <User size={20} className="text-gray-600" />,
      options: ["male", "female"],
      field: "gender",
    },
    {
      key: "meatPreference",
      title: "What Proteins Do You Prefer?",
      description: "Select ALL proteins you're comfortable eating. You can specify day preferences in the next step.",
      icon: <Utensils size={20} className="text-gray-600" />,
      options: ["Chicken", "Pork", "Beef", "Fish", "Eggs", "Paneer", "Tofu", "Legumes"],
      field: "proteinVariety",
      multiSelect: true, // NEW: Allow multiple selections
    },
    {
      key: "specificDayPreferences",
      title: "Any Day-Specific Preferences?",
      description: "Optional: Specify which foods you want to avoid on certain days (e.g., 'No chicken on Monday and Friday', 'Fish only on weekends')",
      icon: <AlertTriangle size={20} className="text-gray-600" />,
      field: "specificDayPreferences",
      inputType: "textarea",
    },
    {
      key: "activityLevel",
      title: "How Active Are You Daily?",
      description: "Your activity level helps us calculate your calorie needs accurately.",
      icon: <Activity size={20} className="text-gray-600" />,
      options: ["Inactive", "Light", "Moderate", "Heavy"],
      field: "activityLevel",
    },
    {
      key: "fatigueTime",
      title: "When Do You Feel Most Tired?",
      description: "Understanding your energy patterns helps optimize your meal timing.",
      icon: <Clock size={20} className="text-gray-600" />,
      options: [
        "Early Morning",
        "After Lunch",
        "After Dinner",
        "Not Until Bed Time",
      ],
      field: "fatigueTime",
    },
    {
      key: "digestiveUpset",
      title: "Digestive Health Check",
      description: "This helps us recommend foods that support your digestive wellness.",
      icon: <Heart size={20} className="text-gray-600" />,
      options: [
        "Never",
        "A couple times per month",
        "Twice a week or more",
        "Daily",
      ],
      field: "digestiveUpset",
    },
    {
      key: "cravingsFrequency",
      title: "How Often Do You Have Food Cravings?",
      description: "Understanding cravings helps us create a sustainable meal plan.",
      icon: <Zap size={20} className="text-gray-600" />,
      options: [
        "Once a month or less",
        "On a weekly basis",
        "A few times per week",
        "Daily",
      ],
      field: "cravingsFrequency",
    },
    {
      key: "cravingType",
      title: "What Do You Crave Most?",
      description: "This helps us include satisfying alternatives in your plan.",
      icon: <Target size={20} className="text-gray-600" />,
      options: ["Carbs", "Sweets", "Red Meat", "No Cravings"],
      field: "cravingType",
    },
    {
      key: "goals",
      title: "What Are Your Health Goals?",
      description: "Tell us what you want to achieve with your nutrition plan.",
      icon: <Target size={20} className="text-gray-600" />,
      options: [
        "More energy",
        "Better sleep",
        "Weight gain",
        "Weight loss",
        "Become lean and toned",
        "Improve digestion",
        "Improve metabolism",
      ],
      field: "goals",
    },
    {
      key: "heightAge",
      title: "Your Physical Stats",
      description: "Enter your height in centimeters and your age in years.",
      icon: <Ruler size={20} className="text-gray-600" />,
      field: ["height", "age"],
      type: "number",
    },
    {
      key: "weightGoal",
      title: "Weight Goals",
      description: "Enter your current weight and your goal weight in kilograms.",
      icon: <Scale size={20} className="text-gray-600" />,
      field: ["currentWeight", "goalWeight"],
      type: "number",
    },
    {
      key: "preferences",
      title: "Food Preferences",
      description: "Tell us about any dietary preferences or lifestyle choices.",
      icon: <Utensils size={20} className="text-gray-600" />,
      field: "preferences",
      type: "text",
    },
    {
      key: "medicalConditions",
      title: "Health Considerations",
      description: "Please share any allergies, diabetes, or other health conditions.",
      icon: <Shield size={20} className="text-gray-600" />,
      field: "medicalConditions",
      type: "text",
    },
    {
      key: "foodsToAvoid",
      title: "Foods to Avoid",
      description: "List any foods you want to strictly avoid in your meal plan.",
      icon: <AlertTriangle size={20} className="text-gray-600" />,
      field: "foodsToAvoid",
      type: "text",
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 font-sans relative"
      style={{
        backgroundImage: `url(${ForestBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Glassmorphism Progress Section */}
      <div className="w-full max-w-2xl mb-12 relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{step}</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-black">
                  Step {step} of {steps.length}
                </p>
                <p className="text-sm text-gray-700">
                  {Math.floor(((step - 1) / steps.length) * 100)}% Complete
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {steps.length - step} steps remaining
              </p>
            </div>
          </div>
          
          {/* Glassmorphism Progress Bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
            <div
              className="h-full bg-black transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((step - 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Glassmorphism Main Card */}
      <div className="w-full max-w-2xl bg-white/15 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-8 space-y-8 relative z-10" style={{ backdropFilter: 'blur(20px)' }}>
        {/* Step Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            {currentStep.icon}
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep.title}
            </h2>
          </div>
          {currentStep.description && (
            <p className="text-sm text-white/90 leading-relaxed max-w-lg mx-auto">
              {currentStep.description}
            </p>
          )}
        </div>

        {/* Step Content */}
        {currentStep.inputType === "textarea" ? (
          <div className="space-y-8">
            <textarea
              value={formData[currentStep.field] || ""}
              onChange={(e) => handleChange(currentStep.field, e.target.value)}
              placeholder="e.g., No chicken on Monday, Wednesday, Friday. Fish only on weekends."
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none min-h-32 resize-y"
              rows="4"
            />
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <ObButton 
                onClick={handleBack}
                icon={<ArrowLeft size={16} />}
                className="px-6 py-3"
              >
                Back
              </ObButton>
              <ObButton
                onClick={handleNext}
                primary
                className="px-8 py-3"
              >
                Continue (Optional)
              </ObButton>
            </div>
          </div>
        ) : currentStep.multiSelect ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentStep.options.map((opt) => {
                const isSelected = Array.isArray(formData[currentStep.field]) 
                  ? formData[currentStep.field].includes(opt)
                  : formData[currentStep.field] === opt;
                return (
                  <ObButton
                    key={opt}
                    onClick={() => {
                      const currentValues = Array.isArray(formData[currentStep.field]) 
                        ? formData[currentStep.field] 
                        : [];
                      const newValues = isSelected
                        ? currentValues.filter(v => v !== opt)
                        : [...currentValues, opt];
                      handleChange(currentStep.field, newValues);
                    }}
                    selected={isSelected}
                    className="text-center py-4 px-4 text-sm"
                  >
                    {opt}
                  </ObButton>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <ObButton 
                onClick={handleBack}
                disabled={step === 1}
                icon={<ArrowLeft size={16} />}
                className="px-6 py-3"
              >
                Back
              </ObButton>
              <ObButton
                onClick={handleNext}
                primary
                disabled={!formData[currentStep.field] || (Array.isArray(formData[currentStep.field]) && formData[currentStep.field].length === 0)}
                className="px-8 py-3"
              >
                Continue
              </ObButton>
            </div>
          </div>
        ) : currentStep.options ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStep.options.map((opt) => (
                <ObButton
                  key={opt}
                  onClick={() => handleChange(currentStep.field, opt)}
                  selected={formData[currentStep.field] === opt}
                  className="text-center py-4 px-6"
                >
                  {opt}
                </ObButton>
              ))}
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <ObButton 
                onClick={handleBack} 
                disabled={step === 1}
                icon={<ArrowLeft size={16} />}
                className="px-6 py-3"
              >
                Back
              </ObButton>
              <ObButton
                onClick={handleNext}
                primary
                disabled={
                  Array.isArray(currentStep.field)
                    ? currentStep.field.some((f) => !formData[f])
                    : !formData[currentStep.field]
                }
                className="px-8 py-3"
              >
                Continue
              </ObButton>
            </div>
          </div>
        ) : currentStep.type === "number" || currentStep.type === "text" ? (
          <div className="space-y-8">
            <div className="space-y-6">
              {Array.isArray(currentStep.field) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {currentStep.field.map((f) => (
                    <div key={f} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </label>
                      <input
                        type={currentStep.type}
                        placeholder={`Enter your ${f}`}
                        value={formData[f]}
                        onChange={(e) => handleChange(f, e.target.value)}
                        className="w-full border border-white/40 rounded-xl p-4 text-base focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all duration-200 bg-white/20 backdrop-blur-sm placeholder-gray-600"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {currentStep.field.charAt(0).toUpperCase() + currentStep.field.slice(1)}
                  </label>
                  <textarea
                    placeholder={`Tell us about your ${currentStep.field.toLowerCase()}`}
                    value={formData[currentStep.field]}
                    onChange={(e) => handleChange(currentStep.field, e.target.value)}
                    rows={4}
                    className="w-full border border-white/40 rounded-xl p-4 text-base focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all duration-200 bg-white/20 backdrop-blur-sm resize-none placeholder-gray-600"
                  />
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
              <ObButton 
                onClick={handleBack}
                icon={<ArrowLeft size={16} />}
                className="px-6 py-3"
              >
                Back
              </ObButton>
              <ObButton
                onClick={step === steps.length ? handleSubmit : handleNext}
                primary
                disabled={
                  Array.isArray(currentStep.field)
                    ? currentStep.field.some((f) => !formData[f])
                    : !formData[currentStep.field]
                }
                className="px-8 py-3"
              >
                {step === steps.length
                  ? loading
                    ? "Creating Your Plan..."
                    : "Complete Setup"
                  : "Continue"}
              </ObButton>
            </div>
          </div>
        ) : null}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
      />
    </div>
  );
}

export default Onboarding;
