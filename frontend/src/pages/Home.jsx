import React from "react";
import "./Home.css";
import SampleVideo from "../assets/wellnest.mp4";
import { FaCheck, FaTimes, FaLeaf } from "react-icons/fa";
import { motion } from "framer-motion";
import { FaRobot, FaUserMd, FaAppleAlt, FaHeartbeat } from "react-icons/fa";
import { MdOutlineAnalytics, MdSchedule } from "react-icons/md";
import Diet from "../assets/diet.jpg";
import Habit from "../assets/habit.jpg";
import Support from "../assets/support.jpg";
import Coach from "../assets/coach.jpg";
import Enthusiast from "../assets/enthusiast.jpg";
import Blogger from "../assets/blogger.jpg";
import Designer from "../assets/Designer.jpg";
import Entrepreneur from "../assets/Entrepreneur.jpg";
import SoftwareEngineer from "../assets/SoftwareEngineer.jpg";
import MarketingExec from "../assets/Marketing.jpg";
import Teacher from "../assets/Teacher.jpg";
import HRManager from "../assets/HRManager.jpg";
import CollegeStudent from "../assets/College.jpg";
import Consultant from "../assets/Consultant.jpg";
import Doctor from "../assets/Doctor.jpg";
import Banker from "../assets/Banker.jpg";
import Fitness from "../assets/Fitness.jpg";
import AIWellness from "../assets/AIwell.jpg";
import Expert from "../assets/Expert.jpg";
import Progress from "../assets/Progress.jpg";
import Time from "../assets/Time.jpg";
import Footer from "../components/Footer";

