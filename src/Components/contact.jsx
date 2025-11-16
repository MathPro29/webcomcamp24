import React from 'react'


const Contact = () => {
    return (
        <section
            id="contact"
            className="bg-white py-16 sm:py-20 text-[#1A1E4A] relative overflow-hidden"
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 relative z-10">
                <span className="inline-flex items-center rounded-full border border-yellow-400/70 px-4 py-1 text-lg sm:text-base font-semibold text-yellow-500 bg-yellow-50">
                    ติดต่อเรา
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#1A1E4A]">
                    มีคำถามหรือข้อสงสัย? ติดต่อเราได้เลย
                </h2>
            </div>

            {/* Contact Box */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Left: Map + Info */}
                <div className="bg-white p-0 rounded-2xl shadow-xl border border-yellow-200 hover:border-yellow-400 transition-all duration-500 overflow-hidden">
                    {/* Map */}
                    <div className="w-full h-64 md:h-80 rounded-t-2xl overflow-hidden">
                        <iframe
                            title="Maejo University Faculty of Science"
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6388.123456!2d99.0129284!3d18.8957308!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da234acab26d49%3A0x673310a15bca3d4a!2sFaculty+of+Science%2C+Maejo+University!5e0!3m2!1sth!2sth!4v1699999999999!5m2!1sth!2sth"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                        />

                    </div>

                    {/* Info */}
                    <div className="p-8">
                        <h3 className="text-xl font-semibold text-yellow-500 mb-4">
                            ข้อมูลการติดต่อ
                        </h3>
                        <ul className="space-y-4 text-gray-600">
                            <li className="flex items-center gap-3">
                                <i className="fa-solid fa-phone text-yellow-500"></i>
                                <span>โทร: 099-123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="fa-solid fa-envelope text-yellow-500"></i>
                                <span>อีเมล: campinfo@example.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="fa-brands fa-facebook text-yellow-500"></i>
                                <span>Facebook: CampOfficial</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <i className="fa-brands fa-line text-yellow-500"></i>
                                <span>Line ID: @campofficial</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right: Form */}
                                <form className="bg-white p-8 rounded-2xl shadow-xl border border-yellow-200 hover:border-yellow-400 transition-all duration-500 space-y-5 flex-shrink-0">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">ชื่อของคุณ</label>
                                        <input
                                            type="text"
                                            placeholder="เช่น นายสมชาย ใจดี"
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">อีเมล</label>
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-2">ข้อความ</label>
                                        <textarea
                                            rows="4"
                                            placeholder="พิมพ์ข้อความของคุณ..."
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-yellow-400 text-[#1A1E4A] font-semibold rounded-lg hover:bg-yellow-300 hover:scale-[1.02] transition-all duration-300 shadow-md cursor-pointer"
                                    >
                                        ส่งข้อความ
                                    </button>
                                </form>
                            </div>

                            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-yellow-50 blur-3xl"></div>
        </section>
    )
}

export default Contact
