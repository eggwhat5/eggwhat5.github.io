// Decode and play previews only while they can be seen. Keep native controls usable.
const previewVideos = document.querySelectorAll('video[data-preview]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const previewStates = new Map();
const automaticPauses = new WeakSet();
function syncPreview(video) {
  const state = previewStates.get(video);
  if (document.hidden || !state.visible || reducedMotion.matches) {
    if (!video.paused) {
      automaticPauses.add(video);
      video.pause();
    }
  } else if (!state.userPaused && video.muted) {
    // Safari may refuse automatic playback in Low Power Mode; controls still work.
    video.play().catch(() => {});
  }
}
if ('IntersectionObserver' in window) {
  const previewObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      previewStates.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      syncPreview(entry.target);
    }
  }, { threshold: [0, 0.25] });
  previewVideos.forEach((video) => {
    previewStates.set(video, { visible: false, userPaused: false });
    video.addEventListener('pause', () => {
      if (automaticPauses.has(video)) automaticPauses.delete(video);
      else if (!video.ended) previewStates.get(video).userPaused = true;
    });
    video.addEventListener('play', () => {
      previewStates.get(video).userPaused = false;
    });
    previewObserver.observe(video);
  });
  document.addEventListener('visibilitychange', () => previewVideos.forEach(syncPreview));
  reducedMotion.addEventListener('change', () => previewVideos.forEach(syncPreview));
}

const clock = document.querySelector('#local-clock');
const year = document.querySelector('#year');
const themeButton = document.querySelector('#theme-toggle');
year.textContent = new Date().getFullYear();
function updateClock(){
  clock.textContent = new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date()) + ' YOUR LOCAL TIME';
}
updateClock();
setInterval(updateClock,60000);
let savedTheme;
try { savedTheme = localStorage.getItem('mp-theme'); } catch {}
if(savedTheme === 'light') document.body.classList.add('light-mode');
function syncThemeButton(){
  const light = document.body.classList.contains('light-mode');
  themeButton.setAttribute('aria-pressed',String(light));
  themeButton.textContent = light ? '◐ Theme: Light' : '☼ Theme: CRT';
}
syncThemeButton();
themeButton.addEventListener('click',()=>{
  document.body.classList.toggle('light-mode');
  try { localStorage.setItem('mp-theme',document.body.classList.contains('light-mode')?'light':'crt'); } catch {}
  syncThemeButton();
});

const numberFormat = new Intl.NumberFormat();
const liveFetch = (url) => fetch(url, { headers: { Accept: 'application/json' } }).then((response) => {
  if (!response.ok) throw new Error(`Live count request failed (${response.status})`);
  return response.json();
});

async function updateBrainchipPlayers(){
  const output = document.querySelector('#brainchip-playing');
  if (!output) return;
  try {
    const places = await liveFetch('https://games.roblox.com/v1/games/multiget-place-details?placeIds=91523839824288');
    const universeId = places?.[0]?.universeId;
    if (!universeId) throw new Error('Roblox did not return a universe ID');
    const gameInfo = await liveFetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const players = gameInfo?.data?.[0]?.playing;
    if (!Number.isFinite(players)) throw new Error('Roblox did not return a player count');
    output.textContent = `${numberFormat.format(players)} players`;
  } catch {
    output.textContent = 'Count unavailable';
  }
}

async function updateDiscordOnline(inviteCode, outputId){
  const output = document.getElementById(outputId);
  if (!output) return;
  try {
    const invite = await liveFetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
    const online = invite?.approximate_presence_count;
    output.textContent = Number.isFinite(online) ? `~${numberFormat.format(online)} online` : 'Count unavailable';
  } catch {
    output.textContent = 'Count unavailable';
  }
}

async function updateLiveCounts(){
  await Promise.allSettled([
    updateBrainchipPlayers(),
    updateDiscordOnline('SHNNd5shf9', 'discord-brainchip'),
    updateDiscordOnline('USrZ7dNjuu', 'discord-windbound'),
    updateDiscordOnline('J4tRqmP3eF', 'discord-imposter')
  ]);
}
updateLiveCounts();
setInterval(updateLiveCounts, 5 * 60 * 1000);

const radioAudio = document.querySelector('#radio-audio');
if (radioAudio) {
  const radioTracks = [
     { src: 'media/radio/biggis%20Sturg_6.mp3', title: 'Int' },
     { src: 'media/radio/bduussu_10.mp3', title: 'Spur' },
     { src: 'media/radio/diggy%20jugger_17.mp3', title: 'Under' },
     { src: 'media/radio/mandrill.mp3', title: 'Mandrill' },
     { src: 'media/radio/sandclouds.mp3', title: 'Sandclouds' }
  ];
  const toggleButton = document.querySelector('#radio-toggle');
  const radioStatus = document.querySelector('.radio-label');
  radioStatus.setAttribute('role', 'status');
  let currentTrack = 0;
  let playbackRequest = 0;
  function showTrack(loading = false) {
    radioStatus.textContent = `${loading ? 'Loading' : 'RADIO'} / ${radioTracks[currentTrack].title}`;
  }
  function showPlaybackError(error) {
    if (error?.name === 'AbortError') return;
    radioStatus.textContent = 'Unable to play. Try another track.';
    syncRadioButton();
  }
  function syncRadioButton() {
    const playing = !radioAudio.paused;
    toggleButton.textContent = playing ? 'Ⅱ' : '▶';
    toggleButton.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    toggleButton.setAttribute('aria-pressed', String(playing));
  }
  function playRadio() {
    const request = ++playbackRequest;
    showTrack(true);
    radioAudio.play().catch((error) => {
      if (request === playbackRequest) showPlaybackError(error);
    });
  }
  function selectRadioTrack(index, autoplay = false) {
    ++playbackRequest;
    radioAudio.pause();
    currentTrack = (index + radioTracks.length) % radioTracks.length;
    showTrack(autoplay);
    radioAudio.src = radioTracks[currentTrack].src;
    radioAudio.load();
    syncRadioButton();
    if (autoplay) playRadio();
  }
  toggleButton.addEventListener('click', () => {
    if (radioAudio.paused) playRadio();
    else {
      ++playbackRequest;
      radioAudio.pause();
      showTrack();
    }
  });
  document.querySelector('#radio-prev').addEventListener('click', () => selectRadioTrack(currentTrack - 1, true));
  document.querySelector('#radio-next').addEventListener('click', () => selectRadioTrack(currentTrack + 1, true));
  radioAudio.addEventListener('play', syncRadioButton);
  radioAudio.addEventListener('playing', () => { showTrack(); });
  radioAudio.addEventListener('error', showPlaybackError);
  radioAudio.addEventListener('pause', syncRadioButton);
  radioAudio.addEventListener('ended', () => selectRadioTrack(currentTrack + 1, true));
  showTrack();
  syncRadioButton();
}
