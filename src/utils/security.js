/**
 * Security Module - ป้องกัน DevTools และ Source Code
 * 
 * Features ที่ใช้งานได้:
 * - บล็อก Keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
 * - ปิด Context menu (คลิกขวา)
 * - ป้องกัน iframe embedding
 * 
 * หมายเหตุ: Console disabling และ DevTools detection ถูกลบออก
 * เพราะกระทบกับ cursor-pointer ของ Tailwind CSS
 * สำหรับ production, Terser จะจัดการลบ console ตอน build
 */

// ========== CONFIGURATION ==========
const CONFIG = {
  disableRightClick: true,
  disableKeyboardShortcuts: true,
  showWarnings: true,
  warningMessage: '⚠️ การกระทำนี้ถูกปิดใช้งานเพื่อความปลอดภัย',
};

// ========== KEYBOARD SHORTCUTS BLOCKER ==========
function blockKeyboardShortcuts() {
  if (!CONFIG.disableKeyboardShortcuts) return;
  
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      if (CONFIG.showWarnings) showWarning();
      return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
      e.preventDefault();
      e.stopPropagation();
      if (CONFIG.showWarnings) showWarning();
      return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      if (CONFIG.showWarnings) showWarning();
      return false;
    }
    
    // Ctrl+Shift+C (Element Picker)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      if (CONFIG.showWarnings) showWarning();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      if (CONFIG.showWarnings) showWarning();
      return false;
    }
    
    // Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });
}

// ========== CONTEXT MENU DISABLER ==========
function disableRightClick() {
  if (!CONFIG.disableRightClick) return;
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (CONFIG.showWarnings) showWarning();
    return false;
  }, { capture: true });
}

// ========== WARNING TOAST ==========
function showWarning(message = CONFIG.warningMessage) {
  if (document.querySelector('.security-toast')) return;
  
  const toast = document.createElement('div');
  toast.className = 'security-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ff4444, #cc0000);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    pointer-events: none;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// ========== MAIN INIT FUNCTION ==========
export function initSecurity() {
  if (typeof window === 'undefined') return;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

function init() {
  try {
    blockKeyboardShortcuts();
    disableRightClick();
    
    // Prevent iframe embedding
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch (e) {
    // Silent fail
  }
}

export { CONFIG as securityConfig };
