const AXES = ["EI","SN","TF","JP"];
const QUICK_COUNT = 20;
let idx = 0;
let answers = Array(Q.length).fill(null);
let profile = {nickname:"", motif:"", appearance:""};
let verified = {};

const $ = s => document.querySelector(s);
function show(id) {
  ["start","quiz","quick","full"].forEach(x => $("#"+x).classList.toggle("hidden", x !== id));
  window.scrollTo({top:0,behavior:"smooth"});
}

function saveState() {
  profile.nickname = $("#nickname") ? $("#nickname").value.trim() : profile.nickname;
  profile.motif = $("#motif") ? $("#motif").value.trim() : profile.motif;
  profile.appearance = $("#appearance") ? $("#appearance").value.trim() : profile.appearance;
  localStorage.setItem("type64_step", JSON.stringify({idx, answers, profile}));
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem("type64_step"));
    if (s && Array.isArray(s.answers) && s.answers.length === Q.length) {
      idx = s.idx || 0;
      answers = s.answers;
      profile = s.profile || profile;
      return true;
    }
  } catch(e) {}
  return false;
}

function resetAll() {
  localStorage.removeItem("type64_step");
  idx = 0;
  answers = Array(Q.length).fill(null);
  verified = {};
}

function renderQ() {
  const q = Q[idx];
  $("#qnum").textContent = `項目 ${idx+1} / 64`;
  $("#phaseLabel").textContent = idx < QUICK_COUNT ? "20問の簡易分析" : "64問の詳細分析";
  $("#bar").style.width = `${(idx / Q.length) * 100}%`;
  $("#textA").textContent = q.a;
  $("#textB").textContent = q.b;
  $("#choiceA").classList.toggle("selected", answers[idx] === "A");
  $("#choiceB").classList.toggle("selected", answers[idx] === "B");
  $("#backBtn").disabled = idx === 0;
  $("#nextBtn").disabled = !answers[idx];
  $("#nextBtn").textContent = idx === Q.length - 1 ? "詳細結果を見る" : "次へ →";
}

function scoreUntil(limit) {
  const s = {EI:{E:0,I:0}, SN:{S:0,N:0}, TF:{T:0,F:0}, JP:{J:0,P:0}};
  for (let i=0; i<limit; i++) {
    const pick = answers[i];
    if (!pick) continue;
    const q = Q[i];
    const pole = pick === "A" ? q.aPole : q.bPole;
    s[q.axis][pole] += 1;
  }
  return s;
}

function codeFromScore(s) {
  let c = "";
  for (const key of AXES) {
    const m = META[key];
    const l = s[key][m.left], r = s[key][m.right];
    c += l >= r ? m.left : m.right;
  }
  return c;
}

function axisRows(targetId, s, limitText) {
  const root = $(targetId);
  root.innerHTML = "";
  for (const key of AXES) {
    const m = META[key];
    const L = s[key][m.left], R = s[key][m.right];
    const total = L + R || 1;
    const pct = Math.round(L / total * 100);
    const pick = L >= R ? m.left : m.right;
    const div = document.createElement("div");
    div.className = "axis";
    div.innerHTML = `
      <div class="axisHead">
        <div class="axisTitle">${m.title}</div>
        <div class="small">${m.left} ${L} / ${m.right} ${R}</div>
      </div>
      <div class="axisDesc">${limitText}では <b>${pick}</b> 側がやや多く選ばれました。</div>
      <div class="meter"><div class="meterFill" style="width:${pct}%"></div></div>
      <div class="ends"><span>${m.left}｜${m.leftName}</span><span>${m.rightName}｜${m.right}</span></div>
    `;
    root.appendChild(div);
  }
}

function renderQuick() {
  const s = scoreUntil(QUICK_COUNT);
  const code = codeFromScore(s);
  const info = TYPEINFO[code];
  $("#quickCode").textContent = code;
  $("#quickTypeName").textContent = `仮タイプ：${info.name}`;
  $("#quickSummary").textContent = info.summary + " これは20問時点の簡易表示なので、残り44問で変わることがあります。";
  axisRows("#quickAxes", s, "20問時点");
  show("quick");
}

