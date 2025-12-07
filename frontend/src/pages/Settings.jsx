import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaTrash,
  FaSave,
  FaEdit,
  FaTimes,
  FaCheck,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import DashNav from "../components/DashNav";
import loaderGif from "../assets/loader.gif";
import { API_ENDPOINTS } from "../utils/api";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({
    profile: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "",
    height: "",
    currentWeight: "",
    goalWeight: "",
    foodAllergies: [],
    preferences: {},
    age: '',
    medicalConditions: '',
    foodsToAvoid: '',
    proteinVariety: [],
    specificDayPreferences: '',
    goals: '',
    generalPreferences: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Token from localStorage:", token ? "exists" : "not found");

      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Fetching profile from:", API_ENDPOINTS.AUTH.PROFILE);
      const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();
      console.log("Profile data received:", data);

      if (data.success) {
        setUser(data.user);
        setFormData({
          username: data.user.username || "",
          email: data.user.email || "",
          gender: data.user.gender || "",
          height: data.user.height || "",
          currentWeight: data.user.currentWeight || "",
          goalWeight: data.user.goalWeight || "",
          foodAllergies: data.user.foodAllergies || [],
          preferences: data.user.preferences || {},
          age: data.user.profile?.age || data.user.age || '',
          medicalConditions: data.user.preferences?.medicalConditions || '',
          foodsToAvoid: data.user.preferences?.foodsToAvoid || '',
          proteinVariety: data.user.preferences?.proteinVariety || [],
          specificDayPreferences: data.user.preferences?.specificDayPreferences || '',
          goals: data.user.preferences?.goals || '',
          generalPreferences: data.user.preferences?.preferences || ''
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("User not found")
      ) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        toast.error(`Failed to load profile data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAllergiesChange = (e) => {
    const allergies = e.target.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      foodAllergies: allergies,
    }));
  };

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    // If top-level fields
    if (['age', 'medicalConditions', 'foodsToAvoid', 'proteinVariety', 'specificDayPreferences', 'goals', 'generalPreferences'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value,
      },
    }));
  };

  const handleProteinVarietyChange = (protein) => {
    setFormData((prev) => {
      const currentProteins = Array.isArray(prev.proteinVariety) ? prev.proteinVariety : [];
      const newProteins = currentProteins.includes(protein)
        ? currentProteins.filter(p => p !== protein)
        : [...currentProteins, protein];
      return { ...prev, proteinVariety: newProteins };
    });
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");

      // Structure the data to match backend expectations
      const payload = {
        username: formData.username,
        email: formData.email,
        gender: formData.gender,
        height: formData.height,
        currentWeight: formData.currentWeight,
        goalWeight: formData.goalWeight,
        foodAllergies: formData.foodAllergies,
        age: formData.age,
        medicalConditions: formData.medicalConditions,
        foodsToAvoid: formData.foodsToAvoid,
        preferences: {
          ...formData.preferences,
          proteinVariety: formData.proteinVariety,
          specificDayPreferences: formData.specificDayPreferences,
          goals: formData.goals,
          preferences: formData.generalPreferences, // This is the general food preferences text
        }
      };

      const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setEditMode((prev) => ({ ...prev, profile: false }));
        toast.success("Profile updated successfully!");

        // Update localStorage user data
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setEditMode((prev) => ({ ...prev, password: false }));
        toast.success("Password changed successfully!");
      } else {
        throw new Error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Account deleted successfully");
        localStorage.clear();
        navigate("/", { replace: true });
      } else {
        throw new Error(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const cancelEdit = (type) => {
    if (type === "profile") {
      setFormData({
        username: user?.username || "",
        email: user?.email || "",
        gender: user?.gender || "",
        height: user?.height || "",
        currentWeight: user?.currentWeight || "",
        goalWeight: user?.goalWeight || "",
        foodAllergies: user?.foodAllergies || [],
        preferences: user?.preferences || {},
        age: user?.profile?.age || user?.age || '',
        medicalConditions: user?.preferences?.medicalConditions || '',
        foodsToAvoid: user?.preferences?.foodsToAvoid || '',
        proteinVariety: user?.preferences?.proteinVariety || [],
        specificDayPreferences: user?.preferences?.specificDayPreferences || '',
        goals: user?.preferences?.goals || '',
        generalPreferences: user?.preferences?.preferences || ''
      });
    } else if (type === "password") {
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setEditMode((prev) => ({ ...prev, [type]: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashNav />
        <div className="flex flex-col items-center justify-center h-96">
          <img src={loaderGif} alt="Loading..." className="w-12 h-12" />
          <p className="mt-4 text-gray-600">Loading your profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashNav />

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUser className="text-blue-600 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Information
                </h2>
              </div>
              {!editMode.profile ? (
                <button
                  onClick={() =>
                    setEditMode((prev) => ({ ...prev, profile: true }))
                  }
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FaEdit className="text-sm" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={updateProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <img
                        src={loaderGif}
                        alt="Saving..."
                        className="w-4 h-4"
                      />
                    ) : (
                      <FaCheck className="text-sm" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => cancelEdit("profile")}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600  hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-sm" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium  bg-white text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  style={{ color: "black",
                    background: "white"
                   }}
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  style={{ color: "black" , background: "white"}}
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleInputChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  name="goalWeight"
                  value={formData.goalWeight}
                  onChange={handleInputChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Food Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.foodAllergies.join(", ")}
                style={{ color: "black",
                    background: "white"
                   }}
                onChange={handleAllergiesChange}
                disabled={!editMode.profile}
                placeholder="e.g., nuts, dairy, shellfish"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            {/* Onboarding Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meat Preference</label>
                <select
                  name="meatPreference"
                  value={formData.preferences?.meatPreference || ""}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">No preference</option>
                  <option value="Any">Any</option>
                  <option value="Chicken">Chicken</option>
                  <option value="Beef">Beef</option>
                  <option value="Fish">Fish</option>
                  <option value="No Meat">No Meat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.preferences?.activityLevel || ""}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fatigue Time</label>
                <select
                  name="fatigueTime"
                  value={formData.preferences?.fatigueTime || ""}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select</option>
                  <option value="Early Morning">Early Morning</option>
                  <option value="After Lunch">After Lunch</option>
                  <option value="After Dinner">After Dinner</option>
                  <option value="Not Until Bed Time">Not Until Bed Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Digestive Upset Frequency</label>
                <select
                  name="digestiveUpset"
                  value={formData.preferences?.digestiveUpset || ""}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select</option>
                  <option value="Never">Never</option>
                  <option value="A couple times per month">A couple times per month</option>
                  <option value="Twice a week or more">Twice a week or more</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cravings Frequency</label>
                <select
                  name="cravingsFrequency"
                  value={formData.preferences?.cravingsFrequency || ""}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select</option>
                  <option value="Once a month or less">Once a month or less</option>
                  <option value="On a weekly basis">On a weekly basis</option>
                  <option value="A few times per week">A few times per week</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Craving Type</label>
                <select
                  name="cravingType"
                  value={formData.preferences?.cravingType || ""}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select</option>
                  <option value="Carbs">Carbs</option>
                  <option value="Sweets">Sweets</option>
                  <option value="Red Meat">Red Meat</option>
                  <option value="No Cravings">No Cravings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                <input
                  type="text"
                  name="medicalConditions"
                  style={{ color: "black",
                    background: "white"
                   }}
                  value={formData.medicalConditions}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  placeholder="e.g., diabetes, hypertension (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foods To Avoid</label>
                <input
                  type="text"
                  name="foodsToAvoid"
                  style={{ color: "black",
                    background: "white"
                   }}
                  value={formData.foodsToAvoid}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  placeholder="e.g., fried foods, gluten"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Goals</label>
                <select
                  name="goals"
                  value={formData.goals}
                  onChange={handlePrefChange}
                  disabled={!editMode.profile}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select Goal</option>
                  <option value="More energy">More energy</option>
                  <option value="Better sleep">Better sleep</option>
                  <option value="Weight gain">Weight gain</option>
                  <option value="Weight loss">Weight loss</option>
                  <option value="Become lean and toned">Become lean and toned</option>
                  <option value="Improve digestion">Improve digestion</option>
                  <option value="Improve metabolism">Improve metabolism</option>
                </select>
              </div>
            </div>

            {/* Protein Variety Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Protein Variety (Select All That Apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Chicken', 'Pork', 'Beef', 'Fish', 'Eggs', 'Paneer', 'Tofu', 'Legumes'].map((protein) => {
                  const isSelected = Array.isArray(formData.proteinVariety) && formData.proteinVariety.includes(protein);
                  return (
                    <button
                      key={protein}
                      type="button"
                      onClick={() => handleProteinVarietyChange(protein)}
                      disabled={!editMode.profile}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {protein}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day-Specific Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day-Specific Preferences (Optional)</label>
              <textarea
                name="specificDayPreferences"
                style={{ color: "black", background: "white" }}
                value={formData.specificDayPreferences}
                onChange={handlePrefChange}
                disabled={!editMode.profile}
                placeholder="e.g., No chicken on Monday and Friday, Fish only on weekends"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-none"
              />
            </div>

            {/* General Food Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">General Food Preferences</label>
              <textarea
                name="generalPreferences"
                style={{ color: "black", background: "white" }}
                value={formData.generalPreferences}
                onChange={handlePrefChange}
                disabled={!editMode.profile}
                placeholder="Tell us about your dietary preferences or lifestyle choices"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaLock className="text-orange-600 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Password & Security
                </h2>
              </div>
              {!editMode.password ? (
                <button
                  onClick={() =>
                    setEditMode((prev) => ({ ...prev, password: true }))
                  }
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <FaEdit className="text-sm" />
                  <span>Change Password</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={changePassword}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <img
                        src={loaderGif}
                        alt="Saving..."
                        className="w-4 h-4"
                      />
                    ) : (
                      <FaCheck className="text-sm" />
                    )}
                    <span>Update Password</span>
                  </button>
                  <button
                    onClick={() => cancelEdit("password")}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-sm" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {editMode.password && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    name="oldPassword"
                    style={{color: "black",
                      background: "white"
                    }}
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    style={{color: "black",
                      background: "white"
                    }}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    style={{color: "black",
                      background: "white"
                    }}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="px-6 py-4 border-b border-red-200">
            <div className="flex items-center gap-3">
              <FaTrash className="text-red-600 text-xl" />
              <h2 className="text-xl font-semibold text-red-900">
                Danger Zone
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm mb-2">
                <strong>Warning:</strong> This action cannot be undone. This
                will permanently delete your account, meal plans, and remove all
                of your data from our servers.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash className="text-sm" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-3">
                Are you sure you want to delete your account? All your data will
                be permanently removed.
              </p>
              <p className="text-sm text-gray-700 mb-3">
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting || deleteConfirmText !== "DELETE"}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <img
                      src={loaderGif}
                      alt="Deleting..."
                      className="w-4 h-4"
                    />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FaTrash className="text-sm" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
