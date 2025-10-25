import React, { useEffect, useRef } from "react";
import "./About.css";
import AboutImg from "../assets/AboutImg.jpg";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import Mission from "../assets/Mission.jpg";
import MissionRight from "../assets/Mission-right.jpg";
import { FaCheckCircle } from "react-icons/fa";
import VisionLeft from "../assets/visionleft.jpg";
import Vision from "../assets/Vision.jpg";
import History from "../assets/History.jpg";
import HistoryRight from "../assets/HistoryRight.jpg";
import Footer from "../components/Footer";

import { gsap } from "gsap";

function About() {
  const { ref, inView } = useInView({ triggerOnce: true });
  const heroRef = useRef(null);
  const aboutTextRef = useRef(null);
  const aboutImageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Section Animation
      const tl = gsap.timeline();
      tl.fromTo(
        aboutTextRef.current?.querySelector(".about-subtitle"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
        .fromTo(
          aboutTextRef.current?.querySelector(".about-title"),
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
          "-=0.5"
        )
        .fromTo(
          aboutTextRef.current?.querySelector(".about-description"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        );

      // Hero Image Animation with floating effect
      gsap.fromTo(
        aboutImageRef.current,
        { opacity: 0, scale: 0.8, rotate: -5 },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1.2,
          ease: "back.out(1.7)",
          delay: 0.3,
        }
      );

      // Continuous floating animation for hero image
      gsap.to(aboutImageRef.current, {
        y: -10,
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, heroRef);

    return () => ctx.revert(); // cleanup animations on unmount
  }, []);
  return (
    <div ref={heroRef}>
      <section className="about-container">
        <div className="Text" ref={aboutTextRef}>
          <p className="about-subtitle">About Us</p>
          <h1 className="about-title">
            Dedicated to Your Health &{" "}
            <span className="highlight">WellNess.</span>
          </h1>
          <p className="about-description">
            Your Health is our top priority. With expert care tailored just for
            you. Trusted by Thousands, we are committed to providing you with
            the best care and support on your wellness journey.
          </p>
        </div>
        <div className="image" ref={aboutImageRef}>
          <img src={AboutImg} alt="About Us" />
        </div>
      </section>
      <section className="description-cards">
        <div className="stats" ref={ref}>
          <div className="stat">
            {inView && (
              <h2>
                <CountUp end={5000} duration={2} />+
              </h2>
            )}
            <p>Personalized Diet Plans</p>
          </div>
          <div className="stat">
            {inView && (
              <h2>
                <CountUp end={200} duration={2} />+
              </h2>
            )}
            <p>Certified Experts</p>
          </div>
          <div className="stat">
            {inView && (
              <h2>
                <CountUp end={10000} duration={2} />+
              </h2>
            )}
            <p>Active Users</p>
          </div>
          <div className="stat">
            {inView && (
              <h2>
                <CountUp end={50} duration={2} />+
              </h2>
            )}
            <p>Wellness Programs</p>
          </div>
        </div>
      </section>
      <section className="Mission">
        <div className="Mission-left">
          <img src={Mission} alt="Mission Blueprint" className="main-img" />
          <img
            src={MissionRight}
            alt="Mission Workers"
            className="overlay-img"
          />
        </div>

        <div className="Mission-right">
          <h2>Our Mission</h2>
          <p>
            At WellNest, our mission is to inspire healthier, happier lives by
            making wellness simple, accessible, and sustainable for everyone. We
            are dedicated to guiding individuals on their wellness journey with
            personalized care, innovative solutions, and a supportive community.
            Through expert guidance and holistic practices, we aim to empower
            people to build long-term habits that nurture both body and mind.
            Our commitment is to create a space where wellness becomes a
            lifestyle, not just a goal.
          </p>
          <ul className="mission-points">
            <li>
              <FaCheckCircle className="icon" /> Empowering Personalized
              Wellness Journeys
            </li>
            <li>
              <FaCheckCircle className="icon" /> Promoting Healthy Habits and
              Mindful Living
            </li>
            <li>
              <FaCheckCircle className="icon" /> Offering Expert Guidance and
              Support
            </li>
            <li>
              <FaCheckCircle className="icon" /> Building a Strong and
              Supportive Community
            </li>
          </ul>
        </div>
      </section>
      <section className="Vision">
        <div className="Vision-left">
          <h2>Our Vision</h2>
          <p>
            At WellNest, our vision is to redefine wellness by creating a future
            where healthier living is simple, accessible, and part of everyday
            life. We envision a world where technology, personalized guidance,
            and holistic practices come together to empower individuals to
            achieve balance in mind, body, and lifestyle. By fostering
            innovation and sustainability in wellness, we aim to inspire
            communities to embrace healthier choices and thrive in every aspect
            of life.
          </p>
          <ul className="vision-points">
            <li>
              <FaCheckCircle className="icon" /> Inspiring Healthy Living for
              All
            </li>
            <li>
              <FaCheckCircle className="icon" /> Pioneering Holistic and
              Sustainable Wellness
            </li>
            <li>
              <FaCheckCircle className="icon" /> Harnessing Technology for
              Smarter Wellness Solutions
            </li>
            <li>
              <FaCheckCircle className="icon" /> Building a Connected and
              Supportive Community
            </li>
          </ul>
        </div>

        <div className="Vision-right">
          <img src={Vision} alt="WellNest Vision" className="main-img" />
          <div className="overlay-img">
            <img src={VisionLeft} alt="WellNest Community" />
          </div>
        </div>
      </section>
      <section className="History">
        <div className="History-left">
          <img src={History} alt="WellNest History" className="main-img" />
          <div className="overlay-img">
            <img src={HistoryRight} alt="WellNest Milestones" />
          </div>
        </div>

        <div className="History-right">
          <h2>Our History</h2>
          <p>
            WellNest began with a simple belief: wellness should be accessible
            to everyone, everywhere. What started as a small initiative to
            provide personalized wellness guidance has grown into a trusted
            platform that empowers individuals and communities to embrace
            healthier lifestyles. Over the years, we have combined expert
            knowledge, innovative solutions, and a supportive approach to
            redefine the way people experience wellness. Today, WellNest has
            evolved into an AI-powered health and wellness platform that brings
            technology and care together in one seamless experience. From
            personalized diet plans and smart meal tracking to real-time
            nutrition advice and expert consultations, we ensure that every
            individual receives the guidance they need to achieve their goals.
            With an integrated e-commerce marketplace for health products and a
            recipe showcase linked to each meal plan, WellNest continues to
            innovate and make wellness simpler, smarter, and sustainable for
            everyone.
          </p>

          <ul className="history-points">
            <li>
              <FaCheckCircle className="icon" /> Founded with a vision for
              holistic wellness
            </li>
            <li>
              <FaCheckCircle className="icon" /> Expanded services to digital
              and personalized care
            </li>
            <li>
              <FaCheckCircle className="icon" /> Built a strong community of
              wellness seekers
            </li>
            <li>
              <FaCheckCircle className="icon" /> Continuing to innovate for a
              healthier future
            </li>
          </ul>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default About;
