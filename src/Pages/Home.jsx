import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import HeroSections from "../Components/herosections";
import Learningsection from "../Components/learningsection";
import Acts from "../Components/acts";
import NameChecking from "../Components/name_checking";
import Senior_feedback from "../Components/senior_feedback";
import QandA from "../Components/qanda";
import Contact from "../Components/contact";
import Footer from "../Components/footer";

import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const location = useLocation();

  // ฟังก์ชันเลื่อนไปยัง element id (คงไว้ถ้าต้องการใช้)
  const scrollToId = (id) => {
    if (!id) return;
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 80);
  };

  useEffect(() => {
    // ปิด browser auto restore เพื่อให้เราควบคุม scroll เอง
    if ("scrollRestoration" in window.history) {
      try {
        window.history.scrollRestoration = "manual";
      } catch (e) { }
    }

    // ถ้ามาจาก hard reload และมี flag -> ไปบนสุดแล้วลบ flag
    try {
      const goHome = sessionStorage.getItem("goHome");
      if (goHome === "1") {
        // ถ้าต้องการ jump ทันทีใช้ behavior: "auto" จะรู้สึกไม่กระเด้ง
        window.scrollTo({ top: 0, behavior: "auto" });
        sessionStorage.removeItem("goHome");
        // คืนค่า scrollRestoration เป็น auto หลังใช้ (option)
        // แต่ผมแนะนำให้คงไว้ manual จนกว่าคุณจะ unmount หรือจัดการตรงอื่น
      }
    } catch (e) {
      // ignore
    }

    // คืนค่าเป็น auto เมื่อ component unmount (ปลอดภัย)
    return () => {
      if ("scrollRestoration" in window.history) {
        try {
          window.history.scrollRestoration = "auto";
        } catch (e) { }
      }
    };
  }, []);

  useEffect(() => {
    // logic เดิม: ถ้ามี location.state.scrollTo หรือ path-based -> เลื่อนตาม
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      scrollToId(scrollTo);
      return;
    }

    const path = location.pathname.replace("/", "");
    if (path) {
      scrollToId(path);
    }
  }, [location]);

  return (
    <main>
      <HeroSections id="home" />
      <Learningsection id="topics" />
      <NameChecking id="name_checking" />
      <Acts id="acts" />
      <Senior_feedback id="senior_feedback" />
      <Contact id="contact" />
      <QandA id="qanda" />
      <Footer />
    </main>
  );
}