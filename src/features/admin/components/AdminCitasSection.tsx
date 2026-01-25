import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteCitaAdmin,
  listCitasAdmin,
  updateCitaAdmin,
  type AdminCita,
} from "@/services/adminCitasApi";

const STATUS_OPTIONS = ["pendiente", "confirmada", "cancelada"];

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CL");
};

export const AdminCitasSection = () => {
  const [citas, setCitas] = useState<AdminCita[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCitas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCitasAdmin();
      setCitas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitas();
  }, []);

  const handleStatusChange = async (cita: AdminCita, estado: string) => {
    setError(null);
    setMessage(null);
    try {
      await updateCitaAdmin(cita.id, { estado });
      setCitas((prev) =>
        prev.map((item) =>
          item.id === cita.id ? { ...item, estado } : item
        )
      );
      setMessage("Estado actualizado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar cita");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Eliminar esta cita?");
    if (!confirmed) return;
    setError(null);
    setMessage(null);
    try {
      await deleteCitaAdmin(id);
      setCitas((prev) => prev.filter((cita) => cita.id !== id));
      setMessage("Cita eliminada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar cita");
    }
  };

  const grouped = useMemo(() => citas, [citas]);

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Citas agendadas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Actualiza estados o elimina citas.
          </p>
        </div>
        <Button variant="outline" onClick={loadCitas}>
          Actualizar lista
        </Button>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando citas...</p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-slate-500">No hay citas registradas.</p>
        ) : (
          grouped.map((cita) => (
            <div
              key={cita.id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {cita.cliente}
                </h4>
                <p className="text-sm text-slate-500">
                  {cita.servicio} • {formatDate(cita.fecha)}{" "}
                  {cita.hora ? `• ${cita.hora}` : ""}
                </p>
                <p className="text-xs text-slate-400">
                  {cita.correo} • {cita.telefono}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={cita.estado}
                  onChange={(event) => handleStatusChange(cita, event.target.value)}
                  className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-sm"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => handleDelete(cita.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default AdminCitasSection;
