import { apiFetch } from "@/services/apiClient";

export type InstagramPost = {
  id: number;
  embed_url: string;
  activo: boolean;
  orden: number;
};

const mapPost = (item: any): InstagramPost => ({
  id: Number(item.id),
  embed_url: item.embed_url ?? "",
  activo: Boolean(Number(item.activo ?? 0)),
  orden: Number(item.orden ?? 0),
});

export const listInstagramPosts = async () => {
  const data = await apiFetch<any[]>("/instagram");
  return data.map(mapPost);
};
