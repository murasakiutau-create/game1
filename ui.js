// ============================================================
// ui.js  — UIレンダリング
// ============================================================

// ── ログ ─────────────────────────────────────────────────────
function addLog(text, type='result') {
  const log=document.getElementById('log');
  if(!log) return;
  const div=document.createElement('div');
  div.className=`log-entry log-${type}`;
  div.textContent=text;
  log.appendChild(div);
  log.scrollTop=log.scrollHeight;
  // モバイルではログタブに切り替え（初期化完了後のみ）
  if(window.innerWidth<=700 && window._initDone) switchMobTab('log');
}

// ── ステータス更新 ────────────────────────────────────────────
function updateUI() {
  // HP
  const hpEl=document.getElementById('stat-hp');
  if(hpEl) hpEl.textContent=`${G.hp}/${G.maxHp}`;
  // SAN
  const sanEl=document.getElementById('stat-san');
  if(sanEl){
    sanEl.textContent=G.san;
    sanEl.style.color=G.san<=20?'#ff4444':G.san<=40?'#ffaa00':'';
  }
  // GOLD
  const goldEl=document.getElementById('stat-gold');
  if(goldEl) goldEl.textContent=`${G.gold}G`;
  // TURN
  const turnEl=document.getElementById('stat-turn');
  if(turnEl) turnEl.textContent=G.turn;
  // LUCK
  const luckEl=document.getElementById('stat-luck');
  if(luckEl) luckEl.textContent=G.luck.toFixed(1);
  // 清潔度
  const cleanEl=document.getElementById('stat-clean');
  if(cleanEl){
    cleanEl.textContent=G.cleanliness;
    cleanEl.style.color=G.cleanliness<=20?'#ff4444':'';
  }
  // 空腹
  const hungerEl=document.getElementById('stat-hunger');
  if(hungerEl){
    hungerEl.textContent=G.hunger;
    hungerEl.style.color=G.hunger<=20?'#ff4444':'';
  }
  // トイレ
  const toiletEl=document.getElementById('stat-toilet');
  if(toiletEl){
    toiletEl.textContent=G.toiletUrgency;
    toiletEl.style.color=G.toiletUrgency>=80?'#ff4444':G.toiletUrgency>=60?'#ffaa00':'';
  }
  // カルマ（ヘッダー内）
  const karmaValEl=document.getElementById('stat-karma-val');
  if(karmaValEl){
    const k=G.karma;
    karmaValEl.textContent=k>0?`+${k}`:k;
    karmaValEl.style.color=k>0?'#4e9fff':k<0?'#ff4e4e':'#d4c9a8';
  }
  // 手配レベル
  const wantedEl=document.getElementById('stat-wanted');
  if(wantedEl){
    const lv=G.wantedLevel||0;
    wantedEl.textContent=`Lv.${lv}`;
    wantedEl.style.color=lv>=5?'#ff4444':lv>=2?'#ffaa00':'';
  }
  // 住居
  const housingEl=document.getElementById('stat-housing');
  if(housingEl){
    const names={homeless:'野宿',inn:'安宿',rental:'借家',apartment:'アパート',own:'自宅',built:'自建宅'};
    housingEl.textContent=`住居: ${names[G.housing]||G.housing}`;
  }
  // 芸術
  const artEl=document.getElementById('stat-art');
  if(artEl) artEl.textContent=`芸術: ${G.art}`;
  // 使い魔・ペット
  const famEl=document.getElementById('stat-familiars');
  if(famEl){
    const all=[...G.familiars,...G.pets];
    famEl.textContent=all.length?`使い魔: ${all.map(f=>f.name).join(', ')}`:'';
  }
  // 服装
  updateClothesDisplay();
  // カルマ
  updateKarmaDisplay();
  // スキル
  renderSkills();
  // インベントリ
  renderInventory();
  // NPCリスト更新
  renderNpcList();
}

