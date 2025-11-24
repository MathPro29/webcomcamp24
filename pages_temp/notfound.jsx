import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const errorVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.8 } },
};

const numberVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 18 } },
  float: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

const infoVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const NotFound = () => {
  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-white to-white p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-3xl w-full text-center">
        <motion.div
          variants={errorVariants}
          initial="hidden"
          animate={["visible", "shake"]}
          className="inline-block bg-red-50 border border-red-100 rounded-2xl px-25 py-6 shadow-lg mb-6"
        >
          <motion.h2 className="text-3xl font-semibold text-red-700 mb-2 " variants={errorVariants}>
            Oops! ไม่พบหน้านี้
          </motion.h2>

          <motion.div className="items-baseline justify-center gap-6">
            <motion.h1
              className="text-6xl md:text-8xl font-extrabold text-gray-800 my-6"
              variants={numberVariants}
              animate="float"
            >
              404
              <p className='text-sm'>Not Found</p>
            </motion.h1>

            <motion.div className="flex flex-col text-left" variants={infoVariants}>
              <motion.p className="text-lg md:text-xl text-gray-600 font-medium mb-2" variants={infoVariants}>
                ขออภัย — หน้าที่คุณค้นหาไม่พบ
              </motion.p>
              <motion.p className="text-sm text-gray-500 mb-4" variants={infoVariants}>
                ลองตรวจสอบ URL หรือกลับไปยังหน้าหลัก
              </motion.p>

              <motion.div className="flex gap-3 items-center justify-center" variants={infoVariants}>
                <Link to="/" className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="cursor-pointer px-4 py-2 bg-orange-400 text-white rounded-lg shadow hover:shadow-md transition-all"
                  >
                    กลับหน้าหลัก
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* subtle floating blobs */}
        <div className="pointer-events-none relative mt-8">
          <motion.span
            className="absolute -left-12 -top-8 w-32 h-32 rounded-full bg-blue-100/60 blur-3xl"
            animate={{ x: [0, 10, 0], y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.span
            className="absolute right-4 top-12 w-24 h-24 rounded-full bg-pink-100/60 blur-3xl"
            animate={{ x: [0, -8, 0], y: [0, 6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
