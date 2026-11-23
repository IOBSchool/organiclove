/* LP計測（件数だけ。氏名・メールは送らない）
   view / cta / form_start / scroll50 / scroll90 を、申込GASの「計測」シートへ記録する。
   使い方：<script src="track.js" data-page="hub|pro|life" defer></script>
   自分の確認は URL の最後に ?src=me を付ける（計測から外れる）。 */
(function () {
  var GAS = "https://script.google.com/macros/s/AKfycbwV4eF7i4VXf4bl_PFZLyRzRngR15VHOt2-vUVXSnnggN8MZImsFCT26Cm6psEoEMLX7A/exec";
  var cur = document.currentScript;
  var page = (cur && cur.getAttribute("data-page")) || "unknown";
  var src = "";
  try {
    var v = new URLSearchParams(location.search).get("src") || "";
    if (/^[A-Za-z0-9_-]{1,30}$/.test(v)) src = v;
  } catch (e) {}
  if (src === "me") return;

  var vid = "";
  try {
    vid = localStorage.getItem("ol_vid") || "";
    if (!vid) { vid = Math.random().toString(36).slice(2, 10); localStorage.setItem("ol_vid", vid); }
  } catch (e) { vid = Math.random().toString(36).slice(2, 10); }

  var dev = window.innerWidth < 768 ? "sp" : "pc";
  var ref = "";
  try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}

  function send(ev, cta) {
    var payload = JSON.stringify({ ev: ev, page: page, src: src, vid: vid, cta: cta || "", dev: dev, ref: ref });
    try {
      fetch(GAS, {
        method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "payload=" + encodeURIComponent(payload)
      });
    } catch (e) {}
  }

  send("view");

  /* ボタン別押下：どの位置のボタンかを名前にする */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("a.choice, button, .btn, a.cta, a[href]") : null;
    if (!t) return;
    var name = "";
    if (t.id) name = t.id;
    else if (t.matches("button, .btn")) {
      var btns = Array.prototype.slice.call(document.querySelectorAll("form button, .btn"));
      name = "btn-" + (btns.indexOf(t) + 1);
    } else {
      var links = Array.prototype.slice.call(document.querySelectorAll("a[href]"));
      name = "link-" + (links.indexOf(t) + 1);
    }
    send("cta", name);
  }, true);

  /* フォーム入力の開始（1回だけ） */
  var started = false;
  document.addEventListener("focusin", function (e) {
    if (started) return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) { started = true; send("form_start"); }
  });

  /* スクロール 50% / 90%（各1回） */
  var s50 = false, s90 = false;
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    var p = window.scrollY / h;
    if (!s50 && p >= 0.5) { s50 = true; send("scroll50"); }
    if (!s90 && p >= 0.9) { s90 = true; send("scroll90"); }
  }, { passive: true });
})();
