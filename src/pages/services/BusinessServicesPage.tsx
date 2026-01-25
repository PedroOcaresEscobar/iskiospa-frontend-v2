import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, CalendarDays, MessageCircle, Building2, Users, Sparkles } from "lucide-react";

import descontracturanteImg from "@/assets/services/descontracturante.jpg";
import deportivoImg from "@/assets/services/deportivo.jpg";
import relajanteImg from "@/assets/services/relajante.jpg";
import giftcardProfesorImg from "@/assets/services/giftcard-profesor.jpg";
import { listServices, type ServiceItem } from "@/services/servicesApi";
import { listServiceCategories, type ServiceCategory } from "@/services/categoriesApi";

type Service = {
  title: string; // etiqueta (Masaje / Plan / Beneficio)
  subtitle: string;
  description: string;
  bullets: string[];
  image: string;
  ctaPrimary: { label: string; to: string };
  ctaSecondary?: { label: string; to: string };
};

type Category = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  items: Service[];
};

const STATIC_CATEGORIES: Category[] = [
  {
    id: "corporate",
    name: "Bienestar corporativo",
    description:
      "Sesiones pensadas para equipos: pausas saludables, alivio de tensión y un ambiente laboral más liviano.",
    icon: <Building2 className="h-4 w-4" />,
    items: [
      {
        title: "Masaje",
        subtitle: "Descontracturante (Oficina)",
        description:
          "Ideal para aliviar tensión muscular (espalda, cuello, hombros). Perfecto para rutinas de escritorio y estrés acumulado.",
        bullets: [
          "Alivia dolor y tensión muscular",
          "Mejora postura y movilidad",
          "Reduce estrés acumulado",
          "Excelente para pausas saludables",
        ],
        image: descontracturanteImg,
        ctaPrimary: { label: "Cotizar para empresas", to: "/empresas" },
        ctaSecondary: { label: "Hablar por WhatsApp", to: "/contacto" },
      },
      {
        title: "Masaje",
        subtitle: "Relajante (Pausa saludable)",
        description:
          "Experiencia tranquila para desconectar y recargar energía. Ideal para jornadas intensas o semanas de alta carga.",
        bullets: [
          "Reduce estrés y ansiedad",
          "Mejora bienestar general",
          "Aporta calma y enfoque",
          "Perfecto para actividades internas",
        ],
        image: relajanteImg,
        ctaPrimary: { label: "Solicitar propuesta", to: "/empresas" },
        ctaSecondary: { label: "Consultar disponibilidad", to: "/contacto" },
      },
    ],
  },
  {
    id: "events",
    name: "Activaciones y eventos",
    description:
      "Ideal para actividades internas, aniversarios, celebraciones o eventos corporativos. Llevamos la experiencia a tu lugar.",
    icon: <Sparkles className="h-4 w-4" />,
    items: [
      {
        title: "Masaje",
        subtitle: "Deportivo (Equipos / Actividad)",
        description:
          "Pensado para personas activas. En empresas funciona excelente para jornadas de movimiento, equipos deportivos internos o eventos.",
        bullets: [
          "Apoya recuperación post-actividad",
          "Reduce fatiga muscular",
          "Mejora circulación y rendimiento",
          "Ideal para equipos y eventos",
        ],
        image: deportivoImg,
        ctaPrimary: { label: "Cotizar evento", to: "/empresas" },
        ctaSecondary: { label: "Hablar por WhatsApp", to: "/contacto" },
      },
    ],
  },
  {
    id: "benefits",
    name: "Beneficios y regalos corporativos",
    description:
      "Giftcards y beneficios para colaboradores: un regalo útil y memorable, fácil de coordinar.",
    icon: <Users className="h-4 w-4" />,
    items: [
      {
        title: "Giftcard",
        subtitle: "Para colaboradores",
        description:
          "Regala una experiencia de bienestar. Coordinación simple por contacto, ideal para reconocer y motivar.",
        bullets: [
          "Regalo útil y memorable",
          "Perfecto para fechas especiales",
          "Coordinación simple",
          "Experiencia premium y cálida",
        ],
        image: giftcardProfesorImg,
        ctaPrimary: { label: "Quiero giftcards", to: "/empresas" },
        ctaSecondary: { label: "Consultar", to: "/contacto" },
      },
    ],
  },
];

