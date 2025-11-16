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
    { name: "หัวข้ออบรม", id: "topics" },
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
    const NAV_OFFSET = 80; // ปรับตามความสูง navbar ของท่าน
    const rectTop = el.getBoundingClientRect().top + window.scrollY;
    const top = Math.max(0, rectTop - NAV_OFFSET);
    window.scrollTo({ top, behavior: "smooth" });
  };

  // เมื่อกดเมนู section
  const handleGotoSection = (id) => {
    setIsMenuOpen(false);
    // ถ้าอยู่ home แล้วเลื่อนเลย
    if (location.pathname === "/" || location.pathname === "") {
      // นิดหน่อย delay เพื่อให้ mobile menu ปิดก่อนเลื่อน (UX ลื่น)
      setTimeout(() => scrollToIdOnPage(id), 80);
      return;
    }
    // ถ้าไม่ได้อยู่ home ให้ navigate กลับไป home พร้อม state เพื่อให้ Home เลื่อนให้
    navigate("/", { state: { scrollTo: id } });
  };

  const handleLogoClick = () => {
    // ปิดการ restore ของ browser (ช่วยลดการคืนตำแหน่งหลัง reload)
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) {
        // ignore (บาง environment อาจขวาง)
      }
    }

    // เซ็ต flag ให้ Home รู้ว่าให้ไป top หลัง reload
    try {
      sessionStorage.setItem("goHome", "1");
    } catch (e) {
      // ignore ถ้า sessionStorage ไม่พร้อม
    }

    // ทำ hard navigation / reload ไปหน้า Home
    // ใช้ location.href เพื่อ full reload
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0b0e26]/90 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* โลโก้ */}
          <button
            onClick={handleLogoClick}
            className="text-xl font-bold text-white hover:text-gray-300 transition-colors duration-200 cursor-pointer"
            aria-label="Go to home"
          >
            Comcamp24<sup>th</sup>
          </button>


          {/* เมนู Desktop (ซ่อนที่ ≤1451px) */}
          <div className="hidden min-[1452px]:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleGotoSection(item.id)}
                  className="text-white hover:text-gray-400 px-3 py-2 text-sm font-medium transition-all duration-200 relative group cursor-pointer"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#e28d0d] group-hover:w-full transition-all duration-300 " />
                </button>
              ))}
            </div>
          </div>

          {/* ปุ่มลงทะเบียน Desktop */}
          <div className="hidden min-[1452px]:flex">
            <button
              onClick={() => {
                navigate("/register");
                setIsMenuOpen(false);
              }}
              className="text-white bg-[#e28d0d] hover:bg-[#a96909] px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
            >
              สนใจลงทะเบียน
            </button>
          </div>

          {/* ปุ่มเมนูมือถือ (แสดง ≤1451px) */}
          <div className="block max-[1451px]:block min-[1452px]:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e28d0d]"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* เมนูมือถือ */}
      <div
        className={`max-[1451px]:block transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 border-t border-white/20 bg-[#0b0e26]/95 backdrop-blur-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleGotoSection(item.id)}
              className="w-full text-left text-white hover:bg-white/10 rounded-md px-3 py-2 text-base font-medium transition-colors duration-200"
            >
              {item.name}
            </button>
          ))}

          <button
            onClick={() => {
              navigate("/register");
              setIsMenuOpen(false);
            }}
            className="w-full text-center bg-[#e28d0d] text-white rounded-md px-3 py-2 font-medium hover:bg-[#a96909] transition-colors duration-200"
          >
            สนใจลงทะเบียน
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;