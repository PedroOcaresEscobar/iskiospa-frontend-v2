import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CalendarDays,
  Clock,
  Mail,
  Phone,
  User,
  IdCard,
  CheckCircle,
} from "lucide-react";

import { createCita } from "@/services/citasApi";
import { getDisponibilidadPorFecha, listDiasDisponibles } from "@/services/disponibilidadApi";
import { listServices, type ServiceItem } from "@/services/servicesApi";

interface AgendarFormData {
  rut: string;
  nombre: string;
  correo: string;
  telefono: string;
  servicioId: string;
  date: Date | undefined;
  time: string;
}

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
  formatDateTime: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} 00:00:00`;
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

export const AgendarPage: React.FC = () => {
  const [formData, setFormData] = useState<AgendarFormData>({
    rut: "",
    nombre: "",
    correo: "",
    telefono: "",
    servicioId: "",
    date: undefined,
    time: "",
  });
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set());
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [daysLoaded, setDaysLoaded] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await listServices();
        const active = data.filter((service) => service.activo !== false);
        setServices(active);
        if (!formData.servicioId && active.length > 0) {
          setFormData((prev) => ({
            ...prev,
            servicioId: String(active[0].id),
          }));
        }
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, [formData.servicioId]);

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

  const setField = useCallback(
    <K extends keyof AgendarFormData>(field: K, value: AgendarFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const canSubmit = useMemo(() => {
    return (
      formData.rut.trim() &&
      formData.nombre.trim() &&
      formData.correo.trim() &&
      formData.telefono.trim() &&
      formData.servicioId.trim() &&
      !!formData.date &&
      !!formData.time
    );
  }, [
    formData.rut,
    formData.nombre,
    formData.correo,
    formData.telefono,
    formData.servicioId,
    formData.date,
    formData.time,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting || !formData.date) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createCita({
        rut: formData.rut.trim(),
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim(),
        servicio_id: Number(formData.servicioId),
        fecha: DateUtils.formatDateTime(formData.date),
        hora: `${formData.time}:00`,
      });
      setSuccessMessage(
        `Reserva confirmada para el ${DateUtils.formatLongDate(
          formData.date
        )} a las ${TimeUtils.getTimeLabel(formData.time)}.`
      );
      setFormData({
        rut: "",
        nombre: "",
        correo: "",
        telefono: "",
        servicioId: formData.servicioId,
        date: undefined,
        time: "",
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error al agendar la cita"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-[90%] 2xl:w-[80%] mx-auto">
      <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 2xl:max-w-none 2xl:w-[80%]">
        <header className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Agenda tu sesion
          </h1>
          <p className="mt-3 text-lg text-slate-700">
            Elige un horario disponible y completa tus datos.
          </p>
        </header>

        <Card className="mt-10 rounded-3xl border-black/10 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-2xl">Agendar sesion</CardTitle>
                <CardDescription className="mt-1">
                  Confirmacion por correo y WhatsApp despues de enviar.
                </CardDescription>
              </div>
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="rut" className="flex items-center gap-2">
                    <IdCard className="h-4 w-4" />
                    RUT <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rut"
                    value={formData.rut}
                    onChange={(event) => setField("rut", event.target.value)}
                    placeholder="12.345.678-9"
                    className="rounded-2xl border-black/10 h-12"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(event) => setField("nombre", event.target.value)}
                    placeholder="Tu nombre"
                    className="rounded-2xl border-black/10 h-12"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(event) => setField("correo", event.target.value)}
                    placeholder="tucorreo@gmail.com"
                    className="rounded-2xl border-black/10 h-12"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(event) => setField("telefono", event.target.value)}
                    placeholder="+56 9 1234 5678"
                    className="rounded-2xl border-black/10 h-12"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Servicio <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.servicioId}
                    onValueChange={(value) => setField("servicioId", value)}
                    disabled={services.length === 0 || isSubmitting}
                  >
                    <SelectTrigger className="rounded-2xl border-black/10 bg-white/70 h-12">
                      <SelectValue
                        placeholder={
                          services.length === 0
                            ? "Cargando servicios..."
                            : "Seleccionar servicio"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                        disabled={isSubmitting}
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {formData.date
                          ? DateUtils.formatLongDate(formData.date)
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-4" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          setField("date", date ?? undefined);
                          setField("time", "");
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
                          Sabado: 10:00 - 16:00
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
                      !formData.date || availableTimes.length === 0 || isSubmitting || isLoadingTimes
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

              {successMessage ? (
                <Alert className="rounded-2xl border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="ml-3">
                    <AlertTitle>Exito</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {successMessage}
                    </AlertDescription>
                  </div>
                </Alert>
              ) : null}

              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertTitle>Accion requerida</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Confirmacion por correo y WhatsApp
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cancelacion hasta 24 hrs antes
                  </p>
                </div>

                <Button
                  type="submit"
                  className="rounded-2xl shadow-sm h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
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
      </div>
    </section>
  );
};

export default AgendarPage;
