export interface CustomPreset {
  name: string;
  icon: string;
  desc: string;
  width: number;
  height: number;
  html: string;
  css: string;
  js: string;
}

export const STARTER_PRESETS: CustomPreset[] = [
  {
    name: 'Jam Analog Neon',
    icon: 'clock',
    desc: 'Jam analog modern dengan jarum detik mengalir dan aksen neon bercahaya.',
    width: 320,
    height: 310,
    html: `<div class="clock-wrap">
  <div class="clock">
    <div class="dial">
      <div class="marker m12">12</div>
      <div class="marker m3">3</div>
      <div class="marker m6">6</div>
      <div class="marker m9">9</div>
      <div class="hand hour" id="hourHand"></div>
      <div class="hand minute" id="minuteHand"></div>
      <div class="hand second" id="secondHand"></div>
      <div class="center-nut"></div>
    </div>
  </div>
  <div class="digital-time" id="digitalTime">--:--:--</div>
</div>`,
    css: `.clock-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: transparent;
}
.clock {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.35);
  border: 2px solid rgba(96, 165, 250, 0.7);
  position: relative;
  margin-bottom: 12px;
}
.dial {
  position: relative;
  width: 100%;
  height: 100%;
}
.marker {
  position: absolute;
  color: #f1f5f9;
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 0 6px rgba(96, 165, 250, 0.8);
}
.m12 { top: 8px; left: 50%; transform: translateX(-50%); }
.m3  { right: 8px; top: 50%; transform: translateY(-50%); }
.m6  { bottom: 8px; left: 50%; transform: translateX(-50%); }
.m9  { left: 8px; top: 50%; transform: translateY(-50%); }

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 4px;
}
.hour {
  width: 4px;
  height: 44px;
  background: #ffffff;
  margin-left: -2px;
  box-shadow: 0 0 6px #ffffff;
}
.minute {
  width: 3px;
  height: 60px;
  background: #60a5fa;
  margin-left: -1.5px;
  box-shadow: 0 0 8px #60a5fa;
}
.second {
  width: 1.5px;
  height: 70px;
  background: #f43f5e;
  margin-left: -0.75px;
  box-shadow: 0 0 8px #f43f5e;
}
.center-nut {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border: 2px solid #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #3b82f6;
}
.digital-time {
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  color: #60a5fa;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
}`,
    js: `function updateClock() {
  const now = new Date();
  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr = now.getHours();

  const secDeg = (sec / 60) * 360;
  const minDeg = ((min + sec / 60) / 60) * 360;
  const hrDeg = ((hr % 12 + min / 60) / 12) * 360;

  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');
  const digi = document.getElementById('digitalTime');

  if (hourHand) hourHand.style.transform = 'rotate(' + hrDeg + 'deg)';
  if (minuteHand) minuteHand.style.transform = 'rotate(' + minDeg + 'deg)';
  if (secondHand) secondHand.style.transform = 'rotate(' + secDeg + 'deg)';
  if (digi) {
    const pad = (n) => String(n).padStart(2, '0');
    digi.innerText = pad(hr) + ':' + pad(min) + ':' + pad(sec);
  }
}
updateClock();
setInterval(updateClock, 1000);`,
  },
  {
    name: 'Pomodoro Timer',
    icon: 'activity',
    desc: 'Timer fokus produktivitas 25 menit dengan kontrol Mulai, Jeda, dan Reset.',
    width: 320,
    height: 250,
    html: `<div class="pomo-card">
  <div class="pomo-badge">Fokus Produktif</div>
  <div class="timer-display" id="timeDisplay">25:00</div>
  <div class="actions">
    <button id="startBtn" class="btn primary">Mulai</button>
    <button id="pauseBtn" class="btn secondary">Jeda</button>
    <button id="resetBtn" class="btn text">Reset</button>
  </div>
  <div class="status" id="statusText">Sesi siap dimulai</div>
</div>`,
    css: `.pomo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
}
.pomo-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #34d399;
  background: rgba(52, 211, 153, 0.15);
  padding: 3px 10px;
  border-radius: 9999px;
  margin-bottom: 8px;
}
.timer-display {
  font-size: 42px;
  font-weight: 800;
  font-family: monospace;
  color: #ffffff;
  text-shadow: 0 0 15px rgba(255,255,255,0.2);
  margin-bottom: 12px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.btn {
  border: none;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn.primary {
  background: #3b82f6;
  color: #fff;
}
.btn.primary:hover { background: #2563eb; }
.btn.secondary {
  background: rgba(255,255,255,0.1);
  color: #e2e8f0;
}
.btn.secondary:hover { background: rgba(255,255,255,0.2); }
.btn.text {
  background: transparent;
  color: #94a3b8;
}
.btn.text:hover { color: #f43f5e; }
.status {
  font-size: 11px;
  color: #94a3b8;
}`,
    js: `let totalSeconds = 25 * 60;
let timerId = null;

function renderTime() {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  const disp = document.getElementById('timeDisplay');
  if (disp) disp.innerText = pad(m) + ':' + pad(s);
}

document.getElementById('startBtn').addEventListener('click', () => {
  if (timerId) return;
  document.getElementById('statusText').innerText = 'Sedang fokus... Tetap semangat!';
  timerId = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      renderTime();
    } else {
      clearInterval(timerId);
      timerId = null;
      document.getElementById('statusText').innerText = 'Waktu habis! Waktunya istirahat.';
    }
  }, 1000);
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    document.getElementById('statusText').innerText = 'Jeda sementara.';
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  clearInterval(timerId);
  timerId = null;
  totalSeconds = 25 * 60;
  renderTime();
  document.getElementById('statusText').innerText = 'Sesi di-reset.';
});
renderTime();`,
  },
  {
    name: 'Kutipan Inspirasi Harian',
    icon: 'sparkles',
    desc: 'Kutipan motivasi dan kata bijak harian dengan tombol refresh kutipan baru.',
    width: 340,
    height: 230,
    html: `<div class="quote-box">
  <div class="quote-icon">“</div>
  <p class="quote-text" id="quoteText">Fokuslah pada kemajuan, bukan kesempurnaan.</p>
  <span class="quote-author" id="quoteAuthor">— Anonim</span>
  <button class="new-btn" id="newQuoteBtn">Kutipan Lain</button>
</div>`,
    css: `.quote-box {
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.quote-icon {
  font-size: 36px;
  line-height: 1;
  color: #a855f7;
  opacity: 0.6;
  margin-bottom: -10px;
}
.quote-text {
  font-size: 13px;
  font-weight: 500;
  font-style: italic;
  color: #f1f5f9;
  line-height: 1.5;
  margin-bottom: 8px;
}
.quote-author {
  font-size: 11px;
  color: #c084fc;
  font-weight: 600;
  margin-bottom: 14px;
}
.new-btn {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  color: #e9d5ff;
  border-radius: 9999px;
  padding: 4px 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.new-btn:hover {
  background: rgba(168, 85, 247, 0.4);
  color: #ffffff;
}`,
    js: `const quotes = [
  { text: "Fokuslah pada kemajuan, bukan kesempurnaan.", author: "Anonim" },
  { text: "Cara terbaik untuk memulai adalah berhenti berbicara dan mulai melakukan.", author: "Walt Disney" },
  { text: "Waktu Anda terbatas, jangan sia-siakan dengan menjalani hidup orang lain.", author: "Steve Jobs" },
  { text: "Kesulitan seringkali mempersiapkan orang biasa untuk takdir yang luar biasa.", author: "C.S. Lewis" },
  { text: "Disiplin adalah jembatan antara tujuan dan pencapaian.", author: "Jim Rohn" }
];

let idx = 0;
document.getElementById('newQuoteBtn').addEventListener('click', () => {
  idx = (idx + 1) % quotes.length;
  document.getElementById('quoteText').innerText = quotes[idx].text;
  document.getElementById('quoteAuthor').innerText = '— ' + quotes[idx].author;
});`,
  },
];
