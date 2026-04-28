// ============================================================
//  ヴィンテージ・メモリア  ―  セーブ/ロード管理 (saveload.js)
//  HMAC-SHA256 による改ざん防止署名付き
// ============================================================

const SaveLoad = (() => {

  // ゲーム固有の秘密鍵（クライアントサイドなので完全な秘匿は不可能だが、
  // 単純なJSONコピペ改ざんを防ぐ目的で使用）
  const SECRET = "VintageMemoria_v2_SaveKey_2026";
  const SAVE_KEY = "vintage_memoria_save";
  const SAVE_VERSION = 2;

  // ──────────────────────────────────────────────
  //  HMAC-SHA256 署名生成（Web Crypto API）
  // ──────────────────────────────────────────────
  async function signData(dataStr) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", keyMaterial, enc.encode(dataStr));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // ──────────────────────────────────────────────
  //  HMAC-SHA256 署名検証
  // ──────────────────────────────────────────────
  async function verifyData(dataStr, signature) {
    const expected = await signData(dataStr);
    return expected === signature;
  }

  // ──────────────────────────────────────────────
  //  セーブデータをlocalStorageに保存
  // ──────────────────────────────────────────────
  async function save(state) {
    try {
      const payload = {
        version: SAVE_VERSION,
        savedAt: new Date().toISOString(),
        state: state
      };
      const dataStr = JSON.stringify(payload);
      const sig = await signData(dataStr);
      const saveObj = { data: dataStr, sig: sig };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveObj));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // ──────────────────────────────────────────────
  //  localStorageからロード
  // ──────────────────────────────────────────────
  async function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ok: false, error: "セーブデータが見つかりません" };
      const saveObj = JSON.parse(raw);
      const valid = await verifyData(saveObj.data, saveObj.sig);
      if (!valid) return { ok: false, error: "セーブデータが改ざんされています" };
      const payload = JSON.parse(saveObj.data);
      return { ok: true, state: payload.state, savedAt: payload.savedAt };
    } catch (e) {
      return { ok: false, error: "セーブデータの読み込みに失敗しました: " + e.message };
    }
  }

  // ──────────────────────────────────────────────
  //  セーブデータをJSONファイルとしてエクスポート
  // ──────────────────────────────────────────────
  async function exportSave(state) {
    try {
      const payload = {
        version: SAVE_VERSION,
        savedAt: new Date().toISOString(),
        state: state
      };
      const dataStr = JSON.stringify(payload);
      const sig = await signData(dataStr);
      const saveObj = { data: dataStr, sig: sig };
      const blob = new Blob([JSON.stringify(saveObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      a.href = url;
      a.download = `vintage_memoria_save_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // ──────────────────────────────────────────────
  //  JSONファイルからインポート
  // ──────────────────────────────────────────────
  async function importSave(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const saveObj = JSON.parse(e.target.result);
          if (!saveObj.data || !saveObj.sig) {
            resolve({ ok: false, error: "セーブファイルの形式が正しくありません" });
            return;
          }
          const valid = await verifyData(saveObj.data, saveObj.sig);
          if (!valid) {
            resolve({ ok: false, error: "セーブデータが改ざんされています" });
            return;
          }
          const payload = JSON.parse(saveObj.data);
          if (payload.version !== SAVE_VERSION) {
            resolve({ ok: false, error: `バージョン不一致（期待: v${SAVE_VERSION}、ファイル: v${payload.version}）` });
            return;
          }
          // localStorageにも保存
          localStorage.setItem(SAVE_KEY, JSON.stringify(saveObj));
          resolve({ ok: true, state: payload.state, savedAt: payload.savedAt });
        } catch (err) {
          resolve({ ok: false, error: "ファイルの解析に失敗しました: " + err.message });
        }
      };
      reader.onerror = () => resolve({ ok: false, error: "ファイルの読み込みに失敗しました" });
      reader.readAsText(file);
    });
  }

  // ──────────────────────────────────────────────
  //  セーブデータの存在確認
  // ──────────────────────────────────────────────
  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  // ──────────────────────────────────────────────
  //  セーブデータの削除
  // ──────────────────────────────────────────────
  function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  return { save, load, exportSave, importSave, hasSave, deleteSave };

})();
