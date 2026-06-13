#target "premierepro"

/**
 * テロップスタイルマネージャー for Adobe Premiere Pro
 * バージョン : 1.0
 * 対象解像度 : 1920×1080 Full HD
 *
 * 使い方:
 *   Premiere Pro > ファイル > スクリプト > スクリプトファイルを実行... でこのファイルを選択
 *
 * 機能:
 *   - 6カテゴリ・25スタイルのテロップ設定値を一覧表示
 *   - タイムライン上の選択クリップへのスタイル適用を試みる
 *   - 全スタイル仕様をテキストファイルとして書き出し
 */

(function TelopStyleManager() {
  "use strict";

  // ============================================================
  // スタイル定義  (座標・サイズは 1920×1080 基準)
  // fill / stroke は [R, G, B]  (0–255)
  // ============================================================
  var CATEGORIES = [
    {
      name: "バラエティ・情報番組",
      styles: [
        {
          id: "v01", name: "標準テロップ",
          desc: "基本の白文字・黒縁。汎用的な横テロップ",
          font: "HiraKakuProN-W6", size: 72,
          fill: [255, 255, 255], stroke: [0, 0, 0], strokeW: 8,
          shadow: false, align: "CENTER", leading: 1.2
        },
        {
          id: "v02", name: "強調テロップ（黄）",
          desc: "重要・驚きの黄色テロップ",
          font: "HiraKakuProN-W6", size: 80,
          fill: [255, 230, 0], stroke: [0, 0, 0], strokeW: 10,
          shadow: false, align: "CENTER", leading: 1.2
        },
        {
          id: "v03", name: "強調テロップ（赤）",
          desc: "警告・重大情報の赤テロップ・白縁",
          font: "HiraKakuProN-W6", size: 76,
          fill: [255, 50, 50], stroke: [255, 255, 255], strokeW: 8,
          shadow: false, align: "CENTER", leading: 1.2
        },
        {
          id: "v04", name: "ツッコミテロップ",
          desc: "コメント・ツッコミ用。黄文字・赤縁・シャドウ付き",
          font: "HiraKakuProN-W6", size: 68,
          fill: [255, 255, 0], stroke: [200, 0, 0], strokeW: 10,
          shadow: true, shadowOpacity: 180, shadowDist: 6,
          align: "CENTER", leading: 1.1, rotation: -3
        },
        {
          id: "v05", name: "うれしいテロップ",
          desc: "ポジティブ演出用・白文字・オレンジ縁",
          font: "HiraKakuProN-W6", size: 72,
          fill: [255, 255, 255], stroke: [255, 120, 0], strokeW: 8,
          shadow: true, shadowOpacity: 160, shadowDist: 4,
          align: "CENTER", leading: 1.2
        }
      ]
    },
    {
      name: "ドキュメンタリー・インタビュー",
      styles: [
        {
          id: "d01", name: "インタビュー字幕",
          desc: "話者セリフ・字幕。白文字・細縁・シャドウ",
          font: "HiraKakuProN-W3", size: 56,
          fill: [255, 255, 255], stroke: [0, 0, 0], strokeW: 5,
          shadow: true, shadowOpacity: 150, shadowDist: 3,
          align: "LEFT", leading: 1.3
        },
        {
          id: "d02", name: "氏名テロップ",
          desc: "出演者の氏名・肩書き。左下配置想定",
          font: "HiraKakuProN-W6", size: 52,
          fill: [255, 255, 255], stroke: [0, 0, 0], strokeW: 5,
          shadow: false, align: "LEFT", leading: 1.0
        },
        {
          id: "d03", name: "ロケーション・日時キャプション",
          desc: "場所・日時などの補足情報。グレー文字",
          font: "HiraKakuProN-W3", size: 44,
          fill: [220, 220, 220], stroke: [0, 0, 0], strokeW: 3,
          shadow: true, shadowOpacity: 120, shadowDist: 2,
          align: "LEFT", leading: 1.2
        },
        {
          id: "d04", name: "ナレーション字幕",
          desc: "ナレーション音声の字幕用。明朝体・中央",
          font: "HiraMinProN-W3", size: 52,
          fill: [255, 255, 255], stroke: [0, 0, 0], strokeW: 4,
          shadow: true, shadowOpacity: 140, shadowDist: 3,
          align: "CENTER", leading: 1.3
        }
      ]
    },
    {
      name: "タイトル・見出し",
      styles: [
        {
          id: "t01", name: "メインタイトル",
          desc: "番組・動画のメインタイトル。白文字・青縁・シャドウ",
          font: "HiraKakuProN-W6", size: 96,
          fill: [255, 255, 255], stroke: [20, 80, 180], strokeW: 14,
          shadow: true, shadowOpacity: 200, shadowDist: 8,
          align: "CENTER", leading: 1.2
        },
        {
          id: "t02", name: "コーナータイトル",
          desc: "セグメントの見出し。黄文字・黒縁",
          font: "HiraKakuProN-W6", size: 80,
          fill: [255, 255, 0], stroke: [0, 0, 0], strokeW: 10,
          shadow: true, shadowOpacity: 180, shadowDist: 6,
          align: "CENTER", leading: 1.2
        },
        {
          id: "t03", name: "ロウワーサード",
          desc: "下部帯テキスト用。縁なし（青背景帯 #003CA0 と組合せ）",
          font: "HiraKakuProN-W6", size: 60,
          fill: [255, 255, 255], stroke: null, strokeW: 0,
          shadow: false, align: "LEFT", leading: 1.0,
          note: "背景帯(青 #003CA0)と組み合わせて使用"
        },
        {
          id: "t04", name: "エンドロール・クレジット",
          desc: "スタッフクレジット用。グレー文字・細め",
          font: "HiraKakuProN-W3", size: 48,
          fill: [200, 200, 200], stroke: null, strokeW: 0,
          shadow: false, align: "CENTER", leading: 1.8
        }
      ]
    },
    {
      name: "ビジネス・コーポレート",
      styles: [
        {
          id: "b01", name: "ビジネス標準",
          desc: "企業動画向けのシンプルダークテキスト",
          font: "HiraKakuProN-W3", size: 64,
          fill: [30, 30, 30], stroke: null, strokeW: 0,
          shadow: false, align: "CENTER", leading: 1.4
        },
        {
          id: "b02", name: "スライドタイトル",
          desc: "プレゼン・セミナー動画のタイトル。ネイビーブルー",
          font: "HiraKakuProN-W6", size: 80,
          fill: [0, 60, 160], stroke: null, strokeW: 0,
          shadow: false, align: "LEFT", leading: 1.2
        },
        {
          id: "b03", name: "解説・本文テキスト",
          desc: "説明テキスト・長文向け。明朝体・行間広め",
          font: "HiraMinProN-W3", size: 44,
          fill: [50, 50, 50], stroke: null, strokeW: 0,
          shadow: false, align: "LEFT", leading: 1.6
        },
        {
          id: "b04", name: "キーワード強調",
          desc: "重要キーワードのハイライト。コーポレートブルー",
          font: "HiraKakuProN-W6", size: 72,
          fill: [0, 100, 220], stroke: null, strokeW: 0,
          shadow: false, align: "CENTER", leading: 1.2
        }
      ]
    },
    {
      name: "YouTube・SNS",
      styles: [
        {
          id: "y01", name: "ポップテロップ",
          desc: "YouTube定番・白文字オレンジ縁",
          font: "HiraKakuProN-W6", size: 76,
          fill: [255, 255, 255], stroke: [255, 80, 0], strokeW: 10,
          shadow: true, shadowOpacity: 160, shadowDist: 5,
          align: "CENTER", leading: 1.1
        },
        {
          id: "y02", name: "リアクション文字",
          desc: "驚き・感情の大テキスト。黄文字・赤オレンジ縁",
          font: "HiraKakuProN-W6", size: 120,
          fill: [255, 220, 0], stroke: [255, 60, 0], strokeW: 14,
          shadow: true, shadowOpacity: 200, shadowDist: 8,
          align: "CENTER", leading: 1.0
        },
        {
          id: "y03", name: "サムネイル風タイトル",
          desc: "アイキャッチ・サムネイル用大文字",
          font: "HiraKakuProN-W6", size: 104,
          fill: [255, 255, 255], stroke: [0, 0, 0], strokeW: 16,
          shadow: true, shadowOpacity: 220, shadowDist: 10,
          align: "CENTER", leading: 1.1
        },
        {
          id: "y04", name: "ハッシュタグ",
          desc: "SNSハッシュタグ表示。水色・右揃え",
          font: "HiraKakuProN-W3", size: 48,
          fill: [100, 180, 255], stroke: [0, 60, 120], strokeW: 4,
          shadow: false, align: "RIGHT", leading: 1.2
        },
        {
          id: "y05", name: "チャプター見出し",
          desc: "動画チャプター区切り用。白文字・紫縁",
          font: "HiraKakuProN-W6", size: 88,
          fill: [255, 255, 255], stroke: [80, 0, 180], strokeW: 12,
          shadow: true, shadowOpacity: 180, shadowDist: 6,
          align: "CENTER", leading: 1.1
        }
      ]
    },
    {
      name: "ニュース・報道",
      styles: [
        {
          id: "n01", name: "ニューステロップ（帯付き）",
          desc: "報道スタイル。縁なし（紺帯 #0000B4 と組合せ）",
          font: "HiraKakuProN-W6", size: 56,
          fill: [255, 255, 255], stroke: null, strokeW: 0,
          shadow: false, align: "LEFT", leading: 1.0,
          note: "背景帯(紺 #0000B4)と組み合わせて使用"
        },
        {
          id: "n02", name: "速報テロップ（上部バナー）",
          desc: "緊急・速報バナー。白文字（赤帯 #CC0000 と組合せ）",
          font: "HiraKakuProN-W6", size: 68,
          fill: [255, 255, 255], stroke: null, strokeW: 0,
          shadow: false, align: "CENTER", leading: 1.0,
          note: "背景帯(赤 #CC0000)と組み合わせて使用"
        },
        {
          id: "n03", name: "速報スクロール（下部バー）",
          desc: "画面下部の速報テロップ。黄文字（黒帯と組合せ）",
          font: "HiraKakuProN-W3", size: 44,
          fill: [255, 255, 0], stroke: null, strokeW: 0,
          shadow: false, align: "LEFT", leading: 1.0,
          note: "背景帯(黒 #000000)と組み合わせて使用"
        },
        {
          id: "n04", name: "コメンテーター字幕",
          desc: "解説者・スタジオコメントの字幕",
          font: "HiraKakuProN-W3", size: 52,
          fill: [255, 255, 255], stroke: [0, 0, 0], strokeW: 4,
          shadow: true, shadowOpacity: 160, shadowDist: 3,
          align: "LEFT", leading: 1.3
        }
      ]
    }
  ];

  // ============================================================
  // ユーティリティ
  // ============================================================
  function toHex(rgb) {
    function h(n) { var s = Math.round(n).toString(16); return s.length < 2 ? "0" + s : s; }
    return "#" + h(rgb[0]) + h(rgb[1]) + h(rgb[2]);
  }

  function specText(catName, s) {
    var L = [];
    L.push("【" + catName + "】" + s.name);
    L.push("説明: " + s.desc);
    L.push("─────────────────────────────────────");
    L.push("フォント         : " + s.font);
    L.push("サイズ           : " + s.size + " px");
    L.push("塗り色           : " + toHex(s.fill) +
           "  (R:" + s.fill[0] + "  G:" + s.fill[1] + "  B:" + s.fill[2] + ")");
    if (s.stroke) {
      L.push("縁取り色         : " + toHex(s.stroke) +
             "  (R:" + s.stroke[0] + "  G:" + s.stroke[1] + "  B:" + s.stroke[2] + ")");
      L.push("縁取り幅         : " + s.strokeW + " px");
    } else {
      L.push("縁取り           : なし");
    }
    if (s.shadow) {
      L.push("シャドウ         : あり  (不透明度:" + s.shadowOpacity + "  距離:" + s.shadowDist + "px)");
    } else {
      L.push("シャドウ         : なし");
    }
    var al = s.align === "CENTER" ? "中央揃え" : s.align === "LEFT" ? "左揃え" : "右揃え";
    L.push("テキスト配置     : " + al);
    if (s.leading) L.push("行間 (leading)   : " + s.leading);
    if (s.rotation) L.push("回転             : " + s.rotation + "°");
    if (s.note) L.push("備考             : " + s.note);
    return L.join("\n");
  }

  function allSpecsText() {
    var out = "================================================\n";
    out += "  テロップスタイル仕様書  (1920x1080 Full HD)\n";
    out += "  Generated : " + new Date().toLocaleString() + "\n";
    out += "================================================\n";
    for (var ci = 0; ci < CATEGORIES.length; ci++) {
      var cat = CATEGORIES[ci];
      out += "\n\n■ " + cat.name + "\n";
      out += "================================================\n";
      for (var si = 0; si < cat.styles.length; si++) {
        out += "\n" + specText(cat.name, cat.styles[si]) + "\n";
      }
    }
    return out;
  }

  // ============================================================
  // Premiere Pro API — 選択クリップへのスタイル適用
  // ============================================================
  function tryApplyToSelected(style) {
    var seq;
    try { seq = app.project.activeSequence; } catch (e) { seq = null; }
    if (!seq) return { ok: false, msg: "アクティブなシーケンスがありません。" };

    var applied = 0;
    var tracks = seq.videoTracks;
    for (var ti = 0; ti < tracks.numTracks; ti++) {
      var clips = tracks[ti].clips;
      for (var ci2 = 0; ci2 < clips.numItems; ci2++) {
        try {
          var clip = clips[ci2];
          if (!clip.selected) continue;
          // コンポーネントツリーを探索してフォントサイズを変更
          var comps = clip.components;
          for (var ki = 0; ki < comps.numItems; ki++) {
            applyToComponent(comps[ki], style);
          }
          applied++;
        } catch (e) { /* ignore unselectable clips */ }
      }
    }

    if (applied > 0) {
      return { ok: true, msg: applied + " クリップにフォントサイズを適用しました。\nその他の値は Essential Graphics パネルで手動設定してください。" };
    }
    return {
      ok: false,
      msg: "タイムラインでテキストクリップを選択してから「適用」ボタンを押してください。\n" +
           "選択後に再度実行すると、フォントサイズの変更を試みます。"
    };
  }

  function applyToComponent(comp, style) {
    try {
      var props = comp.properties;
      for (var i = 0; i < props.numItems; i++) {
        try {
          var p = props[i];
          var dn = p.displayName;
          // フォントサイズだけはAPIで設定可能なことが多い
          if (dn === "フォントサイズ" || dn === "Font Size") {
            p.setValue(style.size, true);
          }
        } catch (e) { /* ignore per-property errors */ }
      }
    } catch (e) { /* ignore per-component errors */ }
  }

  // ============================================================
  // ScriptUI
  // ============================================================
  var dlg = new Window("dialog", "テロップスタイルマネージャー  |  1920×1080 Full HD  |  v1.0");
  dlg.spacing = 8;
  dlg.margins = 14;

  // --- カテゴリ選択 ---
  var row1 = dlg.add("group");
  row1.orientation = "row";
  row1.add("statictext", undefined, "カテゴリ:");
  var catDrop = row1.add("dropdownlist", [0, 0, 340, 24],
    CATEGORIES.map(function (c) { return c.name; }));
  catDrop.selection = 0;
  row1.add("statictext", undefined, "  計" + (function () {
    var n = 0;
    for (var i = 0; i < CATEGORIES.length; i++) n += CATEGORIES[i].styles.length;
    return n;
  }()) + "スタイル収録");

  // --- メインエリア ---
  var mainGrp = dlg.add("group");
  mainGrp.orientation = "row";
  mainGrp.spacing = 10;

  // 左: スタイルリスト
  var leftPnl = mainGrp.add("panel", undefined, "スタイル一覧");
  var styleListBox = leftPnl.add("listbox", [4, 4, 234, 374], []);
  styleListBox.preferredSize = { width: 230, height: 370 };

  // 右: 詳細
  var rightPnl = mainGrp.add("panel", undefined, "設定値  (Essential Graphics パネルに手動入力)");
  var detailBox = rightPnl.add("edittext", [4, 4, 394, 374],
    "← スタイルを選択すると\n   設定値が表示されます",
    { multiline: true, readonly: true });
  detailBox.preferredSize = { width: 390, height: 370 };

  function refreshList(ci) {
    styleListBox.removeAll();
    var styles = CATEGORIES[ci].styles;
    for (var si = 0; si < styles.length; si++) {
      styleListBox.add("item", styles[si].name);
    }
    if (styleListBox.items.length > 0) {
      styleListBox.selection = 0;
      refreshDetail(ci, 0);
    }
  }

  function refreshDetail(ci, si) {
    detailBox.text = specText(CATEGORIES[ci].name, CATEGORIES[ci].styles[si]);
  }

  catDrop.onChange = function () { refreshList(catDrop.selection.index); };
  styleListBox.onChange = function () {
    if (styleListBox.selection !== null) {
      refreshDetail(catDrop.selection.index, styleListBox.selection.index);
    }
  };

  // --- ボタン行 ---
  var btnRow = dlg.add("group");
  btnRow.orientation = "row";
  btnRow.spacing = 8;

  var applyBtn = btnRow.add("button", undefined, "選択クリップに適用");
  applyBtn.preferredSize = { width: 160, height: 26 };

  var exportBtn = btnRow.add("button", undefined, "全スタイルを書き出し (.txt)");
  exportBtn.preferredSize = { width: 190, height: 26 };

  var closeBtn = btnRow.add("button", undefined, "閉じる");
  closeBtn.preferredSize = { width: 80, height: 26 };

  // ステータス行
  var statusLbl = dlg.add("statictext", undefined,
    "スタイルを選択 → Essential Graphics パネルで設定値を入力 → スタイルとして保存");
  statusLbl.preferredSize = { width: 650, height: 18 };

  // イベント
  applyBtn.onClick = function () {
    if (styleListBox.selection === null) { alert("スタイルを選択してください"); return; }
    var ci = catDrop.selection.index;
    var si = styleListBox.selection.index;
    var style = CATEGORIES[ci].styles[si];
    var r = tryApplyToSelected(style);
    statusLbl.text = (r.ok ? "✓ " : "✗ ") + r.msg.split("\n")[0];
    if (!r.ok) {
      alert("手動設定が必要です:\n\n" + r.msg + "\n\n────────\n設定値:\n\n" + specText(CATEGORIES[ci].name, style));
    } else {
      alert(r.msg);
    }
  };

  exportBtn.onClick = function () {
    try {
      var f = File.saveDialog("テロップスタイル仕様書を保存", "テキストファイル:*.txt");
      if (f) {
        f.encoding = "UTF-8";
        f.open("w");
        f.write(allSpecsText());
        f.close();
        statusLbl.text = "✓ 書き出し完了: " + decodeURI(f.name);
        alert("仕様書を保存しました:\n" + decodeURI(f.fsName));
      }
    } catch (e) {
      alert("保存エラー: " + e.toString());
    }
  };

  closeBtn.onClick = function () { dlg.close(); };

  // 初期化して表示
  refreshList(0);
  dlg.center();
  dlg.show();

}());
