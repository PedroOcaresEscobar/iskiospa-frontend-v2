import React from "react";
import { Link } from "react-router-dom";
import logoIskio from "@/assets/logo_iskioSPA.png";

export const NavbarBrand: React.FC = () => {
  return (
    <Link to="/" className="flex items-center gap-3">
      {/* Círculo + logo */}
      <div
        className="relative h-9 w-9 rounded-2xl shadow-sm flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #c98261 0%, #e8a393 45%, #edddc8 100%)",
        }}
        aria-hidden="true"
      >
        <img
          src={logoIskio}
          alt="ISKIO Spa"
          className="h-7 w-7 object-contain"
        />
      </div>

      {/* Texto */}
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-wide text-slate-900">
          ISKIO{" "}
          <span className="font-bold" style={{ color: "#c98261" }}>
            Spa
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Corporativo • Domicilio • Eventos
        </div>
      </div>
    </Link>
  );
};

export default NavbarBrand;
