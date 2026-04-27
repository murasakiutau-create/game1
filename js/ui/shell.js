// Top HUD + scene host. Other scenes mount inside `#scene-host`.

import { h, clear, btn } from "./components.js";
import { state, repTier, PHASE_LABEL } from "../state.js";

export function renderShell(root, sceneEl, navHandlers) {
  clear(root);
  const tier = repTier();
  const stars = "★".repeat(tier.stars) + "☆".repeat(4 - tier.stars);

  const hud = h("header", { class: "hud", role: "banner" },
    h("span", { class: "stat" },
      h("span", { class: "label" }, "日"),
      h("span", { class: "value" }, `第${state.day}日`),
    ),
    h("span", { class: "stat" },
      h("span", { class: "label" }, "時"),
      h("span", { class: "value" }, PHASE_LABEL[state.phase]),
    ),
    h("span", { class: "stat" },
      h("span", { class: "label" }, "金貨"),
      h("span", { class: "value" }, state.gold.toLocaleString() + " G"),
    ),
    h("span", { class: "stat" },
      h("span", { class: "label" }, "評判"),
      h("span", { class: "value" }, `${tier.label} `, h("span", { class: "rep-stars" }, stars)),
    ),
    btn("📜 記録", navHandlers.openLogs, { ghost: true, small: true }),
  );

  const sceneHost = h("main", { class: "scene", id: "scene-host" }, sceneEl);

  const bottomTabs = h("nav", { class: "bottom-tabs", role: "navigation" },
    bottomBtn("title",   "title",  "タイトル", navHandlers.gotoTitle),
    bottomBtn("logs",    "logs",   "記録",     navHandlers.openLogs),
    bottomBtn("party",   "party",  "冒険者",   navHandlers.openParty),
    bottomBtn("market",  "market", "雇用",     navHandlers.openMarket),
  );

  root.appendChild(h("div", { class: "shell" }, hud, sceneHost, bottomTabs));
}

function bottomBtn(id, iconKey, label, on) {
  return h("button", { type: "button", onClick: on, dataset: { id } },
    h("span", { class: `icon png-mask icon-${iconKey}`, "aria-hidden": "true" }),
    h("span", null, label));
}

// Update only the HUD region without re-mounting the scene
export function updateHud() {
  const hud = document.querySelector(".hud");
  if (!hud) return;
  const tier = repTier();
  const stars = "★".repeat(tier.stars) + "☆".repeat(4 - tier.stars);
  const stats = hud.querySelectorAll(".stat .value");
  if (stats.length >= 4) {
    stats[0].textContent = `第${state.day}日`;
    stats[1].textContent = PHASE_LABEL[state.phase];
    stats[2].textContent = state.gold.toLocaleString() + " G";
    stats[3].textContent = "";
    stats[3].appendChild(document.createTextNode(`${tier.label} `));
    const sp = document.createElement("span");
    sp.className = "rep-stars";
    sp.textContent = stars;
    stats[3].appendChild(sp);
  }
}
