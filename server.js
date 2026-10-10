const http = require('http');

const PORT = process.env.PORT || 3000;

const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Eminem A–Z Practice</title>
<style>
:root{--bg:#080808;--panel:#121212;--panel2:#191919;--text:#f4f4f4;--muted:#aaa;--red:#e53935;--green:#32c875;--gold:#e0b24b;--line:#2b2b2b}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top,#181818 0,#080808 45%);color:var(--text);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;min-height:100vh}
.app{max-width:980px;margin:0 auto;padding:18px 14px 40px}.top{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;margin-bottom:14px}.brand h1{margin:0;font-size:clamp(26px,6vw,44px);letter-spacing:-.04em}.brand p{margin:5px 0 0;color:var(--muted);font-size:14px}.score{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:10px 13px;min-width:92px;text-align:center}.score strong{font-size:22px;display:block}.tabs{display:flex;gap:8px;margin:14px 0}.tab,.action{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:12px;min-height:44px;padding:0 14px;font-weight:700;cursor:pointer}.tab.active{border-color:var(--red);box-shadow:0 0 0 1px var(--red) inset}.letters{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin:12px 0}.letter{position:relative;min-height:52px;border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;font-size:19px;font-weight:900;cursor:pointer}.letter:hover{border-color:#666}.letter.selected{outline:2px solid var(--gold)}.letter.correct{border-color:var(--green);color:var(--green)}.letter.missed{border-color:var(--red);color:var(--red)}.letter.dead{border-color:var(--red);color:#888;background:#110a0a;cursor:not-allowed}.letter.dead:after{content:"";position:absolute;left:8px;right:8px;top:50%;height:3px;background:var(--red);transform:rotate(-16deg);border-radius:3px}.card{border:1px solid var(--line);background:rgba(18,18,18,.96);border-radius:16px;padding:16px;margin-top:12px}.card h2{margin:0 0 8px;font-size:22px}.muted{color:var(--muted)}.songs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.song{border:1px solid var(--line);background:#0e0e0e;color:var(--text);padding:11px 12px;border-radius:10px;text-align:left;cursor:pointer;font-weight:650}.song:hover{border-color:#666}.song small{display:block;color:var(--muted);font-weight:500;margin-top:2px}.testbox{display:grid;gap:12px}.prompt{font-size:44px;font-weight:950;letter-spacing:-.04em}.row{display:flex;gap:8px;flex-wrap:wrap}.primary{background:var(--red);border-color:var(--red)}.danger{border-color:var(--red);color:#ff6d68}.good{border-color:var(--green);color:var(--green)}input{width:100%;min-height:48px;border-radius:12px;border:1px solid var(--line);background:#0c0c0c;color:var(--text);padding:0 13px;font-size:16px}.feedback{min-height:24px;font-weight:750}.feedback.ok{color:var(--green)}.feedback.bad{color:#ff716b}.pill{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:4px 9px;color:var(--muted);font-size:12px;margin:2px 4px 2px 0}.footer-note{font-size:12px;color:#777;margin-top:14px}.hidden{display:none!important}
@media(max-width:560px){.letters{grid-template-columns:repeat(5,1fr)}.songs{grid-template-columns:1fr}.top{align-items:center}.score{min-width:78px}.app{padding-top:12px}.prompt{font-size:38px}}
</style>
</head>
<body>
<main class="app">
  <div class="top">
    <div class="brand"><h1>EMINEM A–Z</h1><p>Browse the catalog or run a practice round.</p></div>
    <div class="score"><span class="muted">Score</span><strong id="score">0/24</strong></div>
  </div>

  <div class="tabs">
    <button class="tab active" data-mode="browse">Browse</button>
    <button class="tab" data-mode="test">Test</button>
  </div>

  <div id="letters" class="letters" aria-label="Alphabet"></div>

  <section id="browseCard" class="card">
    <h2 id="browseTitle">A songs</h2>
    <div id="browseMeta" class="muted"></div>
    <div id="songs" class="songs"></div>
  </section>

  <section id="testCard" class="card hidden">
    <div class="testbox">
      <div>
        <div class="muted">Current letter</div>
        <div id="testLetter" class="prompt">A</div>
      </div>
      <div class="row">
        <button id="micBtn" class="action primary">🎤 Speak answer</button>
        <button id="revealBtn" class="action">Reveal songs</button>
        <button id="missBtn" class="action danger">✕ Missed it</button>
      </div>
      <input id="guess" autocomplete="off" placeholder="Or type a song title and press Enter" />
      <div id="heard" class="muted"></div>
      <div id="feedback" class="feedback"></div>
      <div id="choices" class="songs hidden"></div>
      <div class="row">
        <button id="nextBtn" class="action good">Next letter</button>
        <button id="resetBtn" class="action">Reset run</button>
      </div>
    </div>
  </section>

  <div class="footer-note">House rule: Q and X are crossed out and excluded from scoring. Voice uses your browser's speech recognition when available.</div>
</main>
<script>
const CATALOG = {
A:[['Almost Famous','Recovery'],['Amityville','The Marshall Mathers LP'],['Antichrist','The Death of Slim Shady'],['Arose','Revival'],['As the World Turns','The Slim Shady LP'],['Ass Like That','Encore'],['Asshole','The Marshall Mathers LP 2']],
B:[['Baby','The Marshall Mathers LP 2 Deluxe'],['Backstabber','Infinite'],['Bad Guy','The Marshall Mathers LP 2'],['Bad Husband','Revival'],['Bad Meets Evil','The Slim Shady LP'],['Bad One','The Death of Slim Shady'],['Bagpipes from Baghdad','Relapse'],['Beautiful','Relapse'],['Beautiful Pain','The Marshall Mathers LP 2 Deluxe'],['Believe','Revival'],['Berzerk','The Marshall Mathers LP 2'],['Big Weenie','Encore'],['Bitch Please II','The Marshall Mathers LP'],['Black Magic','Music to Be Murdered By – Side B'],['Book of Rhymes','Music to Be Murdered By – Side B'],['Brain Damage','The Slim Shady LP'],['Brainless','The Marshall Mathers LP 2'],['Brand New Dance','The Death of Slim Shady'],['Buffalo Bill','Relapse: Refill'],['Business','The Eminem Show']],
C:[['Castle','Revival'],['Chloraseptic','Revival'],['Cinderella Man','Recovery'],['Cleanin’ Out My Closet','The Eminem Show'],['Cold Wind Blows','Recovery'],['Crack a Bottle','Relapse'],['Crazy in Love','Encore'],['Criminal','The Marshall Mathers LP'],['Cum on Everybody','The Slim Shady LP']],
D:[['Darkness','Music to Be Murdered By'],['Deja Vu','Relapse'],['Desperation','The Marshall Mathers LP 2 Deluxe'],['Discombobulated','Music to Be Murdered By – Side B'],['Drug Ballad','The Marshall Mathers LP'],['Drips','The Eminem Show'],['Drop the Bomb on ’Em','Relapse: Refill']],
E:[['Elevator','Relapse: Refill'],['Encore / Curtains Down','Encore'],['Evil','The Death of Slim Shady'],['Evil Deeds','Encore'],['Evil Twin','The Marshall Mathers LP 2']],
F:[['FACK','Curtain Call'],['Fall','Kamikaze'],['Farewell','Music to Be Murdered By'],['Favorite Bitch','Music to Be Murdered By – Side B'],['Framed','Revival'],['Fuel','The Death of Slim Shady'],['Forever','Relapse: Refill']],
G:[['Gnat','Music to Be Murdered By – Side B'],['Godzilla','Music to Be Murdered By'],['Going Through Changes','Recovery'],['Good Guy','Kamikaze'],['Greatest','Kamikaze'],['Groundhog Day','The Marshall Mathers LP 2 Deluxe'],['Guilty Conscience','The Slim Shady LP'],['Guilty Conscience 2','The Death of Slim Shady'],['Guts Over Fear','Shady XV']],
H:[['Habits','The Death of Slim Shady'],['Hailie’s Song','The Eminem Show'],['Head Honcho','The Death of Slim Shady'],['Headlights','The Marshall Mathers LP 2'],['Heat','Revival'],['Hell Breaks Loose','Relapse: Refill'],['Higher','Music to Be Murdered By – Side B'],['Houdini','The Death of Slim Shady']],
I:[['I’m Back','The Marshall Mathers LP'],['I’m Shady','The Slim Shady LP'],['I Will','Music to Be Murdered By'],['If I Had','The Slim Shady LP'],['In Too Deep','Music to Be Murdered By'],['In Your Head','Revival'],['Infinite','Infinite'],['Insane','Relapse'],['It’s OK','Infinite']],
J:[['Jealousy Woes II','Infinite'],['Jimmy Crack Corn','Eminem Presents: The Re-Up'],['Just Don’t Give a Fuck','The Slim Shady LP'],['Just Lose It','Encore']],
K:[['Kamikaze','Kamikaze'],['Kill You','The Marshall Mathers LP'],['Killer','Music to Be Murdered By – Side B'],['Kim','The Marshall Mathers LP'],['Kings Never Die','Southpaw']],
L:[['Leaving Heaven','Music to Be Murdered By'],['Legacy','The Marshall Mathers LP 2'],['Like Home','Revival'],['Like My Shit','The Death of Slim Shady bonus'],['Like Toy Soldiers','Encore'],['Little Engine','Music to Be Murdered By'],['Lock It Up','Music to Be Murdered By'],['Lose Yourself','8 Mile'],['Love Game','The Marshall Mathers LP 2'],['Love the Way You Lie','Recovery'],['Love You More','Encore'],['Lucifer','The Death of Slim Shady'],['Lucky You','Kamikaze']],
M:[['Majesty','Nicki Minaj feat. Eminem'],['Marsh','Music to Be Murdered By'],['Marshall Mathers','The Marshall Mathers LP'],['Maxine','Infinite'],['Medicine Ball','Relapse'],['Mockingbird','Encore'],['Mosh','Encore'],['Mr. Mathers','Relapse'],['Murder, Murder','Slim Shady EP'],['Music Box','Relapse: Refill'],['Must Be the Ganja','Relapse'],['My 1st Single','Encore'],['My Dad’s Gone Crazy','The Eminem Show'],['My Fault','The Slim Shady LP'],['My Mom','Relapse'],['My Name Is','The Slim Shady LP']],
N:[['Need Me','Revival'],['Never 2 Far','Infinite'],['Never Enough','Encore'],['Never Love Again','Music to Be Murdered By'],['Nice Guy','Kamikaze'],['No Apologies','Eminem Presents: The Re-Up'],['No Love','Recovery'],['No Regrets','Music to Be Murdered By'],['Normal','Kamikaze'],['Not Afraid','Recovery'],['Not Alike','Kamikaze'],['Nowhere Fast','Revival']],
O:[['Offended','Revival'],['Old Time’s Sake','Relapse'],['On Fire','Recovery'],['One Shot 2 Shot','Encore'],['Open Mic','Infinite']],
P:[['Phenomenal','Southpaw'],['Premonition (Intro)','Music to Be Murdered By'],['Public Enemy #1','Eminem Presents: The Re-Up'],['Puke','Encore']],
Q:[],
R:[['Rabbit Run','8 Mile'],['Rain Man','Encore'],['Rap God','The Marshall Mathers LP 2'],['Recovery','—'],['Remember Me?','The Marshall Mathers LP'],['Remind Me','Revival'],['Renaissance','The Death of Slim Shady'],['Renegade','Jay-Z feat. Eminem'],['Rhyme or Reason','The Marshall Mathers LP 2'],['Ridaz','Recovery Deluxe'],['River','Revival'],['Road Rage','The Death of Slim Shady'],['Rock Bottom','The Slim Shady LP'],['Role Model','The Slim Shady LP']],
S:[['Same Song & Dance','Relapse'],['Say Goodbye Hollywood','The Eminem Show'],['Say What You Say','The Eminem Show'],['Searchin’','Infinite'],['Seduction','Recovery'],['Session One','Recovery Deluxe'],['Shake That','Curtain Call'],['She Loves Me','Music to Be Murdered By – Side B'],['Sing for the Moment','The Eminem Show'],['So Bad','Recovery'],['So Far...','The Marshall Mathers LP 2'],['So Much Better','The Marshall Mathers LP 2'],['Soldier','The Eminem Show'],['Somebody Save Me','The Death of Slim Shady'],['Space Bound','Recovery'],['Spend Some Time','Encore'],['Square Dance','The Eminem Show'],['Stan','The Marshall Mathers LP'],['Stay Wide Awake','Relapse'],['Stepping Stone','Kamikaze'],['Still Don’t Give a Fuck','The Slim Shady LP'],['Stimulate','8 Mile deluxe'],['Stronger Than I Was','The Marshall Mathers LP 2'],['Superman','The Eminem Show'],['Survival','The Marshall Mathers LP 2']],
T:[['Taking My Ball','Relapse: Refill'],['Talkin’ 2 Myself','Recovery'],['Temporary','The Death of Slim Shady'],['The Kids','The Marshall Mathers LP bonus'],['The Monster','The Marshall Mathers LP 2'],['The Real Slim Shady','The Marshall Mathers LP'],['The Ringer','Kamikaze'],['The Sauce','diss track'],['The Way I Am','The Marshall Mathers LP'],['These Demons','Music to Be Murdered By – Side B'],['Those Kinda Nights','Music to Be Murdered By'],['Till I Collapse','The Eminem Show'],['Tobey','The Death of Slim Shady'],['Tone Deaf','Music to Be Murdered By – Side B'],['Tonite','Infinite'],['Tragic Endings','Revival'],['Trouble','The Death of Slim Shady']],
U:[['Unaccommodating','Music to Be Murdered By'],['Under the Influence','The Marshall Mathers LP'],['Underground','Relapse'],['Untitled','Recovery'],['Untouchable','Revival']],
V:[['Venom','Kamikaze']],
W:[['W.T.P.','Recovery'],['Walk on Water','Revival'],['We As Americans','Encore Deluxe'],['We Made You','Relapse'],['What’s the Difference','Dr. Dre feat. Eminem'],['When I’m Gone','Curtain Call'],['When the Music Stops','The Eminem Show'],['White America','The Eminem Show'],['White Trash Party','Recovery'],['Who Knew','The Marshall Mathers LP'],['Wicked Ways','The Marshall Mathers LP 2 Deluxe'],['Without Me','The Eminem Show'],['Won’t Back Down','Recovery']],
X:[],
Y:[['Yah Yah','Music to Be Murdered By'],['Yellow Brick Road','Encore'],['You Don’t Know','Eminem Presents: The Re-Up'],['You Gon’ Learn','Music to Be Murdered By'],['You’re Never Over','Recovery']],
Z:[['Zeus','Music to Be Murdered By – Side B']]
};

const DEAD = new Set(['Q','X']);
const playable = Object.keys(CATALOG).filter(l=>!DEAD.has(l));
const $ = s => document.querySelector(s);
const lettersEl = $('#letters'), songsEl = $('#songs'), browseTitle = $('#browseTitle'), browseMeta = $('#browseMeta');
const browseCard = $('#browseCard'), testCard = $('#testCard'), testLetter = $('#testLetter'), choices = $('#choices');
const feedback = $('#feedback'), heard = $('#heard'), guess = $('#guess'), scoreEl = $('#score');
let mode='browse', selected='A', idx=0;
let state = JSON.parse(localStorage.getItem('eminemAZState')||'{}');

function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]/g,'');}
function save(){localStorage.setItem('eminemAZState',JSON.stringify(state));}
function renderLetters(){lettersEl.innerHTML=''; for(const l of Object.keys(CATALOG)){const b=document.createElement('button');b.className='letter';b.textContent=l;if(DEAD.has(l)){b.classList.add('dead');b.title='Excluded by house rule';b.disabled=true;}else{if(l===selected)b.classList.add('selected');if(state[l]==='correct')b.classList.add('correct');if(state[l]==='missed')b.classList.add('missed');b.onclick=()=>{selected=l;if(mode==='browse')showBrowse(l);else{idx=playable.indexOf(l);showTest(l);}renderLetters();};}lettersEl.appendChild(b);}updateScore();}
function updateScore(){const correct=playable.filter(l=>state[l]==='correct').length;scoreEl.textContent=correct+'/24';}
function songButton([title,source],onClick){const b=document.createElement('button');b.className='song';b.innerHTML='<span></span><small></small>';b.querySelector('span').textContent=title;b.querySelector('small').textContent=source||'';if(onClick)b.onclick=()=>onClick(title);return b;}
function showBrowse(l){selected=l;browseTitle.textContent=l+' songs';const arr=CATALOG[l];browseMeta.textContent=arr.length?arr.length+' accepted titles in this practice catalog. Tap one to mark it as your pick.':'No entry under the house rules.';songsEl.innerHTML='';arr.forEach(x=>songsEl.appendChild(songButton(x,t=>{state[l]='correct';save();renderLetters();browseMeta.textContent='Locked in: '+t;})));}
function setMode(m){mode=m;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.mode===m));browseCard.classList.toggle('hidden',m!=='browse');testCard.classList.toggle('hidden',m!=='test');if(m==='test'){const first=playable.find(l=>!state[l])||'A';idx=playable.indexOf(first);showTest(first);}else showBrowse(selected);renderLetters();}
function showTest(l){selected=l;testLetter.textContent=l;feedback.textContent='';feedback.className='feedback';heard.textContent='';guess.value='';choices.classList.add('hidden');choices.innerHTML='';CATALOG[l].forEach(x=>choices.appendChild(songButton(x,t=>markCorrect('Locked in: '+t))));renderLetters();}
function markCorrect(msg){state[selected]='correct';save();feedback.textContent='✓ '+msg;feedback.className='feedback ok';renderLetters();}
function markMiss(){state[selected]='missed';save();feedback.textContent='✕ Marked missed.';feedback.className='feedback bad';renderLetters();}
function checkGuess(raw){const n=norm(raw);heard.textContent=raw?'Heard/typed: “'+raw+'”':'';const match=CATALOG[selected].find(([t])=>{const x=norm(t);return n===x || n.includes(x) || x.includes(n);});if(match){markCorrect(match[0]+' counts.');return true;}feedback.textContent='No match yet — try again, reveal the songs, or mark it missed.';feedback.className='feedback bad';return false;}
function next(){idx=(idx+1)%playable.length;showTest(playable[idx]);}

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('#revealBtn').onclick=()=>choices.classList.toggle('hidden');
$('#missBtn').onclick=markMiss;
$('#nextBtn').onclick=next;
$('#resetBtn').onclick=()=>{if(confirm('Reset the whole practice run?')){state={};save();idx=0;showTest(playable[0]);renderLetters();}};
guess.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();checkGuess(guess.value);}});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const micBtn = $('#micBtn');
if(!SpeechRecognition){micBtn.disabled=true;micBtn.textContent='🎤 Voice not supported here';}
else{
  const rec = new SpeechRecognition();rec.lang='en-US';rec.interimResults=false;rec.maxAlternatives=3;
  micBtn.onclick=()=>{feedback.textContent='Listening…';feedback.className='feedback';heard.textContent='';try{rec.start();}catch(e){}};
  rec.onresult=e=>{const alts=[...e.results[0]].map(x=>x.transcript);heard.textContent='Heard: '+alts.map(x=>'“'+x+'”').join(' / ');const hit=alts.some(checkGuess);if(!hit && !feedback.textContent)checkGuess(alts[0]);};
  rec.onerror=e=>{feedback.textContent='Voice error: '+e.error+'. You can still type or reveal choices.';feedback.className='feedback bad';};
}

showBrowse('A');renderLetters();
</script>
</body>
</html>`;

const server = http.createServer((req,res)=>{
  if(req.url==='/health'){res.writeHead(200,{'content-type':'text/plain'});return res.end('ok');}
  res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});
  res.end(html);
});
server.listen(PORT,'0.0.0.0',()=>console.log('Eminem A-Z practice running on '+PORT));
