// Top-left ⚙ settings button. The 記録 entry lives in the bottom tab bar.

import { openSettingsModal } from "./settingsModal.js";
import { playPlainClick } from "./audio.js";

let mounted = null;

export function mountSettingsButton() {
  if (mounted) return mounted;
  const rail = document.createElement("div");
  rail.className = "side-rail";

  const gear = document.createElement("button");
  gear.type = "button";
  gear.className = "side-fab side-fab--gear";
  gear.setAttribute("aria-label", "設定");
  gear.textContent = "⚙";
  gear.addEventListener("click", () => {
    playPlainClick();
    openSettingsModal();
  });

  rail.appendChild(gear);
  document.body.appendChild(rail);
  mounted = rail;
  return rail;
}
