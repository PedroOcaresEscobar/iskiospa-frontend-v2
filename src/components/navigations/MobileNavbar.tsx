import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, CalendarDays, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { NavItem } from "./Navbar";
import logoIskio from "@/assets/logo_iskioSPA.png";
type Props = {
  items: NavItem[];
};

export const MobileNavbar: React.FC<Props> = ({ items }) => {
  return (
    <>
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2">
  {/* Logo */}
  <div
    className="h-9 w-9 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden"
    style={{
      background:
        "linear-gradient(135deg, #c98261 0%, #e8a393 45%, #edddc8 100%)",
    }}
  >
    <img
      src={logoIskio}
      alt="ISKIO Spa"
      className="h-6 w-6 object-contain"
    />
  </div>

  {/* Texto */}
  <div className="leading-tight">
    <div className="text-sm font-semibold text-slate-900">
      ISKIO{" "}
      <span className="font-bold" style={{ color: "#c98261" }}>
        Spa
      </span>
    </div>
    <div className="text-[11px] text-slate-500">Masajes • Relajación</div>
  </div>
</Link>


      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          asChild
          size="sm"
          className="rounded-2xl"
          style={{ backgroundColor: "#c98261", color: "white" }}
        >
          <Link to="/agendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Reservar
          </Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl border-slate-200"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[320px] p-0">
            {/* Header */}
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-2xl shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #c98261 0%, #e8a393 45%, #edddc8 100%)",
                  }}
                  aria-hidden="true"
                />
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    ISKIO <span style={{ color: "#c98261" }}>Spa</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Corporativo • Domicilio • Eventos
                  </div>
                </div>
              </div>

              <div
                className="mt-4 rounded-2xl p-3 text-sm text-slate-700"
                style={{ backgroundColor: "rgba(237,221,200,0.55)" }}
              >
                Bienestar para personas y empresas. Experiencias relajantes, profesionales y
                fáciles de agendar.
              </div>
            </div>

            <Separator />

            {/* Links */}
            <nav className="p-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "block rounded-xl px-4 py-3 text-sm font-medium transition",
                      "text-slate-700 hover:text-slate-900",
                      "hover:bg-[rgba(237,221,200,0.55)]",
                      isActive ? "bg-[rgba(201,130,97,0.14)] text-slate-900" : "",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <Separator />

            {/* Bottom actions */}
            <div className="p-5 space-y-3">
              <Button
                asChild
                className="w-full rounded-2xl"
                style={{ backgroundColor: "#c98261", color: "white" }}
              >
                <Link to="/agendar" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Reservar ahora
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full rounded-2xl border-slate-200"
              >
                <a href="tel:+56900000000" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Llamar
                </a>
              </Button>

              <div className="text-xs text-slate-500">
                Horario: Lun–Sáb • 09:00–20:00
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
