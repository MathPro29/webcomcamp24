import React from "react";
// ถ้าใช้ Framer Motion v11+: 
import { motion } from "motion/react";
// ถ้าใช้เวอร์ชันเดิม ให้เปลี่ยนเป็น: import { motion } from "framer-motion";

/// Components Import
import Countdown from "./countdown";

import { Link } from "react-router-dom";



const HeroSections = () => {
  return (
    <section id="home" className="relative overflow-hidden bg-[#101330] mt-12 sm:mt-16 md:mt-20 lg:mt-24 xl:mt-28">
      {/* --- Content --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center text-center py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="text-white font-bold">
            <h1
              className="leading-[0.95] tracking-tight mb-2 sm:mb-3 mt-2
                     text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            >
              ComCamp24
              <sup className="align-super text-[0.5em] ml-0.5">th</sup>
            </h1>

            <p className="text-white/80 text-base sm:text-lg md:text-xl lg:text-2xl mb-5">
              เปิดรับสมัครตั้งแต่วันที่ N ถึง N+1 พ.ศ.2668
            </p>

            {/* Sign up center */}
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/register"
                  className="inline-block bg-[#e28d0d] hover:bg-[#a96909]
                 text-white font-semibold rounded-xl
                 px-8 py-3 sm:px-10 sm:py-4 text-lg sm:text-xl
                 shadow-lg transition-all duration-300"
                >
                  สนใจลงทะเบียน
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <Countdown />

      <p
        className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8
               text-center text-white
               pt-4 pb-10 sm:pb-12 md:pb-14 lg:pb-16"
      >
        ค่ายยุวชนคอมพิวเตอร์ จัดขึ้นโดย สาขาวิชาวิทยาการคอมพิวเตอร์
        คณะวิทยาศาสตร์ มหาวิทยาลัยแม่โจ้ <p>เพื่อให้น้องๆ ที่สนใจเรียนรู้และฝึกฝน
          ทักษะด้านคอมพิวเตอร์เป็นเวลา 100 วัน 99 คืน</p>
      </p>
    </section>


  );
};

export default HeroSections;