function updateClothesDisplay() {
  const el=document.getElementById('stat-clothes');
  if(!el) return;
  const names={head:'帽子',upper:'上着',lower:'ズボン',feet:'靴',hands:'手袋'};
  const worn=Object.entries(G.clothes).filter(([,v])=>v).map(([k])=>names[k]);
  const naked=worn.length===0;
  el.textContent=naked?'服装: 全裸！':`服装: ${worn.join('・')}`;
  el.style.color=naked?'#ff4444':'';
}

function updateKarmaDisplay() {
  const bar=document.getElementById('karma-bar-fill');
  const label=document.getElementById('karma-value');
  if(!bar||!label) return;
  // 善が左(+100)、悪が右(-100)
  // karma=100 → width=100%, left寄り
  // karma=0   → width=50%
  // karma=-100→ width=0%
  const pct=((G.karma+100)/200)*100;
  bar.style.width=pct+'%';
  bar.style.background=G.karma>0?
    `linear-gradient(90deg,#4caf50,#81c784)`:
    `linear-gradient(90deg,#e53935,#ef9a9a)`;
  label.textContent=G.karma>0?`善 +${G.karma}`:G.karma<0?`悪 ${G.karma}`:'中立';
}

function renderSkills() {
  const el=document.getElementById('skills-list');
  if(!el) return;
  el.innerHTML=Object.entries(G.skills).map(([name,s])=>`
    <div class="skill-item">
      <span class="skill-name">${name}</span>
      <span class="skill-lv">Lv.${s.lv}</span>
      <div class="skill-bar"><div class="skill-bar-fill" style="width:${Math.min(100,(s.exp/(s.lv*100))*100)}%"></div></div>
    </div>
  `).join('');
}

function renderInventory() {
  const el=document.getElementById('inventory-list');
  if(!el) return;
  if(!G.inventory.length){ el.innerHTML='<div class="inv-empty">何も持っていない</div>'; return; }
  el.innerHTML=G.inventory.map(i=>`
    <div class="inv-item">
      <span class="inv-name">${itemName(i.id)}</span>
      <span class="inv-qty">×${i.qty}</span>
    </div>
  `).join('');
}

// ── NPCリスト（現在地ベース） ─────────────────────────────────
function renderNpcList() {
  const el=document.getElementById('npc-grid');
  if(!el) return;

  const loc=getLocation(G.currentLocation)||LOCATIONS[0];
  // 自分自身は常に表示
  const self={id:'self', name:'自分自身', emoji:'🧍', attitude:'self'};
  // この場所の特殊ターゲット（req()でフィルタ）
  const specials=(LOCATION_SPECIALS[loc.id]||[]).filter(s=>!s.req||s.req())
    .map(s=>({...s, attitude:'obj'}));
  // この場所のNPC
  const npcsHere=NPCS.filter(n=>n.location===loc.id && n.hp>0);

  const sectionHere=`
    <div class="loc-header">
      <div class="loc-emoji">${loc.emoji}</div>
      <div class="loc-name">📍 ${loc.name}</div>
      <div class="loc-desc">${loc.desc}</div>
    </div>
    <div class="loc-section-title">◈ ここにいる人・物</div>
  `;

  const allHere=[self, ...specials, ...npcsHere];
  const cards=allHere.map(t=>{
    const isSelected=G.selectedTarget===t.id;
    const attClass=t.attitude==='self'?'att-self':
                   t.attitude==='obj'?'att-obj':
                   t.attitude==='friendly'?'att-friendly':
                   t.attitude==='hostile'?'att-hostile':
                   t.attitude==='charmed'?'att-charmed':
                   t.attitude==='believer'?'att-believer':'att-neutral';
    const emoji=t.emoji||(
      t.attitude==='friendly'?'😊':
      t.attitude==='hostile'?'😡':
      t.attitude==='charmed'?'💜':
      t.attitude==='believer'?'✨':'😐'
    );
    const hpBar=t.hp!==undefined?`<div class="npc-hp-bar"><div style="width:${(t.hp/t.maxHp)*100}%"></div></div>`:'';
    return `<div class="npc-card ${attClass} ${isSelected?'selected':''}" onclick="selectTarget('${t.id}')">
      <div class="npc-emoji">${emoji}</div>
      <div class="npc-name">${t.name}</div>
      ${hpBar}
      <div class="npc-att">${attitudeLabel(t.attitude)}</div>
    </div>`;
  }).join('');

  // 移動先（隣接ロケーション）
  const neighbors=(loc.neighbors||[]).map(id=>getLocation(id)).filter(Boolean);
  const moveCards=neighbors.map(n=>{
    const visited=G.visitedLocations.includes(n.id);
    return `<div class="move-card ${visited?'visited':'unvisited'}" onclick="moveTo('${n.id}')">
      <div class="move-emoji">${n.emoji}</div>
      <div class="move-name">${visited?n.name:`？${n.name}`}</div>
      <div class="move-hint">${visited?'移動':'未踏の地'}</div>
    </div>`;
  }).join('');

  el.innerHTML=`
    ${sectionHere}
    <div class="npc-cards-grid">${cards}</div>
    <div class="loc-section-title">◈ 移動する</div>
    <div class="move-cards-grid">${moveCards||'<div class="inv-empty">行ける場所がない</div>'}</div>
  `;
}

