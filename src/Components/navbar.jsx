import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  const navigate = useNavigate();
  const location = useLocation();

  // ปิดเมนูอัตโนมัติเมื่อขยายจอเกิน breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1452 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  const navItems = [
    { name: "หน้าหลัก", id: "home" },
    { name: "หัวข้อการอบรม", id: "topics" },
    { name: "ตรวจสอบรายชื่อ", id: "name_checking" },
    { name: "กิจกรรมในค่าย", id: "acts" },
    { name: "เสียงจากรุ่นพี่", id: "senior_feedback" },
    { name: "ติดต่อเรา", id: "contact" },
    { name: "Q&A", id: "qanda" },
  ];

  // เลื่อนไปยัง id ถ้าอยู่หน้า Home (pathname === '/')
  const scrollToIdOnPage = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const NAV_OFFSET = 80;
    const rectTop = el.getBoundingClientRect().top + window.scrollY;
    const top = Math.max(0, rectTop - NAV_OFFSET);
    window.scrollTo({ top, behavior: "smooth" });
  };

  // เมื่อกดเมนู section
  const handleGotoSection = (id) => {
    setIsMenuOpen(false);
    if (location.pathname === "/" || location.pathname === "") {
      setTimeout(() => scrollToIdOnPage(id), 80);
      return;
    }
    navigate("/", { state: { scrollTo: id } });
  };

  const handleLogoClick = () => {
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) {
        // ignore
      }
    }

    try {
      sessionStorage.setItem("goHome", "1");
    } catch (e) {
      // ignore
    }

    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#0b0e26]/95 via-[#0f1332]/95 to-[#0b0e26]/95 backdrop-blur-lg z-50 border-b border-white/10">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* โลโก้ */}
          <button
            onClick={handleLogoClick}
            className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent hover:from-blue-200 hover:via-white hover:to-blue-200 transition-all duration-300 cursor-pointer transform hover:scale-105 flex-shrink-0"
            aria-label="Go to home"
          >
            Comcamp<span className="text-[#e28d0d]">24</span><sup className="text-sm text-[#e28d0d]">th</sup>
          </button>

          {/* เมนู Desktop - ขยายเต็มที่ */}
          <div className="hidden min-[1452px]:flex flex-1 justify-center px-8">
            <div className="flex items-center justify-between w-full max-w-5xl">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleGotoSection(item.id)}
                  className="relative text-white/90 hover:text-white px-4 py-2.5 text-sm font-medium transition-all duration-300 group cursor-pointer overflow-hidden rounded-lg whitespace-nowrap"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="relative z-10">{item.name}</span>
                  <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-[#e28d0d] to-transparent group-hover:w-4/5 transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* ปุ่ม Desktop - ชำระเงิน + สนใจลงทะเบียน */}
          <div className="hidden min-[1452px]:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleGotoSection("payment")}
              className="relative text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-[#e28d0d]/50 px-5 py-2.5 rounded-full font-medium transition-all duration-300 cursor-pointer transform hover:scale-105 group overflow-hidden backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                ชำระเงิน
              </span>
            </button>

            <button
              onClick={() => {
                navigate("/register");
                setIsMenuOpen(false);
              }}
              className="relative text-white bg-gradient-to-r from-[#e28d0d] to-[#f5a623] hover:from-[#f5a623] hover:to-[#e28d0d] px-6 py-2.5 rounded-full font-medium transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg hover:shadow-[#e28d0d]/50 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                สนใจลงทะเบียน
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </button>
          </div>

          {/* ปุ่มเมนูมือถือ */}
          <div className="block max-[1451px]:block min-[1452px]:hidden">
            <button
              onClick={toggleMenu}
              className="p-2.5 rounded-xl text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#e28d0d] transition-all duration-200 border border-white/10"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* เมนูมือถือ */}
      <div
        className={`max-[1451px]:block transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 border-t border-white/10 bg-gradient-to-b from-[#0b0e26]/98 to-[#0f1332]/98 backdrop-blur-lg">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleGotoSection(item.id)}
              className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 border border-transparent hover:border-white/10 backdrop-blur-sm"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-[#e28d0d]" />
                {item.name}
              </span>
            </button>
          ))}

          {/* ปุ่มชำระเงินใน Mobile */}
          <button
            onClick={() => {
              handleGotoSection("payment");
              setIsMenuOpen(false);
            }}
            className="w-full text-center bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300 border border-white/20 hover:border-[#e28d0d]/50 backdrop-blur-sm"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#e28d0d]" />
              ชำระเงิน
            </span>
          </button>

          {/* ปุ่มสนใจลงทะเบียนใน Mobile */}
          <button
            onClick={() => {
              navigate("/register");
              setIsMenuOpen(false);
            }}
            className="w-full text-center bg-gradient-to-r from-[#e28d0d] to-[#f5a623] text-white rounded-xl px-4 py-3 font-medium hover:from-[#f5a623] hover:to-[#e28d0d] transition-all duration-300 shadow-lg shadow-[#e28d0d]/30 hover:shadow-[#e28d0d]/50 transform hover:scale-[1.02]"
          >
            สนใจลงทะเบียน →
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;