function renderVerify(fullCode) {
  verified = {
    EI: fullCode[0],
    SN: fullCode[1],
    TF: fullCode[2],
    JP: fullCode[3]
  };
  const root = $("#verifyList");
  root.innerHTML = "";
  for (const key of AXES) {
    const m = META[key];
    const row = document.createElement("div");
    row.className = "verifyItem";
    row.innerHTML = `
      <h3>${m.title}</h3>
      <p class="axisDesc"><b>${m.left}｜${m.leftName}</b>：${m.leftDesc}<br><b>${m.right}｜${m.rightName}</b>：${m.rightDesc}</p>
      <div class="verifyBtns">
        <button class="ghost" data-axis="${key}" data-pole="${m.left}">${m.left} の方が自分らしい</button>
        <button class="ghost" data-axis="${key}" data-pole="${m.right}">${m.right} の方が自分らしい</button>
      </div>
    `;
    root.appendChild(row);
  }
  root.querySelectorAll("button").forEach(b => {
    b.onclick = () => {
      verified[b.dataset.axis] = b.dataset.pole;
      updateVerified();
    };
  });
  updateVerified();
}

function verifiedCodeValue() {
  return AXES.map(k => verified[k]).join("");
}

function summaryTextForCode(code) {
  const info = TYPEINFO[code];
  return `「${info.name}」：${info.summary} 得意面は「${info.strengths}」。気をつけたい面は「${info.watchouts}」。`;
}

function buildImagePrompt() {
  const code = verifiedCodeValue();
  const info = TYPEINFO[code];
  const nick = profile.nickname ? `名前・呼び名は「${profile.nickname}」。` : "";
  const motif = profile.motif ? `入れたい象徴モチーフは「${profile.motif}」。` : "象徴モチーフとして、" + info.image + " を取り入れてください。";
  const appearance = profile.appearance ? `外見・雰囲気の指定：${profile.appearance}。` : "外見は、落ち着きがあり象徴的な雰囲気の成人として描いてください。";
  const axisNotes = AXES.map(k => {
    const m = META[k];
    const p = verified[k];
    const name = p === m.left ? m.leftName : m.rightName;
    const desc = p === m.left ? m.leftDesc : m.rightDesc;
    return `${p}（${name}）：${desc}`;
  }).join("\n- ");

  return `以下の条件で、1枚のオリジナルイラストを作成してください。

【目的】
性格傾向を象徴的に表現した「タロットカード風」のイメージイラストを作る。
※ただし、既存の特定タロットデッキ（例：Rider-Waiteなど）の構図・絵柄・カード名・記号を直接模倣しないこと。
※著作権を侵害しないオリジナルデザインにすること。

【人物イメージの元情報】
${nick}
回答コード：${code}
タイプ名：${info.name}
要約：${info.summary}
得意面：${info.strengths}
気をつけたい面：${info.watchouts}

4軸の傾向：
- ${axisNotes}

${appearance}
${motif}

【描写要件】
- 縦長の1枚絵
- タロットカードから着想を得た、幻想的・象徴的・装飾的な雰囲気
- 中央に人物を配置し、周囲を装飾フレームで囲む
- 人物の表情・姿勢・小物・背景で性格傾向を象徴的に示す
- 配色は落ち着きと神秘性がありつつ、タイプの印象に合うもの
- 画面下部に、この作品のオリジナルタイトルとして「${info.name}」を英語または日本語で上品に入れてよい
- 細密で美しいイラスト、上質感のある仕上がり
- ロゴ、透かし、既存作品の固有意匠は入れない

【補足】
心理検査の公式カードではなく、回答結果から着想した象徴アートとして表現してください。`;
}

