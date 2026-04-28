// Settings modal: BGM track A/B, BGM volume, BGM on/off, SE on/off.

import { h, modal, btn } from "./components.js";
import { SETTINGS, saveSettings } from "./settings.js";
import { TRACKS, applyBgm } from "./bgm.js";

function row(label, control) {
  return h("div", { class: "settings-row" },
    h("span", { class: "settings-label" }, label),
    h("span", { class: "settings-control" }, control),
  );
}

function toggle(checked, onChange) {
  const cb = h("input", { type: "checkbox" });
  cb.checked = !!checked;
  cb.addEventListener("change", () => onChange(cb.checked));
  return h("label", { class: "settings-toggle" }, cb, h("span", { class: "track" }), h("span", { class: "thumb" }));
}

function radio(name, value, label, current, onChange) {
  const r = h("input", { type: "radio", name, value });
  r.checked = current === value;
  r.addEventListener("change", () => { if (r.checked) onChange(value); });
  return h("label", { class: "settings-radio" }, r, h("span", null, label));
}

function update(patch) {
  Object.assign(SETTINGS, patch);
  saveSettings();
  applyBgm();
}

export function openSettingsModal() {
  const trackGroup = h("div", { class: "settings-radios" },
    radio("bgmTrack", "A", TRACKS.A.label, SETTINGS.bgmTrack, (v) => update({ bgmTrack: v })),
    radio("bgmTrack", "B", TRACKS.B.label, SETTINGS.bgmTrack, (v) => update({ bgmTrack: v })),
  );

  const volSlider = h("input", {
    type: "range", min: "0", max: "100", step: "1",
    value: String(Math.round(SETTINGS.bgmVolume * 100)),
    class: "settings-slider",
  });
  const volReadout = h("span", { class: "settings-readout" }, `${Math.round(SETTINGS.bgmVolume * 100)}`);
  volSlider.addEventListener("input", () => {
    const v = Number(volSlider.value) / 100;
    volReadout.textContent = String(Math.round(v * 100));
    update({ bgmVolume: v });
  });

  const body = h("div", { class: "settings-body" },
    row("BGM トラック", trackGroup),
    row("BGM 音量", h("span", { class: "settings-volume" }, volSlider, volReadout)),
    row("BGM 再生", toggle(SETTINGS.bgmEnabled, (b) => update({ bgmEnabled: b }))),
    row("効果音", toggle(SETTINGS.seEnabled, (b) => update({ seEnabled: b }))),
  );

  const close = btn("閉じる", () => m.close(), { ghost: true });
  const m = modal(body, { title: "設定", foot: [close] });
}
