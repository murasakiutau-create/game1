// ============================================================
//  ヴィンテージ・メモリア  ―  ゲームエンジン v2.0
// ============================================================

const Engine = (() => {

  // ──────────────────────────────────────────────
  //  ユーティリティ
  // ──────────────────────────────────────────────
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randFloat = () => Math.random();
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const deepClone = obj => JSON.parse(JSON.stringify(obj));

  // ──────────────────────────────────────────────
  //  ゲーム状態
  // ──────────────────────────────────────────────
  let state = null;

  // ──────────────────────────────────────────────
  //  初期化（職業選択後に呼ぶ）
  // ──────────────────────────────────────────────
  function init(jobId) {
    const pb = GAMEDATA.playerBase;
    const job = GAMEDATA.jobs.find(j => j.id === jobId);
    if (!job) throw new Error("Invalid jobId: " + jobId);

    state = {
      player: {
        name: "プレイヤー",
        jobId: job.id,
        jobName: job.name,
        hp: pb.hp,
        maxHp: pb.maxHp,
        mp: pb.mp,
        maxMp: pb.maxMp,
        attackBonus: pb.attackBonus,
        physicalBonus: 0,
        magicBonus: 0,
        level: pb.level,
        exp: pb.exp,
        expToNext: pb.expToNext,
        gold: pb.gold,
        shield: 0,
        statusEffects: [],
        buffs: [],
        // 装備スロット
        equipment: { weapon: null, armor: null },
        // ステータス強化段階（職業ごと）
        statUpgrades: { hp: 0, mp: 0, attack: 0 }
      },
      // デッキスロット（3セット）
      decks: [[...job.starterDeck], [], []],
      activeDeckIndex: 0,
      // 現在アクティブなデッキ（decks[activeDeckIndex]への参照として使用）
      fullDeck: [...job.starterDeck],
      // カード強化段階（cardId -> level 0-5）
      cardUpgrades: {},
      drawPile: [],
      hand: [],
      discardPile: [],
      // インベントリ
      inventory: {
        materials: {},      // materialId -> count
        pendingDrops: []    // 種別選択待ちの古物 { sourceId, enemyName }
      },
      // 戦闘状態
      battle: null,
      // 探索状態
      currentStageId: "attic",
      currentFloor: 0,
      battleCount: 0,
      gamePhase: "home",   // home | job_select | map | battle | card_choice | stage_clear | gameover
      // クリア済みステージ
      clearedStages: [],
      // 職業別ステータス保持（jobId -> stats）
      jobStats: {},
      // 図鑑解放データ
      zukan: {
        enemies: [],    // 遭遇した敵のid一覧
        cards: [],      // 入手したカードのid一覧（sourceId単位）
        equipment: []   // クラフトした装備のid一覧
      },
      // ストーリー解放データ
      story: {
        seenScenes: []  // 閲覧済みシーンID一覧
      }
    };
    // 初期デッキのカードを図鑑に解放済みとして登録
    job.starterDeck.forEach(function(cardId) {
      var cardDef = GAMEDATA.cards.find(function(c) { return c.id === cardId; });
      if (cardDef && cardDef.sourceId && state.zukan.cards.indexOf(cardDef.sourceId) === -1) {
        state.zukan.cards.push(cardDef.sourceId);
      }
    });
    return state;
  }

  function getState() { return state; }

  function setState(s) { state = s; }

  // 職業別ステータスを保存するヘルパー
  function _saveCurrentJobStats() {
    if (!state) return;
    const p = state.player;
    if (!state.jobStats) state.jobStats = {};
    state.jobStats[p.jobId] = {
      level: p.level,
      exp: p.exp,
      expToNext: p.expToNext,
      maxHp: p.maxHp,
      hp: p.hp,
      maxMp: p.maxMp,
      mp: p.mp,
      statUpgrades: deepClone(p.statUpgrades)
    };
  }

  // 職業別ステータスを復元するヘルパー（なければ初期値）
  function _restoreJobStats(jobId) {
    const pb = GAMEDATA.playerBase;
    const saved = state.jobStats && state.jobStats[jobId];
    if (saved) {
      state.player.level = saved.level;
      state.player.exp = saved.exp;
      state.player.expToNext = saved.expToNext;
      state.player.maxHp = saved.maxHp;
      state.player.hp = saved.hp;
      state.player.maxMp = saved.maxMp;
      state.player.mp = saved.mp;
      state.player.statUpgrades = deepClone(saved.statUpgrades);
    } else {
      // 初めて選択する職業は初期値
      state.player.level = pb.level;
      state.player.exp = pb.exp;
      state.player.expToNext = pb.expToNext;
      state.player.maxHp = pb.maxHp;
      state.player.hp = pb.maxHp;
      state.player.maxMp = pb.maxMp;
      state.player.mp = pb.maxMp;
      state.player.statUpgrades = { hp: 0, mp: 0, attack: 0 };
    }
  }

  // 職業変更（ホーム画面から呼び出す）
  function changeJob(jobId) {
    const job = GAMEDATA.jobs.find(j => j.id === jobId);
    if (!job) return;
    // 現在職業のステータスを保存
    _saveCurrentJobStats();
    // 新職業に切り替え
    state.player.jobId = job.id;
    state.player.jobName = job.name;
    state.player.shield = 0;
    state.player.statusEffects = [];
    state.player.buffs = [];
    // 新職業のステータスを復元（初回は初期値、以前の状態があればそれ）
    _restoreJobStats(job.id);
    // デッキ・ゴールド・素材・装備・カード強化は引き継ぎ
    state.drawPile = [];
    state.hand = [];
    state.discardPile = [];
    state.gamePhase = "home";
  }

  // ──────────────────────────────────────────────
  //  携帯食料
  //  最大HP分の食料を持ってダンジョンへ
  // ──────────────────────────────────────────────
  function getMaxFood() {
    if (!state) return 0;
    return state.player.maxHp;
  }

  function startExploration(stageId) {
    state.currentStageId = stageId;
    state.currentFloor = 0;
    state.battleCount = 0;
    // 携帯食料をセット（最大HP分）
    state.food = state.player.maxHp;
    state.gamePhase = "map";
  }

  // 食料を使ってHP回復（戦闘後に任意で）
  function useFood(amount) {
    if (!state.food || state.food <= 0) return { success: false, reason: "no_food" };
    // 1個使うごとに1HP回復・1個消費
    const actualHeal = Math.min(1, state.player.maxHp - state.player.hp);
    state.player.hp = clamp(state.player.hp + actualHeal, 0, state.player.maxHp);
    state.food -= 1;
    return { success: true, healed: actualHeal, foodLeft: state.food };
  }

  // ホーム帰還時にHP・MP全回復
  function recoverAtHome() {
    state.player.hp = state.player.maxHp;
    state.player.mp = state.player.maxMp;
  }

  // 食料が0になったらホームへ強制送還
  function checkFoodAndReturn() {
    if (state.food !== undefined && state.food <= 0 && state.player.hp > 0) {
      state.gamePhase = "home";
      return true;
    }
    return false;
  }

  // ──────────────────────────────────────────────
  //  デッキ操作
  // ──────────────────────────────────────────────
  function shuffleDeck() {
    const pile = [...state.fullDeck];
    for (let i = pile.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [pile[i], pile[j]] = [pile[j], pile[i]];
    }
    state.drawPile = pile;
    state.hand = [];
    state.discardPile = [];
  }

  function drawCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (state.drawPile.length === 0) {
        if (state.discardPile.length === 0) break;
        state.drawPile = state.discardPile.sort(() => Math.random() - 0.5);
        state.discardPile = [];
      }
      drawn.push(state.drawPile.shift());
    }
    state.hand.push(...drawn);
    return drawn;
  }

  function discardHand() {
    state.discardPile.push(...state.hand);
    state.hand = [];
  }

  // デッキスロット切り替え（0/1/2）
  function switchDeckIndex(idx) {
    if (idx < 0 || idx > 2) return;
    // 現在のデッキをdecksに保存
    state.decks[state.activeDeckIndex] = [...state.fullDeck];
    state.activeDeckIndex = idx;
    state.fullDeck = [...state.decks[idx]];
  }

  // 指定スロットのデッキを現在のスロットにコピー（上書き）
  function copyDeck(fromIndex) {
    if (fromIndex < 0 || fromIndex > 2) return { success: false };
    if (fromIndex === state.activeDeckIndex) return { success: false, reason: "same_deck" };
    // コピー元のデッキを取得（現在アクティブなデッキは一度保存）
    state.decks[state.activeDeckIndex] = [...state.fullDeck];
    const source = [...state.decks[fromIndex]];
    state.decks[state.activeDeckIndex] = source;
    state.fullDeck = [...source];
    return { success: true };
  }

  // デッキにカードを追加（15枚・同一カード3枚制限）
  function addCardToDeck(cardId) {
    if (state.fullDeck.length >= 15) return { success: false, reason: "deck_full" };
    const sameCount = state.fullDeck.filter(id => id === cardId).length;
    if (sameCount >= 3) return { success: false, reason: "max_copies" };
    state.fullDeck.push(cardId);
    state.decks[state.activeDeckIndex] = [...state.fullDeck];
    return { success: true };
  }

  function removeCardFromDeck(cardId) {
    const idx = state.fullDeck.indexOf(cardId);
    if (idx === -1) return false;
    state.fullDeck.splice(idx, 1);
    state.decks[state.activeDeckIndex] = [...state.fullDeck];
    return true;
  }

  function getCardData(cardId) {
    return GAMEDATA.cards.find(c => c.id === cardId) || null;
  }

  // カードの現在の効果値（強化段階を反映）
  function getCardEffectValue(cardId) {
    const card = getCardData(cardId);
    if (!card) return null;
    const upgradeLevel = state.cardUpgrades[cardId] || 0;
    // 強化ボーナス：各段階で baseValue * 0.2 ずつ加算
    const bonus = Math.floor(card.baseValue * 0.2 * upgradeLevel);
    return card.baseValue + bonus;
  }

  // デッキ内の同カードのセット効果を確認
  function getActiveSetEffects() {
    const countMap = {};
    state.fullDeck.forEach(id => {
      const card = getCardData(id);
      if (!card || !card.setEffect) return;
      countMap[card.setEffect.key] = (countMap[card.setEffect.key] || 0) + 1;
    });
    const active = {};
    Object.entries(countMap).forEach(([key, count]) => {
      if (count >= 3) active[key] = true;
    });
    return active;
  }

  // ──────────────────────────────────────────────
  //  売却システム
  // ──────────────────────────────────────────────
  // 余ったカード（デッキ外）を売却
  function sellCard(cardId) {
    const card = getCardData(cardId);
    if (!card) return { success: false, reason: "invalid_card" };
    // pendingDropsから消費
    const idx = state.inventory.pendingDrops.findIndex(d => {
      const c = GAMEDATA.cards.find(c2 => c2.sourceId === d.sourceId && c2.id === cardId);
      return !!c;
    });
    // 既にデッキ外の余剰カードとして管理している場合
    const surplusIdx = state.inventory.surplusCards
      ? state.inventory.surplusCards.indexOf(cardId)
      : -1;
    if (surplusIdx !== -1) {
      state.inventory.surplusCards.splice(surplusIdx, 1);
      state.player.gold += card.sellPrice;
      return { success: true, gold: card.sellPrice };
    }
    return { success: false, reason: "card_not_in_surplus" };
  }

  // 素材を売却
  function sellMaterial(materialId, count = 1) {
    const mat = GAMEDATA.materials.find(m => m.id === materialId);
    if (!mat) return { success: false, reason: "invalid_material" };
    const have = state.inventory.materials[materialId] || 0;
    if (have < count) return { success: false, reason: "not_enough" };
    state.inventory.materials[materialId] -= count;
    if (state.inventory.materials[materialId] <= 0) delete state.inventory.materials[materialId];
    const earned = mat.sellPrice * count;
    state.player.gold += earned;
    return { success: true, gold: earned };
  }

  // ──────────────────────────────────────────────
  //  カード強化（ゴールドで購入）
  // ──────────────────────────────────────────────
  function upgradeCard(cardId) {
    const card = getCardData(cardId);
    if (!card) return { success: false, reason: "invalid_card" };
    const currentLevel = state.cardUpgrades[cardId] || 0;
    if (currentLevel >= 5) return { success: false, reason: "max_level" };
    const cost = GAMEDATA.cardUpgradeCost[currentLevel];
    if (state.player.gold < cost) return { success: false, reason: "not_enough_gold" };
    state.player.gold -= cost;
    state.cardUpgrades[cardId] = currentLevel + 1;
    return { success: true, newLevel: currentLevel + 1, cost };
  }

  // ──────────────────────────────────────────────
  //  キャラクターステータス強化
  // ──────────────────────────────────────────────
  function upgradePlayerStat(statKey) {
    const validStats = ["hp", "mp", "attack"];
    if (!validStats.includes(statKey)) return { success: false, reason: "invalid_stat" };
    const currentLevel = state.player.statUpgrades[statKey] || 0;
    // 上限なし、段階ごとに高額化（基本コスト * 1.5^レベル、最低100G）
    const cost = Math.floor(Math.max(100, 100 * Math.pow(1.5, currentLevel)));
    if (state.player.gold < cost) return { success: false, reason: "not_enough_gold" };
    state.player.gold -= cost;
    state.player.statUpgrades[statKey] = currentLevel + 1;
    // 1ずつ上昇
    if (statKey === "hp") {
      state.player.maxHp += 1;
      state.player.hp = Math.min(state.player.hp + 1, state.player.maxHp);
    } else if (statKey === "mp") {
      state.player.maxMp += 1;
      state.player.mp = Math.min(state.player.mp + 1, state.player.maxMp);
    } else if (statKey === "attack") {
      state.player.attackBonus += 1;
    }
    return { success: true, newLevel: currentLevel + 1, cost };
  }

  // ──────────────────────────────────────────────
  //  装備クラフト
  // ──────────────────────────────────────────────
  function craftEquipment(recipeId) {
    const recipe = GAMEDATA.craftRecipes.find(r => r.id === recipeId);
    if (!recipe) return { success: false, reason: "invalid_recipe" };
    // 素材チェック
    for (const [matId, need] of Object.entries(recipe.materials)) {
      const have = state.inventory.materials[matId] || 0;
      if (have < need) return { success: false, reason: "not_enough_materials", missing: matId };
    }
    // 素材消費
    for (const [matId, need] of Object.entries(recipe.materials)) {
      state.inventory.materials[matId] -= need;
      if (state.inventory.materials[matId] <= 0) delete state.inventory.materials[matId];
    }
    // 装備品をインベントリに追加
    if (!state.inventory.equipment) state.inventory.equipment = [];
    state.inventory.equipment.push(recipeId);
    // 図鑑に装備を記録
    if (!state.zukan) state.zukan = { enemies: [], cards: [], equipment: [] };
    if (state.zukan.equipment.indexOf(recipeId) === -1) {
      state.zukan.equipment.push(recipeId);
    }
    return { success: true, item: recipe };
  }

  // 装備を装着
  function equipItem(recipeId) {
    const recipe = GAMEDATA.craftRecipes.find(r => r.id === recipeId);
    if (!recipe) return { success: false, reason: "invalid_recipe" };
    const invIdx = state.inventory.equipment
      ? state.inventory.equipment.indexOf(recipeId)
      : -1;
    if (invIdx === -1) return { success: false, reason: "not_in_inventory" };

    // 現在の装備を外す
    const slot = recipe.type; // "weapon" or "armor"
    const oldEquip = state.player.equipment[slot];
    if (oldEquip) {
      const oldRecipe = GAMEDATA.craftRecipes.find(r => r.id === oldEquip);
      if (oldRecipe) {
        state.player.physicalBonus = (state.player.physicalBonus || 0) - (oldRecipe.physicalBonus || oldRecipe.attackBonus || 0);
        state.player.magicBonus = (state.player.magicBonus || 0) - (oldRecipe.magicBonus || 0);
        state.player.maxHp -= oldRecipe.hpBonus;
        state.player.hp = Math.min(state.player.hp, state.player.maxHp);
      }
      // 外した装備をインベントリに戻す
      state.inventory.equipment.push(oldEquip);
    }

    // 新しい装備を装着
    state.inventory.equipment.splice(invIdx, 1);
    state.player.equipment[slot] = recipeId;
    state.player.physicalBonus = (state.player.physicalBonus || 0) + (recipe.physicalBonus || 0);
    state.player.magicBonus = (state.player.magicBonus || 0) + (recipe.magicBonus || 0);
    state.player.maxHp += recipe.hpBonus;
    state.player.hp = Math.min(state.player.hp + recipe.hpBonus, state.player.maxHp);

    return { success: true, equipped: recipe };
  }

  // 装備を外す
  function unequipItem(slot) {
    const equippedId = state.player.equipment[slot];
    if (!equippedId) return { success: false, reason: "nothing_equipped" };
    const recipe = GAMEDATA.craftRecipes.find(r => r.id === equippedId);
    if (recipe) {
      state.player.physicalBonus = (state.player.physicalBonus || 0) - (recipe.physicalBonus || recipe.attackBonus || 0);
      state.player.magicBonus = (state.player.magicBonus || 0) - (recipe.magicBonus || 0);
      state.player.maxHp -= recipe.hpBonus;
      state.player.hp = Math.min(state.player.hp, state.player.maxHp);
      if (!state.inventory.equipment) state.inventory.equipment = [];
      state.inventory.equipment.push(equippedId);
    }
    state.player.equipment[slot] = null;
    return { success: true };
  }

  // ──────────────────────────────────────────────
  //  戦闘初期化
  // ──────────────────────────────────────────────
  function startBattle(stageId) {
    const stage = GAMEDATA.stages.find(s => s.id === stageId);
    if (!stage) return null;

    state.battleCount++;
    state.currentFloor++;

    // ボス出現判定：半分の階数（midFloor）と最終階（maxFloor）のみ
    var midFloor = Math.floor(stage.maxFloor / 2);
    var isMidBoss  = state.currentFloor === midFloor;
    var isFinalBoss = state.currentFloor >= stage.maxFloor;
    var isBoss = isMidBoss || isFinalBoss;

    let enemies = [];

    if (isBoss) {
      const bossData = deepClone(GAMEDATA.enemies.find(e => e.id === stage.boss));
      bossData.actionIndex = 0;
      bossData.statusEffects = [];
      bossData.buffs = [];
      enemies.push(bossData);
      // 最終階では必ず取り巻き付き、中間ボスは単体
      if (isFinalBoss && stage.bossMinions && stage.bossMinions.length > 0) {
        const minionId = stage.bossMinions[rand(0, stage.bossMinions.length - 1)];
        const minionData = deepClone(GAMEDATA.enemies.find(e => e.id === minionId));
        minionData.actionIndex = 0;
        minionData.statusEffects = [];
        minionData.buffs = [];
        enemies.push(minionData);
      }
    } else {
      const enemyId = stage.enemies[rand(0, stage.enemies.length - 1)];
      const enemyData = deepClone(GAMEDATA.enemies.find(e => e.id === enemyId));
      enemyData.actionIndex = 0;
      enemyData.statusEffects = [];
      enemyData.buffs = [];
      enemies.push(enemyData);
      if (randFloat() < stage.multiEnemyChance) {
        const anotherEnemyId = stage.enemies[rand(0, stage.enemies.length - 1)];
        const anotherEnemy = deepClone(GAMEDATA.enemies.find(e => e.id === anotherEnemyId));
        anotherEnemy.actionIndex = 0;
        anotherEnemy.statusEffects = [];
        anotherEnemy.buffs = [];
        enemies.push(anotherEnemy);
      }
    }

    // 図鑑に敵を記録
    if (!state.zukan) state.zukan = { enemies: [], cards: [], equipment: [] };
    enemies.forEach(function(e) {
      if (e && e.id && state.zukan.enemies.indexOf(e.id) === -1) {
        state.zukan.enemies.push(e.id);
      }
    });

    shuffleDeck();
    state.player.shield = 0;
    state.player.statusEffects = [];
    state.player.buffs = [];

    state.battle = {
      enemies,
      isBoss,
      turn: 1,
      phase: "player",
      log: [],
      targetIndex: 0,
      pendingEffects: {
        nextMagicDamageBonus: 1.0,
        nextCardCostHalf: false,
        blockNextAttack: 0,
        allCostDown: 0,
        nextTurnMpBonus: 0,
        candleReflectBurn: null,
        firstTurnBookDiscount: false  // 古書セット：戦闘開始最初のターンのみ魔法MP-1
      }
    };

    state.gamePhase = "battle";
    // ターン1開始時もMP最低保証5
    if (state.player.mp < 5) {
      state.player.mp = 5;
    }
    // 記憶術師：手札上限６枚、それ以外は５枚
    const initHandLimit = state.player.jobId === "mnemonist" ? 6 : 5;
    // 古書セット効果：戦闘開始時にアクティブなら最初のターンのみ有効
    const initSetEffects = getActiveSetEffects();
    if (initSetEffects.bookSetMpDiscount) {
      state.battle.pendingEffects.firstTurnBookDiscount = true;
    }
    drawCards(initHandLimit);
    previewEnemyActions();
    return state.battle;
  }

  // 予告型：次の敵行動を設定
  function previewEnemyActions() {
    state.battle.enemies.forEach(enemy => {
      const pattern = enemy.actionPattern;
      const idx = enemy.actionIndex % pattern.length;
      enemy.nextAction = enemy.actions[pattern[idx]];
      enemy.nextNextAction = null;
    });
  }

  // ──────────────────────────────────────────────
  //  カードプレイ
  // ──────────────────────────────────────────────
  function playCard(handIndex, targetEnemyIndex = 0) {
    const battle = state.battle;
    if (!battle || battle.phase !== "player") return { success: false, reason: "not_player_turn" };

    const cardId = state.hand[handIndex];
    if (!cardId) return { success: false, reason: "invalid_hand_index" };

    const card = getCardData(cardId);
    if (!card) return { success: false, reason: "card_not_found" };

    // MPコスト計算
    let cost = card.mpCost;
    if (battle.pendingEffects.nextCardCostHalf) {
      cost = Math.ceil(cost / 2);
      battle.pendingEffects.nextCardCostHalf = false;
    }
    const magicCostBuff = state.player.buffs.find(b => b.type === "magicCostDown");
    if (magicCostBuff && card.affinity === "magic") {
      cost = Math.max(0, cost - magicCostBuff.value);
    }
    // 古書セット効果（戦闘開始最初のターンのみ魔法コスト-1）
    if (battle.pendingEffects.firstTurnBookDiscount && card.affinity === "magic") {
      cost = Math.max(0, cost - 1);
    }
    // 灯火の加護セット効果（allCostDown）
    if (battle.pendingEffects.allCostDown) {
      cost = Math.max(0, cost - battle.pendingEffects.allCostDown);
    }

    if (state.player.mp < cost) return { success: false, reason: "not_enough_mp" };

    state.player.mp -= cost;
    state.hand.splice(handIndex, 1);
    state.discardPile.push(cardId);

    const result = applyCardEffect(card, targetEnemyIndex);

    if (card.effect.drawCards) {
      drawCards(card.effect.drawCards);
    }

    battle.log.push({ type: "player_card", cardName: card.name, ...result });

    // 全敵撃破チェック
    if (battle.enemies.every(e => e.hp <= 0)) {
      const endResult = endBattle();
      return { success: true, result, battleEnd: endResult };
    }

    // 現在のターゲットが死亡していたら、生存している敵に自動切り替え
    if (battle.enemies[battle.targetIndex] && battle.enemies[battle.targetIndex].hp <= 0) {
      const aliveIdx = battle.enemies.findIndex(e => e.hp > 0);
      if (aliveIdx !== -1) {
        battle.targetIndex = aliveIdx;
        result.autoTargetChanged = aliveIdx;
      }
    }

    return { success: true, result };
  }

  function applyCardEffect(card, targetEnemyIndex) {
    const battle = state.battle;
    const player = state.player;
    const enemies = battle.enemies;
    const target = enemies[targetEnemyIndex] || enemies[0];
    const result = {};
    const activeSetEffects = getActiveSetEffects();

    // 強化段階による効果値補正
    const upgradeLevel = state.cardUpgrades[card.id] || 0;
    const upgradeMultiplier = 1 + 0.2 * upgradeLevel;

    switch (card.type) {
      case "attack": {
        let baseDmg = Math.round((card.effect.damage || 0) * upgradeMultiplier);
        // 装備による攻撃ボーナス（物理カードは物理ボーナス、魔法カードは魔法ボーナス）
        if (card.affinity === "magic") {
          baseDmg += (player.magicBonus || 0);
        } else {
          baseDmg += (player.physicalBonus || 0);
        }
        // 魔法ダメージボーナス（記録カード）
        if (card.affinity === "magic" && battle.pendingEffects.nextMagicDamageBonus > 1.0) {
          baseDmg = Math.round(baseDmg * battle.pendingEffects.nextMagicDamageBonus);
          battle.pendingEffects.nextMagicDamageBonus = 1.0;
        }
        // インクセット効果（魔法ダメージ+3）
        if (activeSetEffects.inkSetMagicBonus && card.affinity === "magic") {
          baseDmg += 3;
        }
        // 音楽セット効果（混乱敵へのダメージ+50%）
        if (activeSetEffects.musicSetConfuseBonus) {
          const isConfused = target.statusEffects && target.statusEffects.find(e => e.type === "confuse");
          if (isConfused) baseDmg = Math.round(baseDmg * 1.5);
        }
        // 蝋燭セット効果（燻し状態の敵へのダメージ+3）
        if (activeSetEffects.candleSetBurnBonus) {
          const isBurning = target.statusEffects && target.statusEffects.find(e => e.type === "burn");
          if (isBurning) baseDmg += 3;
        }
        // コンパスセット効果（方位の刃が敵全体を攻撃）
        if (activeSetEffects.compassSetAllAttack && card.id === "compass_attack") {
          enemies.forEach((e, i) => {
            if (i !== targetEnemyIndex && e.hp > 0) {
              const absorbed = Math.min(e.shield, baseDmg);
              e.shield -= absorbed;
              e.hp = clamp(e.hp - (baseDmg - absorbed), 0, e.maxHp);
            }
          });
        }
        // 鍵束セット効果（混乱付与が必中）
        if (activeSetEffects.keyringSetConfuseGuarantee && card.id === "keyring_attack") {
          applyStatusEffect(target, { type: "confuse", duration: 1 });
          result.statusEffect = "confuse";
        }
        // 敵の防御デバフ
        const defDebuff = target.statusEffects && target.statusEffects.find(e => e.type === "defenseDown");
        if (defDebuff) baseDmg = Math.round(baseDmg / defDebuff.value);

        // 全体攻撃（反射光）
        if (card.effect.allEnemies) {
          const ignoreShield = activeSetEffects.mirrorSetIgnoreShield || activeSetEffects.radioSetIgnoreShield;
          enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            // 弱点チェック（弱点属性なら1.5倍）
            const affinity = card.affinity === "magic" ? "magic" : "physical";
            const isWeak = enemy.weakness === affinity || enemy.weakness === "both";
            const adjDmg = isWeak ? Math.round(baseDmg * 1.5) : baseDmg;
            if (ignoreShield) {
              enemy.hp = clamp(enemy.hp - adjDmg, 0, enemy.maxHp);
            } else {
              const absorbed = Math.min(enemy.shield, adjDmg);
              enemy.shield = Math.max(0, enemy.shield - adjDmg);
              enemy.hp = clamp(enemy.hp - (adjDmg - absorbed), 0, enemy.maxHp);
            }
          });
          // 表示用ダメージはターゲットへの値
          const affinityT = card.affinity === "magic" ? "magic" : "physical";
          const isWeakT = target.weakness === affinityT || target.weakness === "both";
          result.damage = isWeakT ? Math.round(baseDmg * 1.5) : baseDmg;
          result.isWeak = isWeakT;
          result.allEnemies = true;
        } else {
          // 弱点チェック（弱点属性なら1.5倍）
          const affinity = card.affinity === "magic" ? "magic" : "physical";
          const isWeak = target.weakness === affinity || target.weakness === "both";
          const adjDmg = isWeak ? Math.round(baseDmg * 1.5) : baseDmg;
          const absorbed = Math.min(target.shield, adjDmg);
          target.shield = Math.max(0, target.shield - adjDmg);
          target.hp = clamp(target.hp - (adjDmg - absorbed), 0, target.maxHp);
          result.damage = adjDmg;
          result.isWeak = isWeak;
          result.shieldAbsorbed = absorbed;
        }

        if (card.effect.statusEffect) {
          let effect = deepClone(card.effect.statusEffect);
          // ランタンセット効果（燻しダメージ+2）
          if (activeSetEffects.lanternSetBurnBonus && effect.type === "burn") {
            effect.damagePerTurn += 2;
          }
          applyStatusEffect(target, effect);
          result.statusApplied = effect.type;
        }
        break;
      }
      case "defense": {
        if (card.effect.shield) {
          const shieldVal = Math.round(card.effect.shield * upgradeMultiplier);
          // 懐中時計セット効果（毎ターンガード+3は別途処理）
          player.shield += shieldVal;
          result.shield = shieldVal;
        }
        if (card.effect.blockNextAttack) {
          battle.pendingEffects.blockNextAttack += card.effect.blockNextAttack;
          result.blockNextAttack = card.effect.blockNextAttack;
        }
        if (card.effect.healHp) {
          const healVal = Math.round(card.effect.healHp * upgradeMultiplier);
          player.hp = clamp(player.hp + healVal, 0, player.maxHp);
          result.healHp = healVal;
        }
        if (card.effect.reflectDamageRatio) {
          player.buffs.push({ type: "reflect", ratio: card.effect.reflectDamageRatio, duration: 1 });
          result.reflect = card.effect.reflectDamageRatio;
        }
        // candle_defense: ガード後に攻撃してきた敵へburnを付与（燻し反射）
        if (card.id === "candle_defense" && card.effect.statusEffect) {
          battle.pendingEffects.candleReflectBurn = deepClone(card.effect.statusEffect);
        } else if (card.effect.statusEffect) {
          // その他の防御カードのステータス効果（煙幕の燻しなど）をターゲットの敵に付与
          let effect = deepClone(card.effect.statusEffect);
          if (activeSetEffects.lanternSetBurnBonus && effect.type === "burn") {
            effect.damagePerTurn += 2;
          }
          applyStatusEffect(target, effect);
          result.statusApplied = effect.type;
        }
        break;
      }
      case "support": {
        if (card.effect.mpRestore) {
          const mpVal = Math.round(card.effect.mpRestore * upgradeMultiplier);
          player.mp = clamp(player.mp + mpVal, 0, player.maxMp);
          result.mpRestore = mpVal;
        }
        if (card.effect.nextMagicDamageBonus) {
          battle.pendingEffects.nextMagicDamageBonus = card.effect.nextMagicDamageBonus;
          result.nextMagicDamageBonus = card.effect.nextMagicDamageBonus;
        }
        if (card.effect.debuff) {
          applyStatusEffect(target, deepClone(card.effect.debuff));
          result.debuffApplied = card.effect.debuff.type;
        }
        if (card.effect.buff) {
          const buff = deepClone(card.effect.buff);
          player.buffs.push(buff);
          result.buffApplied = buff.type;
          if (buff.type === "nextCardCostHalf") {
            battle.pendingEffects.nextCardCostHalf = true;
          }
          if (buff.type === "allCostDown") {
            battle.pendingEffects.allCostDown = (battle.pendingEffects.allCostDown || 0) + buff.value;
          }
          if (buff.type === "nextTurnMpBonus") {
            battle.pendingEffects.nextTurnMpBonus = (battle.pendingEffects.nextTurnMpBonus || 0) + buff.value;
          }
        }
        break;
      }
    }
    return result;
  }

  function applyStatusEffect(target, effect) {
    const existing = target.statusEffects.find(e => e.type === effect.type);
    if (existing) {
      // 上書き延長：新しいdurationでリセット（燻しなどの連続付与で延長される）
      existing.duration = effect.duration || existing.duration;
      if (effect.damagePerTurn) existing.damagePerTurn = effect.damagePerTurn;
    } else {
      target.statusEffects.push({ ...effect });
    }
  }

  // ──────────────────────────────────────────────
  //  ターン終了
  // ──────────────────────────────────────────────
  function endPlayerTurn() {
    const battle = state.battle;
    if (!battle || battle.phase !== "player") return;

    battle.phase = "enemy";
    discardHand();

    // プレイヤーの状態異常ティック
    tickStatusEffects(state.player, battle);

    // 修繕屋：ガード値30%持ち越し
    let carryoverShield = 0;
    if (state.player.jobId === "repairman") {
      carryoverShield = Math.floor(state.player.shield * 0.3);
    }

    // 懐中時計セット効果：毎ターン開始時にガード+3（次ターン適用のためここで計算）
    const activeSetEffects = getActiveSetEffects();

    // 敵のシールドをターン終了時にリセット
    battle.enemies.forEach(enemy => { enemy.shield = 0; });

    // 探偵：戦闘開始1ターン目は敵が行動しない
    const detectiveImmune = state.player.jobId === "detective" && battle.turn === 1;

    // 敵の行動
    const enemyResults = [];
    battle.enemies.forEach((enemy, idx) => {
      if (enemy.hp <= 0) return;
      tickStatusEffects(enemy, battle);
      if (enemy.hp <= 0) return;

      if (detectiveImmune) {
        enemyResults.push({ enemyName: enemy.name, action: "様子を見ている", skipped: true });
        return;
      }

      const confused = enemy.statusEffects.find(e => e.type === "confuse");
      if (confused) {
        enemyResults.push({ enemyName: enemy.name, action: "混乱", skipped: true });
        return;
      }

      const action = enemy.nextAction;
      const res = applyEnemyAction(enemy, action);
      enemyResults.push({ enemyName: enemy.name, action: action.label, ...res });
      enemy.actionIndex++;
    });

    battle.log.push({ type: "enemy_turn", results: enemyResults });

    // プレイヤーHP確認
    if (state.player.hp <= 0) {
      battle.phase = "result";
      state.gamePhase = "gameover";
      return { phase: "gameover" };
    }

    // 全敵撃破確認
    if (battle.enemies.every(e => e.hp <= 0)) {
      const result = endBattle();
      battle.log.push({ type: "battle_end", ...result });
      return result;
    }

    // 次のターン準備
    battle.turn++;
    battle.phase = "player";

    // MP最低保証5（5未満なら5まで回復）
    if (state.player.mp < 5) {
      state.player.mp = 5;
    }
    // 骨董商：毎ターン開始時にMP+1
    if (state.player.jobId === "antique_dealer") {
      state.player.mp = clamp(state.player.mp + 1, 0, state.player.maxMp);
    }
    // 罠師：毎ターン開始時に敵全体へ1ダメージ
    if (state.player.jobId === "trapper") {
      battle.enemies.forEach(enemy => {
        if (enemy.hp > 0) enemy.hp = clamp(enemy.hp - 1, 0, enemy.maxHp);
      });
      battle.log.push({ type: "trap_damage", message: "罠師の罠が発動！ 敵全体に1ダメージ" });
    }

    // ガード値リセット（修纕屋は30%持ち越し）
    state.player.shield = carryoverShield;
    // 懐中時計セット効果
    if (activeSetEffects.watchSetGuard) {
      state.player.shield += 3;
    }
    // 砂時計セット効果（毎ターン開始時にMP+2）
    if (activeSetEffects.hourglassSetMpRegen) {
      state.player.mp = clamp(state.player.mp + 2, 0, state.player.maxMp);
    }
    // 地球儀セット効果（毎ターン開始時にMP+3）
    if (activeSetEffects.globeSetMpRegen) {
      state.player.mp = clamp(state.player.mp + 3, 0, state.player.maxMp);
    }
    // nextTurnMpBonus（砂時計を裏返すカード）
    if (battle.pendingEffects.nextTurnMpBonus) {
      state.player.mp = clamp(state.player.mp + battle.pendingEffects.nextTurnMpBonus, 0, state.player.maxMp);
      battle.pendingEffects.nextTurnMpBonus = 0;
    }
    // allCostDownはターン終了時にリセット
    battle.pendingEffects.allCostDown = 0;
    // firstTurnBookDiscount：最初のターン終了後は無効化
    battle.pendingEffects.firstTurnBookDiscount = false;
    // candleReflectBurn: 蝋の鎧の燻し反射（敵ターン中に攻撃してきた敵へ付与）はapplyEnemyActionで処理

    tickBuffs(state.player);
    battle.enemies.forEach(e => tickBuffs(e));
    // 旋律カードのバフ：ターン終了時に次カードMP半減フラグをリセット（同ターン内で使わなかった場合にリセット）
    battle.pendingEffects.nextCardCostHalf = false;
    previewEnemyActions();
    // 記憶術師：手札上限6枚、それ以外は5枚
    const handLimit = state.player.jobId === "mnemonist" ? 6 : 5;
    drawCards(handLimit);

    return { phase: "player", turn: battle.turn };
  }

  function applyEnemyAction(enemy, action) {
    const player = state.player;
    const result = {};

    // 蝋の鎧の燻し反射：次の敵攻撃時に燻しを付与
    const candleReflect = state.battle.pendingEffects.candleReflectBurn;
    if (action.type === "attack") {
      const hits = action.hits || 1;
      let totalDamage = 0;
      let totalAbsorbed = 0;
      let totalReflected = 0;
      let blocked = false;

      for (let h = 0; h < hits; h++) {
        let dmg = action.damage || 0;
        if (state.battle.pendingEffects.blockNextAttack > 0) {
          state.battle.pendingEffects.blockNextAttack--;
          blocked = true;
          continue;
        }
        const reflectBuff = player.buffs.find(b => b.type === "reflect");
        if (reflectBuff) {
          const reflected = Math.round(dmg * reflectBuff.ratio);
          enemy.hp = clamp(enemy.hp - reflected, 0, enemy.maxHp);
          dmg -= reflected;
          totalReflected += reflected;
        }
        const absorbed = Math.min(player.shield, dmg);
        player.shield = Math.max(0, player.shield - dmg);
        const remaining = dmg - absorbed;
        player.hp = clamp(player.hp - remaining, 0, player.maxHp);
        totalDamage += dmg;
        totalAbsorbed += absorbed;
      }

      if (blocked && totalDamage === 0) {
        result.blocked = true;
        return result;
      }
      result.damage = totalDamage;
      result.shieldAbsorbed = totalAbsorbed;
      if (totalReflected > 0) result.reflected = totalReflected;
      if (hits > 1) result.hits = hits;
      if (action.statusEffect) {
        const se = action.statusEffect;
        if (se.type === "mpDrain") {
          const drained = Math.min(player.mp, se.amount || 0);
          player.mp = Math.max(0, player.mp - drained);
          result.statusApplied = "mpDrain";
          result.mpDrained = drained;
        } else {
          applyStatusEffect(player, deepClone(se));
          result.statusApplied = se.type;
        }
      }
      // 蝋の鎧の燻し反射
      if (candleReflect && !blocked) {
        applyStatusEffect(enemy, deepClone(candleReflect));
        state.battle.pendingEffects.candleReflectBurn = null;
        result.candleReflectApplied = true;
      }
    } else if (action.type === "defense") {
      const addShield = action.shield || 0;
      const maxEnemyShield = Math.floor(enemy.maxHp * 0.3);
      enemy.shield = Math.min(enemy.shield + addShield, maxEnemyShield);
      result.shield = addShield;
    } else if (action.type === "support") {
      if (action.healSelf) {
        enemy.hp = clamp(enemy.hp + action.healSelf, 0, enemy.maxHp);
        result.healSelf = action.healSelf;
      }
    }
    return result;
  }

  function tickStatusEffects(entity, battle) {
    entity.statusEffects = entity.statusEffects.filter(effect => {
      if (effect.type === "burn") {
        entity.hp = clamp(entity.hp - effect.damagePerTurn, 0, entity.maxHp);
        battle.log.push({ type: "status_tick", entity: entity.name, effect: "burn", damage: effect.damagePerTurn });
      } else if (effect.type === "poison") {
        // 毒：毎ターンダメージが増加する（初回: damagePerTurn、毎回+stackIncrease）
        entity.hp = clamp(entity.hp - effect.damagePerTurn, 0, entity.maxHp);
        battle.log.push({ type: "status_tick", entity: entity.name, effect: "poison", damage: effect.damagePerTurn });
        if (effect.stackIncrease) effect.damagePerTurn += effect.stackIncrease;
      }
      effect.duration--;
      return effect.duration > 0;
    });
  }

  function tickBuffs(entity) {
    entity.buffs = entity.buffs.filter(buff => {
      if (buff.duration !== undefined) {
        buff.duration--;
        return buff.duration > 0;
      }
      return true;
    });
  }

  // ──────────────────────────────────────────────
  //  戦闘終了・ドロップ処理
  // ──────────────────────────────────────────────
  function endBattle() {
    const battle = state.battle;
    battle.phase = "result";

    let totalExp = 0;
    let totalGold = 0;
    const drops = { cards: [], materials: [] };

    battle.enemies.forEach(enemy => {
      totalExp += enemy.expReward;
      totalGold += enemy.goldReward || 0;

      // カードドロップ（古物）→ 種別選択待ちキューへ
      if (enemy.dropCards.length > 0 && randFloat() < enemy.dropRate.card) {
        const sourceId = enemy.dropCards[rand(0, enemy.dropCards.length - 1)];
        drops.cards.push(sourceId);
        state.inventory.pendingDrops.push({ sourceId, enemyName: enemy.name });
      }

      // 素材ドロップ
      if (enemy.dropMaterials.length > 0 && randFloat() < enemy.dropRate.material) {
        const matId = enemy.dropMaterials[rand(0, enemy.dropMaterials.length - 1)];
        drops.materials.push(matId);
        state.inventory.materials[matId] = (state.inventory.materials[matId] || 0) + 1;
      }
    });

    state.player.gold += totalGold;

    // 経験値付与・レベルアップ
    const levelUpResult = gainExp(totalExp);

    // ステージクリアチェック（最大フロア到達後のボス撃破）
    const stage = GAMEDATA.stages.find(s => s.id === state.currentStageId);
    const isStageCleared = stage && state.currentFloor >= stage.maxFloor;
    if (isStageCleared) {
      if (!state.clearedStages) state.clearedStages = [];
      if (!state.clearedStages.includes(state.currentStageId)) {
        state.clearedStages.push(state.currentStageId);
      }
    }

    // カードドロップがあれば種別選択画面へ、クリア時はクリア画面へ
    if (isStageCleared) {
      state.gamePhase = "stage_clear";
    } else if (drops.cards.length > 0) {
      state.gamePhase = "card_choice";
    } else {
      state.gamePhase = "map";
    }

    return {
      phase: "result",
      exp: totalExp,
      gold: totalGold,
      drops,
      levelUp: levelUpResult,
      stageCleared: isStageCleared ? (stage ? stage.name : "") : null
    };
  }

  function gainExp(amount) {
    const player = state.player;
    const job = GAMEDATA.jobs.find(j => j.id === player.jobId);
    player.exp += amount;
    const results = [];

    while (player.exp >= player.expToNext) {
      player.exp -= player.expToNext;
      player.level++;
      // 職業ごとのレベルアップ成長値
      const hpGain = job ? job.levelStats.hpGain : 10;
      const mpGain = job ? job.levelStats.mpGain : 2;
      player.maxHp += hpGain;
      player.maxMp += mpGain;
      // レベルアップで全回復
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      player.expToNext = Math.round(player.expToNext * GAMEDATA.levelUp.expMultiplier);
      results.push({ level: player.level, hpGain, mpGain });
      if (state.battle) {
        state.battle.log.push({ type: "levelup", level: player.level });
      }
    }
    return results;
  }

  // ──────────────────────────────────────────────
  //  カード種別選択（pendingDropsを処理）
  // ──────────────────────────────────────────────
  function chooseCardType(dropIndex, targetType) {
    const drop = state.inventory.pendingDrops[dropIndex];
    if (!drop) return { success: false, reason: "invalid_drop" };

    const card = GAMEDATA.cards.find(c => c.sourceId === drop.sourceId && c.type === targetType);
    if (!card) return { success: false, reason: "no_card_found" };

    // 図鑑にカードのsourceIdを記録
    if (!state.zukan) state.zukan = { enemies: [], cards: [], equipment: [] };
    if (state.zukan.cards.indexOf(drop.sourceId) === -1) {
      state.zukan.cards.push(drop.sourceId);
    }

    // デッキに追加できるか確認
    const addResult = addCardToDeck(card.id);
    if (!addResult.success) {
      // デッキが満杯 or 3枚上限 → 余剰カードとして保持
      if (!state.inventory.surplusCards) state.inventory.surplusCards = [];
      state.inventory.surplusCards.push(card.id);
    }

    // pendingDropsから削除
    state.inventory.pendingDrops.splice(dropIndex, 1);

    // 残りのpendingDropsがなければマップへ
    if (state.inventory.pendingDrops.length === 0) {
      state.gamePhase = "map";
    }

    return { success: true, card, addedToDeck: addResult.success };
  }

  // ──────────────────────────────────────────────
  //  ターゲット変更
  // ──────────────────────────────────────────────
  function setTarget(index) {
    if (!state.battle) return;
    const enemies = state.battle.enemies;
    if (index >= 0 && index < enemies.length && enemies[index].hp > 0) {
      state.battle.targetIndex = index;
    }
  }

  // ──────────────────────────────────────────────
  //  セーブ・ロード（localStorage）
  // ──────────────────────────────────────────────
  function saveGame() {
    try {
      localStorage.setItem("vm_save_v2", JSON.stringify(state));
      return true;
    } catch (e) { return false; }
  }

  function loadGame() {
    try {
      const data = localStorage.getItem("vm_save_v2");
      if (!data) return false;
      state = JSON.parse(data);
      // 旧セーブデータ互換性：decks・activeDeckIndexがない場合に補完
      if (!state.decks) {
        state.decks = [[...(state.fullDeck || [])], [], []];
      }
      if (state.activeDeckIndex === undefined || state.activeDeckIndex === null) {
        state.activeDeckIndex = 0;
      }
      // fullDeckとdecks[activeDeckIndex]を同期
      state.fullDeck = [...state.decks[state.activeDeckIndex]];
      // 旧セーブデータ互換性：physicalBonus/magicBonusがない場合は装備から再計算
      if (state.player.physicalBonus === undefined) {
        state.player.physicalBonus = 0;
        state.player.magicBonus = 0;
        const wId = state.player.equipment && state.player.equipment.weapon;
        if (wId) {
          const wRec = GAMEDATA.craftRecipes.find(r => r.id === wId);
          if (wRec) {
            state.player.physicalBonus = wRec.physicalBonus || 0;
            state.player.magicBonus = wRec.magicBonus || 0;
          }
        }
      }
      // 旧セーブデータ互換性：clearedStagesがない場合は空配列で初期化
      if (!state.clearedStages) state.clearedStages = [];
      // 旧セーブデータ互換性：zukanがない場合は初期化
      if (!state.zukan) state.zukan = { enemies: [], cards: [], equipment: [] };
      // 初期デッキのカードを図鑑に解放済みとして登録（旧セーブデータ対応）
      var job = GAMEDATA.jobs.find(function(j) { return j.id === state.player.jobId; });
      if (job && job.starterDeck) {
        job.starterDeck.forEach(function(cardId) {
          var cardDef = GAMEDATA.cards.find(function(c) { return c.id === cardId; });
          if (cardDef && cardDef.sourceId && state.zukan.cards.indexOf(cardDef.sourceId) === -1) {
            state.zukan.cards.push(cardDef.sourceId);
          }
        });
      }
      // 旧セーブデータ互換性：player.nameが「旅人」の場合は「プレイヤー」に変換
      if (state.player.name === "旅人") state.player.name = "プレイヤー";
      // 旧セーブデータ互換性：jobStatsがない場合は現在職業のステータスで初期化
      if (!state.jobStats) {
        state.jobStats = {};
        const p = state.player;
        state.jobStats[p.jobId] = {
          level: p.level,
          exp: p.exp,
          expToNext: p.expToNext,
          maxHp: p.maxHp,
          hp: p.hp,
          maxMp: p.maxMp,
          mp: p.mp,
          statUpgrades: JSON.parse(JSON.stringify(p.statUpgrades || { hp: 0, mp: 0, attack: 0 }))
        };
      }
      return true;
    } catch (e) { return false; }
  }

  function hasSave() {
    return !!localStorage.getItem("vm_save_v2");
  }

  function deleteSave() {
    localStorage.removeItem("vm_save_v2");
  }

  // ──────────────────────────────────────────────
  //  公開API
  // ──────────────────────────────────────────────
  return {
    init, getState, setState, changeJob, getCardData, getCardEffectValue, getActiveSetEffects,
    shuffleDeck, drawCards, discardHand,
    addCardToDeck, removeCardFromDeck, switchDeckIndex, copyDeck,
    startExploration, useFood, checkFoodAndReturn, getMaxFood, recoverAtHome,
    sellCard, sellMaterial,
    upgradeCard, upgradePlayerStat,
    craftEquipment, equipItem, unequipItem,
    startBattle, playCard, endPlayerTurn, setTarget,
    chooseCardType,
    saveGame, loadGame, hasSave, deleteSave,
    getZukan: function() {
      if (!state) return { enemies: [], cards: [], equipment: [] };
      if (!state.zukan) state.zukan = { enemies: [], cards: [], equipment: [] };
      return state.zukan;
    },
    getStory: function() {
      if (!state) return { seenScenes: [] };
      if (!state.story) state.story = { seenScenes: [] };
      return state.story;
    },
    markStorySeen: function(sceneId) {
      if (!state) return;
      if (!state.story) state.story = { seenScenes: [] };
      if (state.story.seenScenes.indexOf(sceneId) === -1) {
        state.story.seenScenes.push(sceneId);
      }
    },
    getClearedStages: function() {
      if (!state) return [];
      return state.clearedStages || [];
    },
    _endBattle: endBattle
  };
})();