function Home() {
  const cardVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const data = [
    {
      img: Coach,
      name: "Rounak U.",
      role: "Nutrition Coach",
      text: "This platform completely transformed the way I manage my clients. Simple, intuitive, and super effective!",
    },
    {
      img: Enthusiast,
      name: "Chetan B.",
      role: "Fitness Enthusiast",
      text: "The personalized plans and scheduling features keep me motivated and on track with my goals every day.",
    },
    {
      img: Blogger,
      name: "Yash S.",
      role: "Wellness Blogger",
      text: "I love how seamless everything feels. It's modern, reliable, and actually makes healthy living fun.",
    },
  ];

  const plans = [
    {
      name: "Basic",
      icon: <FaLeaf />,
      price: "Free",
      subtitle: "Start your wellness journey",
      color: "#9e9e9e",
      features: {
        included: [
          "Daily wellness tips",
          "Basic meal suggestions",
          "Meal & progress tracking dashboard",
        ],
        notIncluded: [
          "Personalized AI diet plans",
          "Real-time nutrition advice",
          "Expert consultations",
          "Health product discounts",
        ],
      },
      button: "Start for Free",
      popular: false,
    },
    {
      name: "Premium",
      icon: <FaHeartbeat />,
      price: "₹499/month",
      subtitle: "Best for individuals serious about health",
      color: "linear-gradient(135deg, #6bff81ff, #65f0a6ff)",
      features: {
        included: [
          "All Basic features",
          "AI-powered personalized diet & fasting plans",
          "Meal & progress tracking dashboard",
          "Real-time nutrition insights",
          "Priority chat support",
          "Health product discounts",
        ],
        notIncluded: [],
      },
      button: "Get Premium",
      popular: true,
    },
  ];

  return (
    <div className="body">
      <div className="Content">
        <div className="video-container">
          <video className="video" src={SampleVideo} autoPlay loop muted />
        </div>
      </div>

      <section className="bg-white py-20 px-6 sm:px-10 lg:px-20">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            BOOST YOUR ROUTINE WITH{" "}
            <span className="text-green-600">WELLNEST</span>
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            Unlock Better Health with Personalized AI-Powered Workouts,
            Nutrition, and Tracking.
            <br />
            Tailored Just for You.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[AIWellness, Progress, Expert, Time].map((img, idx) => {
            const titles = [
              "AI Wellness Companion",
              "Progress Tracking",
              "Analytics & Insights",
              "Ecommerce",
            ];
            const descs = [
              "Personalized health insights, reminders, and AI-powered suggestions.",
              "Visualize your habits, routines, and weight progress over time.",
              "Have real time updates on your health stats and analytics.",
              "Order health products and supplements directly from the app.",
            ];
            const btnText = [
              "Explore AI Guide",
              "Track Progress",
              "View Analytics",
              "Shop Now",
            ];

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 mb-6 rounded-full overflow-hidden bg-gray-100 shadow-inner">
                  <img
                    src={img}
                    alt={titles[idx]}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {titles[idx]}
                </h3>
                <p className="text-gray-600 mb-5 leading-relaxed flex-grow">
                  {descs[idx]}
                </p>
                <button className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 mt-auto">
                  {btnText[idx]}
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="health-coach-section">
        <h2 className="health-coach-title">
          Why Choose a WellNest Health Plans
        </h2>
        <p className="health-coach-subtitle">
          Our Plans combine AI insights with personalized guidance and
          preferences to help you achieve your fitness, nutrition, and wellness
          goals.
        </p>

        <div className="health-coach-cards">
          <div className="coach-card">
            <img src={Diet} alt="Nutrition Strategies" />
            <div className="coach-card-text">
              <h3>Nutrition Strategies</h3>
              <p>Personalized meal plans to fuel your body and mind.</p>
            </div>
          </div>

          <div className="coach-card">
            <img src={Habit} alt="Habit Building" />
            <div className="coach-card-text">
              <h3>Habit Building</h3>
              <p>Step-by-step routines to create lasting healthy habits.</p>
            </div>
          </div>

          <div className="coach-card">
            <img src={Support} alt="Support & Motivation" />
            <div className="coach-card-text">
              <h3>Support & Motivation</h3>
              <p>
                Continuous encouragement to keep you consistent and focused.
              </p>
            </div>
          </div>
        </div>

        <div className="coach-feature-list">
          <div className="coach-feature-item">
            <FaAppleAlt className="coach-icon" />
            <div>
              <h4>Balance Body & Mind</h4>
              <p>
                Mindful practices to maintain overall wellness and mental
                clarity.
              </p>
            </div>
          </div>

          <div className="coach-feature-item">
            <MdOutlineAnalytics className="coach-icon" />
            <div>
              <h4>Track Your Activity</h4>
              <p>Monitor steps, workouts, and daily movement effortlessly.</p>
            </div>
          </div>

          <div className="coach-feature-item">
            <FaHeartbeat className="coach-icon" />
            <div>
              <h4>Fitness & Performance</h4>
              <p>Overcome obstacles and reach your peak potential.</p>
            </div>
          </div>

          <div className="coach-feature-item">
            <FaRobot className="coach-icon" />
            <div>
              <h4>AI-Powered Plans</h4>
              <p>Get routines personalized to your body type and goals.</p>
            </div>
          </div>

          <div className="coach-feature-item">
            <FaUserMd className="coach-icon" />
            <div>
              <h4>Healthy Daily Life</h4>
              <p>
                Build habits that improve productivity, sleep, and nutrition.
              </p>
            </div>
          </div>

          <div className="coach-feature-item">
            <MdSchedule className="coach-icon" />
            <div>
              <h4>Health Improvement</h4>
              <p>
                Integrate diet, exercise, and lifestyle for lasting results.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rating-section">
        <div className="rating-badge">
          <span className="star">★</span>
          <p>Rated 4/5 by over 10 Thousand users</p>
        </div>
      </section>
      <section className="testimonials-section">
        <h2>Words of praise from others</h2>
        <h2>about our presence.</h2>

        <div className="wrapper-toright">
          <div className="item-right item1">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                Wellnest’s coaching program helped me find balance in my busy
                life. I feel more energetic and confident every day.
              </p>
              <div className="testimonial-author">
                <img
                  src={MarketingExec}
                  alt="Riya Sharma"
                  className="author-img"
                />
                <div>
                  <h4>Riya Sharma</h4>
                  <p>Marketing Executive, Bengaluru</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item2">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The personalized wellness plan truly changed my lifestyle. My
                stress levels have gone down drastically.
              </p>
              <div className="testimonial-author">
                <img
                  src={SoftwareEngineer}
                  alt="Arjun Mehta"
                  className="author-img"
                />
                <div>
                  <h4>Arjun Mehta</h4>
                  <p>Software Engineer, Pune</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item3">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The meditation and diet guidance from Wellnest made me more
                focused and productive at work.
              </p>
              <div className="testimonial-author">
                <img src={Teacher} alt="Priya Nair" className="author-img" />
                <div>
                  <h4>Priya Nair</h4>
                  <p>Teacher, Kochi</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item4">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                I never thought wellness coaching could have such an impact. I
                feel healthier and happier than ever before.
              </p>
              <div className="testimonial-author">
                <img
                  src={Entrepreneur}
                  alt="Karan Patel"
                  className="author-img"
                />
                <div>
                  <h4>Kabir Dhaliwal</h4>
                  <p>Entrepreneur, Ahmedabad</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item5">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The yoga sessions and coaching at Wellnest gave me clarity and
                inner peace I was searching for.
              </p>
              <div className="testimonial-author">
                <img src={Designer} alt="Ananya Gupta" className="author-img" />
                <div>
                  <h4>Ananya Gupta</h4>
                  <p>Designer, New Delhi</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item6">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The team is supportive and motivating. My sleep has improved and
                I’ve built healthy routines.
              </p>
              <div className="testimonial-author">
                <img src={HRManager} alt="Rohit Verma" className="author-img" />
                <div>
                  <h4>Rohit Verma</h4>
                  <p>HR Manager, Mumbai</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item7">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The guidance helped me lose weight in a healthy way and gain
                confidence in myself again.
              </p>
              <div className="testimonial-author">
                <img
                  src={CollegeStudent}
                  alt="Sneha Iyer"
                  className="author-img"
                />
                <div>
                  <h4>Sneha Iyer</h4>
                  <p>College Student, Chennai</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item8">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                Wellnest’s holistic approach towards mental and physical health
                is exactly what I needed.
              </p>
              <div className="testimonial-author">
                <img
                  src={Consultant}
                  alt="Vikram Singh"
                  className="author-img"
                />
                <div>
                  <h4>Vikram Singh</h4>
                  <p>Consultant, Gurugram</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item9">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                My anxiety levels have reduced, and I feel more in control of my
                daily life thanks to their sessions.
              </p>
              <div className="testimonial-author">
                <img src={Doctor} alt="Neha Reddy" className="author-img" />
                <div>
                  <h4>Neha Reddy</h4>
                  <p>Doctor, Hyderabad</p>
                </div>
              </div>
            </div>
          </div>

          <div className="item-right item10">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                This journey with Wellnest has been life-changing. I feel
                healthier, calmer, and more positive.
              </p>
              <div className="testimonial-author">
                <img src={Banker} alt="Amit Kulkarni" className="author-img" />
                <div>
                  <h4>Amit Kulkarni</h4>
                  <p>Banker, Nagpur</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper-toleft">
          <div className="item-left item1">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The guidance helped me lose weight in a healthy way and gain
                confidence in myself again.
              </p>
              <div className="testimonial-author">
                <img src={Designer} alt="Sneha Iyer" className="author-img" />
                <div>
                  <h4>Sneha Iyer</h4>
                  <p>College Student, Chennai</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item2">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The personalized approach made all the difference. I finally
                feel like I’m on the right track.
              </p>
              <div className="testimonial-author">
                <img
                  src={SoftwareEngineer}
                  alt="Ravi Kumar"
                  className="author-img"
                />
                <div>
                  <h4>Ravi Kumar</h4>
                  <p>Software Engineer, Bangalore</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item3">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                I never thought I could achieve this level of fitness. Thank
                you, Wellnest!
              </p>
              <div className="testimonial-author">
                <img src={Fitness} alt="Anjali Mehta" className="author-img" />
                <div>
                  <h4>Anjali Mehta</h4>
                  <p>Fitness Trainer, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item4">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The mental health support has been invaluable. I’m so grateful
                for this service.
              </p>
              <div className="testimonial-author">
                <img src={Teacher} alt="Priya Sharma" className="author-img" />
                <div>
                  <h4>Priya Sharma</h4>
                  <p>Teacher, Delhi</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item5">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                I’ve tried many programs, but Wellnest’s approach is truly
                unique and effective.
              </p>
              <div className="testimonial-author">
                <img src={Banker} alt="Mohit Verma" className="author-img" />
                <div>
                  <h4>Mohit Verma</h4>
                  <p>Entrepreneur, Pune</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item6">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                I appreciate the holistic approach to wellness. It’s made a real
                difference in my life.
              </p>
              <div className="testimonial-author">
                <img
                  src={MarketingExec}
                  alt="Neha Bhatia"
                  className="author-img"
                />
                <div>
                  <h4>Neha Bhatia</h4>
                  <p>Marketing Manager, Noida</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item7">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The personalized coaching has been a game changer for me.
              </p>
              <div className="testimonial-author">
                <img
                  src={SoftwareEngineer}
                  alt="Ravi Kumar"
                  className="author-img"
                />
                <div>
                  <h4>Ravi Kumar</h4>
                  <p>Software Engineer, Bangalore</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item8">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                I’ve never felt more supported in my wellness journey.
              </p>
              <div className="testimonial-author">
                <img src={Fitness} alt="Anjali Mehta" className="author-img" />
                <div>
                  <h4>Anjali Mehta</h4>
                  <p>Fitness Trainer, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item9">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                The community support is incredible. I feel like I belong.
              </p>
              <div className="testimonial-author">
                <img src={Teacher} alt="Priya Sharma" className="author-img" />
                <div>
                  <h4>Priya Sharma</h4>
                  <p>Teacher, Delhi</p>
                </div>
              </div>
            </div>
          </div>
          <div className="item-left item10">
            <div className="testimonial-card">
              <div className="quote-icon">“</div>
              <p className="testimonial-text">
                I’m amazed at the progress I’ve made in such a short time.
              </p>
              <div className="testimonial-author">
                <img
                  src={Entrepreneur}
                  alt="Kabir Dhaliwal"
                  className="author-img"
                />
                <div>
                  <h4>Mohit Verma</h4>
                  <p>Entrepreneur, Pune</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-section">
        <div className="impact-left">
          <h2>Our Impact</h2>
        </div>
        <div className="impact-right">
          <h2 className="impact-title">
            Boost Your <span className="gradient-text">Wellness Impact. </span>
            Elevate your Health Journey{" "}
            <span className="gray-text">with WellNest Solutions.</span>
          </h2>

          <div className="impact-stats">
            <div className="impact-card">
              <h3>84.3%</h3>
              <p>Success rate achieved through proven wellness strategies.</p>
              <button className="impact-button">Read More</button>
            </div>
            <div className="impact-card">
              <h3>10k+</h3>
              <p>
                Happy clients who have transformed their health, mindset, and
                lifestyle with our guidance.
              </p>
            </div>
            <div className="impact-card">
              <h3>₹499/mo</h3>
              <p>
                Start your journey with an affordable plan designed to help you
                unlock lasting wellness.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;
