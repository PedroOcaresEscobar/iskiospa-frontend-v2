import { apiFetch } from "@/services/apiClient";

export type DashboardOverview = {
  total_citas?: number;
  citas_hoy?: number;
  clientes?: number;
  servicios?: number;
  top_servicios_30d?: Array<{
    servicio_id: number;
    servicio_nombre: string;
    total_citas: number;
  }>;
};

export const fetchDashboardOverview = () =>
  apiFetch<DashboardOverview>("/dashboard/overview");

export const fetchDashboardCitasHoy = () =>
  apiFetch<any[]>("/dashboard/citas-hoy");

export const fetchDashboardTopServicios = () =>
  apiFetch<any[]>("/dashboard/top-servicios");
