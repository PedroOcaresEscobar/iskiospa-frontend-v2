import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  User,
  CalendarDays,
  ArrowLeft,
  Send,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { getDisponibilidadPorFecha, listDiasDisponibles } from "@/services/disponibilidadApi";

/**
 * ✅ Mejoras aplicadas (sin cambiar tu lógica):
 * - Fix TS6133: parámetro no usado -> _data
 * - Fix typings: eliminado `as any` en ClientForm (setter genérico tipado)
 * - Mantiene UI/UX y estructura tal cual
 */

// Types
type FormMode = "company" | "client" | null;

interface CompanyFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  date: Date | undefined;
  time: string;
}

// Utils
const DateUtils = {
  startOfDay: (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  },
  isPastDate: (date: Date): boolean => {
    return (
      DateUtils.startOfDay(date).getTime() <
      DateUtils.startOfDay(new Date()).getTime()
    );
  },
  isSunday: (date: Date): boolean => date.getDay() === 0,
  formatLongDate: (date: Date): string =>
    date.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  formatDateKey: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  },
};

const TimeUtils = {
  getTimeLabel: (time: string): string => {
    const [hourText = "0", minute = "00"] = time.split(":");
    const hour = Number(hourText);
    if (Number.isNaN(hour)) return time;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    return `${String(displayHour).padStart(2, "0")}:${minute} ${period}`;
  },
};

// Hooks
const useFormNavigation = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<FormMode>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetMode = useCallback(() => {
    setMode(null);
    setIsSubmitting(false);
  }, []);

  const goHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return { mode, setMode, isSubmitting, setIsSubmitting, resetMode, goHome };
};

const useSuccessMessage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const showSuccess = useCallback(
    (message: string) => setSuccessMessage(message),
    []
  );
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);
  return { successMessage, showSuccess, clearSuccess };
};

// Small UI helper
function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-[90%] 2xl:w-[80%] mx-auto">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 2xl:max-w-none 2xl:w-[80%]">
        {children}
      </div>
    </section>
  );
}

