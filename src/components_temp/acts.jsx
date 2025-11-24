import React from 'react'


const Acts = () => {
  return (
   <section id="acts" className="bg-[#101330] py-16 sm:py-20 text-white">
  {/* Header */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
    <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm sm:text-base font-semibold text-yellow-400">
      กิจกรรมในค่าย
    </span>
    <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
      สนุก เรียนรู้ และสร้างแรงบันดาลใจในค่าย ComCamp24<sup className='text-blue-400'>th</sup>
    </h2>
    <p className="mt-3 text-gray-300 text-sm sm:text-base">
      พบกับกิจกรรมสุดมันส์จากพี่ ๆ ทีมงานและอาจารย์ ที่จะทำให้คุณทั้งเรียนและเล่นไปพร้อมกัน!
    </p>
  </div>

  {/* Activities Grid */}
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
    {/* กิจกรรม 1 */}
    <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
      <img
        src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80"
        alt="Workshop เขียนโปรแกรม"
        className="w-full h-48 object-cover"
      />
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Workshop เขียนโปรแกรม</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          ฝึกเขียนโปรแกรมพื้นฐานและทดลองสร้างโปรเจกต์จริงกับพี่ ๆ ในค่าย
        </p>
      </div>
    </div>

    {/* กิจกรรม 2 */}
    <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
      <img
        src="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=800&q=80"
        alt="Team Building"
        className="w-full h-48 object-cover"
      />
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Team Building</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          สร้างมิตรภาพและเรียนรู้การทำงานเป็นทีมผ่านเกมและกิจกรรมสุดสนุก
        </p>
      </div>
    </div>

    {/* กิจกรรม 3 */}
    <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
        alt="Project Presentation"
        className="w-full h-48 object-cover"
      />
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Project Presentation</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          แสดงผลงานและไอเดียสุดสร้างสรรค์ที่คุณได้เรียนรู้ในค่าย พร้อมคำแนะนำจากพี่ ๆ และอาจารย์
        </p>
      </div>
    </div>

    {/* กิจกรรม 3 */}
    <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
        alt="Project Presentation"
        className="w-full h-48 object-cover"
      />
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Project Presentation</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          แสดงผลงานและไอเดียสุดสร้างสรรค์ที่คุณได้เรียนรู้ในค่าย พร้อมคำแนะนำจากพี่ ๆ และอาจารย์
        </p>
      </div>
    </div>

    {/* กิจกรรม 3 */}
    <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
        alt="Project Presentation"
        className="w-full h-48 object-cover"
      />
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Project Presentation</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          แสดงผลงานและไอเดียสุดสร้างสรรค์ที่คุณได้เรียนรู้ในค่าย พร้อมคำแนะนำจากพี่ ๆ และอาจารย์
        </p>
      </div>
    </div>

    {/* กิจกรรม 3 */}
    <div className="bg-[#1b1f45] rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-all duration-300">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
        alt="Project Presentation"
        className="w-full h-48 object-cover"
      />
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Project Presentation</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          แสดงผลงานและไอเดียสุดสร้างสรรค์ที่คุณได้เรียนรู้ในค่าย พร้อมคำแนะนำจากพี่ ๆ และอาจารย์
        </p>
      </div>
    </div>
  </div>
</section>

  )
}

export default Acts