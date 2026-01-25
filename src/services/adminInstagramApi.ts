import { apiFetch } from "@/services/apiClient";

export type AdminInstagramPost = {
  id: string;
  embed_url: string;
  activo: boolean;
  orden: number;
  actualizado_en?: string | null;
};

export type AdminInstagramPayload = Omit<
  AdminInstagramPost,
  "id" | "actualizado_en"
>;

const mapPost = (item: any): AdminInstagramPost => ({
  id: String(item.id),
  embed_url: item.embed_url ?? "",
  activo: Boolean(Number(item.activo ?? 0)),
  orden: Number(item.orden ?? 0),
  actualizado_en: item.actualizado_en ?? null,
});

export const listInstagramAdmin = async () => {
  const data = await apiFetch<any[]>("/instagram");
  return data.map(mapPost);
};

export const createInstagramAdmin = (payload: AdminInstagramPayload) =>
  apiFetch<{ id: number | string }>("/instagram", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateInstagramAdmin = (
  id: string,
  payload: Partial<AdminInstagramPayload>
) =>
  apiFetch<{ success: boolean }>(`/instagram?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteInstagramAdmin = (id: string) =>
  apiFetch<{ success: boolean }>(`/instagram?id=${id}`, {
    method: "DELETE",
  });
