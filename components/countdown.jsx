import React from 'react'
import { motion } from "framer-motion";

const countdown_time = (targetDate = new Date()) => {
  const now = new Date();
  const target = new Date(targetDate);
  let diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);

  const seconds = Math.floor(diff / 1000);

  return {
    total: Math.max(0, target - now),
    days,
    hours,
    minutes,
    seconds,
  };
};


const Countdown = () => {
  const [timeLeft, setTimeLeft] = React.useState(countdown_time('2026-02-06T23:59:59'));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(countdown_time('2026-02-06T23:59:59'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center text-white py-8 px-4">
      <motion.h1
        className="text-lg sm:text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Countdown วันเปิดค่าย
        <h2 className="text-base sm:text-lg md:text-xl font-normal mt-1 text-white/70">
          7 กุมภาพันธ์ 2569
        </h2>
      </motion.h1>

      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb--">
        {[
          { label: "วัน", value: timeLeft.days },
          { label: "ชั่วโมง", value: timeLeft.hours },
          { label: "นาที", value: timeLeft.minutes },
          { label: "วินาที", value: timeLeft.seconds },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center justify-center w-16 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#e28d0d]">
              {item.value.toString().padStart(2, "0")}
            </span>
            <span className="text-xs sm:text-sm text-white/70 mt-1">
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export default Countdown