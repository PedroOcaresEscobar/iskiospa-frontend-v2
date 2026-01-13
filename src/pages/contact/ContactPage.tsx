import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// icons (opcional)
import { Building2, User, CalendarDays, ArrowLeft, Send } from "lucide-react";

type Mode = "empresa" | "cliente" | null;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isPastDate(d: Date) {
  return startOfDay(d).getTime() < startOfDay(new Date()).getTime();
}

function isSunday(d: Date) {
  return d.getDay() === 0;
}

/**
 * Disponibilidad simple (editable):
 * - Lunes a Sábado
 * - Horas base: 10:00 a 19:00
 * - Puedes personalizar por fecha si quieres.
 */
function getAvailableTimes(date: Date | undefined): string[] {
  if (!date) return [];
  if (isSunday(date)) return [];
  if (isPastDate(date)) return [];

  // ejemplo: bloques cada 60 min
  const slots = ["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  // ejemplo de regla especial: sábados menos horas
  if (date.getDay() === 6) {
    return ["10:00", "11:00", "12:00", "13:00", "15:00", "16:00"];
  }

  return slots;
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString("es-CL", { weekday: "short", day: "2-digit", month: "short" });
}

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // EMPRESA form
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyMsg, setCompanyMsg] = useState("");

  // CLIENTE form
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const availableTimes = useMemo(() => getAvailableTimes(selectedDate), [selectedDate]);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const brandGradient =
    "linear-gradient(135deg, rgba(201,130,97,0.9) 0%, rgba(232,163,147,0.75) 45%, rgba(237,221,200,0.85) 100%)";

  function resetForms() {
    setCompanyName("");
    setContactName("");
    setCompanyEmail("");
    setCompanyPhone("");
    setCompanyMsg("");

    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setSelectedDate(undefined);
    setSelectedTime("");
  }

  function handleSuccess(message: string) {
    setSuccessMsg(message);
    resetForms();

    // UX: deja que el usuario lea el mensaje y luego redirige
    setTimeout(() => {
      navigate("/");
    }, 1400);
  }

  function onSubmitCompany(e: React.FormEvent) {
    e.preventDefault();

    // validación mínima
    if (!companyName.trim() || !contactName.trim() || !companyEmail.trim()) {
      setSuccessMsg("Completa al menos Empresa, Nombre de contacto y Correo.");
      return;
    }

    // aquí iría tu POST real a backend / email service
    handleSuccess("✅ Solicitud enviada. Te contactaremos para la cotización.");
  }

  function onSubmitClient(e: React.FormEvent) {
    e.preventDefault();

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setSuccessMsg("Completa Nombre, Correo y Teléfono para agendar.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      setSuccessMsg("Selecciona una fecha y una hora disponible.");
      return;
    }

    // aquí iría tu POST real a backend / calendario
    handleSuccess("✅ Reserva enviada. Te confirmaremos tu hora a la brevedad.");
  }

  return (
    <div className="w-full">
      {/* Fondo suave, relax */}
      <div
        className="w-screen"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 20%, rgba(232,163,147,0.35) 0%, rgba(237,221,200,0.28) 40%, rgba(255,255,255,0.9) 75%)",
        }}
      >
        <div className="w-full px-4 py-10 2xl:w-[80vw] 2xl:mx-auto 2xl:px-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Contacto & Reserva
              </h1>
              <p className="mt-2 text-slate-700">
                Elige si eres <span className="font-semibold">empresa</span> (cotización) o{" "}
                <span className="font-semibold">persona</span> (agenda tu hora).
              </p>
            </div>

            {mode && (
              <Button
                variant="outline"
                className="rounded-2xl border-black/10 bg-white/70 hover:bg-white"
                onClick={() => {
                  setMode(null);
                  setSuccessMsg(null);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            )}
          </div>

          {/* Mensaje */}
          {successMsg && (
            <div className="mt-6">
              <Alert className="rounded-2xl border-black/10 bg-white/80">
                <AlertTitle>Mensaje</AlertTitle>
                <AlertDescription>{successMsg}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Selector inicial */}
          {!mode && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Card
                className="rounded-3xl border-black/10 bg-white/75 backdrop-blur cursor-pointer hover:shadow-md transition"
                onClick={() => {
                  setSuccessMsg(null);
                  setMode("empresa");
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-2xl shadow-sm"
                      style={{ background: brandGradient }}
                      aria-hidden="true"
                    />
                    <div>
                      <CardTitle className="text-lg">Empresas</CardTitle>
                      <CardDescription>
                        Cotizaciones para pausas saludables, activaciones y eventos.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
                    <Building2 className="h-4 w-4" style={{ color: "#a4a58d" }} />
                    Ideal para equipos y actividades corporativas.
                  </div>
                </CardContent>
              </Card>

              <Card
                className="rounded-3xl border-black/10 bg-white/75 backdrop-blur cursor-pointer hover:shadow-md transition"
                onClick={() => {
                  setSuccessMsg(null);
                  setMode("cliente");
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-2xl shadow-sm"
                      style={{ background: brandGradient }}
                      aria-hidden="true"
                    />
                    <div>
                      <CardTitle className="text-lg">Personas</CardTitle>
                      <CardDescription>
                        Agenda una sesión para relajación o descontracturante.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
                    <User className="h-4 w-4" style={{ color: "#c98261" }} />
                    Domicilio o coordinación personalizada.
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Form Empresa */}
          {mode === "empresa" && (
            <Card className="mt-8 rounded-3xl border-black/10 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Contacto Empresas</CardTitle>
                <CardDescription>
                  Envíanos tu solicitud y te contactamos para cotizar.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={onSubmitCompany} className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Empresa *</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nombre de la empresa"
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Nombre de contacto *</Label>
                      <Input
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Tu nombre"
                        className="rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Correo *</Label>
                      <Input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="contacto@empresa.cl"
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Mensaje</Label>
                    <Textarea
                      value={companyMsg}
                      onChange={(e) => setCompanyMsg(e.target.value)}
                      placeholder="Cuéntanos: cantidad de personas, lugar, fecha estimada, tipo de servicio, etc."
                      className="rounded-2xl min-h-[120px]"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2">
                    <div className="text-xs text-slate-600">
                      * Campos obligatorios. Respuesta habitual dentro de 24–48 hrs hábiles.
                    </div>

                    <Button
                      type="submit"
                      className="rounded-2xl shadow-sm"
                      style={{ backgroundColor: "#c98261", color: "white" }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar solicitud
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Form Cliente + calendario */}
          {mode === "cliente" && (
            <Card className="mt-8 rounded-3xl border-black/10 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">Agendar sesión</CardTitle>
                <CardDescription>
                  Completa tus datos y selecciona fecha/hora disponible.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={onSubmitClient} className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Nombre *</Label>
                      <Input
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Tu nombre"
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Correo *</Label>
                      <Input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="tucorreo@gmail.com"
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Teléfono *</Label>
                      <Input
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Fecha + Hora */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Fecha *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start rounded-2xl border-black/10 bg-white/70 hover:bg-white"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            {selectedDate ? formatShortDate(selectedDate) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => {
                              setSelectedDate(d);
                              setSelectedTime("");
                            }}
                            disabled={(date) => isPastDate(date) || isSunday(date)}
                            initialFocus
                          />
                          <div className="px-2 pb-2 text-xs text-slate-600">
                            No hay reservas los domingos.
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label>Hora *</Label>
                      <Select
                        value={selectedTime}
                        onValueChange={(v) => setSelectedTime(v)}
                        disabled={!selectedDate || availableTimes.length === 0}
                      >
                        <SelectTrigger className="rounded-2xl border-black/10 bg-white/70">
                          <SelectValue
                            placeholder={
                              !selectedDate
                                ? "Primero elige una fecha"
                                : availableTimes.length === 0
                                  ? "Sin horas disponibles"
                                  : "Seleccionar hora"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedDate && availableTimes.length === 0 && (
                        <div className="text-xs text-slate-600">
                          No hay cupos para esa fecha. Prueba otro día.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-2">
                    <div className="text-xs text-slate-600">
                      * Campos obligatorios. Recibirás confirmación por contacto.
                    </div>

                    <Button
                      type="submit"
                      className="rounded-2xl shadow-sm"
                      style={{ backgroundColor: "#a4a58d", color: "white" }}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Agendar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