// ── 場所移動 ──────────────────────────────────────────────────
function moveTo(locId) {
  const loc=getLocation(locId);
  if(!loc){ addLog('そんな場所はない。','bad'); return; }
  const cur=getLocation(G.currentLocation);
  if(!cur || !cur.neighbors.includes(locId)){
    addLog(`ここから直接「${loc.name}」には行けない。`,'bad'); return;
  }
  G.currentLocation=locId;
  const firstVisit=!G.visitedLocations.includes(locId);
  if(firstVisit){
    G.visitedLocations.push(locId);
    addLog(`✨ 初めて${loc.emoji} ${loc.name}に来た。${loc.desc}`,'level');
  } else {
    addLog(`📍 ${loc.emoji} ${loc.name}に移動した。`,'result');
  }
  advanceTurn();
  // 移動先では「自分自身」をデフォルト選択
  G.selectedTarget='self';
  renderNpcList();
  renderCommandArea(buildSelfCommands(),`自分自身（${loc.name}）`);
  if(window.innerWidth<=700) switchMobTab('npc');
}

// ── ターゲット選択 ────────────────────────────────────────────
function selectTarget(id) {
  G.selectedTarget=id;
  renderNpcList();

  // 特殊ターゲット
  if(id==='self'){
    const loc=getLocation(G.currentLocation);
    renderCommandArea(buildSelfCommands(),`自分自身（${loc?loc.name:''}）`);
    if(window.innerWidth<700) switchMobTab('log');
    return;
  }
  if(id==='board'){
    renderCommandArea(buildBoardCommands(),'街の掲示板');
    if(window.innerWidth<700) switchMobTab('log');
    return;
  }
  if(id==='forest_explore'){ openForestMenu(); return; }
  if(id==='job'){    openJobBoard(); return; }
  if(id==='gamble'){ openGambleMenu(); return; }
  if(id==='trade'){  openTradeMenu(); return; }
  if(id==='estate'){ openRealEstateMenu(); return; }
  if(id==='bounty'){ openBountyMenu(); return; }
  if(id==='stock'){  openStockMenu(); return; }
  if(id==='housing'){ openHousingMenu(); return; }
  if(id==='cult'){    openCultMenu(); return; }
  if(id==='trap'){    openTrapMenu(); return; }
  if(id==='science'){ openScienceMenu(); return; }

  // NPC
  const npc=NPCS.find(n=>n.id===id);
  if(!npc) return;
  addLog(`👁 ${npc.name}を選択した。（${attitudeLabel(npc.attitude)}）`,'dim');
  renderCommandArea(buildNpcCommands(npc), npc.name);
  if(window.innerWidth<700) switchMobTab('log');
}

