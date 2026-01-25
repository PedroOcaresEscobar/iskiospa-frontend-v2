import { apiFetch } from "@/services/apiClient";

export type CreateCitaPayload = {
  nombre: string;
  correo: string;
  telefono: string;
  fecha: string;
  hora: string;
  servicio_id: number;
  rut?: string;
};

export const createCita = (payload: CreateCitaPayload) =>
  apiFetch<{ message: string; cita_id: number }>("/citas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
