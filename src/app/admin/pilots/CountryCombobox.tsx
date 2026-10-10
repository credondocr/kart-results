"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** ISO 3166-1 alpha-2 (códigos usados en el registro de pilotos). */
const ISO2 =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
    .split(" ")
    .filter(Boolean);

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🏳️";
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

let cachedNames: Map<string, string> | null = null;

function countryName(code: string): string {
  if (!cachedNames) {
    cachedNames = new Map();
    try {
      const display = new Intl.DisplayNames(["es"], { type: "region" });
      for (const c of ISO2) {
        cachedNames.set(c, display.of(c) ?? c);
      }
    } catch {
      for (const c of ISO2) cachedNames.set(c, c);
    }
  }
  return cachedNames.get(code) ?? code;
}

interface CountryComboboxProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
}

export default function CountryCombobox({ value, onChange, id }: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedName = value ? countryName(value) : "";

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const all = ISO2.map((code) => ({ code, name: countryName(code) }));
    if (!q) return all;
    return all.filter(
      (c) => normalize(c.name).includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open) setHighlight(0);
  }, [open, query]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const commit = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlight((h) => {
        const next = e.key === "ArrowDown" ? h + 1 : h - 1;
        return Math.max(0, Math.min(results.length - 1, next));
      });
    } else if (e.key === "Enter") {
      if (open && results[highlight]) {
        e.preventDefault();
        commit(results[highlight].code);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    } else if (e.key === "Backspace" && !query && value) {
      onChange("");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          className="admin-input pr-16"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id ?? "country"}-list`}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Buscar país…"
          value={open ? query : selectedName}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={onKeyDown}
        />
        {value && !open ? (
          <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-base leading-none">
            {flagEmoji(value)}
          </span>
        ) : null}
        {value ? (
          <button
            type="button"
            aria-label="Quitar país"
            onClick={() => {
              onChange("");
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-sm text-[var(--text-dim)] hover:text-white"
          >
            ×
          </button>
        ) : null}
      </div>

      {open ? (
        <ul
          id={`${id ?? "country"}-list`}
          ref={listRef}
          role="listbox"
          className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--line-strong)] bg-[var(--ink-950)] py-1 shadow-2xl"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--text-dim)]">
              Sin resultados para “{query}”
            </li>
          ) : (
            results.map((c, i) => (
              <li
                key={c.code}
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(c.code);
                }}
                className={`flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm ${
                  i === highlight ? "bg-[#4C8DFF]/20 text-white" : "text-[var(--text)]"
                }`}
              >
                <span className="w-6 text-base leading-none">{flagEmoji(c.code)}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="font-mono text-[11px] text-[var(--text-dim)]">
                  {c.code}
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
