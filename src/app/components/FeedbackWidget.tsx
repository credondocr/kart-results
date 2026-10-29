"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";

const MAX_MESSAGE = 500;
const DISMISS_KEY = "crkc:feedback-dismissed-at";

const SENTIMENTS = [
  { value: "sad", emoji: "😞", label: "Insatisfecho" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "happy", emoji: "😊", label: "Satisfecho" },
] as const;

type Sentiment = (typeof SENTIMENTS)[number]["value"];

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDismissed(isDismissed());
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
    setServerError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!sentiment) {
        setServerError("Elige cómo te sientes respecto al sitio.");
        return;
      }
      const trimmed = message.trim();
      if (trimmed.length < 3) {
        setServerError("Escribe un mensaje un poco más largo.");
        return;
      }
      setSubmitting(true);
      setServerError(null);
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sentiment,
            message: trimmed.slice(0, MAX_MESSAGE),
            pagePath: pathname,
            userAgent: navigator.userAgent,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            message?: string;
          } | null;
          setServerError(
            data?.message ?? "Hubo un error al enviar. Intenta de nuevo."
          );
          return;
        }
        setSuccess(true);
        try {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch {
          /* localStorage puede no estar disponible */
        }
        setDismissed(true);
        setTimeout(() => setOpen(false), 1600);
      } catch {
        setServerError("Ocurrió un error inesperado. Revisa tu conexión.");
      } finally {
        setSubmitting(false);
      }
    },
    [sentiment, message, pathname]
  );

  if (dismissed) return null;

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={openPanel}
        aria-label="Enviar feedback sobre el sitio"
        className="fixed right-4 z-40 flex h-10 items-center justify-center gap-2 rounded-full border border-[#4C8DFF]/40 bg-[#0C1226] pl-3.5 pr-4 text-[#4C8DFF] shadow-lg shadow-black/40 transition-all hover:border-[#4C8DFF] hover:bg-[#111832] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A14]"
        style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-[0.1em]">
          Feedback
        </span>
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={close} className="relative z-[90]">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-end justify-end sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-250"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
              enterTo="opacity-100 translate-y-0 sm:translate-x-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:translate-x-0"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:translate-x-4"
            >
              <Dialog.Panel
                className="w-full rounded-t-2xl border border-[var(--line)] bg-[#0C1226] shadow-2xl shadow-black/60 sm:max-w-sm sm:rounded-2xl"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                {success ? (
                  <div className="px-5 py-8 text-center sm:px-6">
                    <p className="text-3xl" aria-hidden="true">
                      🏁
                    </p>
                    <Dialog.Title className="mt-3 text-base font-semibold text-white">
                      ¡Gracias por tu feedback!
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-[var(--text-dim)]">
                      Lo leemos todo.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="flex max-h-[85svh] flex-col overflow-hidden sm:max-h-[70vh]"
                  >
                    {/* Handle visual en mobile */}
                    <div
                      className="flex justify-center pt-3 sm:hidden"
                      aria-hidden="true"
                    >
                      <span className="h-1 w-10 rounded-full bg-white/15" />
                    </div>

                    <div className="flex items-start justify-between px-5 pt-4 sm:px-6">
                      <div>
                        <Dialog.Title className="text-base font-semibold text-white">
                          ¿Qué te parece el sitio?
                        </Dialog.Title>
                        <p className="mt-0.5 text-xs text-[var(--text-dim)]">
                          Tu opinión nos ayuda a mejorar.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={close}
                        aria-label="Cerrar"
                        className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8DFF]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="overflow-y-auto px-5 pb-4 pt-4 sm:px-6">
                      {/* Sentimientos */}
                      <div
                        role="group"
                        aria-label="Sentimiento"
                        className="grid grid-cols-3 gap-2"
                      >
                        {SENTIMENTS.map((s) => {
                          const active = sentiment === s.value;
                          return (
                            <button
                              key={s.value}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                setSentiment(s.value);
                                setServerError(null);
                              }}
                              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8DFF] ${
                                active
                                  ? "border-[#4C8DFF] bg-[#4C8DFF]/10 text-white"
                                  : "border-[var(--line)] bg-transparent text-[var(--text-dim)] hover:border-white/20 hover:text-white"
                              }`}
                            >
                              <span className="text-xl" aria-hidden="true">
                                {s.emoji}
                              </span>
                              <span className="text-[11px] leading-none">
                                {s.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Mensaje */}
                      <div className="mt-4">
                        <label
                          htmlFor="feedback-message"
                          className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-dim)]"
                        >
                          Comentario
                        </label>
                        <textarea
                          id="feedback-message"
                          ref={textareaRef}
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value.slice(0, MAX_MESSAGE));
                            if (serverError) setServerError(null);
                          }}
                          rows={3}
                          placeholder="Cuéntanos qué funciona bien o qué podríamos mejorar…"
                          className="mt-1.5 w-full resize-none rounded-xl border border-[var(--line)] bg-[#070A14] px-3.5 py-3 text-base text-white placeholder:text-[var(--text-dim)]/60 focus:border-[#4C8DFF] focus:outline-none focus:ring-1 focus:ring-[#4C8DFF]"
                        />
                        <p className="mt-1 text-right font-mono text-[10px] text-[var(--text-dim)]">
                          {message.length}/{MAX_MESSAGE}
                        </p>
                      </div>

                      {serverError ? (
                        <p
                          role="alert"
                          className="mt-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                        >
                          {serverError}
                        </p>
                      ) : null}
                    </div>

                    <div className="border-t border-[var(--line)] px-5 py-4 sm:px-6">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4C8DFF] text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#3B7BEE] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C1226]"
                      >
                        {submitting ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
                              />
                            </svg>
                            Enviando…
                          </>
                        ) : (
                          "Enviar"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
