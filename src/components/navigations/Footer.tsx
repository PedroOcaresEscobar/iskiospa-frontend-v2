import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin } from "lucide-react";
import NavbarBrand from "./NavbarBrand";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full ">
      <div style={{ backgroundColor: "rgba(237,221,200,0.45)" }}>
        <div className="w-full px-4 py-10 2xl:w-[80vw]  2xl:px-0 2xl:mx-auto">
          <div className="grid gap-10 md:grid-cols-3 lg:w-[90%] mx-auto ">
            {/* Brand */}
            <div className="md:col-span-1">
              {/* Brand */}
            <NavbarBrand/>

              <p className="mt-4 text-sm text-slate-700 leading-relaxed">
                Experiencias de bienestar para todo público: domicilio, empresas y eventos.
              </p>
            </div>


            
            {/* Ayuda */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Ayuda</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link className="text-slate-700 hover:text-slate-900" to="/contacto">Contacto</Link></li>
                <li><Link className="text-slate-700 hover:text-slate-900" to="/contacto">Reservas</Link></li>
                <li><Link className="text-slate-700 hover:text-slate-900" to="/preguntas">Preguntas frecuentes</Link></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Contacto</h4>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a className="hover:text-slate-900" href="tel:+56900000000">
                    +56 9 0000 0000
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a className="hover:text-slate-900" href="mailto:contacto@iskiospa.cl">
                    contacto@iskiospa.cl
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Santiago, Chile</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} ISKIO Spa. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-xs">
              <Link className="text-slate-600 hover:text-slate-900" to="/privacidad">
                Privacidad
              </Link>
              <Link className="text-slate-600 hover:text-slate-900" to="/terminos">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
