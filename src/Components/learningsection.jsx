import React from 'react'


const Learningsection = () => {
return (
    <section id="topics" className="bg-white py-12 sm:py-16">
  {/* Header */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm sm:text-base font-semibold text-yellow-600">
      หัวข้ออบรม
    </span>
    <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
      เนื้อหาที่จะได้เรียนรู้ในค่าย
    </h2>
    <p className="mt-2 text-gray-600 text-sm sm:text-base">
      เรียนแบบลงมือทำจริง ทั้งเครื่องมืออัตโนมัติ AI และโปรเจกต์สรุปท้ายค่าย
    </p>
  </div>

  {/* Cards */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
      {[
        {
          title: "n8n",
          desc:
            "เรียนรู้การต่อ Workflow อัตโนมัติ เชื่อมต่อบริการต่าง ๆ แบบ no-code/low-code พร้อมตัวอย่างใช้งานจริงในชีวิตประจำวัน.",
          tag: "Automation",
        },
        {
          title: "AI's Generative",
          desc:
            "เข้าใจพื้นฐาน GenAI และลองสร้างคอนเทนต์/ภาพ/โค้ดจากโมเดลสมัยใหม่ พร้อมเทคนิค Prompt ให้ได้ผลลัพธ์คุณภาพ.",
          tag: "Generative AI",
        },
        {
          title: "Project",
          desc:
            "สรุปความรู้ด้วยโปรเจกต์จบค่าย ทำงานเป็นทีม วางแผน แบ่งงาน และนำเสนอผลงานต่อคณะกรรมการ.",
          tag: "Team Project",
        },
         
      ].map((item) => (
        <article
          key={item.title}
          className="
            relative rounded-2xl bg-white p-6 sm:p-7
            shadow-sm ring-1 ring-gray-200/70
            hover:shadow-xl hover:-translate-y-0.5 transition-all
            min-h-[220px] flex flex-col
          "
        >
          {/* gradient border on hover */}
          <span
            className="
              pointer-events-none absolute inset-0 rounded-2xl
              opacity-0 hover:opacity-100 transition-opacity
              ring-2 ring-transparent
              [background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#ffd166,#e28d0d,#7dd3fc)_border-box]
              border border-transparent
            "
          />

          {/* icon / tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1">
              {item.tag}
            </span>
          </div>

          <h3 className="mt-3 text-lg sm:text-xl font-bold text-gray-900">
            {item.title}
          </h3>

          <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
            {item.desc}
          </p>
        </article>
      ))}
    </div>
  </div>
</section>

)
}

export default Learningsection