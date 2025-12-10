import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Countdown helper: คืนค่าเวลาที่เหลือจนถึง targetDate (ms)
 * targetDate: string or Date
 */
const countdown_time = (targetDate = new Date()) => {
  const now = new Date();
  const target = new Date(targetDate);
  const total = Math.max(0, target - now);

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { total, days, hours, minutes, seconds };
};

/**
 * Simple confetti particle (one-shot)
 * Note: random values are precomputed in parent and passed down so they do not change each render.
 */
const ConfettiParticle = ({ x, y, xOffset, duration, delay, color, rotateDir }) => (
  <motion.div
    className="absolute w-3 h-3 rounded-full"
    style={{ left: `${x}%`, top: `${y}%`, background: color }}
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      x: [0, xOffset],
      y: [0, -100, -220, -320],
      rotate: [0, 360 * rotateDir],
    }}
    transition={{ duration, delay, ease: "easeOut", repeat: 0 }}
  />
);

const CampCountdown = () => {
  // ตั้งเวลาที่นี่เป็น ISO string หรือ Date object
  // ตัวอย่าง:
  const OPEN_TARGET = "2026-02-06T23:59:59";  // เวลาเปิดค่าย
  const CLOSE_TARGET = "2026-02-08T18:00:00"; // เวลาปิดค่าย

  // ตรวจสอบความถูกต้องเบื้องต้น
  if (new Date(CLOSE_TARGET) <= new Date(OPEN_TARGET)) {
    // ถ้าเวลา close <= open จะ console.error และ component จะแสดงข้อความ error
    console.error("CLOSE_TARGET must be after OPEN_TARGET");
  }

  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // สถานะสามแบบ:
  // beforeOpen: now < open
  // openPeriod: open <= now < close
  // afterClose: now >= close
  const isBeforeOpen = now < new Date(OPEN_TARGET);
  const isAfterClose = now >= new Date(CLOSE_TARGET);
  const isOpenPeriod = !isBeforeOpen && !isAfterClose;

  // ถ้าต้องการ countdown ถึงเวลาเปิด (เมื่อ beforeOpen)
  const countdownToOpen = React.useMemo(() => countdown_time(OPEN_TARGET), [now, OPEN_TARGET]);

  // สร้าง confetti particles แบบคงที่ (precompute) ถ้าต้องการตอนเปิด
  const confettiParticles = React.useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 60 + Math.random() * 30,
      xOffset: (Math.random() - 0.5) * 220,
      duration: 2.2 + Math.random() * 1.5,
      delay: Math.random() * 0.6,
      color: `hsl(${Math.floor(Math.random() * 360)}, 75%, 55%)`,
      rotateDir: Math.random() > 0.5 ? 1 : -1,
    }));
  }, []);

  // เลย์เอาต์/UI: ก่อนเปิด -> แสดง countdown; เปิดแล้ว -> ข้อความเปิด + confetti; ปิดแล้ว -> ข้อความปิด
  return (
    <div className="flex flex-col items-center justify-center text-center text-white px-4 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isBeforeOpen && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="z-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2  bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              Countdown เวลาเปิดค่าย
            </h2>
            <p className="text-lg text-white">
              ค่ายเริ่มวันที่ 7 กุมภาพันธ์ 2569
            </p>

            <div className="flex gap-2 sm:gap-3 justify-center mb-6 px-4">
              {[
                { label: "วัน", value: countdownToOpen.days },
                { label: "ชั่วโมง", value: countdownToOpen.hours },
                { label: "นาที", value: countdownToOpen.minutes },
                { label: "วินาที", value: countdownToOpen.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 lg:w-24 lg:h-28 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mt-3"
                >
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-[#e28d0d]">
                    {item.value.toString().padStart(2, "0")}
                  </span>
                  <span className="text-xs sm:text-sm md:text-base text-white/80 mt-1 sm:mt-2">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>


          </motion.div>
        )}

        {isOpenPeriod && (
          <motion.div
            key="open"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="relative z-20"
          >
            {/* Confetti */}
            {confettiParticles.map((p) => (
              <ConfettiParticle
                key={p.id}
                x={p.x}
                y={p.y}
                xOffset={p.xOffset}
                duration={p.duration}
                delay={p.delay}
                color={p.color}
                rotateDir={p.rotateDir}
              />
            ))}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                เปิดค่ายแล้ว
              </span>
            </h1>
            <p className="text-lg text-white/90">ค่าย ComCamp 24<sup className="text-yellow-400">th</sup> เริ่มแล้ว</p>

          </motion.div>
        )}

        {isAfterClose && (
          <motion.div
            key="closed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                ค่ายปิดแล้ว
              </span>
            </h1>
            <p className="text-lg text-white/80">เจอกันใหม่ค่าย Comcamp25<sup className="">th</sup> นะ</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

export default CampCountdown;



