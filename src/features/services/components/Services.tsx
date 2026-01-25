import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, CalendarDays, MessageCircle } from "lucide-react";

import drenajeImg from "@/assets/services/drenaje-linfatico.jpg";
import descontracturanteImg from "@/assets/services/descontracturante.jpg";
import deportivoImg from "@/assets/services/deportivo.jpg";
import relajanteImg from "@/assets/services/relajante.jpg";
import giftcardProfesorImg from "@/assets/services/giftcard-profesor.jpg";
import promoMamaImg from "@/assets/services/promo-mama.jpg";
import { listServices, type ServiceItem } from "@/services/servicesApi";

type Service = {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  image: string;
  ctaPrimary: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
};

const STATIC_SERVICES: Service[] = [
  {
    title: "Masaje",
    subtitle: "Drenaje Linfático",
    description:
      "Técnica suave orientada a estimular el sistema linfático para apoyar la eliminación de líquidos y la sensación de liviandad corporal.",
    bullets: [
      "Mejora la circulación linfática",
      "Apoya la reducción de inflamación",
      "Favorece la sensación de descanso",
      "Mejora el aspecto de la piel",
    ],
    image: drenajeImg,
    ctaPrimary: { label: "Agendar", to: "/contacto" },
    ctaSecondary: { label: "Ver disponibilidad", to: "/contacto" },
  },
  {
    title: "Masaje",
    subtitle: "Descontracturante",
    description:
      "Ideal para aliviar tensión muscular (espalda, cuello, hombros). Enfocado en liberar zonas cargadas y mejorar la movilidad.",
    bullets: [
      "Alivia dolor y tensión muscular",
      "Mejora postura y flexibilidad",
      "Reduce estrés acumulado",
      "Aumenta la sensación de energía",
    ],
    image: descontracturanteImg,
    ctaPrimary: { label: "Reservar ahora", to: "/contacto" },
    ctaSecondary: { label: "Hablar por WhatsApp", to: "/contacto" },
  },
  {
    title: "Masaje",
    subtitle: "Deportivo",
    description:
      "Pensado para personas activas y deportistas. Ayuda a preparar el músculo, prevenir molestias y apoyar la recuperación.",
    bullets: [
      "Apoya la recuperación post-entreno",
      "Ayuda a prevenir lesiones",
      "Reduce dolor muscular y fatiga",
      "Mejora circulación y rendimiento",
    ],
    image: deportivoImg,
    ctaPrimary: { label: "Agendar sesión", to: "/contacto" },
    ctaSecondary: { label: "Cotizar para equipos", to: "/empresas" },
  },
  {
    title: "Masaje",
    subtitle: "Relajante",
    description:
      "Una experiencia tranquila para desconectar, bajar el estrés y mejorar el bienestar general. Ideal para recargar energía.",
    bullets: [
      "Reduce estrés y ansiedad",
      "Mejora el descanso y ánimo",
      "Favorece la relajación profunda",
      "Apoya el bienestar general",
    ],
    image: relajanteImg,
    ctaPrimary: { label: "Agendar", to: "/contacto" },
    ctaSecondary: { label: "Ver servicios", to: "/servicios" },
  },
  {
    title: "Giftcard",
    subtitle: "Día del Profesor",
    description:
      "Regala una experiencia de bienestar. Giftcard equivalente a un masaje, en la comodidad del hogar (ideal para sorprender).",
    bullets: [
      "Regalo útil y memorable",
      "Perfecto para fechas especiales",
      "Coordinación simple por contacto",
      "Experiencia premium y cálida",
    ],
    image: giftcardProfesorImg,
    ctaPrimary: { label: "Comprar / Consultar", to: "/contacto" },
    ctaSecondary: { label: "Empresas (beneficios)", to: "/empresas" },
  },
  {
    title: "Promo",
    subtitle: "Día de Relajo",
    description:
      "Pack promocional con opciones de masaje y extras (según disponibilidad). Perfecto para regalar o regalonearte.",
    bullets: [
      "Incluye aromaterapia / musicoterapia (según pack)",
      "Duración aproximada 60 min",
      "Opciones: relajante, descontracturante o mixto",
      "Ideal para fechas como Día de la Madre",
    ],
    image: promoMamaImg,
    ctaPrimary: { label: "Quiero esta promo", to: "/contacto" },
    ctaSecondary: { label: "Agendar", to: "/contacto" },
  },
];

