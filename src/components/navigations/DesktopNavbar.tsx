import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, CalendarDays } from "lucide-react";
import type { NavItem } from "./Navbar";

type Props = {
  items: NavItem[];
};

export const DesktopNavbar: React.FC<Props> = ({ items }) => {
  return (
    <>
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2">
        <div
          className="h-9 w-9 rounded-2xl shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, #c98261 0%, #e8a393 45%, #edddc8 100%)",
          }}
          aria-hidden="true"
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide text-slate-900">
            ISKIO <span className="font-bold" style={{ color: "#c98261" }}>Spa</span>
          </div>
          <div className="text-[11px] text-slate-500">Corporativo • Domicilio • Eventos</div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                "text-slate-700 hover:text-slate-900",
                "hover:bg-[rgba(237,221,200,0.55)]",
                isActive
                  ? "bg-[rgba(201,130,97,0.14)] text-slate-900"
                  : "",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href="tel:+56900000000"
          className="hidden lg:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-[rgba(237,221,200,0.55)] hover:text-slate-900 transition"
          aria-label="Llamar a ISKIO Spa"
        >
          <Phone className="h-4 w-4" />
          <span>+56 9 0000 0000</span>
        </a>

        <Button
          asChild
          className="rounded-2xl shadow-sm"
          style={{
            backgroundColor: "#c98261",
            color: "white",
          }}
        >
          <Link to="/reservar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Reservar
          </Link>
        </Button>
      </div>
    </>
  );
};
