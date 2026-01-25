import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, CalendarDays, ChevronRight } from "lucide-react";
import {
  motion,
  useAnimation,
  useInView,
  useReducedMotion,
  type Variants,
  type MotionProps,
} from "framer-motion";
import { listHomeContent, type HomeContentItem } from "@/services/homeContentApi";

export const Hero: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const [homeContent, setHomeContent] = useState<HomeContentItem | null>(null);

  const particles = useMemo(() => {
    const count = 10;
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.floor(Math.random() * 14 + 6);
      return {
        id: i,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 4 + 6,
        delay: Math.random() * 1.5,
        variant: i % 3,
        drift: Math.random() * 18 - 9,
        lift: Math.random() * 26 + 18,
      };
    });
  }, []);

  const backgroundImageUrl =
    homeContent?.imagen_url ||
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=70";

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [controls, isInView]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await listHomeContent();
        if (data.length > 0) {
          setHomeContent(data[0]);
        }
      } catch {
        setHomeContent(null);
      }
    };

    loadContent();
  }, []);

  // ✅ Tipado: evita uniones raras en TS
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: reduceMotion
      ? { opacity: 1, transition: { duration: 0.2 } }
      : {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.05,
            duration: 0.6,
          },
        },
  };

  // ✅ Clave: `type` literal (no string) + Variants tipado
  const itemVariants: Variants = {
    hidden: { y: 18, opacity: 0 },
    visible: reduceMotion
      ? { y: 0, opacity: 1, transition: { duration: 0.2 } }
      : {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring" as const,
            stiffness: 110,
            damping: 18,
          },
        },
  };

  // ✅ Tipado MotionProps para props spread en motion.div
  const floatProps: MotionProps = reduceMotion
    ? {}
    : {
        animate: { y: [0, -12, 0] },
        transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
      };

  return (
    <section
      ref={ref}
      className="relative w-screen overflow-hidden min-h-[92vh] flex items-center"
      style={{ maxWidth: "100vw", width: "100%" }}
    >
      {/* Fondo */}
      <div className="absolute inset-0">
        <img
          src={backgroundImageUrl}
          alt="Fondo relajante"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          style={{ filter: "brightness(0.92)" }}
        />

        {/* Overlay base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.40) 45%, rgba(255,255,255,0.22) 100%)",
          }}
        />

        {/* Overlay decorativo */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 20% 50%, rgba(232,163,147,0.22) 0%, transparent 55%), radial-gradient(circle at 80% 30%, rgba(164,165,141,0.18) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Blobs */}
      {!reduceMotion && (
        <>
          <motion.div
            {...floatProps}
            className="pointer-events-none absolute top-16 left-6 h-56 w-56 rounded-full blur-2xl opacity-25"
            style={{ backgroundColor: "rgba(201,130,97,0.40)" }}
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
            className="pointer-events-none absolute bottom-16 right-6 h-64 w-64 rounded-full blur-2xl opacity-20"
            style={{ backgroundColor: "rgba(164,165,141,0.34)" }}
          />
        </>
      )}

      {/* Partículas */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full will-change-transform"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                backgroundColor:
                  p.variant === 0
                    ? "rgba(201,130,97,0.16)"
                    : p.variant === 1
                    ? "rgba(164,165,141,0.12)"
                    : "rgba(232,163,147,0.12)",
              }}
              animate={{ y: [0, -p.lift, 0], x: [0, p.drift, 0] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Contenido */}
      <div className="relative lg:w-[80%] mx-auto">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-10 pb-14 pt-0 md:pb-20 md:pt-10 max-w-[1400px] 2xl:max-w-[80vw]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid items-center gap-10 lg:grid-cols-2"
          >
            {/* Texto */}
            <motion.div
              variants={itemVariants}
              className="mx-auto lg:mx-0 w-full max-w-[38rem] lg:max-w-[42rem] text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-800 shadow-sm border border-black/5 mb-6"
                style={{ backgroundColor: "rgba(237,221,200,0.85)" }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "#c98261" }} />
                <span className="leading-none">
                  Bienestar corporativo • Domicilio • Eventos
                </span>
              </motion.div>

              {/* Título */}
              <motion.h1
                variants={itemVariants}
                className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]"
              >
                {homeContent?.titulo ?? (
                  <>
                    Masajes que{" "}
                    <span className="relative inline-block" style={{ color: "#c98261" }}>
                      relajan
                    </span>{" "}
                    el cuerpo y{" "}
                    <span className="relative inline-block" style={{ color: "#c98261" }}>
                      despejan
                    </span>{" "}
                    la mente.
                  </>
                )}
              </motion.h1>

              {/* Texto */}
              <motion.p
                variants={itemVariants}
                className="mt-6 text-base sm:text-lg leading-relaxed text-slate-700 mx-auto lg:mx-0 max-w-[34rem]"
              >
                {homeContent?.subtitulo ?? (
                  <>
                    En{" "}
                    <span className="font-bold text-slate-900">ISKIO Spa</span>{" "}
                    llevamos una experiencia profesional y cálida a personas,
                    equipos y eventos. Ideal para pausas saludables, activaciones y
                    sesiones de relajación profunda.
                  </>
                )}
              </motion.p>

              {/* Botones */}
              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    asChild
                    className="w-full sm:w-auto rounded-2xl shadow-lg px-7 sm:px-8 h-12 text-base font-semibold gap-3 transition-all duration-300 hover:shadow-xl"
                    style={{ backgroundColor: "#c98261", color: "white" }}
                  >
                    <Link to="/agendar" className="flex items-center justify-center gap-3">
                      <CalendarDays className="h-5 w-5" />
                      Reservar ahora
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto rounded-2xl border-slate-300 bg-white/90 hover:bg-white px-7 sm:px-8 h-12 text-base font-semibold gap-2"
                  >
                    <Link to="/servicios" className="flex items-center justify-center gap-2">
                      Ver servicios
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <div className="hidden lg:block" />
          </motion.div>
        </div>
      </div>

      {/* Indicador scroll */}
      {!reduceMotion && (
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-slate-600 font-medium">Descubre más</div>
            <div className="h-8 w-px bg-gradient-to-b from-slate-400 to-transparent" />
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
