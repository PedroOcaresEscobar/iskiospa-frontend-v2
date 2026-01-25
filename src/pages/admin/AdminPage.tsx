import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, CalendarDays, Clock, Images, Instagram, Sparkles, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminDashboardSection } from "@/features/admin/components/AdminDashboardSection";
import { AdminInstagramSection } from "@/features/admin/components/AdminInstagramSection";
import { AdminHomeContentSection } from "@/features/admin/components/AdminHomeContentSection";
import { AdminServicesSection } from "@/features/admin/components/AdminServicesSection";
import { AdminCitasSection } from "@/features/admin/components/AdminCitasSection";
import { AdminDisponibilidadSection } from "@/features/admin/components/AdminDisponibilidadSection";
import { AdminAccountSection } from "@/features/admin/components/AdminAccountSection";
import { useAuth } from "@/features/auth/AuthContext";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "citas" | "disponibilidad" | "servicios" | "instagram" | "home" | "cuenta" |  null
  >(null);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="mx-auto w-[90%] 2xl:w-[80%] px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Panel Administrativo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bienvenido {user?.username}. Rol: {user?.rol}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-black/10"
            asChild
          >
            <Link to="/">Ver sitio</Link>
          </Button>
          <Button
            className="rounded-2xl bg-[#c98261] text-white hover:bg-[#b87456]"
            onClick={handleLogout}
          >
            Cerrar sesion
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        {!activeSection ? (
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveSection("dashboard")}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#111827]/10 p-3 text-[#111827]">
                  <BarChart3 className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Dashboard
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Resumen de citas y servicios.
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("citas")}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#10b981]/15 p-3 text-[#047857]">
                  <CalendarDays className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Citas agendadas
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Administra visitas y estados.
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("disponibilidad")}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#0f766e]/15 p-3 text-[#0f766e]">
                  <Clock className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Disponibilidad
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Gestiona dias y horas disponibles.
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("servicios")}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#c98261]/15 p-3 text-[#b87456]">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Servicios
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Administra servicios, precios e imagenes.
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("instagram")}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#f43f5e]/15 p-3 text-[#be123c]">
                  <Instagram className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Instagram embeds
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Agrega o edita iframes de Instagram.
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("home")}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#f59e0b]/15 p-3 text-[#b45309]">
                  <Images className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Home / Carousel
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Edita textos e imagenes del home.
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("cuenta")}
              className="rounded-3xl border border-black/10 bg-white/80 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#0ea5e9]/15 p-3 text-[#0284c7]">
                  <UserCog className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Cuenta</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Cambia correo y contrasena.
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeSection === "servicios"
                  ? "Gestion de servicios"
                  : activeSection === "home"
                    ? "Gestion del home"
                    : activeSection === "instagram"
                      ? "Gestion de Instagram"
                      : activeSection === "disponibilidad"
                      ? "Gestion de disponibilidad"
                    : activeSection === "citas"
                      ? "Gestion de citas"
                      : activeSection === "cuenta"
                        ? "Gestion de cuenta"
                        : "Dashboard de citas"}
              </h2>
              <Button variant="outline" onClick={() => setActiveSection(null)}>
                Volver al panel
              </Button>
            </div>
            {activeSection === "servicios" ? (
              <AdminServicesSection />
            ) : activeSection === "home" ? (
              <AdminHomeContentSection />
            ) : activeSection === "instagram" ? (
              <AdminInstagramSection />
            ) : activeSection === "disponibilidad" ? (
              <AdminDisponibilidadSection />
            ) : activeSection === "citas" ? (
              <AdminCitasSection />
            ) : activeSection === "cuenta" ? (
              <AdminAccountSection />
            ) : (
              <AdminDashboardSection />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
