// Tiny DOM helpers for building the UI declaratively.

import { playPrimaryClick, playGhostClick, playPlainClick } from "./audio.js";

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class" || k === "className") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "dataset" && typeof v === "object") for (const [dk, dv] of Object.entries(v)) el.dataset[dk] = dv;
    else if (k === "html") el.innerHTML = v;
    else if (typeof v === "boolean") el.toggleAttribute(k, v);
    else el.setAttribute(k, v);
  }
  for (const c of children) appendChild(el, c);
  return el;
}

function appendChild(parent, c) {
  if (c == null || c === false) return;
  if (Array.isArray(c)) { for (const x of c) appendChild(parent, x); return; }
  if (c instanceof Node) { parent.appendChild(c); return; }
  parent.appendChild(document.createTextNode(String(c)));
}

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

export function btn(label, onClick, opts = {}) {
  const cls = ["btn"];
  if (opts.primary) cls.push("primary");
  if (opts.ghost) cls.push("ghost");
  if (opts.dark) cls.push("dark");
  if (opts.small) cls.push("small");
  if (opts.block) cls.push("block");
  if (opts.className) cls.push(opts.className);
  const sfx = resolveSfx(opts);
  const handler = sfx
    ? (e) => { sfx(); if (onClick) onClick(e); }
    : onClick;
  return h("button", {
    class: cls.join(" "),
    type: "button",
    onClick: handler,
    disabled: opts.disabled || false,
    "aria-label": opts.ariaLabel,
  }, label);
}

function resolveSfx(opts) {
  if (opts.sfx === false) return null;
  if (opts.sfx === "primary") return playPrimaryClick;
  if (opts.sfx === "ghost") return playGhostClick;
  if (opts.sfx === "plain") return playPlainClick;
  if (opts.sfx === true) return playPrimaryClick;
  // Visual style alone no longer maps to the primary SFX. Only buttons
  // tagged with sfx: "primary" use it (save/start + time-advance). Brown
  // ghost/dark buttons default to the brown SFX; everything else plays plain.
  if (opts.ghost || opts.dark) return playGhostClick;
  return playPlainClick;
}

export function panel(title, body, ornament = "❦") {
  const head = title ? h("div", { class: "panel-head" },
    h("span", null, title),
    ornament ? h("span", { class: "ornament" }, ornament) : null,
  ) : null;
  return h("section", { class: "panel" }, head, body);
}

// Toast host
let host = null;
function ensureToastHost() {
  if (host) return host;
  host = document.createElement("div");
  host.id = "toast-host";
  document.body.appendChild(host);
  return host;
}

export function toast(text, opts = {}) {
  ensureToastHost();
  const t = h("div", { class: "toast" + (opts.error ? " error" : "") }, text);
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 220);
  }, opts.ms || 2400);
}

// Modal
// opts.dismissible (default true) — when false, only the header ✕ and
// explicit .close() calls (e.g. footer buttons) close the modal;
// clicking the backdrop is ignored.
export function modal(content, opts = {}) {
  const dismissible = opts.dismissible !== false;
  const back = h("div", { class: "modal-backdrop" });
  const onClose = (e) => {
    if (e && e.target !== back && !e.__force) return;
    if (!dismissible && !(e && e.__force)) return;
    back.remove();
    if (opts.onClose) opts.onClose();
  };
  back.addEventListener("click", onClose);
  const head = opts.title ? h("div", { class: "head" },
    h("h3", null, opts.title),
    btn("✕", () => { const ev = {}; ev.__force = true; onClose(ev); }, { ghost: true, small: true, ariaLabel: "閉じる" }),
  ) : null;
  const body = h("div", { class: "body" }, content);
  const foot = opts.foot ? h("div", { class: "foot" }, opts.foot) : null;
  const m = h("section", { class: "modal panel flush" }, head, body, foot);
  back.appendChild(m);
  document.body.appendChild(back);
  return { close: () => { const ev = {}; ev.__force = true; onClose(ev); }, root: back };
}

// Confirm dialog
export function confirmModal({ title = "確認", message = "", confirmLabel = "実行", cancelLabel = "やめる", onConfirm, danger = false, confirmSfx }) {
  const box = h("div", null, h("p", null, message));
  const cancel = btn(cancelLabel, () => m.close(), { ghost: true });
  const ok = btn(confirmLabel, () => { m.close(); onConfirm && onConfirm(); },
    { primary: true, className: danger ? "primary" : "", sfx: confirmSfx });
  const m = modal(box, { title, foot: [cancel, ok] });
}

// Number spinner
export function spinner(value, min, max, onChange) {
  let v = value;
  const valBox = h("span", { class: "val" }, v);
  const dec = h("button", { type: "button" }, "−");
  const inc = h("button", { type: "button" }, "+");
  dec.addEventListener("click", () => { v = Math.max(min, v - 1); valBox.textContent = v; onChange(v); });
  inc.addEventListener("click", () => { v = Math.min(max, v + 1); valBox.textContent = v; onChange(v); });
  return h("span", { class: "spinner" }, dec, valBox, inc);
}

// ── Themed tag helpers (quality / danger / rank) ──
import { QUALITY_LABEL } from "../data/materials.js";

export function qualityTag(quality, suffix) {
  const label = QUALITY_LABEL[quality] || quality;
  return h("span", { class: `tag q-${quality}` }, suffix ? `${label}${suffix}` : label);
}

export function dangerTag(level) {
  const lv = Math.max(1, Math.min(7, Number(level) || 1));
  return h("span", { class: `tag danger-${lv}` }, `危険度 ${level}`);
}

export function rankTag(rankId) {
  return h("span", { class: `tag rank-${rankId}` }, rankId);
}

// Tabs
export function tabs(items, current, onChange) {
  const bar = h("div", { class: "tabbar", role: "tablist" });
  for (const it of items) {
    bar.appendChild(h("button", {
      class: "tab-btn",
      type: "button",
      role: "tab",
      "aria-selected": it.id === current ? "true" : "false",
      onClick: () => onChange(it.id),
    }, it.label));
  }
  return bar;
}
