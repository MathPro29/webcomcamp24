import React from 'react'
import Sponsors_sm from '../assets/sponsors_sm.png'
import Sponsors_tall from '../assets/sponsors_tall.png'

const Footer = () => {
    return (
        <footer>
            {/* รายชื่อผู้สนับสนุน Sponsors - Responsive */}
            <div className='bg-white py-8'>
                <p className='text-center text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-4'>ขอขอบคุณผู้สนับสนุน</p>
                <div className='flex justify-center px-4'>
                    {/* แสดงรูป sponsors_sm สำหรับหน้าจอเล็ก (< md) */}
                    <img
                        src={Sponsors_tall}
                        alt="รายชื่อผู้สนับสนุน"
                        className="block md:hidden w-full max-w-2xl"
                    />
                    {/* แสดงรูป sponsors_tall สำหรับหน้าจอกลาง-ใหญ่ (md - lg) */}
                    <img
                        src={Sponsors_tall}
                        alt="รายชื่อผู้สนับสนุน"
                        className="hidden md:block w-full max-w-4xl"
                    />
                </div>
            </div>

            {/* Copyright */}
            <div className="bg-[#101330] py-6 text-center text-sm text-gray-400">
                © 2025 Comcamp24th All rights reserved.
            </div>
        </footer>

    )
}

export default Footer