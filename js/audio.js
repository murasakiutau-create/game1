// ============================================================
//  ヴィンテージ・メモリア  ―  オーディオ管理モジュール
//  BGM切り替え：クロスフェード方式（同時フェードアウト＋フェードイン）
// ============================================================

const AudioManager = (() => {

  // ── ファイルマップ ────────────────────────────────────────
  const BGM_FILES = {
    main:   "main.bgm.mp3",
    battle: "battle.bgm.mp3"
  };

  const SE_FILES = {
    open:   "open.mp3",
    back:   "back.mp3",
    up:     "up.mp3",
    cash:   "cash.mp3",
    button: "button.mp3"
  };

  // ── 設定（LocalStorageで永続化） ─────────────────────────
  const STORAGE_KEY = "vm_audio_settings";

  function _loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return { bgmOn: true, seOn: true, bgmVolume: 0.6 };
  }

  function _saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch(e) {}
  }

  var settings = _loadSettings();

  // クロスフェードの長さ（ms）
  // フェードアウトとフェードインが重なる時間
  const CROSSFADE_DURATION = 3500;
  const TICK = 50; // ms ごとに音量更新

  const SE_VOLUME = 0.8;

  // 現在再生中のBGMトラック（最大2つ同時：フェードアウト中 + フェードイン中）
  let currentKey   = null;  // 再生中（または再生予定）のBGMキー
  let activeAudio  = null;  // フェードイン完了済み or フェードイン中のメイン Audio
  let fadingOut    = [];    // フェードアウト中の Audio の配列

  // ── BGM 制御 ──────────────────────────────────────────────

  /**
   * BGMをクロスフェードで切り替える
   * @param {string|null} key  "main" | "battle" | null（停止）
   */
  function playBgm(key) {
    if (currentKey === key) return; // 同じBGMなら何もしない
    currentKey = key;

    if (!settings.bgmOn) return; // BGMオフ中は状態だけ記録

    // 現在のアクティブトラックをフェードアウトキューへ移動
    if (activeAudio && !activeAudio.paused) {
      var outAudio = activeAudio;
      fadingOut.push(outAudio);
      activeAudio = null;
      _fadeOut(outAudio, CROSSFADE_DURATION, function() {
        fadingOut = fadingOut.filter(function(a) { return a !== outAudio; });
      });
    }

    // 新しいBGMをフェードインで開始
    if (key) {
      var inAudio = new Audio(BGM_FILES[key]);
      inAudio.loop   = true;
      inAudio.volume = 0;
      inAudio.play().catch(function() {});
      _fadeIn(inAudio, CROSSFADE_DURATION, settings.bgmVolume);
      activeAudio = inAudio;
    }
  }

  function stopBgm() {
    currentKey = null;
    if (activeAudio && !activeAudio.paused) {
      var out = activeAudio;
      fadingOut.push(out);
      activeAudio = null;
      _fadeOut(out, CROSSFADE_DURATION, function() {
        fadingOut = fadingOut.filter(function(a) { return a !== out; });
      });
    } else if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
  }

  function _fadeIn(audio, duration, targetVolume) {
    var steps     = duration / TICK;
    var increment = targetVolume / steps;
    audio.volume  = 0;
    var timer = setInterval(function() {
      if (!audio || audio.paused) { clearInterval(timer); return; }
      var next = Math.min(audio.volume + increment, targetVolume);
      audio.volume = next;
      if (next >= targetVolume) {
        audio.volume = targetVolume;
        clearInterval(timer);
      }
    }, TICK);
  }

  function _fadeOut(audio, duration, callback) {
    var startVol  = Math.max(audio.volume, 0.001);
    var steps     = duration / TICK;
    var decrement = startVol / steps;
    var timer = setInterval(function() {
      var next = Math.max(audio.volume - decrement, 0);
      audio.volume = next;
      if (next <= 0) {
        audio.volume = 0;
        audio.pause();
        clearInterval(timer);
        if (callback) callback();
      }
    }, TICK);
  }

  // ── SE 制御 ───────────────────────────────────────────────

  function playSe(key) {
    if (!settings.seOn) return;
    var file = SE_FILES[key];
    if (!file) return;
    var audio = new Audio(file);
    audio.volume = SE_VOLUME;
    audio.play().catch(function() {});
  }

  // ── 設定変更 API ─────────────────────────────────────────

  function setBgmOn(on) {
    settings.bgmOn = !!on;
    _saveSettings();
    if (settings.bgmOn) {
      // オンにしたとき：現在のキーで再生再開
      if (currentKey && (!activeAudio || activeAudio.paused)) {
        var key = currentKey;
        currentKey = null; // 強制再生させるためリセット
        playBgm(key);
      }
    } else {
      // オフにしたとき：全トラックをフェードアウト
      if (activeAudio && !activeAudio.paused) {
        var out = activeAudio;
        fadingOut.push(out);
        activeAudio = null;
        _fadeOut(out, CROSSFADE_DURATION, function() {
          fadingOut = fadingOut.filter(function(a) { return a !== out; });
        });
      }
      fadingOut.forEach(function(a) {
        // すでにフェードアウト中のものは放置（自然に止まる）
      });
    }
  }

  function setSeOn(on) {
    settings.seOn = !!on;
    _saveSettings();
  }

  function setBgmVolume(vol) {
    vol = Math.max(0, Math.min(1, parseFloat(vol)));
    settings.bgmVolume = vol;
    _saveSettings();
    // アクティブなBGMの音量をリアルタイムで変更
    if (activeAudio && !activeAudio.paused) {
      activeAudio.volume = vol;
    }
  }

  function getSettings() {
    return {
      bgmOn:     settings.bgmOn,
      seOn:      settings.seOn,
      bgmVolume: settings.bgmVolume
    };
  }

  // ── 公開API ───────────────────────────────────────────────
  return {
    playBgm:      playBgm,
    stopBgm:      stopBgm,
    playSe:       playSe,
    setBgmOn:     setBgmOn,
    setSeOn:      setSeOn,
    setBgmVolume: setBgmVolume,
    getSettings:  getSettings
  };

})();
