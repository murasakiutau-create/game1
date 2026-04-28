// Boot + scene routing. Call render(scene) on phase changes.

import { state, ensureRecipeMap, syncRng, repTier } from "./state.js";
import { renderShell, updateHud } from "./ui/shell.js";
import { renderTitleScene } from "./ui/titleScreen.js";
import { renderMorningScene } from "./ui/morningScene.js";
import { renderDayScene } from "./ui/dayScene.js";
import { renderEveningScene } from "./ui/eveningScene.js";
import { renderNightScene } from "./ui/nightScene.js";
import { openLogViewer } from "./ui/logScene.js";
import { openPartyViewer } from "./ui/partyViewer.js";
import { openMarketViewer } from "./ui/marketViewer.js";
import { advancePhase, refreshMarket } from "./systems/time.js";
import { refreshQuests } from "./systems/quests.js";
import { toast } from "./ui/components.js";
import { startBgm } from "./ui/bgm.js";
import { mountSettingsButton } from "./ui/settingsButton.js";

const root = document.getElementById("app");

mountSettingsButton();

let mode = "title"; // "title" | "play"

function render() {
  if (mode === "title") {
    root.innerHTML = "";
    renderTitleScene(root, { onStart: () => { mode = "play"; ensurePostStart(); startBgm(); render(); } });
    return;
  }
  // Play mode: shell + scene
  ensureRecipeMap();
  // Build the appropriate scene element
  const scene = document.createElement("div");
  switch (state.phase) {
    case "morning": renderMorningScene(scene, { onAdvance: () => { advancePhase(); render(); }, refresh: render }); break;
    case "day":     renderDayScene(scene, { onAdvance: () => { advancePhase(); render(); }, refresh: render }); break;
    case "evening": renderEveningScene(scene, { onAdvance: () => { advancePhase(); render(); }, refresh: render }); break;
    case "night":   renderNightScene(scene, { onAdvance: () => { advancePhase(); render(); }, refresh: render }); break;
    default:        scene.textContent = "未対応のフェーズ：" + state.phase;
  }
  renderShell(root, scene, {
    openLogs: () => openLogViewer(),
    gotoTitle: () => { mode = "title"; render(); },
    openParty: () => openPartyViewer(render),
    openMarket: () => openMarketViewer(render),
  });
}

function ensurePostStart() {
  // First time the game enters play mode after a new game / load:
  // make sure there's a market and quest board on day 1.
  if (state.market.length === 0 && state.phase === "morning") {
    refreshMarket();
  }
  if ((state.quests?.available?.length ?? 0) === 0
      && (state.quests?.active?.length ?? 0) === 0
      && state.phase === "morning") {
    refreshQuests();
  }
}

// global exception toast (small dev aid)
window.addEventListener("error", (e) => {
  console.error(e);
  toast("内部エラー：コンソールを確認してください。", { error: true, ms: 3000 });
});
window.addEventListener("unhandledrejection", (e) => {
  console.error(e);
  toast("非同期エラー：コンソールを確認してください。", { error: true, ms: 3000 });
});

render();
