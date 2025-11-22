import React from "react";
// ถ้าใช้ Framer Motion v11+: 
import { motion } from "framer-motion";
// ถ้าใช้เวอร์ชันเดิม ให้เปลี่ยนเป็น: import { motion } from "framer-motion";

import Countdown from "./countdown";
import { Link } from "react-router-dom";

const HeroSections = () => {
  return (
    <section id="home" className="relative min-h-screen bg-gradient-to-b from-[#0a0d1f] via-[#101330] to-[#0a0d1f] flex items-center justify-center overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 sm:space-y-12"
        >
          {/* Title */}
          <div className="space-y-3 mt-20">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white font-bold leading-tight"
              style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
            >
              ComCamp24
              <sup className="text-[0.4em] align-super ml-1 text-white">th</sup>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-white/60 text-sm sm:text-base md:text-lg font-light tracking-wide"
            >
              เปิดรับสมัครตั้งแต่วันที่ อะไรนะ ถึง N+1 พ.ศ.2569
            </motion.p>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-2"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(226, 141, 13, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#e28d0d] to-[#f5a623] hover:from-[#f5a623] hover:to-[#e28d0d] text-white font-semibold rounded-full px-10 py-4 text-base sm:text-lg shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <span className="relative z-10">สนใจลงทะเบียน</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </motion.button>
            </Link>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Countdown />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="pt-4"
          >
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="max-w-2xl mx-auto space-y-2 pt-8"
          >
            <p className="text-white/70 text-sm sm:text-base leading-relaxed font-light">
              ค่ายยุวชนคอมพิวเตอร์ จัดขึ้นโดย สาขาวิชาวิทยาการคอมพิวเตอร์
            </p>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed font-light">
              คณะวิทยาศาสตร์ มหาวิทยาลัยแม่โจ้
            </p>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-light pt-2">
              เพื่อให้น้องๆ ที่สนใจเรียนรู้และฝึกฝนทักษะด้านคอมพิวเตอร์เป็นเวลา 2 วัน 1 คืน
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0d1f] to-transparent"></div>
    </section>
  );
};

export default HeroSections;