export const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await listServices();
        setServices(data);
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, []);

  const servicesToRender = useMemo(() => {
    const visible = services.filter(
      (service) => service.activo !== false && service.mostrar_servicios
    );
    if (visible.length === 0) {
      return STATIC_SERVICES;
    }
    return visible
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((service) => mapServiceItemToCard(service));
  }, [services]);

  return (
    // Deja que el MainLayout controle el ancho (lg:w-[80%] mx-auto)
    <section className="w-full">
      {/* Fondo suave ocupa solo el ancho disponible */}
      <div
        className="w-full"
        style={{
          background:
            "",
        }}
      >
        {/* Container responsive */}
        <div className="w-full max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 2xl:max-w-none 2xl:w-[80%]">
          {/* Título */}
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Servicios ISKIO Spa
            </h2>
            <p className="mt-2 text-slate-700">
              Elige tu experiencia: relajación, descontracturante, deportivo, drenaje y
              opciones para regalar o eventos.
            </p>
          </div>

          {/* Lista */}
          <div className="mt-10 space-y-12">
            {servicesToRender.map((s, idx) => (
              <ServiceRow
                key={`${s.title}-${s.subtitle}`}
                service={s}
                reverse={idx % 2 === 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function ServiceRow({ service, reverse }: { service: Service; reverse: boolean }) {
  return (
    <div
      className={[
        "grid items-center gap-8 lg:gap-10",
        // 1 columna en mobile, 2 columnas desde lg
        "grid-cols-1 lg:grid-cols-2",
        // alternar orden solo en pantallas grandes
        reverse ? "lg:[&_.media]:order-2 lg:[&_.content]:order-1" : "",
      ].join(" ")}
    >
      {/* Imagen */}
      <div className="media relative">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="aspect-[4/3] w-full">
            <img
              src={service.image}
              alt={`${service.title} ${service.subtitle}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.10) 55%, rgba(237,221,200,0.18) 100%)",
            }}
          />
        </div>

        <div
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] blur-2xl opacity-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(201,130,97,0.28) 0%, rgba(232,163,147,0.22) 40%, rgba(164,165,141,0.22) 100%)",
          }}
        />
      </div>

      {/* Texto */}
      <div className="content">
        <div
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-slate-800 border border-black/5"
          style={{ backgroundColor: "rgba(237,221,200,0.65)" }}
        >
          {service.title}
        </div>

        <h3 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
          {service.subtitle}
        </h3>

        <p className="mt-3 text-slate-700 leading-relaxed">{service.description}</p>

        {service.bullets.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {service.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="h-4 w-4 mt-0.5" style={{ color: "#a4a58d" }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="rounded-2xl shadow-sm"
            style={{ backgroundColor: "#c98261", color: "white" }}
          >
            <Link to={service.ctaPrimary.to} className="gap-2">
              <CalendarDays className="h-4 w-4" />
              {service.ctaPrimary.label}
            </Link>
          </Button>

          {service.ctaSecondary && (
            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-black/10 bg-white/70 hover:bg-white"
            >
              <Link to={service.ctaSecondary.to} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                {service.ctaSecondary.label}
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-3 text-xs text-slate-500">
          * Horarios y disponibilidad pueden variar según zona y agenda.
        </div>
      </div>
    </div>
  );
}

export default Services;

function mapServiceItemToCard(service: ServiceItem): Service {
  const label = service.cta_primary_label || "Agendar";
  const to = service.cta_primary_url || "/contacto";
  const secondaryLabel = service.cta_secondary_label || "Ver disponibilidad";
  const secondaryUrl = service.cta_secondary_url || "/contacto";

  return {
    title: service.etiqueta?.trim() || "Servicio",
    subtitle: service.subtitulo?.trim() || service.nombre,
    description: service.descripcion ?? "",
    bullets: service.beneficios ?? [],
    image: service.imagen_url || drenajeImg,
    ctaPrimary: { label, to },
    ctaSecondary:
      secondaryLabel && secondaryUrl ? { label: secondaryLabel, to: secondaryUrl } : undefined,
  };
}
