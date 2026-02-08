"use client";
import { useEffect, useState, useRef } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function FocusGuard({ reload, isTestActive }) {
  const [violation, setViolation] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!isTestActive) return;

    const triggerViolation = () => {
      if (hasTriggered.current) return;
      hasTriggered.current = true;
      
      setViolation(true);
      
      if (reload) {
        reload();
      }
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    };

    const handleKeydown = (e) => {
      const isInspector = 
        e.key === "F12" || 
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u");

      if (isInspector) {
        e.preventDefault();
        triggerViolation();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const onBlur = () => {
      triggerViolation();
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", onBlur);
    };
  }, [isTestActive, reload]);

  if (!violation) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-xl z-[9999] p-4">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-[400px] text-center border-b-8 border-red-600 animate-in zoom-in-95">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Нарушение</h2>
        <p className="text-slate-500 mb-6 font-medium">
          Попытка обхода защиты. Прогресс аннулирован, вопросы будут заменены.
        </p>
        <div className="flex items-center justify-center gap-3 py-3 bg-red-50 rounded-xl text-red-600 font-bold">
          <RefreshCw size={18} className="animate-spin" />
          <span>Обновление теста...</span>
        </div>
      </div>
    </div>
  );
}