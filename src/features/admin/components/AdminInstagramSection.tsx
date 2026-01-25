import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AdminInstagramPayload,
  type AdminInstagramPost,
  createInstagramAdmin,
  deleteInstagramAdmin,
  listInstagramAdmin,
  updateInstagramAdmin,
} from "@/services/adminInstagramApi";

type InstagramFormState = {
  id?: string;
  embed_url: string;
  orden: string;
  activo: boolean;
};

const emptyForm: InstagramFormState = {
  embed_url: "",
  orden: "0",
  activo: true,
};

const mapToForm = (post: AdminInstagramPost): InstagramFormState => ({
  id: post.id,
  embed_url: post.embed_url ?? "",
  orden: String(post.orden ?? 0),
  activo: Boolean(post.activo),
});

const buildPayload = (form: InstagramFormState): AdminInstagramPayload => ({
  embed_url: form.embed_url.trim(),
  orden: Number(form.orden) || 0,
  activo: form.activo,
});

export const AdminInstagramSection = () => {
  const [posts, setPosts] = useState<AdminInstagramPost[]>([]);
  const [form, setForm] = useState<InstagramFormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listInstagramAdmin();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleChange = (
    field: keyof InstagramFormState,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const payload = buildPayload(form);
      if (form.id) {
        await updateInstagramAdmin(form.id, payload);
        setMessage("Post actualizado");
      } else {
        await createInstagramAdmin(payload);
        setMessage("Post creado");
      }
      setForm(emptyForm);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar post");
    }
  };

  const handleEdit = (post: AdminInstagramPost) => {
    setForm(mapToForm(post));
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Eliminar este post?");
    if (!confirmed) return;
    setError(null);
    setMessage(null);
    try {
      await deleteInstagramAdmin(id);
      setMessage("Post eliminado");
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar post");
    }
  };

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Instagram embeds
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Agrega URLs de embeds para el carrusel o grilla.
          </p>
        </div>
        <Button variant="outline" onClick={loadPosts}>
          Actualizar lista
        </Button>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="instagram-embed">URL embed</Label>
            <Input
              id="instagram-embed"
              value={form.embed_url}
              onChange={(event) => handleChange("embed_url", event.target.value)}
              placeholder="https://www.instagram.com/p/..."
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="instagram-order">Orden</Label>
            <Input
              id="instagram-order"
              type="number"
              value={form.orden}
              onChange={(event) => handleChange("orden", event.target.value)}
              min="0"
              step="1"
            />
          </div>
          <label className="mt-8 inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(event) => handleChange("activo", event.target.checked)}
            />
            Activo
          </label>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Accion requerida</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : message ? (
          <Alert>
            <AlertTitle>Listo</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            {isEditing ? "Actualizar post" : "Crear post"}
          </Button>
          {isEditing ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar edicion
            </Button>
          ) : null}
        </div>
      </form>

      <div className="mt-8 grid gap-3">
        <h3 className="text-base font-semibold text-gray-900">
          Posts existentes
        </h3>
        {loading ? (
          <p className="text-sm text-slate-500">Cargando posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-500">Sin posts.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 p-3"
            >
              <div>
                <p className="font-medium text-gray-900">
                  Orden {post.orden} | {post.activo ? "Activo" : "Inactivo"}
                </p>
                <p className="text-xs text-slate-500 break-all">
                  {post.embed_url}
                </p>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 md:w-auto">
                <Button variant="outline" onClick={() => handleEdit(post)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => handleDelete(post.id)}
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
