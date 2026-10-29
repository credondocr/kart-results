"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import ReCAPTCHA from "react-google-recaptcha";
import WhatsAppShare from "@/app/components/WhatsAppShare";
import { useLatinoamericano } from "./LatinoamericanoStore";
import { CATEGORIA_FAMILIAS, EQUIPOS, posicionDe } from "./data";

type CountryOption = { value: string; label: string; flag: string };

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

/* ── Combobox de país (banderas + búsqueda, sin react-select) ─────────────── */

function CountryCombobox({
  value,
  onChange,
  error,
}: {
  value: CountryOption | null;
  onChange: (c: CountryOption | null) => void;
  error?: string;
}) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("world-countries")
      .then((mod) => {
        if (cancelled) return;
        const raw = (mod.default ?? mod) as {
          cca2: string;
          name: { common: string };
          translations?: { spa?: { common?: string } };
        }[];
        const list = raw
          .map((c) => ({
            value: c.cca2,
            label: c.translations?.spa?.common || c.name.common,
            flag: `https://flagcdn.com/w40/${c.cca2.toLowerCase()}.png`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label, "es"));
        setCountries(list);
      })
      .catch(() => setCountries([]));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("es");
    if (!q) return countries.slice(0, 80);
    return countries
      .filter(
        (c) =>
          c.label.toLocaleLowerCase("es").includes(q) ||
          c.value.toLowerCase().includes(q)
      )
      .slice(0, 80);
  }, [countries, query]);

  useEffect(() => setActive(0), [query]);

  const commit = (c: CountryOption | undefined) => {
    if (!c) return;
    onChange(c);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      commit(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor="la-pais" className="admin-label">
        Nacionalidad
      </label>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--line-strong)] bg-white/[0.03] px-3 py-2">
          <Image src={value.flag} alt="" width={24} height={18} className="h-4 w-6 rounded-[2px] object-cover" />
          <span className="flex-1 text-sm font-medium text-white">{value.label}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <input
            id="la-pais"
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="la-pais-list"
            aria-autocomplete="list"
            autoComplete="off"
            placeholder="Buscar país…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="admin-input"
            aria-invalid={Boolean(error)}
          />
          {open ? (
            <ul
              id="la-pais-list"
              ref={listRef}
              role="listbox"
              className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--line-strong)] bg-[#0F1322] py-1 shadow-2xl"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[var(--text-dim)]">
                  Sin resultados. Sigue escribiendo…
                </li>
              ) : (
                filtered.map((c, i) => (
                  <li key={c.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onClick={() => commit(c)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                        i === active ? "bg-[#4C8DFF]/15 text-white" : "text-[var(--text)]"
                      }`}
                    >
                      <Image src={c.flag} alt="" width={20} height={15} className="h-3.5 w-5 rounded-[2px] object-cover" />
                      {c.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </>
      )}
      {error ? (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ── Toggle carpa ─────────────────────────────────────────────────────────── */

function CarpaToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--line-strong)] bg-white/[0.03] px-3 py-2.5">
      <div>
        <span className="text-sm font-semibold text-white">Necesita carpa</span>
        <p className="text-xs text-[var(--text-dim)]">Espacio techado en el paddock</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Necesita carpa"
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
          on ? "border-[#4C8DFF] bg-[#4C8DFF]" : "border-[var(--line-strong)] bg-white/5"
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
            on ? "translate-x-[20px]" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/* ── Formulario principal ─────────────────────────────────────────────────── */

export default function PreRegistroForm() {
  const { refetch } = useLatinoamericano();

  const [step, setStep] = useState<1 | 2>(1);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [pais, setPais] = useState<CountryOption | null>(null);
  const [categoria, setCategoria] = useState("");
  const [equipo, setEquipo] = useState("");
  const [carpa, setCarpa] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ position: number } | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const onCaptchaChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "Escribe tu nombre completo.";
    if (!correo.trim()) e.correo = "Escribe tu correo.";
    else if (!EMAIL_RE.test(correo.trim())) e.correo = "El correo no es válido.";
    if (!pais) e.pais = "Selecciona tu nacionalidad.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errs: Record<string, string> = {};
      if (!categoria) errs.categoria = "Elige tu categoría.";
      if (!equipo) errs.equipo = "Elige tu equipo.";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
      if (!pais) {
        setStep(1);
        return;
      }

      setSubmitting(true);
      setServerError(null);
      try {
        if (RECAPTCHA_SITE_KEY && !captchaToken) {
          setServerError("Completa la verificación reCAPTCHA antes de enviar.");
          return;
        }

        const res = await fetch("/api/latinoamericano/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombre.trim(),
            correo: correo.trim(),
            nacionalidad: pais.value,
            categoria,
            equipo,
            carpa,
            captchaToken: captchaToken ?? "",
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { message?: string }
            | null;
          setServerError(data?.message ?? "Hubo un error al enviar. Intenta de nuevo.");
          if (RECAPTCHA_SITE_KEY) {
            recaptchaRef.current?.reset();
            setCaptchaToken(null);
          }
          return;
        }

        const fresh = await refetch();
        setSuccess({ position: posicionDe(fresh, nombre) });
      } catch {
        setServerError("Ocurrió un error inesperado. Revisa tu conexión.");
      } finally {
        setSubmitting(false);
      }
    },
    [carpa, categoria, captchaToken, correo, equipo, nombre, pais, refetch]
  );

  /* ── Estado de éxito ─────────────────────────────────────────────────── */
  if (success) {
    const shareText = `¡Ya estoy pre-inscrito en el Campeonato Latinoamericano de Karting 2027 (#${success.position})! 7-9 de mayo · P1 Speedway, Costa Rica. ¡Nos vemos en la pista!`;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#4C8DFF]/30 bg-[var(--surface-2)]/60 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
          <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-emerald-400" fill="none" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#E8B84B]">
          Pre-registro confirmado
        </p>
        <h3 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Sos el{" "}
          <span className="text-[#4C8DFF]">#{success.position}</span>
          <br className="sm:hidden" /> en la lista
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-dim)]">
          Gracias, <span className="font-semibold text-white">{nombre.trim()}</span>.
          Tu lugar en la parrilla del Latinoamericano ya está reservado en el
          pre-registro. Pronto recibirás más información en tu correo.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <WhatsAppShare text={shareText} label="Compartir por WhatsApp" />
          <a
            href="#pre-inscritos"
            className="rounded-lg border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#4C8DFF]/60 hover:bg-white/5"
          >
            Ver la lista
          </a>
        </div>
      </div>
    );
  }

  /* ── Pasos ───────────────────────────────────────────────────────────── */
  const fieldError = (k: string) =>
    errors[k] ? (
      <p className="mt-1.5 text-xs text-red-400" role="alert">
        {errors[k]}
      </p>
    ) : null;

  return (
    <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface-2)]/50 p-6 sm:p-8">
      {/* Indicador de pasos */}
      <ol className="mb-8 flex items-center gap-3" aria-label="Pasos del formulario">
        {[
          { n: 1, label: "Piloto" },
          { n: 2, label: "Competencia" },
        ].map((s, i) => (
          <li key={s.n} className="flex items-center gap-3">
            {i > 0 ? <span className="h-px w-8 bg-[var(--line-strong)]" aria-hidden="true" /> : null}
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold ${
                step === s.n
                  ? "bg-[#4C8DFF] text-white"
                  : step > s.n
                    ? "bg-[#4C8DFF]/20 text-[#4C8DFF]"
                    : "bg-white/5 text-[var(--text-dim)]"
              }`}
              aria-current={step === s.n ? "step" : undefined}
            >
              {s.n}
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-[0.14em] ${
                step === s.n ? "text-white" : "text-[var(--text-dim)]"
              }`}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label htmlFor="la-nombre" className="admin-label">
              Nombre del piloto
            </label>
            <input
              id="la-nombre"
              type="text"
              autoComplete="name"
              placeholder="Nombre y apellido"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="admin-input"
              aria-invalid={Boolean(errors.nombre)}
            />
            {fieldError("nombre")}
          </div>

          <div>
            <label htmlFor="la-correo" className="admin-label">
              Correo
            </label>
            <input
              id="la-correo"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="admin-input"
              aria-invalid={Boolean(errors.correo)}
            />
            {fieldError("correo")}
          </div>

          <CountryCombobox
            value={pais}
            onChange={(c) => {
              setPais(c);
              if (c) setErrors((prev) => ({ ...prev, pais: "" }));
            }}
            error={errors.pais}
          />

          <button
            type="button"
            onClick={goStep2}
            className="w-full rounded-lg bg-[#4C8DFF] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#3a7cf0] active:scale-[0.98]"
          >
            Continuar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <fieldset>
            <legend className="admin-label">Categoría</legend>
            <div className="space-y-4">
              {CATEGORIA_FAMILIAS.map((fam) => (
                <div key={fam.id}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-dim)]">
                    {fam.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fam.items.map((cat) => {
                      const selected = categoria === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            setCategoria(cat);
                            setErrors((p) => ({ ...p, categoria: "" }));
                          }}
                          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                            selected
                              ? "border-[#4C8DFF] bg-[#4C8DFF]/15 text-white"
                              : "border-[var(--line-strong)] bg-white/[0.03] text-[var(--text-dim)] hover:border-white/25 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {fieldError("categoria")}
          </fieldset>

          <div>
            <label htmlFor="la-equipo" className="admin-label">
              Equipo
            </label>
            <select
              id="la-equipo"
              value={equipo}
              onChange={(e) => {
                setEquipo(e.target.value);
                setErrors((p) => ({ ...p, equipo: "" }));
              }}
              className="admin-input"
              aria-invalid={Boolean(errors.equipo)}
            >
              <option value="">Selecciona un equipo</option>
              {EQUIPOS.map((eq) => (
                <option key={eq} value={eq}>
                  {eq === "TDR-Babyliss Pro" ? "TDR - Babyliss Pro" : eq}
                </option>
              ))}
            </select>
            {fieldError("equipo")}
          </div>

          <CarpaToggle on={carpa} onChange={setCarpa} />

          {serverError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
              {serverError}
            </p>
          ) : null}

          {RECAPTCHA_SITE_KEY ? (
            <div className="flex justify-center [&_div]:bg-white/5 [&_div]:rounded-lg [&_div]:p-1">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={onCaptchaChange}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-dim)] transition-colors hover:text-white"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#4C8DFF] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#3a7cf0] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Enviando…
                </span>
              ) : (
                "Confirmar pre-registro"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
