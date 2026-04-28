// Fixed top-left ⚙️ button that opens the settings modal.

import { openSettingsModal } from "./settingsModal.js";
import { playGhostClick } from "./audio.js";

let mounted = null;

export function mountSettingsButton() {
  if (mounted) return mounted;
  const b = document.createElement("button");
  b.type = "button";
  b.className = "settings-fab";
  b.setAttribute("aria-label", "設定");
  b.textContent = "⚙";
  b.addEventListener("click", () => {
    playGhostClick();
    openSettingsModal();
  });
  document.body.appendChild(b);
  mounted = b;
  return b;
}