// ── NPCコマンドビルダー ───────────────────────────────────────
function buildNpcCommands(npc) {
  const lv=G.skills;
  const cmds=[
    // 基本
    {label:'調べる',           color:'dim',    fn:()=>doExamine(npc)},
    {label:'話しかける',       color:'dim',    fn:()=>doTalk(npc)},
    {label:'挨拶する',         color:'dim',    fn:()=>doGreet(npc)},
    {label:'情報を聞く',       color:'dim',    fn:()=>doAskInfo(npc)},
    {label:'昔話を聞く',       color:'dim',    fn:()=>doAskStory(npc)},
    // 交流
    {label:'褒める',           color:'result', fn:()=>doCompliment(npc)},
    {label:'侮辱する',         color:'crime',  fn:()=>doInsult(npc)},
    {label:'脅す',             color:'crime',  fn:()=>doThreaten(npc)},
    {label:'賄賂を渡す',       color:'crime',  fn:()=>doBribe(npc)},
    {label:'交渉する',         color:'result', fn:()=>doNegotiate(npc)},
    {label:'演奏する',         color:'skill',  fn:()=>doPerform(npc)},
    {label:'料理を振る舞う',   color:'skill',  fn:()=>doCookGive(npc)},
    {label:'花を渡す',         color:'good',   fn:()=>doGiveFlower(npc)},
    {label:'アイテムを渡す',   color:'item',   fn:()=>doGiveItem(npc)},
    // 戦闘
    {label:'素手で攻撃',       color:'combat', fn:()=>doAttack(npc,'素手')},
    {label:'短剣で攻撃',       color:'combat', fn:()=>doAttack(npc,'短剣'), req:()=>hasItem('dagger')},
    {label:'剣で攻撃',         color:'combat', fn:()=>doAttack(npc,'剣'),   req:()=>hasItem('sword')},
    {label:'炎魔法',           color:'magic',  fn:()=>doCastFire(npc),      req:()=>lv['魔法'].lv>=2},
    {label:'魅了魔法',         color:'magic',  fn:()=>doCastCharm(npc),     req:()=>lv['魅力'].lv>=3},
    {label:'逃げる',           color:'dim',    fn:()=>doFlee(npc)},
    // スキル
    {label:'スリを働く',       color:'crime',  fn:()=>doPickpocket(npc),    req:()=>lv['窃盗'].lv>=1},
    {label:'毒を盛る',         color:'crime',  fn:()=>doPoisonFood(npc),    req:()=>hasItem('poison_herb')||hasItem('poison_potion')},
    {label:'解体する',         color:'crime',  fn:()=>doDissect(npc),       req:()=>npc.hp<=0},
    {label:'治療する',         color:'good',   fn:()=>doHeal(npc),          req:()=>lv['医術'].lv>=1},
    // 信仰
    {label:'神の教えを説く',   color:'faith',  fn:()=>doPreach(npc)},
    {label:'祈る',             color:'faith',  fn:()=>doPrayFor(npc)},
    {label:'捧げ物をする',     color:'faith',  fn:()=>doOfferItem(npc)},
    // ショップ
    {label:'買い物をする',     color:'item',   fn:()=>doBuy(npc),           req:()=>!!npc.shop},
    {label:'値引き交渉',       color:'result', fn:()=>doNegotiatePrice(npc),req:()=>!!npc.shop},
    {label:'万引きする',       color:'crime',  fn:()=>doStealFromShop(npc), req:()=>!!npc.shop},
    {label:'店に落書き',       color:'crime',  fn:()=>doGraffitiShop(npc),  req:()=>!!npc.shop},
    {label:'店を掃除する',     color:'good',   fn:()=>doCleanShop(npc),     req:()=>!!npc.shop},
    {label:'店に火をつける',   color:'combat', fn:()=>doFireShop(npc),      req:()=>!!npc.shop},
    {label:'店を壊す',         color:'combat', fn:()=>doBreakShop(npc),     req:()=>!!npc.shop},
    // 依頼
    {label:'依頼を受ける',     color:'result', fn:()=>openNpcQuestMenu(npc)},
    {label:'雇ってくれと頼む', color:'result', fn:()=>doAskHire(npc),       req:()=>!!npc.jobSlots},
    // 役割固有メニュー
    {label:'ギルド業務を確認', color:'result', fn:()=>openGuildMenu(),      req:()=>npc.id==='guild_master'},
    {label:'金を借りる/返す',  color:'result', fn:()=>openLoanMenu(),       req:()=>npc.id==='loan_shark'},
    {label:'コロシアムに参加', color:'combat', fn:()=>openColosseumMenu(),  req:()=>npc.id==='colosseum_master'},
    // 特殊
    {label:'自首する',         color:'dim',    fn:()=>doSurrender(npc),     req:()=>npc.id==='guard'},
    {label:'治療を頼む',       color:'good',   fn:()=>doAskHeal(npc),       req:()=>npc.id==='priest'},
    {label:'懺悔する',         color:'faith',  fn:()=>doConfess(npc),       req:()=>npc.id==='priest'},
    {label:'犯罪の依頼をする', color:'crime',  fn:()=>doJoinCrime(npc),     req:()=>npc.id==='thief'},
    {label:'盗品を換金する',   color:'crime',  fn:()=>doSellStolen(npc),    req:()=>npc.isFence},
    // 信者命令
    {label:'布教させる',       color:'faith',  fn:()=>doOrderSpread(npc),   req:()=>npc.isBeliever},
    {label:'上納金を持ってこい',color:'faith',  fn:()=>doOrderTithe(npc),    req:()=>npc.isBeliever},
    {label:'家族を入信させろ', color:'faith',  fn:()=>doOrderFamily(npc),   req:()=>npc.isBeliever},
    {label:'捧げ物を持ってこい',color:'faith',  fn:()=>doOrderOffering(npc), req:()=>npc.isBeliever},
    {label:'自害せよ',         color:'combat', fn:()=>doOrderSuicide(npc),  req:()=>npc.isBeliever&&lv['信仰'].lv>=8},
    // 魅了命令
    {label:'ついてこい',       color:'magic',  fn:()=>doCharmOrderFollow(npc),  req:()=>npc.attitude==='charmed'},
    {label:'持ち物を渡せ',     color:'magic',  fn:()=>doCharmOrderGive(npc),    req:()=>npc.attitude==='charmed'},
    {label:'誰かを攻撃しろ',   color:'magic',  fn:()=>doCharmOrderAttack(npc),  req:()=>npc.attitude==='charmed'},
    {label:'服を脱げ',         color:'magic',  fn:()=>doCharmOrderUndress(npc), req:()=>npc.attitude==='charmed'},
    // 科学・化学アイテム使用
    {label:'真実の血清を使う', color:'skill',  fn:()=>doUseTruthSerum(npc),  req:()=>hasItem('truth_serum')},
    {label:'爆発物を使う',     color:'combat', fn:()=>doUseExplosive(npc),   req:()=>hasItem('explosive')},
    {label:'強酸を浴びせる',   color:'combat', fn:()=>doUseAcid(npc),        req:()=>hasItem('acid')},
    {label:'罠を仕掛ける',     color:'crime',  fn:()=>openSetTrapNpcMenu(),  req:()=>G.trapInventory.length>0},
  ];
  return cmds;
}

