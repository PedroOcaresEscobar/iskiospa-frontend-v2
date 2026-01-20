import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  phoneNumber?: string; // sin "+"
  defaultMessage?: string;
  position?: "bottom-right" | "bottom-left";

  // ✅ Control de cuánto sube al llegar al final
  maxLift?: number; // px que sube máximo (al final)
  liftDistanceFromBottom?: number; // desde cuántos px antes del final empieza a subir
};

export default function WhatsAppWidget({
  phoneNumber = "56944718488",
  defaultMessage = "¡Hola! Me gustaría agendar una hora 😊",
  position = "bottom-right",

  // ✅ Ajusta esto:
  maxLift = 280, // ← AL LLEGAR AL FINAL, sube 500px
  liftDistanceFromBottom = 800, // ← empieza a subir cuando faltan 800px para el final
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [liftAmount, setLiftAmount] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const posClasses =
    position === "bottom-left"
      ? "left-6 bottom-6 items-start"
      : "right-6 bottom-6 items-end";

  const waUrl = useMemo(() => {
    const text = encodeURIComponent(message.trim() || defaultMessage);
    return `https://wa.me/${phoneNumber}?text=${text}`;
  }, [phoneNumber, message, defaultMessage]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setMessage(defaultMessage);
    setIsOpen(false);
  };

  // ✅ Cerrar con ESC y click afuera
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!isOpen) return;
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  // ✅ Lift inteligente: se ajusta al footer (sube cuando te acercas al final)
  useEffect(() => {
    let raf = 0;

    const compute = () => {
      const scrollTop = window.scrollY;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;

      // cuánto falta para el final (0 = estás en el fondo)
      const remaining = docH - (scrollTop + viewportH);

      // progreso 0..1 (0 lejos, 1 en el final)
      const progress = Math.min(
        1,
        Math.max(0, (liftDistanceFromBottom - remaining) / liftDistanceFromBottom)
      );

      const nextLift = progress * maxLift;

      setLiftAmount((prev) => (Math.abs(prev - nextLift) < 0.5 ? prev : nextLift));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [maxLift, liftDistanceFromBottom]);

  return (
    <motion.div
      ref={containerRef}
      animate={{ y: -liftAmount }}
      transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
      className={`fixed ${posClasses} z-50 flex flex-col gap-3`}
    >
      {/* Ventana */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="
              w-72 max-w-[calc(100vw-3rem)]
              rounded-2xl border border-emerald-500/30
              bg-white shadow-lg
              p-4
            "
            role="dialog"
            aria-label="Chat de WhatsApp"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  ¿En qué podemos ayudarte?
                </div>
                <div className="mt-0.5 text-xs text-slate-600">
                  Escribe y te respondemos rápido.
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="
                  rounded-full p-2
                  text-slate-500 hover:text-rose-600
                  hover:bg-slate-100
                  transition
                  focus:outline-none focus:ring-2 focus:ring-emerald-400
                "
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={3}
              className="
                mt-3 w-full resize-none
                rounded-xl border border-slate-200
                bg-white px-3 py-2
                text-sm text-slate-800
                placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-emerald-400
              "
            />

            <button
              onClick={handleSendMessage}
              className="
                mt-3 w-full inline-flex items-center justify-center gap-2
                rounded-xl bg-emerald-500 py-2
                text-sm font-semibold text-white
                shadow-sm
                hover:bg-emerald-600 transition
                focus:outline-none focus:ring-4 focus:ring-emerald-200
              "
            >
              <Send className="h-4 w-4" />
              Enviar mensaje
            </button>

            <div className="mt-2 text-[11px] text-slate-500">
              * Se abrirá WhatsApp en una pestaña nueva.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="
          h-14 w-14 rounded-full
          bg-emerald-500 hover:bg-emerald-600
          text-white
          shadow-lg
          flex items-center justify-center
          transition-transform hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-emerald-300
        "
        aria-label={isOpen ? "Cerrar chat de WhatsApp" : "Abrir chat de WhatsApp"}
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </motion.div>
  );
}
