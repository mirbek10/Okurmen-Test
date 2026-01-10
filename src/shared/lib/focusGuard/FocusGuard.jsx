"use client";
import { useEffect, useState } from "react";

export default function FocusGuard({reload}) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const onBlur = () => {
      setShowModal(true);
      setTimeout(() => {
        window.location.reload();
        reload();
      }, 1500);
    };

    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
      <div className="bg-blue-600 text-white px-8 py-6 rounded-xl shadow-2xl w-[340px] text-center">
        <h2 className="text-xl font-semibold mb-2">
          Внимание!
        </h2>
        <p className="text-sm opacity-90">
          Нельзя открывать новые страницы.  
          Вы проходите тест.
        </p>
      </div>
    </div>
  );
}