// ── コマンドエリアレンダリング ────────────────────────────────────
function renderCommandArea(cmds, title) {
  const area=document.getElementById('command-area');
  if(!area) return;

  // モバイル用「◄ NPCに戻る」ボタン（ログタブ表示中のみ表示）
  const backBtn = window.innerWidth<=700
    ? `<button class="mob-back-btn" onclick="switchMobTab('npc')">◄ NPC一覧に戻る</button>`
    : '';

  if(!cmds || !Array.isArray(cmds)){
    area.innerHTML=`${backBtn}<div class="cmd-title">${title}</div><div class="cmd-grid"><div style="color:#888;padding:8px">コマンドなし</div></div>`;
    return;
  }
  const colorMap={
    dim:'#888',result:'#7ec8e3',good:'#81c784',bad:'#ef9a9a',
    combat:'#e57373',crime:'#ff8a65',faith:'#ce93d8',magic:'#80cbc4',
    skill:'#fff176',item:'#a5d6a7',level:'#ffd54f',
  };
  // innerHTML生成（onclickはaddEventListenerで後付け）
  const fns = [];
  const btns = cmds.map((c,i)=>{
    const disabled=c.req&&!c.req();
    const col=colorMap[c.color]||'#aaa';
    fns.push(c.fn);
    return `<button class="cmd-btn ${disabled?'cmd-disabled':''}" data-idx="${i}"
      style="border-color:${col};color:${disabled?'#555':col}"
      ${disabled?'disabled':''}>${c.label}</button>`;
  });
  area.innerHTML=`${backBtn}<div class="cmd-title">${title}</div><div class="cmd-grid">${btns.join('')}</div>`;
  area.querySelectorAll('.cmd-btn[data-idx]').forEach(btn=>{
    const idx=parseInt(btn.dataset.idx,10);
    btn.addEventListener('click',()=>fns[idx]());
  });
}

