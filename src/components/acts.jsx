import React from 'react'
import img_act9 from "../assets/img_act9.jpg";
import img_act5 from "../assets/img_act5.jpg";
import img_act2 from "../assets/img_act2.jpg";
import img_act4 from "../assets/img_act4.jpg";
import img_act10 from "../assets/img_act10.jpg";
import img_act8 from "../assets/img_act8.jpg";


const Acts = () => {
  return (
    <section id="acts" className="bg-[#101330] py-16 sm:py-20 text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm sm:text-base font-semibold text-yellow-400">
          กิจกรรมในค่าย
        </span>
        <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
          ทั้งสนุก ทั้งสาระ แบบเต็ม Max ในค่าย ComCamp24<sup className='text-blue-400'>th</sup>
        </h2>
        <p className="mt-3 text-gray-300 text-sm sm:text-base">
          พบกับกิจกรรมสุดมันส์จากพี่ ๆ ทีมงาน ที่จะทำให้น้องๆสนุกและได้ความรู้
        </p>
      </div>

      {/* Activities Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
        {/* กิจกรรม 1 */}
        <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <img
            src={img_act9}
            alt="พบปะอาจารย์และพี่ค่าย"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">พบปะอาจารย์และพี่ค่าย</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              เพื่อให้น้องๆได้ทำความรู้จักกับพี่ๆ อาจารย์ รวมถึงเพื่อนๆ ที่มาร่วมในค่ายครั้งนี้
            </p>
          </div>
        </div>

        {/* กิจกรรม 2 */}
        <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <img
            src={img_act5}
            alt="รับฟังความรู้จากพี่วิทยากร"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">รับฟังความรู้จากพี่วิทยากร</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              เพื่อให้น้องๆได้เข้าใจถึงพื้นฐานและเป็นการเตรียมความพร้อมไปในตัว
            </p>
          </div>
        </div>

        {/* กิจกรรม 3 */}
        <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <img
            src={img_act2}
            alt="ลงมือปฏิบัติจริง"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">ลงมือปฏิบัติจริง</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              หลังจากรับฟังความรู้จากพี่วิทยากร น้องๆจะได้ลงมือปฏิบัติจริง เพื่อให้เกิดความเข้าใจมากยิ่งขึ้น
            </p>
          </div>
        </div>

        {/* กิจกรรม 4 */}
        <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <img
            src={img_act4}
            alt="สันทนาการ"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">สันทนาการ</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              เพื่อให้น้องๆได้ผ่อนคลายกับกิจกรรมที่ผ่านมา รับรองว่ากิจกรรมนี้เต็มไปด้วยความสนุกและเสียงหัวเราะ
            </p>
          </div>
        </div>

        {/* กิจกรรม 5 */}
        <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <img
            src={img_act10}
            alt="นำเสนองาน"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">นำเสนอผลงาน</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              โอกาสของน้องๆที่จะได้นำเสนอผลงานที่น้องๆได้พัฒนาขึ้นมา แก่คณาจารย์และเพื่อนๆ
            </p>
          </div>
        </div>

        {/* กิจกรรม 6 */}
        <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
          <img
            src={img_act8}
            alt="ถ่ายรูปที่ระลึก"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">ถ่ายรูปที่ระลึก</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              ครั้งหนึ่งเราเคยมาเข้าค่าย Comcamp มาถ่ายรูปเก็บเป็นความทรงจำอันล้ำค่ากัน
            </p>
          </div>

        </div>
      </div>
      <p className="text-center text-gray-300 text-sm sm:text-base mt-6 italic">
        กิจกรรมเพียงบางส่วนเท่านั้น ภาพจาก Comcamp23<sup>rd</sup> ที่ผ่านมา
      </p>
    </section>

  )
}

export default Acts