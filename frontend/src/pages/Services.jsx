import React from "react";
import { useNavigate } from "react-router-dom";
import DietService from "../assets/Food.jpg";
import {
  RestaurantMenu,
  Fastfood,
  QuestionAnswer,
  ShoppingCart,
  Person,
  BarChart,
  Explore,
  Login,
  VerifiedUser,
  Dashboard,
  Info,
} from "@mui/icons-material";

import Footer from "../components/Footer";

function Services() {
  const navigate = useNavigate();
  const services = [
    {
      title: "Personalized Diet Plans",
      desc: "AI-curated meal plans tailored to your goals, preferences, and lifestyle.",
      icon: <RestaurantMenu fontSize="large" className="text-blue-600" />,
    },
    {
      title: "Meal Tracking",
      desc: "Track your daily meals, calories, and nutrients with ease and precision.",
      icon: <Fastfood fontSize="large" className="text-blue-600" />,
    },
    {
      title: "Real-Time Nutrition Advice",
      desc: "Get instant recommendations from our AI nutrition assistant anytime.",
      icon: <QuestionAnswer fontSize="large" className="text-blue-600" />,
    },
    {
      title: "Health Products E-Commerce",
      desc: "Shop seamlessly for supplements, fitness essentials, and wellness products.",
      icon: <ShoppingCart fontSize="large" className="text-blue-600" />,
    },
    {
      title: "Expert Consultation",
      desc: "Connect with health experts for personalized guidance and support.",
      icon: <Person fontSize="large" className="text-blue-600" />,
    },
    {
      title: "Progress Analytics",
      desc: "Visualize your health journey with detailed reports and insights.",
      icon: <BarChart fontSize="large" className="text-blue-600" />,
    },
  ];

  const processSteps = [
    {
      title: "Explore Our Services",
      desc: "Discover AI-powered health & wellness tools designed to elevate your lifestyle.",
      icon: <Explore fontSize="large" className="text-emerald-600" />,
    },
    {
      title: "Login / Register",
      desc: "Create your free WellNest account in under a minute - no hassle, no stress.",
      icon: <Login fontSize="large" className="text-emerald-600" />,
    },
    {
      title: "Verify OTP",
      desc: "Securely verify your identity with instant OTP verification for safe access.",
      icon: <VerifiedUser fontSize="large" className="text-emerald-600" />,
    },
    {
      title: "Dashboard",
      desc: "Fill the Preferences Onboarding Pages and Access your personalized wellness dashboard with plans, tracking, and more.",
      icon: <Dashboard fontSize="large" className="text-emerald-600" />,
    },
    {
      title: "About WellNest",
      desc: "AI-powered health platform: Diet Plans, Meal Tracking, Nutrition Advice, E-Commerce & Expert Consultation.",
      icon: <Info fontSize="large" className="text-emerald-600" />,
    },
  ];

  return (
    <div className="max-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 min-h-[100vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Our Services
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight">
              WellNest
              <br />
              <span className="text-blue-600">
                Powered by AI for Your Health
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              WellNest is your all-in-one health & wellness platform. Get
              personalized diet plans, track your meals, receive real-time
              nutrition advice, shop for health products, and consult with
              experts — all through a seamless AI-powered experience.
            </p>
            <button
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2"
              onClick={() => navigate("/login")}
            >
              Get Started
              <span>→</span>
            </button>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={DietService}
                alt="WellNest Service Illustration"
                className="w-full h-[24rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="bg-white py-16 lg:py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
              Our Premium Services
            </h2>
            <p className="text-lg text-gray-600">
              Explore how WellNest can help you achieve your health & wellness
              goals with AI-powered solutions.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-black mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
              Proven Process for Smarter Wellness
            </h2>
            <p className="text-lg text-gray-600">
              We simplify your wellness journey, so you can focus on your health
              — not paperwork.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-600 transition-colors duration-300 text-center"
              >
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Services;
