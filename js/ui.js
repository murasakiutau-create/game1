// ============================================================
//  ヴィンテージ・メモリア  ―  UI コントローラー v2.0
// ============================================================

const UI = (() => {

  // ──────────────────────────────────────────────
  //  定数
  // ──────────────────────────────────────────────
  const CARD_TYPE_LABEL = { attack: "攻撃", defense: "防御", support: "補助" };
  const CARD_TYPE_CLASS = { attack: "card-attack", defense: "card-defense", support: "card-support" };
  const AFFINITY_LABEL = { physical: "物理", magic: "魔法" };
  const INTENT_ICON = {
    attack: "⚔️", heavy_attack: "💥", defense: "🛡️",
    debuff: "💀", heal: "💚", summon: "✨"
  };

  const CARD_EMOJI = {
    watch_attack: "⏱️", watch_defense: "⏱️", watch_support: "⏱️",
    ink_attack: "🖋️", ink_defense: "🖋️", ink_support: "🖋️",
    mirror_attack: "🪞", mirror_defense: "🪞", mirror_support: "🪞",
    lantern_attack: "🏮", lantern_defense: "🏮", lantern_support: "🏮",
    book_attack: "📖", book_defense: "📖", book_support: "📖",
    music_attack: "🎵", music_defense: "🎵", music_support: "🎵",
    compass_attack: "🧭", compass_defense: "🧭", compass_support: "🧭",
    keyring_attack: "🗝️", keyring_defense: "🗝️", keyring_support: "🗝️",
    candle_attack: "🕯️", candle_defense: "🕯️", candle_support: "🕯️",
    hourglass_attack: "⏳", hourglass_defense: "⏳", hourglass_support: "⏳",
    telescope_attack: "🔭", telescope_defense: "🔭", telescope_support: "🔭",
    syringe_attack: "💉", syringe_defense: "💉", syringe_support: "💉",
    radio_attack: "📻", radio_defense: "📻", radio_support: "📻",
    globe_attack: "🌍", globe_defense: "🌍", globe_support: "🌍",
    chess_piece_attack: "♟️", chess_piece_defense: "♟️", chess_piece_support: "♟️"
  };
  const ENEMY_EMOJI = {
    dusty_bear: "🧸", cracked_doll: "🪆", faded_rabbit: "🐰",
    rusted_knight: "⚔️", ink_specter: "👻", boss_clockwork: "🕰️",
    boss_librarian: "📚", minion_gear: "⚙️",
    cursed_statue: "🗿", rotting_monk: "💀", wailing_ghost: "👻",
    masked_merchant: "🎭", broken_marionette: "🪆", night_wisp: "✨",
    boss_cathedral_priest: "⛪", boss_night_illusionist: "🎩",
    minion_ghost: "👻", minion_wisp: "✨",
    fog_smuggler: "🌫️", barnacle_crab: "🦀", drowned_sailor: "💀",
    boss_mist_captain: "☠️", minion_fog: "🌫️",
    scrap_golem: "🤖", toxic_slime: "🟢", rusty_drone: "🚁",
    boss_furnace_core: "🔥", minion_spark: "⚡",
    thorn_creeper: "🌿", man_eating_plant: "🌺", poison_butterfly: "🦋",
    boss_rose_queen: "🌹", minion_petal: "🌸",
    phantom_pirate: "👻", cursed_treasure: "📦", bone_shark: "🦈",
    boss_davy_jones: "🌊", minion_tentacle: "🐙",
    star_watcher: "⭐", pendulum_knight: "⚔️", time_swallower: "⏰",
    boss_time_weaver: "🕰️", minion_sand: "⌛",
    royal_guard: "🛡️", mimic_antique: "📦",
    boss_antique_king: "👑"
  };
  const MATERIAL_EMOJI = {
    rusty_screw: "🔩", thick_cloth: "🧵", dried_herb: "🌿",
    glass_shard: "💎", velvet_ribbon: "🎀", old_ink: "🖋️",
    bronze_gear: "⚙️", faded_leather: "🟫",
    stone_fragment: "🪨", cursed_cloth: "🧣", old_bone: "🦴",
    ectoplasm: "💧", silk_thread: "🧵", amber_shard: "🟡",
    sea_glass: "🟢", smuggler_coin: "🪙", scrap_metal: "🔧", toxic_oil: "🟤",
    cursed_thorn: "🌵", blood_rose: "🌹", phantom_gold: "🪙", deep_sea_pearl: "🔵",
    star_sand: "⭐", golden_gear: "⚙️", royal_seal: "👑", memory_crystal: "💎"
  };
  // 装備アイコン：剣・杖・防具3種類で使い回す
  function getEquipIcon(recipe) {
    if (!recipe) return "🔧";
    if (recipe.type === "armor") return "🛡️";
    if (recipe.weaponType === "staff") return "🪄";
    return "⚔️"; // sword
  }
  // 互換性のためEQUIP_EMOJIは空オブジェクトにする
  const EQUIP_EMOJI = {};
  const SOURCE_NAMES = {
    watch: "錆びた懐中時計", ink: "色褪せたインク瓶", mirror: "割れた手鏡",
    lantern: "古びたランタン", book: "革張りの古書", music: "壊れたオルゴール",
    compass: "古びたコンパス", keyring: "錆びた鍵束", candle: "褪せた蝋燭", hourglass: "割れた砂時計",
    telescope: "古びた望遠鏡", syringe: "錆びた注射器", radio: "壊れたラジオ",
    globe: "古びた地球儀", chess_piece: "王のチェス駒"
  };

  // ──────────────────────────────────────────────
  //  画面管理
  // ──────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  function showModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
  }

  function hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  }

  // ──────────────────────────────────────────────
  //  ヘルパー
  // ──────────────────────────────────────────────
  function imgOrEmoji(src, emoji, cls) {
    cls = cls || "";
    if (!src) return '<span class="emoji-icon ' + cls + '">' + emoji + '</span>';
    return '<img src="' + src + '" alt="" class="' + cls + '" onerror="this.style.display=\'none\';this.nextElementSibling&&(this.nextElementSibling.style.display=\'\');">' +
           '<span class="emoji-icon ' + cls + '" style="display:none">' + emoji + '</span>';
  }

  function hpBar(current, max) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    const cls = pct > 50 ? "hp-high" : pct > 25 ? "hp-mid" : "hp-low";
    return `<div class="hp-bar-wrap"><div class="hp-bar ${cls}" style="width:${pct}%"></div></div>`;
  }

  function statusBadges(effects) {
    if (!effects || effects.length === 0) return "";
    return effects.map(function(e) {
      if (e.type === "burn") return `<span class="status-badge burn">🔥燻し(${e.duration})</span>`;
      if (e.type === "confuse") return `<span class="status-badge confuse">💫混乱(${e.duration})</span>`;
      if (e.type === "defenseDown") return `<span class="status-badge debuff">⬇️防御低下(${e.duration})</span>`;
      if (e.type === "poison") return `<span class="status-badge poison">💀毒(${e.duration}) ダメージ${e.damagePerTurn}</span>`;
      return `<span class="status-badge">${e.type}(${e.duration})</span>`;
    }).join("");
  }

  function getEffectText(card) {
    const s = Engine.getState();
    const effectVal = s ? Engine.getCardEffectValue(card.id) : card.baseValue;
    if (card.effect.damage) {
      if (card.effect.allEnemies) return `${AFFINITY_LABEL[card.affinity] || ""}全体攻撃 ${effectVal}`;
      return `${AFFINITY_LABEL[card.affinity] || ""}攻撃 ${effectVal}`;
    }
    if (card.effect.shield) return `ガード +${effectVal}`;
    if (card.effect.mpRestore) return `MP +${effectVal}`;
    if (card.effect.healHp) return `HP +${effectVal}`;
    if (card.effect.blockNextAttack) return "次の攻撃を無効";
    if (card.effect.drawCards) return `ドロー +${card.effect.drawCards}`;
    if (card.effect.nextMagicDamageBonus) return "次の魔法ダメージ×1.5";
    if (card.effect.reflectDamageRatio) return `ガード +${effectVal} / 反射40%`;
    if (card.effect.debuff) return "敵防御低下";
    if (card.effect.buff) {
      if (card.effect.buff.type === "magicCostDown") return "魔法MPコスト-1";
      if (card.effect.buff.type === "nextCardCostHalf") return "次カードMP半減";
      if (card.effect.buff.type === "allCostDown") return "次ターン全カードMP-1";
      if (card.effect.buff.type === "nextTurnMpBonus") return "HP回復 + 次ターンMP+3";
    }
    return "";
  }

  // ──────────────────────────────────────────────
  //  タイトル画面
  // ──────────────────────────────────────────────
  function initTitle() {
    // ブラウザのAutoplay Policy対策：最初のユーザー操作でBGMを開始
    // DOMContentLoaded直後は再生できないため、ボタン押下時に開始
    function _startMainBgm() {
      AudioManager.playBgm("main");
    }
    showScreen("screen-title");
    document.getElementById("btn-new-game").onclick = function() {
      _startMainBgm();
      AudioManager.playSe("open");
      showScreen("screen-job-select");
      renderJobSelect();
    };
    document.getElementById("btn-continue").onclick = function() {
      _startMainBgm();
      AudioManager.playSe("open");
      if (Engine.loadGame()) {
        var s = Engine.getState();
        if (s.gamePhase === "battle" || s.gamePhase === "card_choice") s.gamePhase = "map";
        Engine.saveGame();
        initHome();
      }
    };
    document.getElementById("btn-continue").style.display = Engine.hasSave() ? "block" : "none";
  }

  // ──────────────────────────────────────────────
  //  職業選択画面
  // ──────────────────────────────────────────────
  function renderJobSelect() {
    var container = document.getElementById("job-list");
    var JOB_COLORS = ['job-card-red', 'job-card-blue', 'job-card-green', 'job-card-yellow', 'job-card-purple'];
    container.innerHTML = GAMEDATA.jobs.map(function(job, idx) {
      var colorClass = JOB_COLORS[idx] || '';
      return `
        <div class="job-card ${colorClass}">
          <div class="job-image">${imgOrEmoji(job.image, "🧑", "job-img")}</div>
          <div class="job-name">${job.name}</div>
          <div class="job-trait">${job.trait}</div>
          <div class="job-desc">${job.description}</div>
          <button class="btn btn-primary btn-small btn-select-job" data-job-id="${job.id}">この職業で始める</button>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-select-job").forEach(function(btn) {
      btn.onclick = function() {
        Engine.init(btn.dataset.jobId);
        Engine.saveGame();
        // 導入ストーリー表示（初回のみ）
        showStoryScene("intro", function() {
          showTutorial(function() {
            initHome();
          });
        });
      };
    });
  }

  // ──────────────────────────────────────────────
  //  ホーム画面
  // ──────────────────────────────────────────────
  function initHome() {
    AudioManager.playBgm("main"); // バトルから戻る際にメインBGMへ切り替え
    Engine.recoverAtHome();
    Engine.saveGame();
    showScreen("screen-home");
    renderHome();
    bindHomeButtons();
  }

  function renderHome() {
    var s = Engine.getState();
    if (!s) return;
    var p = s.player;

    document.getElementById("home-player-name").textContent = p.jobName + " Lv." + p.level;
    document.getElementById("home-hp").textContent = "HP " + p.hp + " / " + p.maxHp;
    document.getElementById("home-mp").textContent = "MP " + p.mp + " / " + p.maxMp;
    document.getElementById("home-gold").textContent = p.gold;
    document.getElementById("home-exp").textContent = "EXP " + p.exp + " / " + p.expToNext;
    var atkText = [];
    if ((p.physicalBonus || 0) > 0) atkText.push("物理+" + p.physicalBonus);
    if ((p.magicBonus || 0) > 0) atkText.push("魔法+" + p.magicBonus);
    document.getElementById("home-atk").textContent = "攻撃ボーナス: " + (atkText.length > 0 ? atkText.join(" / ") : "+0");

    var weaponId = p.equipment.weapon;
    var armorId = p.equipment.armor;
    var weaponRec = weaponId ? GAMEDATA.craftRecipes.find(function(r) { return r.id === weaponId; }) : null;
    var armorRec = armorId ? GAMEDATA.craftRecipes.find(function(r) { return r.id === armorId; }) : null;
    var weaponLabel = "";
    if (weaponRec) {
      if ((weaponRec.physicalBonus || 0) > 0) weaponLabel = "（物理+" + weaponRec.physicalBonus + "）";
      else if ((weaponRec.magicBonus || 0) > 0) weaponLabel = "（魔法+" + weaponRec.magicBonus + "）";
      else weaponLabel = "（攻撃+" + (weaponRec.attackBonus || 0) + "）";
    }
    document.getElementById("home-weapon").textContent = weaponRec ? weaponRec.name + weaponLabel : "なし";
    document.getElementById("home-armor").textContent = armorRec ? armorRec.name + "（HP+" + armorRec.hpBonus + "）" : "なし";

    var stageList = document.getElementById("home-stage-list");
    var clearedStages = s.clearedStages || [];
    stageList.innerHTML = GAMEDATA.stages.map(function(stage) {
      var isCleared = clearedStages.includes(stage.id);
      return `
        <button class="btn btn-stage${isCleared ? ' btn-stage-cleared' : ''}" data-stage-id="${stage.id}">
          <div class="stage-info">
            <span class="stage-name">${stage.name}${isCleared ? ' <span class="stage-clear-badge">クリア済</span>' : ''}</span>
            <span class="stage-desc">${stage.description}</span>
          </div>
        </button>
      `;
    }).join("");
    stageList.querySelectorAll(".btn-stage").forEach(function(btn) {
      btn.onclick = function() {
        AudioManager.playSe("open");
        Engine.startExploration(btn.dataset.stageId);
        Engine.saveGame();
        initMap();
      };
    });
  }

  function bindHomeButtons() {
    document.getElementById("btn-home-deck").onclick = function() {
      AudioManager.playSe("button");
      showScreen("screen-deck");
      renderDeckScreen();
    };
    document.getElementById("btn-home-equip").onclick = function() {
      AudioManager.playSe("button");
      showScreen("screen-craft");
      renderCraftScreen();
    };
    document.getElementById("btn-home-shop").onclick = function() {
      AudioManager.playSe("button");
      showScreen("screen-shop");
      renderShopScreen();
    };
    document.getElementById("btn-home-job").onclick = function() {
      AudioManager.playSe("button");
      showScreen("screen-job-change");
      renderJobChangeScreen();
    };
    document.getElementById("btn-home-saveload").onclick = function() {
      AudioManager.playSe("button");
      openSaveLoadModal();
    };
    document.getElementById("btn-home-zukan").onclick = function() {
      AudioManager.playSe("button");
      showScreen("screen-zukan");
      renderZukanScreen();
    };
    document.getElementById("btn-deck-back").onclick = function() { AudioManager.playSe("back"); initHome(); };
    document.getElementById("btn-craft-back").onclick = function() { AudioManager.playSe("back"); initHome(); };
    document.getElementById("btn-shop-back").onclick = function() { AudioManager.playSe("back"); initHome(); };
    document.getElementById("btn-job-change-back").onclick = function() { AudioManager.playSe("back"); initHome(); };
    document.getElementById("btn-zukan-back").onclick = function() { AudioManager.playSe("back"); initHome(); };
    document.getElementById("btn-home-story").onclick = function() {
      AudioManager.playSe("button");
      showScreen("screen-story");
      renderStoryScreen();
    };
    document.getElementById("btn-home-help").onclick = function() {
      AudioManager.playSe("button");
      showScreen("screen-help");
      renderHelpScreen();
    };
    
    // ストーリー・ヘルプの戻るボタン
    document.getElementById("btn-story-back").onclick = function() { AudioManager.playSe("back"); initHome(); };
    document.getElementById("btn-help-back").onclick = function() { AudioManager.playSe("back"); initHome(); };
  }

  // ──────────────────────────────────────────────
  //  職業変更画面
  // ───────────────────────────────────────────
  function renderJobChangeScreen() {
    var s = Engine.getState();
    var container = document.getElementById("job-change-list");
    var currentJobId = s.player.jobId;
    var JOB_COLORS = ['job-card-red', 'job-card-blue', 'job-card-green', 'job-card-yellow', 'job-card-purple'];
    container.innerHTML = GAMEDATA.jobs.map(function(job, idx) {
      var isCurrent = job.id === currentJobId;
      var colorClass = JOB_COLORS[idx] || '';
      return '<div class="job-card ' + colorClass + (isCurrent ? ' job-card-current' : '') + '">' +
        '<div class="job-image">' + imgOrEmoji(job.image, '\uD83E\uDDD1', 'job-img') + '</div>' +
        '<div class="job-name">' + job.name + (isCurrent ? ' <span class="current-badge">選択中</span>' : '') + '</div>' +
        '<div class="job-trait">' + job.trait + '</div>' +
        '<div class="job-desc">' + job.description + '</div>' +
        (isCurrent
          ? '<button class="btn btn-secondary btn-small" disabled>現在の職業</button>'
          : '<button class="btn btn-primary btn-small btn-change-job" data-job-id="' + job.id + '">この職業に変更</button>') +
        '</div>';
    }).join("");

    container.querySelectorAll(".btn-change-job").forEach(function(btn) {
      btn.onclick = function() {
        var jobId = btn.dataset.jobId;
        var jobName = GAMEDATA.jobs.find(function(j){ return j.id === jobId; }).name;
        showConfirm(
          '職業変更',
          '「' + jobName + '」に変更しますか？\n\n✔ 引き継ぎ：デッキ・ゴールド・素材・装備・カード強化\n✔ 各職業のレベル・HP/MP・ステータス強化は職業ごとに保持されます。\n↻ 初めて選択する職業は初期値からスタートします。',
          function() {
            Engine.changeJob(jobId);
            Engine.saveGame();
            initHome();
          }
        );
      };
    });
  }

  // ──────────────────────────────
   // デッキ画面
  // ──────────────────────────────
  function renderDeckScreen() {
    var s = Engine.getState();
    var container = document.getElementById("deck-card-list");
    var countEl = document.getElementById("deck-count");
    var setEffectEl = document.getElementById("deck-set-effects");
    var surplusContainer = document.getElementById("deck-surplus-list");
    var surplusLabel = document.getElementById("deck-surplus-label");

    // デッキタブのアクティブ状態を更新
    var activeIdx = s.activeDeckIndex || 0;
    document.querySelectorAll(".deck-slot-tab").forEach(function(tab) {
      var slot = parseInt(tab.dataset.slot);
      tab.classList.toggle("active", slot === activeIdx);
      tab.onclick = function() {
        if (slot !== (Engine.getState().activeDeckIndex || 0)) {
          Engine.switchDeckIndex(slot);
          Engine.saveGame();
          renderDeckScreen();
        }
      };
    });

    // コピーバー：現在タブ以外のボタンだけ表示
    var copyBar = document.getElementById("deck-copy-bar");
    var otherDecks = [0, 1, 2].filter(function(i) { return i !== activeIdx; });
    // 他にカードがあるデッキが1つ以上ある場合のみ表示
    var hasSource = otherDecks.some(function(i) { return (s.decks[i] || []).length > 0; });
    copyBar.style.display = hasSource ? "" : "none";
    document.querySelectorAll(".deck-copy-btn").forEach(function(btn) {
      var fromIdx = parseInt(btn.dataset.from);
      var isActive = fromIdx === activeIdx;
      var isEmpty = !(s.decks[fromIdx] || []).length;
      btn.style.display = (isActive || isEmpty) ? "none" : "";
      btn.onclick = function() {
        var fromName = "デッキ " + (fromIdx + 1);
        var toName = "デッキ " + (activeIdx + 1);
        showConfirm(
          "デッキコピー",
          fromName + "の内容を" + toName + "にコピーします。\n" + toName + "の現在の内容は上書きされます。",
          function() {
            Engine.copyDeck(fromIdx);
            Engine.saveGame();
            showToast(fromName + " → " + toName + " にコピーしました");
            renderDeckScreen();
          }
        );
      };
    });

    countEl.textContent = s.fullDeck.length + " / 15";

    var countMap = {};
    s.fullDeck.forEach(function(id) { countMap[id] = (countMap[id] || 0) + 1; });
    var unique = [];
    s.fullDeck.forEach(function(id) { if (unique.indexOf(id) < 0) unique.push(id); });

    container.innerHTML = unique.map(function(cardId) {
      var card = Engine.getCardData(cardId);
      if (!card) return "";
      var cnt = countMap[cardId];
      var upgradeLevel = s.cardUpgrades[cardId] || 0;
      var effectText = getEffectText(card);
      return '<div class="deck-card-row ' + CARD_TYPE_CLASS[card.type] + '">' +
        '<div class="deck-card-icon">' + imgOrEmoji(card.image, CARD_EMOJI[cardId] || "🃏", "deck-card-img") + '</div>' +
        '<div class="deck-card-info">' +
          '<div class="deck-card-name">' + card.name + (upgradeLevel > 0 ? ' <span class="upgrade-star">★' + upgradeLevel + '</span>' : '') + '</div>' +
          '<div class="deck-card-type">' + CARD_TYPE_LABEL[card.type] + (card.type !== 'defense' ? ' / ' + (AFFINITY_LABEL[card.affinity] || '') : '') + ' / MP' + card.mpCost + '</div>' +
          '<div class="deck-card-effect">' + effectText + '</div>' +
          (card.setEffect ? '<div class="deck-card-set">セット効果(3枚): ' + card.setEffect.description + '</div>' : '') +
        '</div>' +
        '<div class="deck-card-count-edit">' +
          '<span class="deck-card-count">×' + cnt + '</span>' +
          '<button class="btn btn-small btn-danger btn-deck-remove" data-card-id="' + cardId + '">外す</button>' +
        '</div>' +
      '</div>';
    }).join("");

    // デッキから外すボタンのイベント
    container.querySelectorAll(".btn-deck-remove").forEach(function(btn) {
      btn.onclick = function() {
        var cardId = btn.dataset.cardId;
        var card = Engine.getCardData(cardId);
        var removed = Engine.removeCardFromDeck(cardId);
        if (removed) {
          if (!s.inventory.surplusCards) s.inventory.surplusCards = [];
          s.inventory.surplusCards.push(cardId);
          Engine.saveGame();
          showToast("「" + (card ? card.name : cardId) + "」をデッキから外しました");
          renderDeckScreen();
        }
      };
    });

    // 余剰カードリスト
    var surplus = s.inventory.surplusCards || [];
    if (surplus.length > 0) {
      surplusLabel.style.display = "";
      var surplusCountMap = {};
      surplus.forEach(function(id) { surplusCountMap[id] = (surplusCountMap[id] || 0) + 1; });
      var surplusUnique = [];
      surplus.forEach(function(id) { if (surplusUnique.indexOf(id) < 0) surplusUnique.push(id); });

      surplusContainer.innerHTML = surplusUnique.map(function(cardId) {
        var card = Engine.getCardData(cardId);
        if (!card) return "";
        var cnt = surplusCountMap[cardId];
        var upgradeLevel = s.cardUpgrades[cardId] || 0;
        var effectText = getEffectText(card);
        var deckFull = s.fullDeck.length >= 15;
        var deckCnt = s.fullDeck.filter(function(id) { return id === cardId; }).length;
        var maxCopies = deckCnt >= 3;
        var canAdd = !deckFull && !maxCopies;
        return '<div class="deck-card-row ' + CARD_TYPE_CLASS[card.type] + ' surplus-card">' +
          '<div class="deck-card-icon">' + imgOrEmoji(card.image, CARD_EMOJI[cardId] || "🃏", "deck-card-img") + '</div>' +
          '<div class="deck-card-info">' +
            '<div class="deck-card-name">' + card.name + (upgradeLevel > 0 ? ' <span class="upgrade-star">★' + upgradeLevel + '</span>' : '') + '</div>' +
            '<div class="deck-card-type">' + CARD_TYPE_LABEL[card.type] + (card.type !== 'defense' ? ' / ' + (AFFINITY_LABEL[card.affinity] || '') : '') + ' / MP' + card.mpCost + '</div>' +
            '<div class="deck-card-effect">' + effectText + '</div>' +
          '</div>' +
          '<div class="deck-card-count-edit">' +
            '<span class="deck-card-count">×' + cnt + '</span>' +
            '<button class="btn btn-small btn-primary btn-surplus-add" data-card-id="' + cardId + '"' + (canAdd ? '' : ' disabled') + '>追加</button>' +
          '</div>' +
        '</div>';
      }).join("");

      surplusContainer.querySelectorAll(".btn-surplus-add").forEach(function(btn) {
        btn.onclick = function() {
          var cardId = btn.dataset.cardId;
          var card = Engine.getCardData(cardId);
          var result = Engine.addCardToDeck(cardId);
          if (result.success) {
            var idx = s.inventory.surplusCards.indexOf(cardId);
            if (idx !== -1) s.inventory.surplusCards.splice(idx, 1);
            Engine.saveGame();
            showToast("「" + (card ? card.name : cardId) + "」をデッキに追加しました");
            renderDeckScreen();
          } else if (result.reason === "deck_full") {
            showToast("デッキが満杯です（15枚）");
          } else if (result.reason === "max_copies") {
            showToast("同じカードは3枚までです");
          }
        };
      });
    } else {
      surplusLabel.style.display = "none";
      surplusContainer.innerHTML = "";
    }

    var active = Engine.getActiveSetEffects();
    var activeKeys = Object.keys(active);
    if (activeKeys.length > 0) {
      var setDescs = [];
      GAMEDATA.cards.forEach(function(c) {
        if (c.setEffect && active[c.setEffect.key] && !setDescs.find(function(d) { return d.key === c.setEffect.key; })) {
          setDescs.push({ key: c.setEffect.key, desc: c.setEffect.description });
        }
      });
      setEffectEl.innerHTML = '<div class="set-effect-active">✨ セット効果発動中：' + setDescs.map(function(d) { return d.desc; }).join(" / ") + '</div>';
    } else {
      setEffectEl.innerHTML = "";
    }
  }

  // ──────────────────────────────────────────────
  //  クラフト画面
  // ──────────────────────────────────────────────
  var _craftFilter = "all";

  var _equipMainTab = "equip"; // 装備タブの現在のメインタブ

  function renderCraftScreen() {
    var s = Engine.getState();
    var p = s.player;
    var container = document.getElementById("craft-recipe-list");
    var matDisplay = document.getElementById("craft-materials-display");
    var mats = s.inventory.materials || {};
    var craftedIds = (s.inventory.equipment || []).concat(
      [s.player.equipment.weapon, s.player.equipment.armor].filter(Boolean)
    );

    // ── メインタブ切り替えイベント ──
    document.querySelectorAll(".equip-main-tab").forEach(function(tab) {
      tab.classList.toggle("active", tab.dataset.tab === _equipMainTab);
      tab.onclick = function() {
        _equipMainTab = tab.dataset.tab;
        document.getElementById("equip-main-tab-equip").style.display = (_equipMainTab === "equip") ? "" : "none";
        document.getElementById("equip-main-tab-craft").style.display = (_equipMainTab === "craft") ? "" : "none";
        document.querySelectorAll(".equip-main-tab").forEach(function(t) {
          t.classList.toggle("active", t.dataset.tab === _equipMainTab);
        });
      };
    });
    // タブ表示状態を現在の_equipMainTabに合わせる
    document.getElementById("equip-main-tab-equip").style.display = (_equipMainTab === "equip") ? "" : "none";
    document.getElementById("equip-main-tab-craft").style.display = (_equipMainTab === "craft") ? "" : "none";

    // ── 装備中スロット更新 ──
    var weaponId = p.equipment.weapon;
    var armorId = p.equipment.armor;
    var weaponRec = weaponId ? GAMEDATA.craftRecipes.find(function(r) { return r.id === weaponId; }) : null;
    var armorRec = armorId ? GAMEDATA.craftRecipes.find(function(r) { return r.id === armorId; }) : null;
    document.getElementById("equip-weapon-name").textContent = weaponRec ? weaponRec.name : "なし";
    var wStat = "";
    if (weaponRec) {
      if ((weaponRec.physicalBonus || 0) > 0) wStat = "物理攻撃 +" + weaponRec.physicalBonus;
      else if ((weaponRec.magicBonus || 0) > 0) wStat = "魔法攻撃 +" + weaponRec.magicBonus;
      else wStat = "攻撃 +" + (weaponRec.attackBonus || 0);
    } else { wStat = "物理/魔法攻撃 +0"; }
    document.getElementById("equip-weapon-stat").textContent = wStat;
    document.getElementById("equip-armor-name").textContent = armorRec ? armorRec.name : "なし";
    document.getElementById("equip-armor-stat").textContent = armorRec ? "最大HP +" + armorRec.hpBonus : "HP +0";
    var btnUW = document.getElementById("btn-unequip-weapon");
    var btnUA = document.getElementById("btn-unequip-armor");
    btnUW.style.display = weaponRec ? "block" : "none";
    btnUA.style.display = armorRec ? "block" : "none";
    btnUW.onclick = function() { AudioManager.playSe("back"); Engine.unequipItem("weapon"); Engine.saveGame(); renderCraftScreen(); };
    btnUA.onclick = function() { AudioManager.playSe("back"); Engine.unequipItem("armor"); Engine.saveGame(); renderCraftScreen(); };

    // ── 所持装備リスト ──
    var inv = s.inventory.equipment || [];
    var invContainer = document.getElementById("equip-inventory-list");
    if (inv.length === 0) {
      invContainer.innerHTML = '<div class="empty-text">所持装備なし</div>';
    } else {
      invContainer.innerHTML = inv.map(function(recipeId) {
        var rec = GAMEDATA.craftRecipes.find(function(r) { return r.id === recipeId; });
        if (!rec) return "";
        var stTxt;
        if (rec.type === "weapon") {
          if ((rec.physicalBonus || 0) > 0) stTxt = "物理攻撃 +" + rec.physicalBonus;
          else if ((rec.magicBonus || 0) > 0) stTxt = "魔法攻撃 +" + rec.magicBonus;
          else stTxt = "攻撃 +" + (rec.attackBonus || 0);
        } else { stTxt = "最大HP +" + rec.hpBonus; }
        var isEquipped = (weaponId === recipeId || armorId === recipeId);
        return '<div class="equip-inv-row">' +
          '<div class="equip-inv-icon">' + imgOrEmoji(rec.image, getEquipIcon(rec), "equip-inv-img") + '</div>' +
          '<div class="equip-inv-info"><div class="equip-inv-name">' + rec.name + '</div><div class="equip-inv-stat">' + stTxt + '</div></div>' +
          (isEquipped
            ? '<span class="equipped-badge">装備中</span>'
            : '<button class="btn btn-small btn-primary btn-equip-item" data-recipe-id="' + recipeId + '">装備</button>') +
          '</div>';
      }).join("");
      invContainer.querySelectorAll(".btn-equip-item").forEach(function(btn) {
        btn.onclick = function() {
          var result = Engine.equipItem(btn.dataset.recipeId);
          if (result.success) { showToast(result.equipped.name + " を装備しました！"); Engine.saveGame(); renderCraftScreen(); }
        };
      });
    }

    // 素材エリアは初回（空のとき）のみ描画し、タブ切り替えでは再描画しない
    if (!matDisplay.dataset.rendered) {
      matDisplay.innerHTML = Object.keys(mats).length === 0
        ? '<span class="empty-text" style="grid-column:1/-1">素材がありません</span>'
        : Object.entries(mats).map(function(entry) {
            var matId = entry[0], cnt = entry[1];
            var mat = GAMEDATA.materials.find(function(m) { return m.id === matId; });
            if (!mat) return "";
            return '<span class="mat-badge">'
              + imgOrEmoji(mat.image, MATERIAL_EMOJI[matId] || "📦", "mat-icon-sm")
              + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + mat.name + '</span>'
              + '<span style="color:var(--gold);font-weight:bold;flex-shrink:0">×' + cnt + '</span>'
              + '</span>';
          }).join("");
      matDisplay.dataset.rendered = "1";
    }

    // タブボタンのアクティブ状態を更新
    document.querySelectorAll(".craft-filter-tab").forEach(function(tab) {
      tab.classList.toggle("active", tab.dataset.filter === _craftFilter);
      tab.onclick = function() {
        _craftFilter = tab.dataset.filter;
        renderCraftScreen();
      };
    });

    var recipes = GAMEDATA.craftRecipes.filter(function(recipe) {
      if (_craftFilter === "craftable") {
        return Object.entries(recipe.materials).every(function(entry) {
          return (mats[entry[0]] || 0) >= entry[1];
        });
      }
      return true;
    });

    container.innerHTML = recipes.map(function(recipe) {
      var matReqs = Object.entries(recipe.materials).map(function(entry) {
        var matId = entry[0], need = entry[1];
        var mat = GAMEDATA.materials.find(function(m) { return m.id === matId; });
        var have = mats[matId] || 0;
        var ok = have >= need;
        return '<span class="mat-req ' + (ok ? "ok" : "ng") + '">' + (mat ? mat.name : matId) + " " + have + "/" + need + "</span>";
      }).join(" ");

      var canCraft = Object.entries(recipe.materials).every(function(entry) {
        return (mats[entry[0]] || 0) >= entry[1];
      });
      var isCrafted = craftedIds.indexOf(recipe.id) !== -1;

      // ステータス表示：物理/魔法攻撃を分離
      var statText;
      if (recipe.type === "weapon") {
        if ((recipe.physicalBonus || 0) > 0) {
          statText = "物理攻撃 +" + recipe.physicalBonus;
        } else if ((recipe.magicBonus || 0) > 0) {
          statText = "魔法攻撃 +" + recipe.magicBonus;
        } else {
          statText = "攻撃 +" + (recipe.attackBonus || 0);
        }
      } else {
        statText = "最大HP +" + recipe.hpBonus;
      }

      var craftedBadge = isCrafted ? '<span class="crafted-badge">✓作成済み</span>' : "";

      return `
        <div class="recipe-card${isCrafted ? " crafted" : ""}">
          <div class="recipe-icon">${imgOrEmoji(recipe.image, getEquipIcon(recipe), "recipe-img")}</div>
          <div class="recipe-info">
            <div class="recipe-name">${recipe.name}${craftedBadge}</div>
            <div class="recipe-stat">${statText}</div>
            <div class="recipe-desc">${recipe.description}</div>
            <div class="recipe-mats">${matReqs}</div>
          </div>
          <button class="btn btn-small ${canCraft ? "btn-primary" : "btn-disabled"} btn-craft" data-recipe-id="${recipe.id}" ${canCraft ? "" : "disabled"}>クラフト</button>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-craft").forEach(function(btn) {
      btn.onclick = function() {
        var result = Engine.craftEquipment(btn.dataset.recipeId);
        if (result.success) {
          showToast(result.item.name + " を作成しました！");
          Engine.saveGame();
          // クラフト後は素材が減るので再描画するためフラグをリセット
          var md = document.getElementById("craft-materials-display");
          if (md) delete md.dataset.rendered;
          renderCraftScreen();
        } else {
          showToast("素材が足りません");
        }
      };
    });
  }



  // ──────────────────────────────────────────────
  //  強化・売却ショップ画面
  // ──────────────────────────────────────────────
  function renderShopScreen() {
    var s = Engine.getState();
    document.getElementById("shop-gold").textContent = s.player.gold;

    document.querySelectorAll(".shop-tab").forEach(function(tab) {
      tab.onclick = function() {
        document.querySelectorAll(".shop-tab").forEach(function(t) { t.classList.remove("active"); });
        document.querySelectorAll(".shop-tab-content").forEach(function(c) { c.classList.remove("active"); });
        tab.classList.add("active");
        document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
      };
    });

    renderCardUpgradeTab();
    renderStatUpgradeTab();
    renderSellTab();
  }

  function renderCardUpgradeTab() {
    var s = Engine.getState();
    var unique = [];
    s.fullDeck.forEach(function(id) { if (unique.indexOf(id) < 0) unique.push(id); });
    var container = document.getElementById("upgrade-list");

    // 強化不可カードの判定関数：MP半減・ MP削減・ ダメージ無効は強化不可
    function isNonUpgradable(card) {
      if (!card || !card.effect) return false;
      if (card.effect.blockNextAttack) return true;
      if (card.effect.buff) {
        var bt = card.effect.buff.type;
        if (bt === "nextCardCostHalf" || bt === "magicCostDown") return true;
      }
      return false;
    }

    container.innerHTML = unique.map(function(cardId) {
      var card = Engine.getCardData(cardId);
      if (!card) return "";
      var level = s.cardUpgrades[cardId] || 0;
      var maxed = level >= 5;
      var nonUpgradable = isNonUpgradable(card);
      var cost = nonUpgradable ? "強化不可" : (maxed ? "MAX" : "🪙 " + GAMEDATA.cardUpgradeCost[level]);
      var effectText = getEffectText(card);
      return `
        <div class="upgrade-row${nonUpgradable ? ' upgrade-locked' : ''}">
          <div class="upgrade-card-icon">${imgOrEmoji(card.image, CARD_EMOJI[cardId] || "🃏", "upgrade-card-img")}</div>
          <div class="upgrade-info">
            <div class="upgrade-name">${card.name}</div>
            <div class="upgrade-level">${nonUpgradable ? '<span class="no-upgrade-label">強化不可</span>' : 'Lv ' + level + ' / 5 &nbsp; 現在効果：' + effectText}</div>
          </div>
          <button class="btn btn-small ${(maxed || nonUpgradable) ? 'btn-disabled' : 'btn-upgrade'} btn-upgrade-card" data-card-id="${cardId}" ${(maxed || nonUpgradable) ? "disabled" : ""}>${cost}</button>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-upgrade-card").forEach(function(btn) {
      btn.onclick = function() {
        var result = Engine.upgradeCard(btn.dataset.cardId);
        if (result.success) {
          AudioManager.playSe("up");
          showToast("強化しました！（Lv" + result.newLevel + "）");
          Engine.saveGame();
          renderShopScreen();
        } else if (result.reason === "not_enough_gold") {
          showToast("ゴールドが足りません");
        } else if (result.reason === "max_level") {
          showToast("これ以上強化できません");
        }
      };
    });
  }

  function renderStatUpgradeTab() {
    var s = Engine.getState();
    var p = s.player;
    var container = document.getElementById("stat-upgrade-list");
    var stats = [
      { key: "hp", label: "最大HP", current: p.maxHp, unit: "+1 / 段階" },
      { key: "mp", label: "最大MP", current: p.maxMp, unit: "+1 / 段階" },
      { key: "attack", label: "攻撃ボーナス", current: p.attackBonus, unit: "+1 / 段階" }
    ];

    container.innerHTML = stats.map(function(stat) {
      var level = p.statUpgrades[stat.key] || 0;
      var cost = Math.floor(Math.max(100, 100 * Math.pow(1.5, level)));
      return `
        <div class="stat-upgrade-row">
          <div class="stat-upgrade-info">
            <div class="stat-upgrade-name">${stat.label}</div>
            <div class="stat-upgrade-val">現在値：${stat.current} &nbsp; Lv ${level} &nbsp; <span class="stat-unit">${stat.unit}</span></div>
          </div>
          <button class="btn btn-small btn-primary btn-upgrade-stat" data-stat-key="${stat.key}">🪙 ${cost}</button>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-upgrade-stat").forEach(function(btn) {
      btn.onclick = function() {
        var result = Engine.upgradePlayerStat(btn.dataset.statKey);
        if (result.success) {
          AudioManager.playSe("up");
          showToast("ステータスを強化しました！");
          Engine.saveGame();
          renderShopScreen();
        } else if (result.reason === "not_enough_gold") {
          showToast("ゴールドが足りません");
        }
      };
    });
  }

  function renderSellTab() {
    var s = Engine.getState();
    var surplus = s.inventory.surplusCards || [];
    var sellCardContainer = document.getElementById("sell-card-list");

    if (surplus.length === 0) {
      sellCardContainer.innerHTML = '<div class="empty-text">売却できるカードなし</div>';
    } else {
      var countMap = {};
      var uniqueOrder = [];
      surplus.forEach(function(id) {
        countMap[id] = (countMap[id] || 0) + 1;
        if (uniqueOrder.indexOf(id) < 0) uniqueOrder.push(id);
      });
      sellCardContainer.innerHTML = uniqueOrder.map(function(cardId) {
        var cnt = countMap[cardId];
        var card = Engine.getCardData(cardId);
        if (!card) return "";
        return `
          <div class="sell-row">
            <div class="sell-icon">${imgOrEmoji(card.image, CARD_EMOJI[cardId] || "🃏", "sell-img")}</div>
            <div class="sell-info">
              <div class="sell-name">${card.name} ×${cnt}</div>
              <div class="sell-price">🪙 ${card.sellPrice} / 枚</div>
            </div>
            <button class="btn btn-small btn-danger btn-sell-card" data-card-id="${cardId}">売却</button>
          </div>
        `;
      }).join("");

      sellCardContainer.querySelectorAll(".btn-sell-card").forEach(function(btn) {
        btn.onclick = function() {
          var result = Engine.sellCard(btn.dataset.cardId);
          if (result.success) {
            AudioManager.playSe("cash");
            showToast("🪙 " + result.gold + " ゴールド獲得！");
            Engine.saveGame();
            renderShopScreen();
          }
        };
      });
    }

    var mats = s.inventory.materials || {};
    var sellMatContainer = document.getElementById("sell-material-list");
    if (Object.keys(mats).length === 0) {
      sellMatContainer.innerHTML = '<div class="empty-text">売却できる素材なし</div>';
    } else {
      sellMatContainer.innerHTML = Object.entries(mats).map(function(entry) {
        var matId = entry[0], cnt = entry[1];
        var mat = GAMEDATA.materials.find(function(m) { return m.id === matId; });
        if (!mat) return "";
        return `
          <div class="sell-row">
            <div class="sell-icon">${imgOrEmoji(mat.image, MATERIAL_EMOJI[matId] || "📦", "sell-img")}</div>
            <div class="sell-info">
              <div class="sell-name">${mat.name} ×${cnt}</div>
              <div class="sell-price">🪙 ${mat.sellPrice} / 個</div>
            </div>
            <button class="btn btn-small btn-danger btn-sell-mat" data-mat-id="${matId}">売却</button>
          </div>
        `;
      }).join("");

      sellMatContainer.querySelectorAll(".btn-sell-mat").forEach(function(btn) {
        btn.onclick = function() {
          var result = Engine.sellMaterial(btn.dataset.matId);
          if (result.success) {
            AudioManager.playSe("cash");
            showToast("🪙 " + result.gold + " ゴールド獲得！");
            Engine.saveGame();
            renderShopScreen();
          }
        };
      });
    }
  }

  // ──────────────────────────────────────────────
  //  マップ画面
  // ──────────────────────────────────────────────
  function initMap() {
    AudioManager.playBgm("main"); // マップ画面ではメインBGM
    showScreen("screen-map");
    renderMap();
    bindMapButtons();
  }

  function renderMap() {
    var s = Engine.getState();
    var stage = GAMEDATA.stages.find(function(st) { return st.id === s.currentStageId; });
    if (!stage) return;

    document.getElementById("map-stage-name").textContent = stage.name;
    document.getElementById("map-floor").textContent = s.currentFloor + " F";
    document.getElementById("map-hp").textContent = "HP " + s.player.hp + " / " + s.player.maxHp;
    document.getElementById("map-mp").textContent = "MP " + s.player.mp + " / " + s.player.maxMp;
    document.getElementById("map-gold").textContent = s.player.gold;
    document.getElementById("map-food").textContent = "食料: " + (s.food || 0);

    // ステージ画像（4:3）を設定（assets/images/stages/{stageId}.jpg または .png）
    var stageImg = document.getElementById("map-stage-image");
    if (stageImg) {
      stageImg._triedPng = false;
      var imgPath = "assets/images/ui/stage_" + s.currentStageId + ".jpg";
      stageImg.src = imgPath;
      stageImg.style.display = "block";
      stageImg.onerror = function() {
        // jpgがなければpngを試す
        if (!this._triedPng) {
          this._triedPng = true;
          this.src = "assets/images/ui/stage_" + s.currentStageId + ".png";
        } else {
          this.style.display = "none";
        }
      };
    }

    var maxFloor = stage.maxFloor || 10;
    var pct = Math.min(100, (s.currentFloor / maxFloor) * 100);
    document.getElementById("map-progress-bar").style.width = pct + "%";
    document.getElementById("map-progress-text").textContent = s.currentFloor + " / " + maxFloor + " F";

    var iconPct = Math.min(90, pct);
    document.getElementById("map-player-icon").style.left = iconPct + "%";

    var nextFloor = s.currentFloor + 1;
    var isBoss = nextFloor % 5 === 0;
    var exploreBtn = document.getElementById("btn-map-explore");
    exploreBtn.textContent = isBoss ? "⚠️ ボス戦へ進む" : "前へ進む";
    exploreBtn.className = "btn " + (isBoss ? "btn-danger" : "btn-primary") + " btn-large";
    exploreBtn.disabled = false;  // 戦闘後に必ず有効化
  }

  function bindMapButtons() {
    var exploreBtn = document.getElementById("btn-map-explore");
    exploreBtn.onclick = function() {
      var s = Engine.getState();
      var stage = GAMEDATA.stages.find(function(st) { return st.id === s.currentStageId; });
      if (stage && stage.moveTexts) {
        var txt = stage.moveTexts[Math.floor(Math.random() * stage.moveTexts.length)];
        document.getElementById("map-flavor-text").textContent = txt;
      }
      exploreBtn.disabled = true;
      setTimeout(function() {
        Engine.startBattle(s.currentStageId);
        Engine.saveGame();
        initBattle();
      }, 700);
    };

    document.getElementById("btn-map-home").onclick = function() {
      AudioManager.playSe("back");
      Engine.getState().gamePhase = "home";
      Engine.saveGame();
      initHome();
    };

    function updateFoodModalStatus() {
      var s = Engine.getState();
      var food = s.food || 0;
      var hp = s.player.hp;
      var maxHp = s.player.maxHp;
      var statusEl = document.getElementById("modal-food-status");
      if (statusEl) statusEl.innerHTML =
        '<span class="food-modal-hp">♥ HP ' + hp + ' / ' + maxHp + '</span>' +
        '<span class="food-modal-food">🍞 食料 ' + food + ' 個</span>';
      var useBtn = document.getElementById("btn-food-use");
      if (useBtn) {
        var healAmt = Engine.getFoodHealAmount ? Engine.getFoodHealAmount() : 1;
        useBtn.textContent = "使う（HP+" + healAmt + "）";
        useBtn.disabled = (food <= 0 || hp >= maxHp);
      }
    }

    document.getElementById("btn-map-food").onclick = function() {
      var s = Engine.getState();
      var food = s.food || 0;
      if (food <= 0) { showToast("食料がありません"); return; }
      AudioManager.playSe("button");
      updateFoodModalStatus();
      showModal("modal-food");
    };

    document.getElementById("btn-food-use").onclick = function() {
      var result = Engine.useFood(1);
      if (result.success) {
        Engine.saveGame();
        renderMap();
        updateFoodModalStatus();
        var s = Engine.getState();
        if ((s.food || 0) <= 0 || s.player.hp >= s.player.maxHp) {
          hideModal("modal-food");
          if (s.player.hp >= s.player.maxHp) showToast("HPは満タンです");
          else showToast("食料がなくなりました");
        }
      } else {
        hideModal("modal-food");
        showToast("食料がありません");
      }
    };

    document.getElementById("btn-food-cancel").onclick = function() { AudioManager.playSe("back"); hideModal("modal-food"); };
  }

  // ──────────────────────────────────────────────
  //  戦闘画面
  // ──────────────────────────────────────────────
  var selectedHandIndex = -1;

  function initBattle() {
    AudioManager.playBgm("battle");
    showScreen("screen-battle");
    selectedHandIndex = -1;
    document.getElementById("btn-use-card").style.display = "none";
    document.getElementById("battle-log").innerHTML = "";
    renderBattle();
    bindBattleButtons();
  }

  function renderBattle() {
    var s = Engine.getState();
    var battle = s.battle;
    if (!battle) return;
    var p = s.player;

    document.getElementById("battle-hp").textContent = "HP " + p.hp + " / " + p.maxHp;
    document.getElementById("battle-mp").textContent = "MP " + p.mp + " / " + p.maxMp;
    document.getElementById("battle-shield").textContent = "ガード " + p.shield;
    document.getElementById("battle-hp-bar").innerHTML = hpBar(p.hp, p.maxHp);
    document.getElementById("battle-status").innerHTML = statusBadges(p.statusEffects);
    document.getElementById("battle-turn").textContent = "ターン " + battle.turn;
    document.getElementById("battle-floor").textContent = s.currentFloor + "F";

    renderEnemies();
    renderHand();
    document.getElementById("btn-end-turn").disabled = battle.phase !== "player";
  }

  function renderEnemies() {
    var s = Engine.getState();
    var battle = s.battle;
    var container = document.getElementById("battle-enemy-area");
    var isTwoTurn = s.player.jobId === "maze_detective";

    container.innerHTML = battle.enemies.map(function(enemy, idx) {
      if (enemy.hp <= 0) return '<div class="enemy-card dead"><div class="enemy-dead-text">撃破</div></div>';
      var isTarget = battle.targetIndex === idx;
      var nextAction = enemy.nextAction;
      var nextNextAction = enemy.nextNextAction;
      var intentIcon = nextAction ? (INTENT_ICON[nextAction.intent] || "❓") : "";
      var intentText = nextAction ? nextAction.label : "—";
      var intentDmg = nextAction && nextAction.damage ? "（" + nextAction.damage + "ダメージ" + (nextAction.hits && nextAction.hits > 1 ? " ×" + nextAction.hits : "") + "）" : "";
      var nextNextHtml = "";
      if (isTwoTurn && nextNextAction) {
        var ni2 = INTENT_ICON[nextNextAction.intent] || "❓";
        nextNextHtml = '<div class="enemy-next2">次々：' + ni2 + " " + nextNextAction.label + "</div>";
      }
      return `
        <div class="enemy-card ${isTarget ? "targeted" : ""} ${enemy.isBoss ? "boss" : ""}" data-enemy-index="${idx}">
          <div class="enemy-name">${enemy.isBoss ? "👑 " : ""}${enemy.name}</div>
          <div class="enemy-image">${imgOrEmoji(enemy.image, ENEMY_EMOJI[enemy.id] || "👾", "enemy-img")}</div>
          <div class="enemy-hp-text">HP ${enemy.hp} / ${enemy.maxHp}</div>
          ${hpBar(enemy.hp, enemy.maxHp)}
          ${enemy.shield > 0 ? '<div class="enemy-shield">🛡️ ' + enemy.shield + "</div>" : ""}
          <div class="enemy-intent">${intentIcon} 次：${intentText} ${intentDmg}</div>
          ${nextNextHtml}
          <div class="enemy-status">${statusBadges(enemy.statusEffects)}</div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".enemy-card:not(.dead)").forEach(function(card) {
      card.onclick = function() {
        var idx = parseInt(card.dataset.enemyIndex);
        Engine.setTarget(idx);
        renderEnemies();
      };
    });
  }

  function renderHand() {
    var s = Engine.getState();
    var container = document.getElementById("battle-hand-area");

    container.innerHTML = s.hand.map(function(cardId, idx) {
      var card = Engine.getCardData(cardId);
      if (!card) return "";
      var isSelected = selectedHandIndex === idx;
      var canAfford = s.player.mp >= card.mpCost;
      var effectText = getEffectText(card);
      var upgradeLevel = s.cardUpgrades[cardId] || 0;
      return `
        <div class="hand-card ${CARD_TYPE_CLASS[card.type]} ${isSelected ? "selected" : ""} ${!canAfford ? "cant-afford" : ""}" data-hand-index="${idx}">
          <div class="card-mp-cost">${card.mpCost}</div>
          <div class="card-img-area">${imgOrEmoji(card.image, CARD_EMOJI[cardId] || "🃏", "card-img")}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-value-display ${card.type === 'attack' ? 'value-attack' : card.type === 'defense' ? 'value-defense' : 'value-support'}">${effectText}</div>
          ${upgradeLevel > 0 ? '<div class="card-upgrade-badge">★' + upgradeLevel + '</div>' : ''}
        </div>
      `;
    }).join("");

    container.querySelectorAll(".hand-card").forEach(function(cardEl) {
      cardEl.onclick = function() {
        var s = Engine.getState();
        if (s.battle.phase !== "player") return;
        var idx = parseInt(cardEl.dataset.handIndex);
        if (selectedHandIndex === idx) {
          useSelectedCard();
        } else {
          selectedHandIndex = idx;
          renderHand();
          showCardUseButton(idx);
        }
      };
    });
  }

  function showCardUseButton(handIndex) {
    var s = Engine.getState();
    var cardId = s.hand[handIndex];
    var card = Engine.getCardData(cardId);
    if (!card) return;
    var useBtn = document.getElementById("btn-use-card");
    useBtn.textContent = "「" + card.name + "」を使う（MP " + card.mpCost + "）";
    useBtn.style.display = "block";
  }

  function useSelectedCard() {
    if (selectedHandIndex < 0) return;
    var s = Engine.getState();
    var targetIdx = s.battle.targetIndex;
    var result = Engine.playCard(selectedHandIndex, targetIdx);
    selectedHandIndex = -1;
    document.getElementById("btn-use-card").style.display = "none";

    if (!result.success) {
      if (result.reason === "not_enough_mp") showToast("MPが足りません");
      return;
    }

    appendBattleLog(result.result);

    if (result.battleEnd) {
      renderBattle();
      onBattleEnd(result.battleEnd);
      return;
    }

    renderBattle();
  }

  function bindBattleButtons() {
    var useBtn = document.getElementById("btn-use-card");
    var newUseBtn = useBtn.cloneNode(true);
    useBtn.parentNode.replaceChild(newUseBtn, useBtn);
    newUseBtn.onclick = function() { useSelectedCard(); };

    var endBtn = document.getElementById("btn-end-turn");
    var newEndBtn = endBtn.cloneNode(true);
    endBtn.parentNode.replaceChild(newEndBtn, endBtn);
    newEndBtn.onclick = function() {
      selectedHandIndex = -1;
      document.getElementById("btn-use-card").style.display = "none";
      var result = Engine.endPlayerTurn();
      if (!result) return;

      if (result.phase === "gameover") {
        showScreen("screen-gameover");
        document.getElementById("gameover-text").textContent = "力尽きて倒れた…";
        document.getElementById("btn-gameover-home").onclick = function() {
          AudioManager.playSe("back");
          var s = Engine.getState();
          s.player.hp = Math.floor(s.player.maxHp * 0.3);
          s.player.mp = s.player.maxMp;
          s.gamePhase = "home";
          Engine.saveGame();
          initHome();
        };
        return;
      }

      if (result.phase === "result") {
        renderBattle();
        onBattleEnd(result);
        return;
      }

      renderBattle();
      showEnemyActionLog();
    };
  }

  function showEnemyActionLog() {
    var s = Engine.getState();
    var battle = s.battle;
    if (!battle || !battle.log.length) return;
    var logEl = document.getElementById("battle-log");

    for (var i = battle.log.length - 1; i >= 0; i--) {
      var entry = battle.log[i];
      if (entry.type === "enemy_turn") {
        entry.results.forEach(function(r) {
          var text = r.enemyName + "：";
          if (r.skipped) {
            if (r.action === "様子を見ている") {
              text += "様子を見ている（探偵の洞察で行動を封じた！）";
            } else {
              text += "混乱して行動できない！";
            }
          } else if (r.blocked) {
            text += r.action + " → 無効化された！";
          } else if (r.damage !== undefined) {
            text += r.action + " → " + r.damage + "ダメージ";
            if (r.shieldAbsorbed > 0) text += "（ガード" + r.shieldAbsorbed + "吸収）";
            if (r.reflected) text += "（" + r.reflected + "反射）";
            if (r.statusApplied === "mpDrain" && r.mpDrained !== undefined) text += "（MP-" + r.mpDrained + "）";
          } else if (r.shield !== undefined) {
            text += r.action + " → ガード+" + r.shield;
          } else if (r.healSelf !== undefined) {
            text += r.action + " → HP+" + r.healSelf + "回復";
          } else {
            text += r.action;
          }
          appendLog(logEl, text, "enemy");
        });
        break;
      }
    }

    // 罠師ダメージログ
    battle.log.forEach(function(l) {
      if (l.type === "trap_damage") {
        appendLog(logEl, l.message, "support");
      }
    });
    // 状態異常ティック
    battle.log.forEach(function(l) {
      if (l.type === "status_tick") {
        const tickNames = { burn: "🔥燻し", confuse: "💫混乱", defenseDown: "⬇️防御低下", weaken: "弱体", poison: "💀毒" };
        appendLog(logEl, l.entity + "：" + (tickNames[l.effect] || l.effect) + " " + l.damage + "ダメージ", "status");
      }
    });
  }

  function appendBattleLog(result) {
    var logEl = document.getElementById("battle-log");
    if (!result) return;
    var text = "";
    if (result.damage !== undefined) {
      text = (result.allEnemies ? "全体攻撃" : "攻撃") + "：" + result.damage + "ダメージ";
      if (result.shieldAbsorbed > 0) text += "（ガード" + result.shieldAbsorbed + "吸収）";
    } else if (result.shield !== undefined) {
      text = "ガード +" + result.shield;
    } else if (result.mpRestore !== undefined) {
      text = "MP +" + result.mpRestore + " 回復";
    } else if (result.healHp !== undefined) {
      text = "HP +" + result.healHp + " 回復";
    } else if (result.blockNextAttack) {
      text = "次の敵攻撃を無効化！";
    } else if (result.nextMagicDamageBonus) {
      text = "次の魔法ダメージ×1.5！";
    } else if (result.buffApplied) {
      const buffNames = { nextCardCostHalf: "次カードMP半減", magicCostDown: "魔法MPコスト-1", allCostDown: "次ターン全カードMP-1", nextTurnMpBonus: "HP回復+次ターンMP+3" };
      text = "バフ付与：" + (buffNames[result.buffApplied] || result.buffApplied);
    } else if (result.debuffApplied) {
      const debuffNames = { defenseDown: "防御低下", weaken: "弱体", confuse: "混乱", burn: "燻し" };
      text = "デバフ付与：" + (debuffNames[result.debuffApplied] || result.debuffApplied);
    }
    if (result.statusApplied) {
      const statusNames = { burn: "燻し", confuse: "混乱", defenseDown: "防御ダウン", weaken: "弱体", poison: "毒" };
      const sName = statusNames[result.statusApplied] || result.statusApplied;
      text += " ＋" + sName + "付与";
    }
    if (text) appendLog(logEl, text, "player");
  }

  function appendLog(el, text, type) {
    type = type || "info";
    var div = document.createElement("div");
    div.className = "log-line log-" + type;
    div.textContent = text;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    while (el.children.length > 20) el.removeChild(el.firstChild);
  }

  // ──────────────────────────────────────────────
  //  戦闘終了処理
  // ──────────────────────────────────────────────
  function onBattleEnd(endResult) {
    var s = Engine.getState();
    if (endResult.levelUp && endResult.levelUp.length > 0) {
      var lu = endResult.levelUp[endResult.levelUp.length - 1];
      document.getElementById("levelup-content").innerHTML =
        '<div class="levelup-level">Lv. ' + lu.level + '</div>' +
        '<div class="levelup-stats">HP +' + lu.hpGain + ' &nbsp; MP +' + lu.mpGain + '</div>' +
        '<div class="levelup-heal">HP・MP 全回復！</div>';
      showModal("modal-levelup");
      document.getElementById("btn-levelup-ok").onclick = function() {
        AudioManager.playSe("button");
        hideModal("modal-levelup");
        showBattleResult(endResult, s);
      };
    } else {
      showBattleResult(endResult, s);
    }
  }

  function showBattleResult(endResult, s) {
    var resultTitle = document.getElementById("modal-result-title");
    var resultContent = document.getElementById("modal-result-content");
    var foodBtn = document.getElementById("btn-result-food");

    resultTitle.textContent = "勝利！";
    var html = '<div class="result-rewards">';
    html += '<div class="result-reward-row">🌟 EXP +' + endResult.exp + '</div>';
    html += '<div class="result-reward-row">🪙 ゴールド +' + endResult.gold + '</div>';
    if (endResult.drops.materials.length > 0) {
      endResult.drops.materials.forEach(function(matId) {
        var mat = GAMEDATA.materials.find(function(m) { return m.id === matId; });
        html += '<div class="result-reward-row">' + (MATERIAL_EMOJI[matId] || "📦") + " " + (mat ? mat.name : matId) + " を入手！</div>";
      });
    }
    if (endResult.drops.cards.length > 0) {
      endResult.drops.cards.forEach(function(sourceId) {
        html += '<div class="result-reward-row">🃏 古物「' + (SOURCE_NAMES[sourceId] || sourceId) + '」を発見！</div>';
      });
    }
    html += "</div>";
    resultContent.innerHTML = html;

    var food = s.food || 0;
    var needHeal = s.player.hp < s.player.maxHp;
    if (food > 0 && needHeal) {
      foodBtn.style.display = "block";
      foodBtn.textContent = "🍞 食料を使う（残り " + food + "）";
      foodBtn.onclick = function() {
        var res = Engine.useFood(1);
        if (res.success) {
          showToast("HP +" + res.healed + " 回復（食料残り " + res.foodLeft + "）");
          foodBtn.textContent = "🍞 食料を使う（残り " + res.foodLeft + "）";
          if (res.foodLeft <= 0) foodBtn.style.display = "none";
          Engine.saveGame();
        }
      };
    } else {
      foodBtn.style.display = "none";
    }

    showModal("modal-battle-result");

    var continueBtn = document.getElementById("btn-result-continue");
    var newContinueBtn = continueBtn.cloneNode(true);
    continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
    newContinueBtn.onclick = function() {
      AudioManager.playSe("button");
      hideModal("modal-battle-result");
      Engine.saveGame();

      if (Engine.checkFoodAndReturn()) {
        showModal("modal-forced-return");
        document.getElementById("btn-forced-return-ok").onclick = function() {
          AudioManager.playSe("back");
          hideModal("modal-forced-return");
          initHome();
        };
        return;
      }

      var curS = Engine.getState();
      if (curS.gamePhase === "stage_clear") {
        showStageClearModal(curS);
      } else if (curS.gamePhase === "card_choice") {
        initCardChoice();
      } else {
        // initMapの代わりにshowScreen+renderMapのみ呼び出してbindMapButtonsの二重登録を防ぐ
        showScreen("screen-map");
        renderMap();
      }
    };
  }

  // ──────────────────────────────────────────────
  //  カード種別選択画面
  // ──────────────────────────────────────────────
  function initCardChoice() {
    showScreen("screen-card-choice");
    renderCardChoice();
  }

  function renderCardChoice() {
    var s = Engine.getState();
    var pending = s.inventory.pendingDrops;
    if (!pending || pending.length === 0) {
      showScreen("screen-map");
      renderMap();
      return;
    }

    var drop = pending[0];
    var sourceId = drop.sourceId;

    document.getElementById("card-choice-title").textContent = "「" + (SOURCE_NAMES[sourceId] || sourceId) + "」をどのカードにしますか？";
    document.getElementById("card-choice-remaining").textContent = "残り " + pending.length + " 件";
    document.getElementById("card-choice-deck-count").textContent = "デッキ " + s.fullDeck.length + " / 15";

    var container = document.getElementById("card-choice-list");
    var types = ["attack", "defense", "support"];
    container.innerHTML = types.map(function(type) {
      var card = GAMEDATA.cards.find(function(c) { return c.sourceId === sourceId && c.type === type; });
      if (!card) return "";
      var inDeck = s.fullDeck.filter(function(id) { return id === card.id; }).length;
      var maxCopies = inDeck >= 3;
      var deckFull = s.fullDeck.length >= 15;
      var upgradeLevel = s.cardUpgrades[card.id] || 0;
      var effectText = getEffectText(card);
      var statusNote = "";
      if (maxCopies) {
        statusNote = '<div class="choice-note warn">デッキに3枚あり → 余剰カードとして保持</div>';
      } else if (deckFull) {
        statusNote = '<div class="choice-note warn">デッキが満杯 → 余剰カードとして保持</div>';
      } else {
        statusNote = '<div class="choice-note ok">デッキに追加（現在 ' + inDeck + ' 枚）</div>';
      }

      return `
        <div class="choice-card ${CARD_TYPE_CLASS[card.type]}">
          <div class="card-header">
            <span class="card-type-badge">${CARD_TYPE_LABEL[card.type]}</span>
            ${upgradeLevel > 0 ? '<span class="upgrade-star">★' + upgradeLevel + "</span>" : ""}
          </div>
          <div class="card-image">${imgOrEmoji(card.image, CARD_EMOJI[card.id] || "🃏", "card-img")}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-effect-val">${effectText}</div>
          <div class="card-mp">MP ${card.mpCost}</div>
          <div class="card-desc">${card.description}</div>
          ${card.setEffect ? '<div class="card-set-effect">セット効果(3枚): ' + card.setEffect.description + "</div>" : ""}
          ${statusNote}
          <button class="btn btn-primary btn-choose-type" data-type="${type}">
            ${CARD_TYPE_LABEL[type]}として追加
          </button>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-choose-type").forEach(function(btn) {
      btn.onclick = function() {
        var result = Engine.chooseCardType(0, btn.dataset.type);
        if (result.success) {
          AudioManager.playSe("up");
          if (result.addedToDeck) {
            showToast("「" + result.card.name + "」をデッキに追加しました！");
          } else {
            showToast("「" + result.card.name + "」を余剰カードとして保持しました");
          }
          Engine.saveGame();
          var newS = Engine.getState();
          if (newS.inventory.pendingDrops.length > 0) {
            renderCardChoice();
          } else {
            showScreen("screen-map");
            renderMap();
          }
        }
      };
    });
  }

  // ──────────────────────────────────────────────
  //  セーブ/ロードモーダル
  // ──────────────────────────────────────────
  function openSaveLoadModal() {
    var modal = document.getElementById('modal-saveload');
    if (!modal) return;
    modal.classList.remove('hidden');

    // タブ切り替え
    modal.querySelectorAll('.saveload-tab').forEach(function(tab) {
      tab.onclick = function() {
        modal.querySelectorAll('.saveload-tab').forEach(function(t) { t.classList.remove('active'); });
        modal.querySelectorAll('.saveload-tab-content').forEach(function(c) { c.classList.remove('active'); });
        tab.classList.add('active');
        var target = document.getElementById('saveload-tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      };
    });

    // セーブ情報表示
    var s = Engine.getState();
    var infoEl = document.getElementById('saveload-current-info');
    if (infoEl && s) {
      infoEl.textContent = s.player.jobName + ' Lv.' + s.player.level + '　HP ' + s.player.hp + '/' + s.player.maxHp + '　ゴールド ' + s.player.gold;
    }

    // ロード情報表示
    var loadInfoEl = document.getElementById('saveload-load-info');
    if (loadInfoEl) {
      if (SaveLoad.hasSave()) {
        loadInfoEl.textContent = 'セーブデータあり';
      } else {
        loadInfoEl.textContent = 'セーブデータなし';
      }
    }

    // メッセージクリア
    var msgEl = document.getElementById('saveload-message');
    if (msgEl) msgEl.textContent = '';

    // インポートファイル選択リセット
    var importBtn = document.getElementById('btn-do-import');
    var fileNameEl = document.getElementById('import-file-name');
    if (importBtn) importBtn.style.display = 'none';
    if (fileNameEl) fileNameEl.textContent = '';
    var fileInput = document.getElementById('import-file-input');
    if (fileInput) fileInput.value = '';
    var _importFile = null;

    // 閉じる
    document.getElementById('btn-saveload-close').onclick = function() {
      AudioManager.playSe("back");
      modal.classList.add('hidden');
    };

    // セーブ
    document.getElementById('btn-do-save').onclick = async function() {
      AudioManager.playSe("button");
      var result = await SaveLoad.save(Engine.getState());
      if (result.ok) {
        if (msgEl) { msgEl.textContent = '✅ セーブしました！'; msgEl.style.color = '#4caf50'; }
      } else {
        if (msgEl) { msgEl.textContent = '❌ ' + result.error; msgEl.style.color = '#f44336'; }
      }
    };

    // ロード
    document.getElementById('btn-do-load').onclick = async function() {
      if (!SaveLoad.hasSave()) {
        if (msgEl) { msgEl.textContent = '❌ セーブデータがありません'; msgEl.style.color = '#f44336'; }
        return;
      }
      showConfirm(
        'ロード確認',
        'セーブデータをロードしますか？\n現在の状態は上書きされます。',
        async function() {
          var result = await SaveLoad.load();
          if (result.ok) {
            Engine.setState(result.state);
            modal.classList.add('hidden');
            initHome();
            showToast('ロードしました！');
          } else {
            if (msgEl) { msgEl.textContent = '❌ ' + result.error; msgEl.style.color = '#f44336'; }
          }
        }
      );
    };

    // エクスポート
    document.getElementById('btn-do-export').onclick = async function() {
      var result = await SaveLoad.exportSave(Engine.getState());
      if (result.ok) {
        if (msgEl) { msgEl.textContent = '✅ エクスポートしました！'; msgEl.style.color = '#4caf50'; }
      } else {
        if (msgEl) { msgEl.textContent = '❌ ' + result.error; msgEl.style.color = '#f44336'; }
      }
    };

    // インポート：ファイル選択
    document.getElementById('btn-import-select').onclick = function() {
      fileInput.click();
    };
    fileInput.onchange = function() {
      if (fileInput.files.length > 0) {
        _importFile = fileInput.files[0];
        if (fileNameEl) fileNameEl.textContent = '選択中: ' + _importFile.name;
        if (importBtn) importBtn.style.display = 'inline-block';
      }
    };

    // インポート実行
    document.getElementById('btn-do-import').onclick = async function() {
      if (!_importFile) return;
      showConfirm(
        'インポート確認',
        'インポートしますか？\n現在の状態は上書きされます。',
        async function() {
          var result = await SaveLoad.importSave(_importFile);
          if (result.ok) {
            Engine.setState(result.state);
            modal.classList.add('hidden');
            initHome();
            showToast('インポートしました！');
          } else {
            if (msgEl) { msgEl.textContent = '❌ ' + result.error; msgEl.style.color = '#f44336'; }
          }
        }
      );
    };
  }

  // ──────────────────────────────────────────
  //  汎用確認モーダル
  // ──────────────────────────────────────────
  function showStageClearModal(state) {
    var stageId = state.currentStageId;
    var stage = GAMEDATA.stages.find(function(st) { return st.id === stageId; });
    var stageName = stage ? stage.name : "ステージ";
    var isAllClear = (stageId === "king_room");
    var overlay = document.createElement("div");
    overlay.className = "stage-clear-overlay";
    overlay.innerHTML = [
      '<div class="stage-clear-box">',
      '  <div class="stage-clear-title">' + (isAllClear ? '🌟 全クリア！ 🌟' : '✨ ' + stageName + ' クリア！ ✨') + '</div>',
      '  <div class="stage-clear-sub">' + (isAllClear ? '全ステージを制達しました' : '全フロアを制達しました') + '</div>',
      '  <button class="btn btn-primary btn-large" id="btn-stage-clear-ok">' + (isAllClear ? 'エンディングを見る' : 'ストーリーを見る') + '</button>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);
    document.getElementById("btn-stage-clear-ok").onclick = function() {
      AudioManager.playSe("open");
      document.body.removeChild(overlay);
      var sceneId = isAllClear ? "all_clear" : ("stage_" + stageId);
      showStoryScene(sceneId, function() {
        state.gamePhase = "home";
        Engine.saveGame();
        initHome();
      });
    };
  }

  function showConfirm(title, msg, onOk) {
    var overlay = document.getElementById('modal-confirm');
    var titleEl = document.getElementById('modal-confirm-title');
    var msgEl   = document.getElementById('modal-confirm-msg');
    var btnOk   = document.getElementById('btn-confirm-ok');
    var btnCancel = document.getElementById('btn-confirm-cancel');
    if (!overlay) { if (onOk) onOk(); return; }
    titleEl.textContent = title;
    msgEl.innerHTML = msg.replace(/\n/g, '<br>');
    overlay.classList.remove('hidden');
    function cleanup() {
      overlay.classList.add('hidden');
      btnOk.removeEventListener('click', handleOk);
      btnCancel.removeEventListener('click', handleCancel);
    }
    function handleOk()     { AudioManager.playSe("button"); cleanup(); if (onOk) onOk(); }
    function handleCancel() { AudioManager.playSe("back"); cleanup(); }
    btnOk.addEventListener('click', handleOk);
    btnCancel.addEventListener('click', handleCancel);
  }

  //  トースト通知
  // ──────────────────────────────────────────
  function showToast(msg) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(function() { toast.classList.remove("show"); }, 2200);
  }

  // ──────────────────────────────────────────────
  //  エントリーポイント
  // ──────────────────────────────────────────────
  // ──────────────────────────────────────────────
  //  図鑑画面
  // ──────────────────────────────────────────────
  var _zukanCurrentTab = "enemies";

  function renderZukanScreen() {
    var zukan = Engine.getZukan();
    var container = document.getElementById("zukan-content");

    // タブボタンのイベント登録
    document.querySelectorAll(".zukan-tab").forEach(function(btn) {
      btn.onclick = function() {
        document.querySelectorAll(".zukan-tab").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        _zukanCurrentTab = btn.dataset.tab;
        _renderZukanTab(zukan, container, _zukanCurrentTab);
      };
    });

    _renderZukanTab(zukan, container, _zukanCurrentTab);
  }

  function _renderZukanTab(zukan, container, tab) {
    var html = "";
    if (tab === "enemies") {
      html = _renderZukanEnemies(zukan.enemies);
    } else if (tab === "cards") {
      html = _renderZukanCards(zukan.cards);
    } else if (tab === "equipment") {
      html = _renderZukanEquipment(zukan.equipment);
    } else if (tab === "stages") {
      html = _renderZukanStages(Engine.getClearedStages());
    }
    container.innerHTML = html;

    // 解放済みカードにタップイベントを登録
    container.querySelectorAll(".zukan-card-unlocked").forEach(function(el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", function() {
        var dataId = el.dataset.id;
        var dataType = el.dataset.type;
        _showZukanDetailModal(dataType, dataId, zukan);
      });
    });

    // 閉じるボタンのイベント登録
    var closeBtn = document.getElementById("btn-zukan-detail-close");
    if (closeBtn) {
      closeBtn.onclick = function() { AudioManager.playSe("back"); hideModal("modal-zukan-detail"); };
    }
    document.getElementById("modal-zukan-detail").addEventListener("click", function(e) {
      if (e.target === document.getElementById("modal-zukan-detail")) {
        hideModal("modal-zukan-detail");
      }
    });
  }

  function _renderZukanEnemies(unlockedIds) {
    var allEnemies = GAMEDATA.enemies;
    var total = allEnemies.length;
    var unlocked = unlockedIds.length;
    var html = '<div class="zukan-progress">遂遇済み: <strong>' + unlocked + ' / ' + total + '</strong></div>';
    html += '<div class="zukan-grid">';
    allEnemies.forEach(function(enemy) {
      var isUnlocked = unlockedIds.indexOf(enemy.id) !== -1;
      if (isUnlocked) {
        var emoji = ENEMY_EMOJI[enemy.id] || "👾";
        html += '<div class="zukan-card zukan-card-unlocked" data-type="enemy" data-id="' + enemy.id + '">';
        html += '<div class="zukan-icon">' + imgOrEmoji(enemy.image, emoji, "zukan-img") + '</div>';
        html += '<div class="zukan-name">' + enemy.name + '</div>';
        html += '<div class="zukan-detail">';
        html += '<span class="zukan-stat">❤️HP ' + enemy.maxHp + '</span>';
        html += '<span class="zukan-stat">⭐EXP ' + enemy.expReward + '</span>';
        html += '</div>';
        html += '<div class="zukan-tap-hint">タップで詳細</div>';
        html += '</div>';
      } else {
        html += '<div class="zukan-card zukan-card-locked">';
        html += '<div class="zukan-icon zukan-locked-icon">❓</div>';
        html += '<div class="zukan-name zukan-unknown">未遷遇</div>';
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }

  function _renderZukanCards(unlockedSourceIds) {
    var allSourceIds = Object.keys(SOURCE_NAMES);
    var total = allSourceIds.length;
    var unlocked = unlockedSourceIds.length;
    var html = '<div class="zukan-progress">入手済み: <strong>' + unlocked + ' / ' + total + '</strong></div>';
    html += '<div class="zukan-grid">';
    allSourceIds.forEach(function(sourceId) {
      var isUnlocked = unlockedSourceIds.indexOf(sourceId) !== -1;
      if (isUnlocked) {
        var cardImgPath = "assets/images/cards/" + sourceId + ".jpg";
        var imgEl = imgOrEmoji(cardImgPath, "🃏", "zukan-img");
        html += '<div class="zukan-card zukan-card-unlocked" data-type="card" data-id="' + sourceId + '">';
        html += '<div class="zukan-icon">' + imgEl + '</div>';
        html += '<div class="zukan-name">' + (SOURCE_NAMES[sourceId] || sourceId) + '</div>';
        html += '<div class="zukan-tap-hint">タップで詳細</div>';
        html += '</div>';
      } else {
        html += '<div class="zukan-card zukan-card-locked">';
        html += '<div class="zukan-icon zukan-locked-icon">❓</div>';
        html += '<div class="zukan-name zukan-unknown">未入手</div>';
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }

  function _renderZukanEquipment(unlockedIds) {
    var allRecipes = GAMEDATA.craftRecipes;
    var total = allRecipes.length;
    var unlocked = unlockedIds.length;
    var html = '<div class="zukan-progress">クラフト済み: <strong>' + unlocked + ' / ' + total + '</strong></div>';
    html += '<div class="zukan-grid">';
    allRecipes.forEach(function(recipe) {
      var isUnlocked = unlockedIds.indexOf(recipe.id) !== -1;
      if (isUnlocked) {
        var typeLabel = recipe.type === "weapon" ? "⚔️ 武器" : "🛡️ 防具";
        html += '<div class="zukan-card zukan-card-unlocked" data-type="equipment" data-id="' + recipe.id + '">';
        html += '<div class="zukan-icon">' + imgOrEmoji(recipe.image, getEquipIcon(recipe), "zukan-img") + '</div>';
        html += '<div class="zukan-name">' + recipe.name + '</div>';
        html += '<div class="zukan-type-badge">' + typeLabel + '</div>';
        html += '<div class="zukan-tap-hint">タップで詳細</div>';
        html += '</div>';
      } else {
        html += '<div class="zukan-card zukan-card-locked">';
        html += '<div class="zukan-icon zukan-locked-icon">❓</div>';
        html += '<div class="zukan-name zukan-unknown">未クラフト</div>';
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }

  function _renderZukanStages(clearedIds) {
    var allStages = GAMEDATA.stages;
    var total = allStages.length;
    var unlocked = clearedIds.length;
    var html = '<div class="zukan-progress">クリア済み: <strong>' + unlocked + ' / ' + total + '</strong></div>';
    html += '<div class="zukan-grid">';
    allStages.forEach(function(stage) {
      var isCleared = clearedIds.indexOf(stage.id) !== -1;
      if (isCleared) {
        html += '<div class="zukan-card zukan-card-unlocked" data-type="stage" data-id="' + stage.id + '">';
        html += '<div class="zukan-icon">' + imgOrEmoji(stage.image, "🏞️", "zukan-img") + '</div>';
        html += '<div class="zukan-name">' + stage.name + '</div>';
        html += '<div class="zukan-tap-hint">タップで詳細</div>';
        html += '</div>';
      } else {
        html += '<div class="zukan-card zukan-card-locked">';
        html += '<div class="zukan-icon zukan-locked-icon">❓</div>';
        html += '<div class="zukan-name zukan-unknown">未探索</div>';
        html += '</div>';
      }
    });
    html += '</div>';
    return html;
  }

  function _showZukanDetailModal(type, id, zukan) {
    var content = document.getElementById("zukan-detail-content");
    var html = "";
    if (type === "enemy") {
      var enemy = GAMEDATA.enemies.find(function(e) { return e.id === id; });
      if (!enemy) return;
      var emoji = ENEMY_EMOJI[enemy.id] || "👾";
      html += '<div class="zd-icon">' + imgOrEmoji(enemy.image, emoji, "zd-img") + '</div>';
      html += '<div class="zd-title">' + enemy.name + '</div>';
      html += '<div class="zd-stats">';
      html += '<span class="zd-stat">❤️最大HP ' + enemy.maxHp + '</span>';
      html += '<span class="zd-stat">⭐EXP ' + enemy.expReward + '</span>';
      html += '<span class="zd-stat">🪙ゴールド ' + enemy.goldReward + '</span>';
      html += '</div>';
      html += '<div class="zd-desc">' + (enemy.description || "") + '</div>';
      // 弱点表示
      if (enemy.weakness) {
        var weakText = enemy.weakness === "physical" ? "⚔️ 物理攻撃が弱点（1.5倍）"
                     : enemy.weakness === "magic"    ? "✨ 魔法攻撃が弱点（1.5倍）"
                     : enemy.weakness === "both"     ? "⚔️✨ 物理・魔法共に弱点（1.5倍）"
                     : "";
        if (weakText) {
          html += '<div class="zd-weakness-badge">' + weakText + '</div>';
        }
      }
      if (enemy.dropMaterials && enemy.dropMaterials.length > 0) {
        html += '<div class="zd-section-label">📦 ドロップ素材</div>';
        html += '<div class="zd-drops">' + enemy.dropMaterials.map(function(mid) {
          var mat = GAMEDATA.materials.find(function(m) { return m.id === mid; });
          return (MATERIAL_EMOJI[mid] || "📦") + " " + (mat ? mat.name : mid);
        }).join("　") + '</div>';
      }
      if (enemy.dropCards && enemy.dropCards.length > 0) {
        html += '<div class="zd-section-label">🃏 ドロップ古物</div>';
        html += '<div class="zd-drops">' + enemy.dropCards.map(function(sid) { return SOURCE_NAMES[sid] || sid; }).join("、") + '</div>';
      }
      if (enemy.actions && enemy.actions.length > 0) {
        html += '<div class="zd-section-label">⚔️ アクション</div>';
        html += '<div class="zd-actions">';
        enemy.actions.forEach(function(a) {
          html += '<div class="zd-action-row">• ' + (a.label || a.name || a.type || "") + '</div>';
        });
        html += '</div>';
      }
    } else if (type === "card") {
      var sourceId = id;
      var cards = GAMEDATA.cards.filter(function(c) { return c.sourceId === sourceId; });
      var setCard = cards[0];
      var setEffect = setCard && setCard.setEffect ? setCard.setEffect : null;
      var cardImgPath = "assets/images/cards/" + sourceId + ".jpg";
      var imgEl = imgOrEmoji(cardImgPath, "🃏", "zd-img");
      html += '<div class="zd-icon">' + imgEl + '</div>';
      html += '<div class="zd-title">' + (SOURCE_NAMES[sourceId] || sourceId) + '</div>';
      html += '<div class="zd-section-label">🃏 カード一覧</div>';
      cards.forEach(function(c) {
        var typeLabel = c.type === "attack" ? "⚔️攻撃" : c.type === "defense" ? "🛡️防御" : "✨サポート";
        html += '<div class="zd-card-block">';
        html += '<div class="zd-card-header"><span class="zd-type-badge">' + typeLabel + '</span><span class="zd-card-name">' + c.name + '</span><span class="zd-mp">MP' + (c.mpCost || 0) + '</span></div>';
        html += '<div class="zd-card-desc">' + (c.description || "") + '</div>';
        html += '</div>';
      });
      if (setEffect) {
        html += '<div class="zd-section-label">🔗 セット効果</div>';
        html += '<div class="zd-set-effect">' + (setEffect.description || "") + '</div>';
      }
    } else if (type === "equipment") {
      var recipe = GAMEDATA.craftRecipes.find(function(r) { return r.id === id; });
      if (!recipe) return;
      var typeLabel = recipe.type === "weapon" ? "⚔️ 武器" : "🛡️ 防具";
      var emoji = getEquipIcon(recipe);
      var statText = recipe.type === "weapon"
        ? ("物理攻撃+" + (recipe.attackBonus || 0) + " / 魔法攻撃+" + (recipe.magicBonus || 0))
        : ("最大HP+" + (recipe.hpBonus || 0));
      html += '<div class="zd-icon">' + imgOrEmoji(recipe.image, getEquipIcon(recipe), "zd-img") + '</div>';
      html += '<div class="zd-title">' + recipe.name + '</div>';
      html += '<div class="zd-type-badge">' + typeLabel + '</div>';
      html += '<div class="zd-stat-row">' + statText + '</div>';
      html += '<div class="zd-desc">' + (recipe.description || "") + '</div>';
      html += '<div class="zd-section-label">📦 必要素材</div>';
      html += '<div class="zd-materials">';
      html += Object.entries(recipe.materials).map(function(entry) {
        var mat = GAMEDATA.materials.find(function(m) { return m.id === entry[0]; });
        return (MATERIAL_EMOJI[entry[0]] || "📦") + " " + (mat ? mat.name : entry[0]) + ' ×' + entry[1];
      }).join("<br>");
      html += '</div>';
    } else if (type === "stage") {
      var stage = GAMEDATA.stages.find(function(s) { return s.id === id; });
      if (!stage) return;
      html += '<div class="zd-icon">' + imgOrEmoji(stage.image, "🏞️", "zd-img") + '</div>';
      html += '<div class="zd-title">' + stage.name + '</div>';
      html += '<div class="zd-desc">' + (stage.description || "") + '</div>';
      html += '<div class="zd-section-label">📜 探索中のテキスト</div>';
      html += '<div class="zd-stage-texts">';
      if (stage.moveTexts && stage.moveTexts.length > 0) {
        stage.moveTexts.forEach(function(text) {
          html += '<div class="zd-stage-text-row">「' + text + '」</div>';
        });
      } else {
        html += '<div class="zd-stage-text-row">テキストなし</div>';
      }
      html += '</div>';
    }
    content.innerHTML = html;
    showModal("modal-zukan-detail");
    content.scrollTop = 0;
    var box = document.querySelector("#modal-zukan-detail .zukan-detail-box");
    if (box) box.scrollTop = 0;
  }

  // ────────────────────────────────────────────
  //  ストーリーシーン表示
  // ────────────────────────────────────────────
  var STORY_DATA = {
    intro: {
      title: "プロローグ",
      scenes: [
        "ここは「忘れられた記憶」が吹き溜まる街。",
        "あなたは、古びた品々に宿る記憶（メモリア）に導かれるように、この街を訪れた。",
        "ある日、奇妙な古物があなたの手に渡った。",
        "それは、かつてこの街を支配していたとされる「骨董王」の遺物だった。",
        "古物の記憶に導かれるように、あなたは街の奥深くへと足を踏み入れる。",
        "失われた記憶を集め、骨董王の真実に追い着くために。"
      ]
    },
    stage_attic: {
      title: "屋根裏部屋 クリア",
      scenes: [
        "屋根裏部屋の埃っぽい空気が晴れていく。",
        "古物たちが抱えていた小さな未練は、あなたの手によって解き放たれた。",
        "しかし、これはまだ始まりに過ぎない。",
        "微かに感じる「骨董王」の気配を追い、あなたはさらに深い場所へと向かう。"
      ]
    },
    stage_library: {
      title: "古い図書館 クリア",
      scenes: [
        "カビ臭い本たちの囁きが止んだ。",
        "知識の海に沈んでいた記憶たちは、静かに眠りについたようだ。",
        "書物の間に隠されていた古地図が、次なる探索の道を示している。"
      ]
    },
    stage_cathedral: {
      title: "廃墟の礼拝堂 クリア",
      scenes: [
        "神聖な静寂が礼拝堂に戻ってきた。",
        "祈りの声に混じっていた怨念は浄化され、ステンドグラスから差し込む光が少しだけ明るさを増した気がする。"
      ]
    },
    stage_night_market: {
      title: "深夜の骨董市 クリア",
      scenes: [
        "喃騒と熱気に包まれた裏市場の主を打ち倒した。",
        "彼らが取引していたのは、単なる品物ではなく、人々の「記憶」そのものだった。",
        "集められた記憶の奔流が、港の方角を指し示している。"
      ]
    },
    stage_port: {
      title: "霧の港倉庫 クリア",
      scenes: [
        "深い霧が晴れ、潮の香りが鼻を突く。",
        "密輸業者たちが隠し持っていたのは、海を越えて持ち込まれた呼われた品々だった。",
        "彼らの背後には、さらに巨大な闇が広がっている。"
      ]
    },
    stage_factory: {
      title: "廃工場の地下 クリア",
      scenes: [
        "機械の駆動音が止み、不気味な静寂が訪れた。",
        "錆びついた歯車たちが動かしていたのは、狂気の発明家の遺産だった。",
        "工場の奥深くから、奇妙な植物の香りが漂ってくる。"
      ]
    },
    stage_garden: {
      title: "呪われた庭園 クリア",
      scenes: [
        "毒々しい花々が枯れ落ち、庭園は本来の姿を取り戻しつつある。",
        "植物たちを狂わせていたのは、古い呪術の残渣だった。",
        "呪いの根源は、さらに暗く深い場所にあるようだ。"
      ]
    },
    stage_ghost_ship: {
      title: "幽霊船の船倉 クリア",
      scenes: [
        "亡霊たちの怨弾の声が、波音と共に消え去った。",
        "彼らが永遠に守り続けていた財宝の奥に、時を操る奇妙なアーティファクトが隠されていた。"
      ]
    },
    stage_clock_tower: {
      title: "忘れられた時計塔 クリア",
      scenes: [
        "狂ったように時を刻んでいた時計塔の针が、ついに正しい時間を指し示した。",
        "時空の歪みは正され、全ての道は一つの場所へと収束していく。",
        "いよいよ、骨董王が眠る秘密の部屋が目の前にある。"
      ]
    },
    all_clear: {
      title: "エンディング",
      scenes: [
        "ついに「骨董王」は倒れた。",
        "彼が長年集め、そして囚われていた膀大な「記憶」たちが、光の粒子となって街の空へと昇っていく。",
        "あなたが見たのは、ただの暴君ではなく、失われた愛する者の記憶を永遠に留めようとした一人の品しい男の姿だった。",
        "街は本来の時間を取り戻し、古物たちはただの古い品物へと還っていった。",
        "あなたの手元に残った一つの小さなオルゴールが、静かに優しいメロディを奏でている。",
        "―― ヴィンテージ・メモリア。記憶の旅は、ここで一つの終わりを迎える。"
      ]
    }
  };

  function showStoryScene(sceneId, onComplete) {
    var data = STORY_DATA[sceneId];
    if (!data) { if (onComplete) onComplete(); return; }
    Engine.markStorySeen(sceneId);
    Engine.saveGame();
    var sceneIndex = 0;
    var scenes = data.scenes;
    var overlay = document.createElement("div");
    overlay.className = "story-overlay";
    function renderScene() {
      overlay.innerHTML =
        '<div class="story-box">' +
        '  <div class="story-title">' + data.title + '</div>' +
        '  <div class="story-text">' + scenes[sceneIndex] + '</div>' +
        '  <div class="story-progress">' + (sceneIndex + 1) + ' / ' + scenes.length + '</div>' +
        '  <div class="story-buttons">' +
        (sceneIndex < scenes.length - 1
          ? '    <button class="btn btn-primary" id="btn-story-next">次へ ▶</button>'
          : '    <button class="btn btn-primary" id="btn-story-end">閉じる</button>') +
        '    <button class="btn btn-secondary" id="btn-story-skip">スキップ</button>' +
        '  </div>' +
        '</div>';
      var btnNext = overlay.querySelector("#btn-story-next");
      var btnEnd = overlay.querySelector("#btn-story-end");
      var btnSkip = overlay.querySelector("#btn-story-skip");
      if (btnNext) btnNext.onclick = function() { sceneIndex++; renderScene(); };
      if (btnEnd) btnEnd.onclick = function() { document.body.removeChild(overlay); if (onComplete) onComplete(); };
      if (btnSkip) btnSkip.onclick = function() { document.body.removeChild(overlay); if (onComplete) onComplete(); };
    }
    renderScene();
    document.body.appendChild(overlay);
  }

  // ────────────────────────────────────────────
  //  チュートリアル
  // ────────────────────────────────────────────
  var TUTORIAL_STEPS = [
    { title: "「古物」を使って戦う", text: "戦闘は「古物（カード）」を使って行います。毎ターン回復するMPを消費して、攻撃・防御・サポートのカードを使いましょう。" },
    { title: "古物の鑑定（カード入手）", text: "敵を倒すと新たな古物を鑑定（入手）できます。同じ古物でも「攻撃」「防御」「サポート」の3タイプがあります。自分のデッキに合ったものを選びましょう。" },
    { title: "セット効果を狙いましょう", text: "同じ種類の古物（例：懐中時計の攻撃・防御・サポート）を3枚揃えて使うと、強力な「セット効果」が発動します。積極的に狙ってみましょう。" },
    { title: "素材とクラフト", text: "敵が落とす「素材」を集めると、強力な「装備」をクラフトできます。装備は身につけるだけで恒久的なステータスアップをもたらします。" },
    { title: "売却と強化", text: "不要な古物や素材はショップで売却してゴールドに変えられます。ゴールドを使ってお気に入りの古物を強化（アップグレード）しましょう。" }
  ];

  // ────────────────────────────────────────────
  //  ストーリー一覧画面
  // ────────────────────────────────────────────
  function renderStoryScreen() {
    var story = Engine.getStory();
    var seen = story.seenScenes || [];
    var container = document.getElementById("story-list");
    var STORY_ORDER = [
      "intro",
      "stage_attic", "stage_library", "stage_cathedral", "stage_night_market",
      "stage_port", "stage_factory", "stage_garden", "stage_ghost_ship",
      "stage_clock_tower", "all_clear"
    ];
    var STORY_LABELS = {
      intro: "プロローグ",
      stage_attic: "屋根裏部屋 クリア",
      stage_library: "古い図書館 クリア",
      stage_cathedral: "廃墟の礼拝堂 クリア",
      stage_night_market: "深夜の骨董市 クリア",
      stage_port: "霧の港倉庫 クリア",
      stage_factory: "廃工場の地下 クリア",
      stage_garden: "呪われた庭園 クリア",
      stage_ghost_ship: "幽霊船の船倉 クリア",
      stage_clock_tower: "忘れられた時計塔 クリア",
      all_clear: "エンディング"
    };
    var html = "";
    STORY_ORDER.forEach(function(sceneId) {
      var isSeen = seen.indexOf(sceneId) !== -1;
      var label = STORY_LABELS[sceneId] || sceneId;
      if (isSeen) {
        html += '<div class="story-list-item story-list-seen" data-scene="' + sceneId + '">' +
          '<span class="story-list-icon">📜</span>' +
          '<span class="story-list-title">' + label + '</span>' +
          '<span class="story-list-badge">閲覧済</span>' +
          '</div>';
      } else {
        html += '<div class="story-list-item story-list-locked">' +
          '<span class="story-list-icon">🔒</span>' +
          '<span class="story-list-title">？？？</span>' +
          '</div>';
      }
    });
    container.innerHTML = html;
    container.querySelectorAll(".story-list-seen").forEach(function(el) {
      el.onclick = function() {
        var sceneId = el.dataset.scene;
        showStoryScene(sceneId, function() {
          showScreen("screen-story");
        });
      };
    });
  }

  // ────────────────────────────────────────────
  //  ヘルプ画面
  // ────────────────────────────────────────────
  var HELP_SECTIONS = [
    {
      icon: "⚔️",
      title: "戦闘の流れ",
      body: "戦闘はターン制で進みます。プレイヤーターンにカードを使い、ターン終了で敵のターンに移ります。HPが0になると戦闘敗北です。"
    },
    {
      icon: "🃏",
      title: "カードの種類",
      body: "カードには「攻撃」「防御」「サポート」の3種類があります。攻撃は敵にダメージ、防御はガードを張りダメージを軽減、サポートはHP回復・MP回復・状態異常付与などの補助効果を発揮します。デッキに入れられるカードは最大15枚です。"
    },
    {
      icon: "💎",
      title: "MPの最低保証",
      body: "各ターン開始時、MPが5以下の場合は自動的に5まで補充されます。MPが完全に枯渇しても最低5は保証されるため、カードを使い続けることができます。"
    },
    {
      icon: "🔗",
      title: "セット効果",
      body: "同じ古物の攻撃・防御・サポートカードを3枚全て揃えると、その古物の「セット効果」が発動します。セット効果は各古物によって異なり、強力な追加効果を発揮します。"
    },
    {
      icon: "🛡️",
      title: "ガードとダメージ計算",
      body: "防御カードを使うとガード値が設定されます。次に受ける攻撃は「攻撃力 − ガード」のダメージになります（最小0）。ガードは1回の攻撃で消費されます。"
    },
    {
      icon: "✨",
      title: "ステータス専用効果",
      body: "燻し（burn）：毎ターンダメージを受ける。毒（poison）：毎ターン増加するダメージを受ける。防御低下（defDown）：次の攻撃がガードを無視する。"
    },
    {
      icon: "🔨",
      title: "素材とクラフト",
      body: "敵を倒すと素材を入手できます。「クラフト」画面で必要素材を満たすと強力な装備を作成できます。装備は装備タブから装備できます。"
    },
    {
      icon: "💰",
      title: "ゴールドの使い方",
      body: "ゴールドは敵を倒すと入手できます。「強化・売却」画面でカードのアップグレードやステータス強化に使えます。不要な素材やカードの売却にも使えます。"
    },
    {
      icon: "🍞",
      title: "食料について",
      body: "食料はマップ画面の「🍞」ボタンから使用できます。使うとHPを回復します。食料はホームに戻ると補充されます。食料が尽きた状態でさらに消費が発生すると、強制的にホームへ送還されます。探索中は食料の残量に注意しましょう。"
    },
    {
      icon: "🏠",
      title: "ホームへ戻るとき",
      body: "探索中に「戻る」ボタンを押すとホームに戻れます。ホームに戻るとHPとMPが回復します。セーブも自動で行われます。"
    }
  ];

  function renderHelpScreen() {
    var container = document.getElementById("help-content");
    var html = "";
    HELP_SECTIONS.forEach(function(sec) {
      html += '<div class="help-section">' +
        '<div class="help-section-header"><span class="help-icon">' + sec.icon + '</span><span class="help-title">' + sec.title + '</span></div>' +
        '<div class="help-body">' + sec.body + '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  function showTutorial(onComplete) {
    var stepIndex = 0;
    var overlay = document.createElement("div");
    overlay.className = "story-overlay";
    function renderStep() {
      var step = TUTORIAL_STEPS[stepIndex];
      overlay.innerHTML =
        '<div class="story-box tutorial-box">' +
        '  <div class="story-title">📚 骨董商の心得 ' + (stepIndex + 1) + '/' + TUTORIAL_STEPS.length + '</div>' +
        '  <div class="tutorial-step-title">' + step.title + '</div>' +
        '  <div class="story-text">' + step.text + '</div>' +
        '  <div class="story-buttons">' +
        (stepIndex < TUTORIAL_STEPS.length - 1
          ? '    <button class="btn btn-primary" id="btn-tut-next">次へ ▶</button>'
          : '    <button class="btn btn-primary" id="btn-tut-end">出発！</button>') +
        '    <button class="btn btn-secondary" id="btn-tut-skip">スキップ</button>' +
        '  </div>' +
        '</div>';
      var btnNext = overlay.querySelector("#btn-tut-next");
      var btnEnd = overlay.querySelector("#btn-tut-end");
      var btnSkip = overlay.querySelector("#btn-tut-skip");
      if (btnNext) btnNext.onclick = function() { AudioManager.playSe("button"); stepIndex++; renderStep(); };
      if (btnEnd) btnEnd.onclick = function() { AudioManager.playSe("open"); document.body.removeChild(overlay); if (onComplete) onComplete(); };
      if (btnSkip) btnSkip.onclick = function() { AudioManager.playSe("back"); document.body.removeChild(overlay); if (onComplete) onComplete(); };
    }
    renderStep();
    document.body.appendChild(overlay);
  }

  function start() {
    // 設定パネル初期化
    _initAudioPanel();
    initTitle();
  }

  function _initAudioPanel() {
    var s = AudioManager.getSettings();

    // 初期値をUIに反映
    var chkBgm = document.getElementById("chk-bgm-on");
    var chkSe  = document.getElementById("chk-se-on");
    var range  = document.getElementById("range-bgm-volume");
    var lbl    = document.getElementById("lbl-bgm-volume");
    if (chkBgm) chkBgm.checked = s.bgmOn;
    if (chkSe)  chkSe.checked  = s.seOn;
    if (range)  range.value    = s.bgmVolume;
    if (lbl)    lbl.textContent = Math.round(s.bgmVolume * 100) + "%";

    // ⚙️ボタン → パネル開閉
    var btn   = document.getElementById("btn-audio-settings");
    var panel = document.getElementById("panel-audio-settings");
    if (btn && panel) {
      btn.onclick = function(e) {
        e.stopPropagation();
        panel.classList.toggle("hidden");
      };
      // 閉じるボタン
      var closeBtn = document.getElementById("btn-audio-panel-close");
      if (closeBtn) closeBtn.onclick = function() { panel.classList.add("hidden"); };
      // パネル外クリックで閉じる
      document.addEventListener("click", function(e) {
        if (!panel.classList.contains("hidden") &&
            !panel.contains(e.target) &&
            e.target !== btn) {
          panel.classList.add("hidden");
        }
      });
    }

    // BGMトグル
    if (chkBgm) chkBgm.onchange = function() {
      AudioManager.setBgmOn(this.checked);
    };

    // SEトグル
    if (chkSe) chkSe.onchange = function() {
      AudioManager.setSeOn(this.checked);
    };

    // BGM音量スライダー
    if (range) range.oninput = function() {
      var v = parseFloat(this.value);
      AudioManager.setBgmVolume(v);
      if (lbl) lbl.textContent = Math.round(v * 100) + "%";
    };
  }

  return {
    start: start,
    initHome: initHome,
    initMap: initMap,
    initBattle: initBattle,
    initCardChoice: initCardChoice,
    showToast: showToast
  };

})();

window.addEventListener("DOMContentLoaded", function() { UI.start(); });
