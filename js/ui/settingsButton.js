// Fixed top-left side rail: ⚙ settings + 記録 (logs).

import { openSettingsModal } from "./settingsModal.js";
import { openLogViewer } from "./logScene.js";
import { playPlainClick, playGhostClick } from "./audio.js";

let mounted = null;

function makeFab(label, ariaLabel, onClick, extraClass = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `side-fab ${extraClass}`.trim();
  b.setAttribute("aria-label", ariaLabel);
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

export function mountSettingsButton() {
  if (mounted) return mounted;
  const rail = document.createElement("div");
  rail.className = "side-rail";

  const gear = makeFab("⚙", "設定", () => {
    playPlainClick();
    openSettingsModal();
  }, "side-fab--gear");

  const logs = makeFab("記録", "記録を見る", () => {
    playGhostClick();
    openLogViewer();
  }, "side-fab--logs");

  rail.appendChild(gear);
  rail.appendChild(logs);
  document.body.appendChild(rail);
  mounted = rail;
  return rail;
}
