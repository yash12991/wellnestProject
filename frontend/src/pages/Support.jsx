import React, { useState } from "react";
import LiquidEther from "../components/UI/LiquidEther"; // adjust path if needed
import "./Support.css"; // optional for custom styles
import ShinyText from "../components/UI/ShinyText";
import RotatingText from "../components/UI/RotatingText";
import FooterSupport from "../components/FooterSupport";

const faqs = [
  {
    q: "How can I contact support?",
    a: "You can reach us through the 'Contact Us' button above or by emailing support@wellnest.com.",
  },
  {
    q: "What is the response time?",
    a: "Our team usually responds within 24 hours, but most queries are answered within a few hours.",
  },
  {
    q: "Do you provide live chat?",
    a: "Yes, live chat support is available during business hours in your dashboard.",
  },
  {
    q: "Where can I track my requests?",
    a: "You can track all your previous requests in your profile’s Support section.",
  },
];

const FAQItem = ({ q, a, isOpen, onClick }) => (
  <div
    className="faq-item border border-gray-300 dark:border-gray-700 rounded-xl mb-4 p-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-md cursor-pointer transition hover:shadow-lg"
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {q}
      </h3>
      <span className="text-xl text-gray-600 dark:text-gray-300 transition-transform duration-300">
        {isOpen ? "−" : "+"}
      </span>
    </div>
    {isOpen && (
      <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
        {a}
      </p>
    )}
  </div>
);

const Support = () => {
  const [openIndex, setOpenIndex] = useState(null);

  // State for form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ticket Submitted:", formData);
    alert("Your support ticket has been submitted!");
    setFormData({ name: "", email: "", category: "General", message: "" });
  };

  return (
    <div className="support-page">
      {/* Section 1: Hero with LiquidEther */}
      <div style={{ width: "100%", height: "775px", position: "relative" }}>
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
        <div className="support-hero-content">
          <h1>Need Help?</h1>
          <p>Our support team is here to assist you.</p>
          <button>
            <ShinyText
              text="Contact Us"
              disabled={false}
              speed={3}
              className="custom-class"
            />
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="FAQ py-10">
        <h2 className="Head flex items-center justify-center gap-2 mb-6">
          <span>Frequently Asked</span>
          <div className="px-2 sm:px-2 md:px-3 bg-green-300 text-black py-0.5 sm:py-1 md:py-2 rounded-lg flex justify-center items-center w-[220px]">
            <RotatingText
              texts={["Questions", "Queries", "Concerns"]}
              mainClassName="overflow-hidden text-center"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
        </h2>
        <div className="faq-list max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>

      {/* Ticket Submission Form */}
      <div className="ticket-form max-w-4xl mx-auto bg-black border border-zinc-800 rounded-2xl p-12 mb-16">
        {/* Heading */}
        <h2 className="text-3xl font-normal mb-12 text-center text-white tracking-tight drop-shadow-sm">
          Submit a Support Ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-emerald-300 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Name"
              className="w-full px-5 py-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 hover:border-emerald-400/70 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-emerald-300 mb-2"
            >
              Your Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full px-5 py-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 hover:border-emerald-400/70 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-emerald-300 mb-2"
            >
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 hover:border-emerald-400/70 transition-all duration-300"
            >
              <option>General</option>
              <option>Account</option>
              <option>Payments</option>
              <option>Technical</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-emerald-300 mb-2"
            >
              Describe your issue
            </label>
            <textarea
              name="message"
              id="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Write your message here..."
              className="w-full px-5 py-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 hover:border-emerald-400/70 transition-all duration-300 shadow-inner"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded font-normal text-lg text-white bg-emerald-500 hover:from-green-400 hover:via-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/30 transition-all duration-300 active:scale-95"
          >
            Submit Ticket
          </button>
        </form>
      </div>
      <FooterSupport />
    </div>
  );
};

export default Support;