export const BusinessServicesPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, categoriesData] = await Promise.all([
          listServices(),
          listServiceCategories(),
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
      } catch {
        setServices([]);
        setCategories([]);
      }
    };

    loadData();
  }, []);

  const dynamicCategories = useMemo(() => {
    const visible = services.filter(
      (service) => service.activo !== false && service.mostrar_empresas
    );
    if (visible.length === 0) {
      return null;
    }

    const categoryMap = new Map<number, ServiceCategory>();
    categories
      .filter((cat) => cat.activo !== false)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .forEach((cat) => categoryMap.set(cat.id, cat));

    const grouped = new Map<number, ServiceItem[]>();
    const withoutCategory: ServiceItem[] = [];

    visible.forEach((service) => {
      const categoryId = service.categoria_id;
      if (categoryId && categoryMap.has(categoryId)) {
        const list = grouped.get(categoryId) ?? [];
        list.push(service);
        grouped.set(categoryId, list);
      } else {
        withoutCategory.push(service);
      }
    });

    const iconPool = [Building2, Sparkles, Users];
    const result: Category[] = [];

    categoryMap.forEach((cat, id) => {
      const items = grouped.get(id);
      if (!items || items.length === 0) return;
      const Icon = iconPool[result.length % iconPool.length] ?? Building2;
      result.push({
        id: String(id),
        name: cat.nombre,
        description:
          cat.descripcion ??
          "Experiencias de bienestar pensadas para equipos, eventos y beneficios corporativos.",
        icon: <Icon className="h-4 w-4" />,
        items: items
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map((service) => mapServiceItemToCard(service, "empresas")),
      });
    });

    if (withoutCategory.length > 0) {
      result.push({
        id: "otros",
        name: "Otros servicios",
        description: "Opciones corporativas adicionales disponibles.",
        icon: <Sparkles className="h-4 w-4" />,
        items: withoutCategory
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          .map((service) => mapServiceItemToCard(service, "empresas")),
      });
    }

    return result.length > 0 ? result : null;
  }, [categories, services]);

  const categoriesToRender = dynamicCategories ?? STATIC_CATEGORIES;

  return (
    <section className="w-[90%] 2xl:w-[80%] mx-auto">
      <div className="w-full">
        <div className="w-full max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 2xl:max-w-none 2xl:w-[80%]">
          <header className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Servicios para Empresas
            </h1>
            <p className="mt-2 text-slate-700">
              Bienestar corporativo, activaciones y beneficios para colaboradores. Cotiza por jornada,
              cantidad de personas y tipo de sesión.
            </p>
          </header>

          <div className="mt-10 space-y-14">
            {categoriesToRender.map((cat) => (
              <CategoryBlock key={cat.id} category={cat} />
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-black/5 bg-white/70 p-6 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 rounded-2xl p-2"
                style={{ backgroundColor: "rgba(237,221,200,0.70)" }}
              >
                <CalendarDays className="h-4 w-4" style={{ color: "#c98261" }} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">¿Cómo cotizamos?</div>
                <p className="mt-1">
                  Nos indicas comuna, fecha tentativa, número de personas y el tipo de sesión. Te enviamos una
                  propuesta clara (duración, logística y valores).
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="rounded-2xl shadow-sm"
                    style={{ backgroundColor: "#c98261", color: "white" }}
                  >
                    <Link to="/empresas" className="gap-2">
                      <Building2 className="h-4 w-4" />
                      Cotizar ahora
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-2xl border-black/10 bg-white/70 hover:bg-white"
                  >
                    <Link to="/contacto" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Hablar por WhatsApp
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function CategoryBlock({ category }: { category: Category }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <div
          className="inline-flex items-center justify-center rounded-2xl p-2 border border-black/5"
          style={{ backgroundColor: "rgba(237,221,200,0.65)" }}
        >
          {category.icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-900">{category.name}</h2>
          <p className="mt-1 text-slate-700 max-w-3xl">{category.description}</p>
        </div>
      </div>

      <div className="mt-8 space-y-12">
        {category.items.map((s, idx) => (
          <ServiceRow key={`${category.id}-${s.subtitle}`} service={s} reverse={idx % 2 === 1} />
        ))}
      </div>
    </div>
  );
}

function ServiceRow({ service, reverse }: { service: Service; reverse: boolean }) {
  return (
    <div
      className={[
        "grid items-center gap-8 lg:gap-10",
        "grid-cols-1 lg:grid-cols-2",
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

export default BusinessServicesPage;

function mapServiceItemToCard(service: ServiceItem, context: "servicios" | "empresas"): Service {
  const label =
    service.cta_primary_label ||
    (context === "empresas" ? "Cotizar ahora" : "Agendar");
  const to =
    service.cta_primary_url || (context === "empresas" ? "/empresas" : "/contacto");
  const secondaryLabel =
    service.cta_secondary_label ||
    (context === "empresas" ? "Hablar por WhatsApp" : "Ver disponibilidad");
  const secondaryUrl =
    service.cta_secondary_url || (context === "empresas" ? "/contacto" : "/contacto");

  return {
    title: service.etiqueta?.trim() || "Servicio",
    subtitle: service.subtitulo?.trim() || service.nombre,
    description: service.descripcion ?? "",
    bullets: service.beneficios ?? [],
    image: service.imagen_url || descontracturanteImg,
    ctaPrimary: { label, to },
    ctaSecondary:
      secondaryLabel && secondaryUrl ? { label: secondaryLabel, to: secondaryUrl } : undefined,
  };
}