function ClickableCard({
  title,
  description,
  icon,
  bullets,
  cta,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  bullets: string[];
  cta: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Card
      className={[
        "rounded-3xl border-black/10 bg-white/75 backdrop-blur",
        "transition-all duration-300",
        disabled
          ? "opacity-60 pointer-events-none"
          : "cursor-pointer hover:shadow-lg hover:-translate-y-1",
        "group focus-within:ring-2 focus-within:ring-amber-500/30",
      ].join(" ")}
      role="button"
      tabIndex={0}
      aria-disabled={disabled ? "true" : "false"}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl shadow-sm bg-gradient-to-br from-amber-500/20 to-amber-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2 text-sm text-slate-600">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {b}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full rounded-2xl">
          {cta}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Mode Selector
const ModeSelector: React.FC<{
  onSelectMode: (mode: FormMode) => void;
  disabled?: boolean;
}> = ({ onSelectMode, disabled }) => (
  <div className="mt-10 grid gap-4 md:grid-cols-2">
    <ClickableCard
      title="Empresas"
      description="Cotizaciones para pausas saludables, activaciones y eventos corporativos."
      icon={<Building2 className="h-6 w-6 text-amber-600" />}
      bullets={[
        "Ideal para equipos grandes",
        "Actividades personalizadas",
        "Cobertura según zona",
      ]}
      cta="Solicitar cotización"
      onClick={() => onSelectMode("company")}
      disabled={disabled}
    />
    <ClickableCard
      title="Personas"
      description="Agenda una sesión: relajación, descontracturante o terapias."
      icon={<User className="h-6 w-6 text-amber-600" />}
      bullets={["Sesiones individuales", "Domicilio o en centro", "Horarios flexibles"]}
      cta="Agendar sesión"
      onClick={() => onSelectMode("client")}
      disabled={disabled}
    />
  </div>
);

// Company Form
const CompanyForm: React.FC<{
  onSubmit: (data: CompanyFormData) => Promise<void>;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = useCallback(
    (field: keyof CompanyFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const canSubmit = useMemo(() => {
    return (
      formData.companyName.trim() &&
      formData.contactName.trim() &&
      formData.email.trim()
    );
  }, [formData.companyName, formData.contactName, formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isLoading) return;
    await onSubmit(formData);
  };

  return (
    <Card className="mt-10 rounded-3xl border-black/10 bg-white/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-2xl">Contacto Empresarial</CardTitle>
            <CardDescription className="mt-1">
              Completa el formulario y te contactaremos en menos de 24 horas hábiles.
            </CardDescription>
          </div>
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName")(e.target.value)}
                placeholder="Nombre de la empresa"
                className="rounded-2xl border-black/10 h-12"
                required
                disabled={isLoading}
              />
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="contactName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre de contacto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleChange("contactName")(e.target.value)}
                placeholder="Tu nombre"
                className="rounded-2xl border-black/10 h-12"
                required
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email")(e.target.value)}
                placeholder="contacto@iskiospa.cl"
                className="rounded-2xl border-black/10 h-12"
                required
                disabled={isLoading}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone")(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="rounded-2xl border-black/10 h-12"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Detalles de la solicitud
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message")(e.target.value)}
              placeholder="Cantidad de personas, lugar, fecha estimada, tipo de servicio, duración, etc."
              className="rounded-2xl border-black/10 min-h-[140px] resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div className="text-sm text-slate-600 space-y-1">
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Respuesta en 24-48 horas hábiles
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Cotización sin compromiso
              </p>
            </div>

            <Button
              type="submit"
              className="rounded-2xl shadow-sm h-12 px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar solicitud
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Client Form
const ClientForm: React.FC<{
  onSubmit: (data: ClientFormData) => Promise<void>;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    phone: "",
    date: undefined,
    time: "",
  });
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set());
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [daysLoaded, setDaysLoaded] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // ✅ Setter tipado (sin `any`)
  const setField = useCallback(
    <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  useEffect(() => {
    const loadAvailableDays = async () => {
      setDaysLoaded(false);
      try {
        const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
        const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
        const desde = DateUtils.formatDateKey(start);
        const hasta = DateUtils.formatDateKey(end);
        const dias = await listDiasDisponibles(desde, hasta);
        setAvailableDays(new Set(dias));
      } catch {
        setAvailableDays(new Set());
      } finally {
        setDaysLoaded(true);
      }
    };

    loadAvailableDays();
  }, [calendarMonth]);

  useEffect(() => {
    const loadAvailableTimes = async () => {
      if (!formData.date) {
        setAvailableTimes([]);
        return;
      }
      setIsLoadingTimes(true);
      try {
        const fechaKey = DateUtils.formatDateKey(formData.date);
        const horas = await getDisponibilidadPorFecha(fechaKey);
        setAvailableTimes(horas);
      } catch {
        setAvailableTimes([]);
      } finally {
        setIsLoadingTimes(false);
      }
    };

    loadAvailableTimes();
  }, [formData.date]);

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      !!formData.date &&
      !!formData.time
    );
  }, [formData.name, formData.email, formData.phone, formData.date, formData.time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isLoading) return;
    await onSubmit(formData);
  };

  return (
    <Card className="mt-10 rounded-3xl border-black/10 bg-white/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-2xl">Agendar Sesión</CardTitle>
            <CardDescription className="mt-1">
              Elige una fecha y una hora disponible para tu sesión.
            </CardDescription>
          </div>
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Tu nombre"
                className="rounded-2xl border-black/10 h-12"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="tucorreo@gmail.com"
                className="rounded-2xl border-black/10 h-12"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+56 9 1234 5678"
                className="rounded-2xl border-black/10 h-12"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Fecha + Hora */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Fecha <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start rounded-2xl border-black/10 bg-white/70 hover:bg-white h-12"
                    disabled={isLoading}
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {formData.date ? DateUtils.formatLongDate(formData.date) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-4" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      setField("date", date ?? undefined);
                      setField("time", ""); // reset hora al cambiar fecha
                    }}
                    onMonthChange={(date) => setCalendarMonth(date)}
                    disabled={(date) => {
                      if (DateUtils.isPastDate(date) || DateUtils.isSunday(date)) {
                        return true;
                      }
                      if (daysLoaded) {
                        return !availableDays.has(DateUtils.formatDateKey(date));
                      }
                      return false;
                    }}
                    initialFocus
                    className="rounded-lg"
                  />

                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Lunes a Viernes: 10:00 - 19:00
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Sábado: 10:00 - 16:00
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora <span className="text-red-500">*</span>
              </Label>

              <Select
                value={formData.time}
                onValueChange={(value) => setField("time", value)}
                disabled={
                  !formData.date || availableTimes.length === 0 || isLoading || isLoadingTimes
                }
              >
                <SelectTrigger className="rounded-2xl border-black/10 bg-white/70 h-12">
                  <SelectValue
                    placeholder={
                      !formData.date
                        ? "Primero elige una fecha"
                        : isLoadingTimes
                        ? "Cargando horas..."
                        : availableTimes.length === 0
                        ? "Sin horas disponibles"
                        : "Seleccionar hora"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TimeUtils.getTimeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formData.date && !isLoadingTimes && availableTimes.length === 0 && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  No hay cupos disponibles para esta fecha
                </p>
              )}
            </div>
          </div>

          {/* Confirmación visual */}
          {formData.date && formData.time && (
            <Alert className="rounded-2xl border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <div className="ml-2">
                <AlertTitle>Resumen</AlertTitle>
                <AlertDescription>
                  Tu sesión:{" "}
                  <span className="font-semibold">
                    {DateUtils.formatLongDate(formData.date)} a las {TimeUtils.getTimeLabel(formData.time)}
                  </span>
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div className="text-sm text-slate-600 space-y-1">
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Confirmación por correo y WhatsApp
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Cancelación hasta 24 hrs antes
              </p>
            </div>

            <Button
              type="submit"
              className="rounded-2xl shadow-sm h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Agendando...
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Confirmar reserva
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Success Alert
const SuccessAlert: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="mt-8">
      <Alert className="rounded-2xl border-green-200 bg-green-50">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div className="ml-3">
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">{message}</AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

// Main
export const ContactPage: React.FC = () => {
  const { mode, setMode, isSubmitting, setIsSubmitting, resetMode, goHome } =
    useFormNavigation();
  const { successMessage, showSuccess } = useSuccessMessage();

  // ✅ FIX TS6133
  const handleCompanySubmit = async (_data: CompanyFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showSuccess("✅ Solicitud enviada. Te contactaremos en menos de 24 horas para la cotización.");
    setIsSubmitting(false);
  };

  const handleClientSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showSuccess(
      `✅ Reserva confirmada para el ${DateUtils.formatLongDate(
        data.date!
      )} a las ${TimeUtils.getTimeLabel(data.time)}. Te enviaremos un recordatorio.`
    );
    setIsSubmitting(false);
  };

  return (
    <div className="relative">
      <SectionShell>
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <header className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Programa tu experiencia
            </h1>
            <p className="mt-3 text-lg text-slate-700">
              Selecciona el tipo de servicio y completa el formulario. Estamos aquí para ayudarte.
            </p>
          </header>

          {mode && (
            <Button
              variant="outline"
              className="rounded-2xl border-black/10 bg-white/80 hover:bg-white shadow-sm w-full sm:w-auto"
              onClick={resetMode}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          )}
        </div>

        {/* Success */}
        {successMessage ? (
          <>
            <SuccessAlert message={successMessage} onClose={goHome} />
            <div className="mt-4">
              <Button
                className="rounded-2xl h-12 px-8 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700"
                onClick={goHome}
              >
                Ir al inicio
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Selector o Form */}
            {!mode ? (
              <ModeSelector onSelectMode={setMode} disabled={isSubmitting} />
            ) : mode === "company" ? (
              <CompanyForm onSubmit={handleCompanySubmit} isLoading={isSubmitting} />
            ) : (
              <ClientForm onSubmit={handleClientSubmit} isLoading={isSubmitting} />
            )}

            {/* Footer note */}
            <div className="mt-14 text-center text-sm text-slate-500">
              <p>
                ¿Necesitas ayuda? Escríbenos a{" "}
                <a
                  href="mailto:contacto@iskiospa.cl"
                  className="text-amber-600 hover:underline"
                >
                  contacto@iskiospa.cl
                </a>{" "}
                o llama al{" "}
                <a
                  href="tel:+56900000000"
                  className="text-amber-600 hover:underline"
                >
                  +56 9 0000 0000
                </a>
              </p>
              <p className="mt-2">Horario de atención: Lunes a Sábado de 9:00 a 20:00 hrs</p>
            </div>
          </>
        )}
      </SectionShell>
    </div>
  );
};

export default ContactPage;