function buildSummaryBlock() {
  const fullCode = $("#fullCode").textContent;
  const finalCode = verifiedCodeValue();
  const info = TYPEINFO[finalCode];
  return `TYPE64 結果要約
20問時点の仮コードではなく、64問の詳細結果をもとに自己確認した最終コードは「${finalCode}」です。
タイプ名：${info.name}
概要：${info.summary}
得意面：${info.strengths}
気をつけたい面：${info.watchouts}
`;
}

function updateVerified() {
  const code = verifiedCodeValue();
  $("#verifiedCode").textContent = code;
  $("#verifiedSummary").textContent = summaryTextForCode(code);
  document.querySelectorAll("[data-axis]").forEach(b => {
    b.classList.toggle("on", verified[b.dataset.axis] === b.dataset.pole);
  });
  $("#imagePrompt").value = buildImagePrompt();
}

function renderFull() {
  const s = scoreUntil(64);
  const code = codeFromScore(s);
  const info = TYPEINFO[code];
  $("#fullCode").textContent = code;
  $("#fullTypeName").textContent = `詳細タイプ：${info.name}`;
  $("#fullSummary").textContent = info.summary;
  $("#strengthChip").textContent = `得意面：${info.strengths}`;
  $("#watchChip").textContent = `気をつけたい面：${info.watchouts}`;
  axisRows("#fullAxes", s, "64問全体");
  renderVerify(code);
  show("full");
  localStorage.removeItem("type64_step");
}

$("#startBtn").onclick = () => {
  profile.nickname = $("#nickname").value.trim();
  profile.motif = $("#motif").value.trim();
  profile.appearance = $("#appearance").value.trim();
  idx = 0;
  answers = Array(Q.length).fill(null);
  saveState();
  renderQ();
  show("quiz");
};

$("#resumeBtn").onclick = () => {
  $("#nickname").value = profile.nickname || "";
  $("#motif").value = profile.motif || "";
  $("#appearance").value = profile.appearance || "";
  renderQ();
  show("quiz");
};

$("#choiceA").onclick = () => { answers[idx] = "A"; saveState(); renderQ(); };
$("#choiceB").onclick = () => { answers[idx] = "B"; saveState(); renderQ(); };
$("#backBtn").onclick = () => { if (idx > 0) { idx--; saveState(); renderQ(); } };
$("#nextBtn").onclick = () => {
  if (!answers[idx]) return;
  if (idx === QUICK_COUNT - 1) {
    saveState();
    renderQuick();
    return;
  }
  if (idx < Q.length - 1) {
    idx++;
    saveState();
    renderQ();
  } else {
    renderFull();
  }
};

$("#continueBtn").onclick = () => {
  idx = QUICK_COUNT;
  saveState();
  renderQ();
  show("quiz");
};

$("#quickRestartBtn").onclick = () => {
  if (confirm("最初からやり直しますか？")) {
    resetAll();
    show("start");
  }
};

$("#restartBtn").onclick = () => {
  if (confirm("最初からやり直しますか？")) {
    resetAll();
    show("start");
  }
};

$("#copyPromptBtn").onclick = async () => {
  try {
    await navigator.clipboard.writeText($("#imagePrompt").value);
    $("#copyPromptBtn").textContent = "コピーしました";
    setTimeout(() => $("#copyPromptBtn").textContent = "プロンプトをコピー", 1400);
  } catch(e) {
    alert("コピーできない環境です。テキストを手動でコピーしてください。");
  }
};

$("#copySummaryBtn").onclick = async () => {
  try {
    await navigator.clipboard.writeText(buildSummaryBlock());
    $("#copySummaryBtn").textContent = "コピーしました";
    setTimeout(() => $("#copySummaryBtn").textContent = "結果要約をコピー", 1400);
  } catch(e) {
    alert(buildSummaryBlock());
  }
};

if (loadState()) {
  $("#nickname").value = profile.nickname || "";
  $("#motif").value = profile.motif || "";
  $("#appearance").value = profile.appearance || "";
  $("#resumeBtn").classList.remove("hidden");
  $("#resumeBtn").textContent = `途中から再開（項目 ${idx+1}）`;
}
