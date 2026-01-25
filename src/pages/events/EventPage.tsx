import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, CalendarDays } from "lucide-react";

import { listInstagramPosts, type InstagramPost } from "@/services/instagramApi";

const toPublicUrl = (embedUrl: string) => embedUrl.replace(/\/embed\/?$/, "/");

export const EventPage: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await listInstagramPosts();
        const ordered = data
          .filter((post) => post.activo !== false && post.embed_url)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        setPosts(ordered);
      } catch {
        setPosts([]);
      }
    };

    loadPosts();
  }, []);

  const embeds = useMemo(() => {
    return posts.map((post) => ({
      id: post.id,
      embed: post.embed_url,
      url: toPublicUrl(post.embed_url),
    }));
  }, [posts]);

  return (
    <section className="w-full">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 2xl:max-w-none 2xl:w-[80%]">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Eventos ISKIO Spa
            </h1>

            <p className="mt-2 text-slate-700">
              Mira reels y publicaciones de nuestras experiencias. Para ver el perfil completo,
              ábrelo directamente en Instagram.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="rounded-2xl shadow-sm"
              style={{ backgroundColor: "#c98261", color: "white" }}
            >
              <a
                href="https://www.instagram.com/stories/highlights/18043051052226043/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-3xl border border-black/5 bg-white/70 p-6 hover:bg-white transition"
              >
                <div className="text-sm font-semibold text-slate-900">
                  Ver Highlights (Historias destacadas)
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Se abre en Instagram (Highlights no soporta embed).
                </div>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-black/10 bg-white/70 hover:bg-white"
            >
              <Link to="/agendar" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Cotizar evento
              </Link>
            </Button>
          </div>
        </header>

        {embeds.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-black/5 bg-white/70 p-6 text-slate-700">
            <div className="font-semibold text-slate-900"></div>
            <p className="mt-2 text-sm">Agregar iframe desde el panel.</p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {embeds.map((item, idx) => (
                <article
                  key={`${item.url}-${idx}`}
                  className="rounded-3xl border border-black/5 bg-white/70 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="relative w-full aspect-video bg-white">
                    <iframe
                      src={item.embed}
                      title={`Instagram embed ${idx + 1}`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                      frameBorder={0}
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          Video / publicación
                        </div>
                        <div className="mt-1 text-xs text-slate-600 truncate">
                          {item.url}
                        </div>
                      </div>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                      >
                        Abrir <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 text-xs text-slate-500">
              * Si algún embed no carga, normalmente es porque el post/reel no es público o Instagram
              restringe la inserción para ese contenido.
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EventPage;
