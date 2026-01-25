import React from "react";
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileNavbar } from "./MobileNavbar";

export type NavItem = { label: string; to: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", to: "/" },
  { label: "Servicios", to: "/servicios" },
  { label: "Empresas", to: "/empresas" },
  { label: "Eventos", to: "/eventos" },
  { label: "Agendar", to: "/agendar" },
  { label: "Contacto", to: "/contacto" },
];

export const Navbar: React.FC = () => {
  return (
    <div className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="w-full px-4 2xl:w-[80%] 2xl:px-0 2xl:mx-auto">
        <div className="h-16 flex items-center justify-between">
          {/* Desktop */}
          <div className="hidden md:flex w-full items-center justify-between">
            <DesktopNavbar items={NAV_ITEMS} />
          </div>

          {/* Mobile */}
          <div className="flex md:hidden w-full items-center justify-between">
            <MobileNavbar items={NAV_ITEMS} />
          </div>
        </div>
      </div>
    </div>
  );
};
