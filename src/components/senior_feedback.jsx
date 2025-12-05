import React from 'react'

const Senior_feedback = () => {
    // Anonymous avatar placeholder - simple gray circle with user icon
    const anonymousAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e5e7eb'/%3E%3Cpath d='M50 45c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15zm0 7.5c-10 0-30 5-30 15V75h60v-7.5c0-10-20-15-30-15z' fill='%239ca3af'/%3E%3C/svg%3E";

    return (
        <section
            id="senior_feedback"
            className="bg-[#101330] py-16 sm:py-20 text-white overflow-hidden"
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                <span className="inline-flex items-center rounded-full border border-yellow-500/70 px-4 py-1 text-sm sm:text-base font-semibold text-yellow-400">
                    เสียงจากรุ่นพี่
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-4">
                    พี่ๆพูดถึงค่ายนี้ว่า...
                </h2>
            </div>

            {/* Comment Section */}
            <div className="space-y-10">
                {/* แถวบน */}
                <div className="relative w-full overflow-hidden">
                    <div className="flex animate-marquee-left space-x-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex space-x-6">
                                {[
                                    {
                                        name: "น้อง A",
                                        text: "ค่ายนี้สนุกมาก ได้เพื่อนใหม่เยอะ แถมได้ความรู้ด้านคอมเพียบ!",
                                    },
                                    {
                                        name: "น้อง B",
                                        text: "บรรยากาศอบอุ่นสุด ๆ เหมือนอยู่บ้าน เรียนรู้ไปหัวเราะไป ❤️",
                                    },
                                    {
                                        name: "น้อง C",
                                        text: "ทีมพี่สตาฟใจดีทุกคน ค่ายนี้คือจุดเริ่มต้นที่ดีของผมในสาย IT!",
                                    },
                                    {
                                        name: "น้อง D",
                                        text: "กิจกรรมแน่น แต่ไม่น่าเบื่อเลย สนุกทุกวัน!",
                                    },
                                    {
                                        name: "น้อง E",
                                        text: "ได้ทั้งความรู้และมิตรภาพที่อยู่ไปตลอดชีวิต 🫶",
                                    },
                                ].map((review, idx) => (
                                    <div
                                        key={idx}
                                        className="min-w-[300px] sm:min-w-[350px] bg-white text-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-amber-400 hover:cursor-pointer relative hover:z-50 hover-pause-parent"
                                    >
                                        <div className="flex items-center space-x-4 mb-3">
                                            <img
                                                src={anonymousAvatar}
                                                alt={review.name}
                                                className="w-12 h-12 rounded-full border border-yellow-400"
                                            />
                                            <div>
                                                <p className="font-semibold text-[#101330]">{review.name}</p>
                                                <p className="text-xs text-gray-500">Comcamp รุ่นก่อน</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">"{review.text}"</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* แถวล่าง */}
                <div className="relative w-full overflow-hidden">
                    <div className="flex animate-marquee-right space-x-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex space-x-6">
                                {[
                                    {
                                        name: "น้อง F",
                                        text: "กิจกรรม Hackathon คือที่สุด! ได้ลองของจริง สนุกมาก🔥",
                                    },
                                    {
                                        name: "น้อง G",
                                        text: "อาหารอร่อยทุกมื้อเลยครับ พี่ๆ ดูแลดีมาก 😊",
                                    },
                                    {
                                        name: "น้อง H",
                                        text: "ประสบการณ์ดีๆ ที่หาไม่ได้จากที่อื่นแน่นอน",
                                    },
                                    {
                                        name: "น้อง I",
                                        text: "ค่ายนี้ทำให้รู้ว่าการเขียนโปรแกรมไม่ไกลเกินฝัน 💻",
                                    },
                                    {
                                        name: "น้อง J",
                                        text: "อบอุ่น สนุก และมีแต่รอยยิ้ม ❤️",
                                    },
                                ].map((review, idx) => (
                                    <div
                                        key={idx}
                                        className="min-w-[300px] sm:min-w-[350px] bg-white text-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-amber-400 hover:cursor-pointer relative hover:z-50 hover-pause-parent"
                                    >
                                        <div className="flex items-center space-x-4 mb-3">
                                            <img
                                                src={anonymousAvatar}
                                                alt={review.name}
                                                className="w-12 h-12 rounded-full border border-yellow-400"
                                            />
                                            <div>
                                                <p className="font-semibold text-[#101330]">{review.name}</p>
                                                <p className="text-xs text-gray-500">Comcamp รุ่นก่อน</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">"{review.text}"</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
  @keyframes marquee-left {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  @keyframes marquee-right {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0%);
    }
  }
  .animate-marquee-left {
    display: flex;
    width: 200%;
    animation: marquee-left 25s linear infinite;
  }
  .animate-marquee-right {
    display: flex;
    width: 200%;
    animation: marquee-right 28s linear infinite;
  }
  .animate-marquee-left:has(.hover-pause-parent:hover),
  .animate-marquee-right:has(.hover-pause-parent:hover) {
    animation-play-state: paused;
  }
`}</style>

        </section>
    )
}

export default Senior_feedback