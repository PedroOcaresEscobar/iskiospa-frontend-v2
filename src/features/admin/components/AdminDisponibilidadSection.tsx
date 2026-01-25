import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDisponibilidad,
  deleteDisponibilidad,
  listSlotsDisponibles,
  type DisponibilidadSlot,
} from "@/services/disponibilidadApi";

const TIME_OPTIONS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const WEEKDAYS = [
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mie", value: 3 },
  { label: "Jue", value: 4 },
  { label: "Vie", value: 5 },
  { label: "Sab", value: 6 },
];

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const buildDateRange = (
  start: string,
  end: string,
  weekdays: number[]
): string[] => {
  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  if (!startDate || !endDate || startDate > endDate) {
    return [];
  }

  const result: string[] = [];
  const cursor = new Date(startDate.getTime());
  while (cursor <= endDate) {
    const day = cursor.getDay();
    if (weekdays.includes(day)) {
      result.push(formatDateInput(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
};

export const AdminDisponibilidadSection = () => {
  const today = new Date();
  const defaultEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

  const [desde, setDesde] = useState(formatDateInput(today));
  const [hasta, setHasta] = useState(formatDateInput(defaultEnd));
  const [weekdays, setWeekdays] = useState<number[]>(WEEKDAYS.map((day) => day.value));
  const [hours, setHours] = useState<string[]>(TIME_OPTIONS);
  const [slots, setSlots] = useState<DisponibilidadSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedDates = useMemo(
    () => buildDateRange(desde, hasta, weekdays),
    [desde, hasta, weekdays]
  );
  const totalSlots = selectedDates.length * hours.length;

  const groupedSlots = useMemo(() => {
    const map = new Map<string, DisponibilidadSlot[]>();
    slots.forEach((slot) => {
      const list = map.get(slot.fecha) ?? [];
      list.push(slot);
      map.set(slot.fecha, list);
    });
    return Array.from(map.entries()).map(([fecha, items]) => ({
      fecha,
      items,
    }));
  }, [slots]);

  const toggleWeekday = (value: number) => {
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((day) => day !== value) : [...prev, value]
    );
  };

  const toggleHour = (value: string) => {
    setHours((prev) =>
      prev.includes(value) ? prev.filter((hour) => hour !== value) : [...prev, value]
    );
  };

  const normalizeHours = (items: DisponibilidadSlot[]) => {
    const merged = new Set<string>();
    items.forEach((slot) => merged.add(slot.hora));
    return Array.from(merged);
  };

  const handleDayToggle = async (fecha: string, active: boolean) => {
    const group = groupedSlots.find((item) => item.fecha === fecha);
    const hoursList = group ? normalizeHours(group.items) : TIME_OPTIONS;
    if (hoursList.length === 0) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload = { fechas: [fecha], horas: hoursList };
      const result = active
        ? await createDisponibilidad(payload)
        : await deleteDisponibilidad(payload);
      setMessage(
        active
          ? `Dia habilitado (${result.total})`
          : `Dia bloqueado (${result.total})`
      );
      await loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar dia");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotToggle = async (slot: DisponibilidadSlot) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload = { fechas: [slot.fecha], horas: [slot.hora] };
      const isActive = Number(slot.activo) === 1;
      const result = isActive
        ? await deleteDisponibilidad(payload)
        : await createDisponibilidad(payload);
      setMessage(isActive ? "Hora bloqueada" : "Hora habilitada");
      await loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar horario");
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = useCallback(async () => {
    if (!desde || !hasta) {
      setError("Debes definir un rango de fechas.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await listSlotsDisponibles(desde, hasta, true);
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar disponibilidad");
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleSave = async () => {
    if (selectedDates.length === 0 || hours.length === 0) {
      setError("Selecciona fechas y horas validas.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await createDisponibilidad({ fechas: selectedDates, horas: hours });
      setMessage(`Horarios habilitados: ${result.total}`);
      await loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedDates.length === 0 || hours.length === 0) {
      setError("Selecciona fechas y horas validas.");
      return;
    }
    const confirmed = window.confirm("Eliminar horarios seleccionados?");
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await deleteDisponibilidad({ fechas: selectedDates, horas: hours });
      setMessage(`Horarios bloqueados: ${result.total}`);
      await loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar horarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Disponibilidad</h2>
          <p className="mt-1 text-sm text-slate-500">
            Agrega o elimina horarios por rango de fechas y horas.
          </p>
        </div>
        <Button variant="outline" onClick={loadSlots} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar listado
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="dispo-desde" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Desde
            </Label>
            <Input
              id="dispo-desde"
              type="date"
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dispo-hasta" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Hasta
            </Label>
            <Input
              id="dispo-hasta"
              type="date"
              value={hasta}
              onChange={(event) => setHasta(event.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Dias disponibles
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const active = weekdays.includes(day.value);
              return (
                <button
                  type="button"
                  key={day.value}
                  className={`rounded-2xl border px-3 py-1 text-sm ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                  onClick={() => toggleWeekday(day.value)}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horas disponibles
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIME_OPTIONS.map((time) => {
              const active = hours.includes(time);
              return (
                <button
                  type="button"
                  key={time}
                  className={`rounded-2xl border px-3 py-1 text-sm ${
                    active
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                  onClick={() => toggleHour(time)}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="rounded-2xl bg-[#10b981] text-white hover:bg-[#0f9f75]"
            onClick={handleSave}
            disabled={loading}
          >
            Habilitar horarios ({totalSlots})
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Bloquear horarios
          </Button>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4">
        {groupedSlots.length === 0 ? (
          <p className="text-sm text-slate-500">No hay horarios cargados.</p>
        ) : (
          groupedSlots.map((group) => {
            const hasActive = group.items.some((slot) => Number(slot.activo) === 1);
            return (
              <div
                key={group.fecha}
                className="rounded-3xl border border-slate-200 bg-white/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{group.fecha}</h4>
                    <p className="text-xs text-slate-500">
                      {hasActive ? "Dia con horarios activos" : "Dia bloqueado"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDayToggle(group.fecha, true)}
                      disabled={loading}
                    >
                      Habilitar dia
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDayToggle(group.fecha, false)}
                      disabled={loading}
                    >
                      Bloquear dia
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((slot) => {
                    const ocupada = Number(slot.ocupada) === 1;
                    const activa = Number(slot.activo) === 1;
                    const label = ocupada
                      ? "Ocupada"
                      : activa
                      ? "Disponible"
                      : "Bloqueada";
                    const color = ocupada
                      ? "bg-amber-100 text-amber-700"
                      : activa
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600";
                    return (
                      <button
                        type="button"
                        key={`${group.fecha}-${slot.hora}`}
                        onClick={() => handleSlotToggle(slot)}
                        disabled={loading}
                        className={`rounded-2xl px-3 py-1 text-xs ${color}`}
                        title="Click para alternar"
                      >
                        {slot.hora} • {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default AdminDisponibilidadSection;