// ── モーダル ──────────────────────────────────────────────
function openModal(title, body, options) {
  const overlay=document.getElementById('modal-overlay');
  const modal=document.getElementById('modal');
  if(!overlay||!modal) return;
  modal.innerHTML=`
    <div class="modal-title">${title}</div>
    <div class="modal-body">${body.replace(/\n/g,'<br>')}</div>
    <div class="modal-opts">
      ${options.map((o,i)=>`<button class="modal-btn" id="mopt${i}">${o.label}</button>`).join('')}
    </div>
    <button class="modal-close" onclick="closeModal()">✕</button>
  `;
  overlay.style.display='flex';
  options.forEach((o,i)=>{
    document.getElementById(`mopt${i}`)?.addEventListener('click',()=>{ closeModal(); o.fn(); });
  });
}
function closeModal() {
  const overlay=document.getElementById('modal-overlay');
  if(overlay) overlay.style.display='none';
}

// アイテム選択モーダル
function openItemModal(title, callback) {
  if(!G.inventory.length){ addLog('アイテムがない。','bad'); return; }
  openModal(title, 'アイテムを選んでください。',
    G.inventory.map(i=>({
      label:`${itemName(i.id)} ×${i.qty}`,
      fn:()=>callback(i.id),
    }))
  );
}

// ── モバイルタブ ──────────────────────────────────────────────
function switchMobTab(tab) {
  // デスクトップでは全パネルをCSSで表示するため、インラインスタイルを設定しない
  if(window.innerWidth>700) return;
  ['npc','log','status'].forEach(t=>{
    const el=document.getElementById(`mob-${t}`);
    const btn=document.getElementById(`tab-${t}`);
    if(el) el.style.display=t===tab?'flex':'none';
    if(btn) btn.classList.toggle('mob-active',t===tab);
  });
}

// ── 初期化 ────────────────────────────────────────────────────
function init() {
  // 初期化中はログタブ自動切り替えを無効化
  window._initDone=false;
  addLog('═══════════════════════════════','dim');
  addLog('  テキストRPG プロトタイプ v3','level');
  addLog('  自由度重視プロトタイプ','dim');
  addLog('═══════════════════════════════','dim');
  addLog('あなたは王国の街「エルナ」に降り立った。','result');
  addLog('🛏️ ひとまず宿屋で休んでいる。','result');
  addLog('左のパネル「移動する」から場所を変えて、街を探索しよう。','dim');
  addLog('場所によって会える人物・できる行動が変わる。','dim');
  addLog('───────────────────────────────','dim');
  G.currentLocation='inn';
  if(!G.visitedLocations.includes('inn')) G.visitedLocations.push('inn');
  G.selectedTarget='self';
  renderNpcList();
  const loc=getLocation(G.currentLocation);
  renderCommandArea(buildSelfCommands(),`自分自身（${loc?loc.name:''}）`);
  updateUI();
  // 初期化完了後にモバイル初期タブをNPCに設定
  window._initDone=true;
  if(window.innerWidth<=700) switchMobTab('npc');
}

window.addEventListener('DOMContentLoaded', init);
