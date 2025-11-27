import React from 'react'
import { Phone, Mail, Facebook, MessageCircle, MapPin } from 'lucide-react';

const Contact = () => {
    return (
        <section
            id="contact"
            className="bg-gradient-to-br from-slate-50 via-white to-yellow-50 py-20 sm:py-24 text-[#1A1E4A] relative overflow-hidden"
        >
            {/* Animated Background Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse"></div>

            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-yellow-400 px-6 py-2 text-sm font-bold text-yellow-600 bg-yellow-50/80 backdrop-blur-sm shadow-lg mb-6">
                    <MessageCircle className="w-4 h-4" />
                    <span>ติดต่อเรา</span>
                </div>
                <h2 className="mt-4 text-4xl sm:text-5xl font-black text-[#1A1E4A] leading-tight">
                    พร้อมตอบทุกข้อสงสัย
                </h2>
                <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                    ทีมงานของเรายินดีให้คำปรึกษาและตอบทุกข้อสงสัย
                </p>
            </div>

            {/* Contact Box - Single Centered */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 hover:shadow-yellow-200/50 hover:border-yellow-300 transition-all duration-500 overflow-hidden group">
                    {/* Map */}
                    <div className="w-full h-80 md:h-96 overflow-hidden relative">
                        <iframe
                            title="Maejo University Faculty of Science"
                            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6388.123456!2d99.0129284!3d18.8957308!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da234acab26d49%3A0x673310a15bca3d4a!2sFaculty+of+Science%2C+Maejo+University!5e0!3m2!1sth!2sth!4v1699999999999!5m2!1sth!2sth"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            className="grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-gray-700">มหาวิทยาลัยแม่โจ้</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-8 md:p-10 bg-gradient-to-br from-white to-yellow-50/30">
                        <h3 className="text-2xl font-bold text-[#1A1E4A] mb-6 flex items-center gap-2">
                            <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
                            ช่องทางการติดต่อ
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-yellow-50 transition-colors group/item cursor-pointer shadow-sm">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover/item:bg-yellow-500 transition-colors flex-shrink-0">
                                    <Phone className="w-5 h-5 text-yellow-600 group-hover/item:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">โทรศัพท์</p>
                                    <p className="text-gray-800 font-semibold">099-123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-yellow-50 transition-colors group/item cursor-pointer shadow-sm">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover/item:bg-yellow-500 transition-colors flex-shrink-0">
                                    <Mail className="w-5 h-5 text-yellow-600 group-hover/item:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">อีเมล</p>
                                    <p className="text-gray-800 font-semibold text-sm">campinfo@example.com</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-yellow-50 transition-colors group/item cursor-pointer shadow-sm">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover/item:bg-yellow-500 transition-colors flex-shrink-0">
                                    <Facebook className="w-5 h-5 text-yellow-600 group-hover/item:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Facebook</p>
                                    <p className="text-gray-800 font-semibold">CampOfficial</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white hover:bg-yellow-50 transition-colors group/item cursor-pointer shadow-sm">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center group-hover/item:bg-yellow-500 transition-colors flex-shrink-0">
                                    <MessageCircle className="w-5 h-5 text-yellow-600 group-hover/item:text-white transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Line</p>
                                    <p className="text-gray-800 font-semibold">@campofficial</p>
                                </div>
                            </div>
                        </div>

                        {/* Facebook Contact Button */}
                        <a
                            href="https://www.facebook.com/CCCSMJU"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-[#1e6bfa] hover:bg-[#1e8bfa] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                        >
                            <Facebook className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-lg">ติดต่อเราผ่าน Facebook</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Contact