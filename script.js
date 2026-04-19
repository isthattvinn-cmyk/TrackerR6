const basePlayers = [
  { name: "NovaVex", platform: "Ubisoft", currentRank: "Champion", peakRank: "Champion", rankScore: 5142, hsPercent: 58, kd: 1.42, winRate: 62, region: "NA East", form: "hot", trend: "up" },
  { name: "GhostLatch", platform: "PlayStation", currentRank: "Diamond I", peakRank: "Champion", rankScore: 4988, hsPercent: 54, kd: 1.29, winRate: 58, region: "NA Central", form: "hot", trend: "up" },
  { name: "RookTheory", platform: "Xbox", currentRank: "Diamond III", peakRank: "Diamond I", rankScore: 4612, hsPercent: 49, kd: 1.18, winRate: 56, region: "EU West", form: "steady", trend: "flat" },
  { name: "PulseShift", platform: "Ubisoft", currentRank: "Emerald I", peakRank: "Diamond II", rankScore: 4324, hsPercent: 51, kd: 1.14, winRate: 53, region: "NA East", form: "hot", trend: "up" },
  { name: "Breachline", platform: "PlayStation", currentRank: "Diamond V", peakRank: "Diamond II", rankScore: 4170, hsPercent: 47, kd: 1.08, winRate: 52, region: "EU North", form: "steady", trend: "flat" },
  { name: "MintControl", platform: "Xbox", currentRank: "Emerald II", peakRank: "Diamond IV", rankScore: 4018, hsPercent: 46, kd: 1.01, winRate: 51, region: "NA West", form: "cold", trend: "down" },
  { name: "ZeroCall", platform: "Ubisoft", currentRank: "Diamond II", peakRank: "Champion", rankScore: 4760, hsPercent: 61, kd: 1.36, winRate: 60, region: "EU West", form: "hot", trend: "up" },
  { name: "AshTempo", platform: "PlayStation", currentRank: "Emerald I", peakRank: "Diamond III", rankScore: 4286, hsPercent: 55, kd: 1.21, winRate: 54, region: "NA East", form: "steady", trend: "up" },
  { name: "EchoFrame", platform: "Xbox", currentRank: "Diamond IV", peakRank: "Diamond II", rankScore: 4448, hsPercent: 52, kd: 1.19, winRate: 57, region: "NA South", form: "hot", trend: "up" },
  { name: "SmokeLedger", platform: "Ubisoft", currentRank: "Championship Push", peakRank: "Champion", rankScore: 5077, hsPercent: 63, kd: 1.47, winRate: 64, region: "EU Central", form: "hot", trend: "up" },
  { name: "PixelBunker", platform: "PlayStation", currentRank: "Emerald III", peakRank: "Emerald I", rankScore: 3892, hsPercent: 43, kd: 0.98, winRate: 49, region: "NA East", form: "cold", trend: "down" },
  { name: "VandalNorth", platform: "Xbox", currentRank: "Diamond II", peakRank: "Champion", rankScore: 4816, hsPercent: 57, kd: 1.31, winRate: 59, region: "EU West", form: "steady", trend: "flat" },
];

const liveMatchTemplates = [
  {
    id: "match-4012",
    map: "Clubhouse",
    mode: "Ranked",
    status: "Round 5 live",
    score: "2 - 2",
    pace: "High entry pressure",
    platforms: ["Ubisoft", "PlayStation", "Xbox"],
    teams: {
      alpha: ["NovaVex", "GhostLatch", "PulseShift", "AshTempo", "PixelBunker"],
      bravo: ["ZeroCall", "RookTheory", "MintControl", "EchoFrame", "VandalNorth"],
    },
  },
  {
    id: "match-4013",
    map: "Chalet",
    mode: "Ranked",
    status: "Round 7 live",
    score: "4 - 2",
    pace: "Defender heavy",
    platforms: ["Ubisoft", "PlayStation"],
    teams: {
      alpha: ["SmokeLedger", "Breachline", "NovaVex", "GhostLatch", "PixelBunker"],
      bravo: ["ZeroCall", "AshTempo", "PulseShift", "RookTheory", "EchoFrame"],
    },
  },
];

const rankTiers = {
  "Championship Push": 9,
  Champion: 10,
  "Diamond I": 9,
  "Diamond II": 8,
  "Diamond III": 7,
  "Diamond IV": 6,
  "Diamond V": 5,
  "Emerald I": 4,
  "Emerald II": 3,
  "Emerald III": 2,
};

const state = {
  players: [],
  matches: [],
  search: "",
  platform: "all",
  sortBy: "rankScore",
  lastUpdated: new Date(),
};

const refs = {
  trackedAccounts: document.querySelector("#trackedAccounts"),
  liveMatchesCount: document.querySelector("#liveMatchesCount"),
  playersInLobby: document.querySelector("#playersInLobby"),
  searchInput: document.querySelector("#searchInput"),
  platformFilter: document.querySelector("#platformFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  snapshotList: document.querySelector("#snapshotList"),
  trackerLinks: document.querySelector("#trackerLinks"),
  platformGrid: document.querySelector("#platformGrid"),
  leaderboard: document.querySelector("#leaderboard"),
  matchList: document.querySelector("#matchList"),
  lastUpdated: document.querySelector("#lastUpdated"),
  refreshButton: document.querySelector("#refreshButton"),
};

function createLiveState() {
  state.players = basePlayers.map((player, index) => {
    const jitter = ((index % 4) - 1.5) * 9;
    return {
      ...player,
      rankScore: player.rankScore + Math.round(jitter),
      lastMatchDelta: Math.round(jitter),
      sessionWinRate: clamp(player.winRate + ((index % 3) - 1) * 2, 42, 72),
      accuracyPulse: clamp(player.hsPercent + ((index % 5) - 2), 35, 70),
    };
  });

  state.matches = buildMatches(state.players);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildMatches(players) {
  return liveMatchTemplates.map((match, matchIndex) => {
    const alpha = match.teams.alpha.map((name, playerIndex) => attachPlayerMatchStats(players, name, "Alpha", playerIndex, matchIndex));
    const bravo = match.teams.bravo.map((name, playerIndex) => attachPlayerMatchStats(players, name, "Bravo", playerIndex, matchIndex));
    return {
      ...match,
      teams: { alpha, bravo },
    };
  });
}

function attachPlayerMatchStats(players, name, teamName, playerIndex, matchIndex) {
  const found = players.find((player) => player.name === name);
  const modifier = ((playerIndex + 1) * (matchIndex + 2)) % 4;
  const kills = clamp(Math.round(found.kd * 4 + modifier), 1, 11);
  const deaths = clamp(5 - modifier + matchIndex, 1, 8);

  return {
    ...found,
    teamName,
    kills,
    deaths,
    rating: clamp(Number((0.82 + found.kd * 0.22 + modifier * 0.04).toFixed(2)), 0.8, 1.78),
    entry: clamp(found.hsPercent + modifier * 2, 38, 72),
  };
}

function applyLiveTick() {
  state.players = state.players.map((player, index) => {
    const swing = ((Date.now() / 1000 + index) % 3) - 1;
    const delta = Math.round(swing * 12);
    return {
      ...player,
      rankScore: clamp(player.rankScore + delta, 3200, 5600),
      hsPercent: clamp(player.hsPercent + (delta > 0 ? 1 : -1), 36, 68),
      kd: clamp(Number((player.kd + delta * 0.002).toFixed(2)), 0.86, 1.6),
      lastMatchDelta: delta,
      sessionWinRate: clamp(player.sessionWinRate + (delta > 0 ? 1 : -1), 40, 74),
      accuracyPulse: clamp(player.accuracyPulse + (delta > 0 ? 1 : -1), 35, 72),
    };
  });

  state.matches = buildMatches(state.players);
  state.lastUpdated = new Date();
  render();
}

function getFilteredPlayers() {
  return state.players
    .filter((player) => state.platform === "all" || player.platform === state.platform)
    .filter((player) => player.name.toLowerCase().includes(state.search) || player.currentRank.toLowerCase().includes(state.search))
    .sort((a, b) => {
      const left = normalizeSortValue(a[state.sortBy], a.currentRank);
      const right = normalizeSortValue(b[state.sortBy], b.currentRank);
      return right - left;
    });
}

function normalizeSortValue(value, rankName) {
  if (typeof value === "number") return value;
  return rankTiers[rankName] || 0;
}

function render() {
  const filteredPlayers = getFilteredPlayers();
  const filteredMatches = getFilteredMatches(filteredPlayers);
  const displayPlayers = filteredPlayers.length ? filteredPlayers : state.players;
  const displayMatches = filteredPlayers.length ? filteredMatches : state.matches;

  refs.trackedAccounts.textContent = String(filteredPlayers.length);
  refs.liveMatchesCount.textContent = String(filteredMatches.length);
  refs.playersInLobby.textContent = String(filteredMatches.reduce((sum, match) => sum + match.teams.alpha.length + match.teams.bravo.length, 0));
  refs.lastUpdated.textContent = `Updated ${formatTime(state.lastUpdated)}`;

  renderTrackerLinks(filteredPlayers.length);
  renderSnapshots(filteredPlayers, filteredMatches);
  renderPlatforms(displayPlayers);
  renderLeaderboard(displayPlayers, filteredPlayers.length);
  renderMatches(displayMatches, filteredPlayers.length);
}

function getFilteredMatches(filteredPlayers) {
  const names = new Set(filteredPlayers.map((player) => player.name));
  return state.matches.filter((match) => {
    const roster = [...match.teams.alpha, ...match.teams.bravo];
    return roster.some((player) => names.has(player.name));
  });
}

function renderSnapshots(players, matches) {
  if (!players.length) {
    refs.snapshotList.innerHTML = `
      <article class="snapshot-item">
        <h3>No players found</h3>
        <p>Try clearing the filters to restore the board.</p>
      </article>
    `;
    return;
  }

  const topPlayer = players[0];
  const hottestPlayer = [...players].sort((a, b) => b.hsPercent - a.hsPercent)[0];
  const averageHs = Math.round(players.reduce((sum, player) => sum + player.hsPercent, 0) / players.length);

  refs.snapshotList.innerHTML = `
    <article class="snapshot-item">
      <h3>Best rank score</h3>
      <strong>${topPlayer.name}</strong>
      <p>${topPlayer.currentRank} | ${topPlayer.rankScore} MMR</p>
    </article>
    <article class="snapshot-item">
      <h3>Sharpest HS%</h3>
      <strong>${hottestPlayer.hsPercent}%</strong>
      <p>${hottestPlayer.name} is leading the filtered pool.</p>
    </article>
    <article class="snapshot-item">
      <h3>Lobby average HS%</h3>
      <strong>${averageHs}%</strong>
      <p>${matches.length} live lobby${matches.length === 1 ? "" : "ies"} on screen.</p>
    </article>
  `;
}

function renderPlatforms(players) {
  const platforms = ["PlayStation", "Ubisoft", "Xbox"];

  refs.platformGrid.innerHTML = platforms.map((platform) => {
    const pool = players.filter((player) => player.platform === platform);
    const best = [...pool].sort((a, b) => b.rankScore - a.rankScore)[0];
    const avgHs = pool.length ? Math.round(pool.reduce((sum, player) => sum + player.hsPercent, 0) / pool.length) : 0;
    const avgKd = pool.length ? (pool.reduce((sum, player) => sum + player.kd, 0) / pool.length).toFixed(2) : "0.00";

    return `
      <article class="platform-card">
        <div class="platform-header">
          <div>
            <span class="platform-badge platform-${platform.toLowerCase()}">${platform}</span>
            <h3>${pool.length ? best.name : "No players in view"}</h3>
            <p class="meta-line">${pool.length ? `${best.currentRank} peak ${best.peakRank}` : "Adjust filters to populate this card."}</p>
          </div>
          <strong>${pool.length ? best.rankScore : "--"}</strong>
        </div>
        <div class="metric-row">
          <div class="metric">
            <span>Average HS%</span>
            <strong>${avgHs}%</strong>
          </div>
          <div class="metric">
            <span>Average K/D</span>
            <strong>${avgKd}</strong>
          </div>
          <div class="metric">
            <span>Top current rank</span>
            <strong>${pool.length ? best.currentRank : "--"}</strong>
          </div>
          <div class="metric">
            <span>Peak ceiling</span>
            <strong>${pool.length ? best.peakRank : "--"}</strong>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderLeaderboard(players, exactMatchCount) {
  const helper = exactMatchCount
    ? ""
    : renderNoMatchHelper("No exact match in the local board. The leaderboard below is still showing the full demo pool while you use the real tracker links above.");

  refs.leaderboard.innerHTML = `
    ${helper}
    ${players.map((player, index) => `
    <article class="leader-row">
      <div class="leader-row-left">
        <div class="position-badge">#${index + 1}</div>
        <div>
          <strong class="player-name">${player.name}</strong>
          <p class="meta-line">${player.platform} | ${player.region} | Peak ${player.peakRank}</p>
        </div>
      </div>
      <div class="leader-row-right">
        <div class="stat-pills">
          <span class="signal-pill ${signalClass(player.lastMatchDelta)}">${signedValue(player.lastMatchDelta)} MMR</span>
          <span class="rank-pill">${player.currentRank}</span>
          <span class="rank-pill">${player.hsPercent}% HS</span>
          <span class="rank-pill">${player.kd.toFixed(2)} K/D</span>
          <span class="rank-pill">${player.winRate}% WR</span>
        </div>
      </div>
    </article>
  `).join("")}
  `;
}

function renderMatches(matches, exactMatchCount) {
  const helper = exactMatchCount
    ? ""
    : renderNoMatchHelper("True live R6 lobby rosters are not available here from a public browser API. This section is a structured demo board until you wire a backend or desktop-app source.");

  refs.matchList.innerHTML = `
    ${helper}
    ${matches.map((match) => `
    <article class="match-card">
      <div class="match-top">
        <div>
          <p class="eyebrow">${match.mode}</p>
          <h3>${match.map}</h3>
          <p class="meta-line">${match.status} | ${match.pace} | Platforms ${match.platforms.join(", ")}</p>
        </div>
        <div class="stat-pills">
          <span class="rank-pill">${match.score}</span>
          <span class="rank-pill">${match.id}</span>
        </div>
      </div>
      <div class="compact-grid">
        <div class="mini-metric">
          <span>Tracked players</span>
          <strong>10</strong>
        </div>
        <div class="mini-metric">
          <span>Highest peak</span>
          <strong>${getHighestPeak(match)}</strong>
        </div>
        <div class="mini-metric">
          <span>Highest HS%</span>
          <strong>${getHighestHs(match)}%</strong>
        </div>
        <div class="mini-metric">
          <span>Top rating</span>
          <strong>${getHighestRating(match)}</strong>
        </div>
      </div>
      <div class="roster-grid">
        <section class="roster-card">
          <h4>Alpha Team</h4>
          <div class="team-rows">
            ${match.teams.alpha.map(renderPlayerLine).join("")}
          </div>
        </section>
        <section class="roster-card">
          <h4>Bravo Team</h4>
          <div class="team-rows">
            ${match.teams.bravo.map(renderPlayerLine).join("")}
          </div>
        </section>
      </div>
    </article>
  `).join("")}
  `;
}

function renderTrackerLinks(exactMatchCount) {
  const query = refs.searchInput.value.trim();
  const selectedPlatform = refs.platformFilter.value;

  if (!query) {
    refs.trackerLinks.innerHTML = `
      <article class="tracker-helper">
        <h3>Real tracker shortcuts</h3>
        <p class="meta-line">Type your gamertag, then use the real tracker links here if the local demo board does not contain your account yet.</p>
      </article>
    `;
    return;
  }

  const platformSlug = {
    Ubisoft: "ubi",
    PlayStation: "psn",
    Xbox: "xbl",
  };

  const trackerUrl = selectedPlatform === "all"
    ? "https://r6.tracker.network/"
    : `https://r6.tracker.network/r6siege/profile/${platformSlug[selectedPlatform]}/${encodeURIComponent(query)}/overview`;

  refs.trackerLinks.innerHTML = `
    <article class="tracker-helper">
      <h3>${exactMatchCount ? "Player found in demo pool" : "Open real trackers for this name"}</h3>
      <p class="meta-line">${query} | ${selectedPlatform === "all" ? "Choose a platform for a direct profile link" : selectedPlatform}</p>
      <div class="external-link-list">
        <a class="external-link" href="${trackerUrl}" target="_blank" rel="noreferrer">Open Tracker Network</a>
        <a class="external-link" href="https://www.ubisoft.com/en-us/game/rainbow-six/siege/stats" target="_blank" rel="noreferrer">Open Ubisoft Stats</a>
        <a class="external-link" href="https://stats.cc/" target="_blank" rel="noreferrer">Open Stats.cc Search</a>
      </div>
      <p class="meta-line">If nothing resolves, try your linked Ubisoft Connect name. Console lookups often fail when the PSN/Xbox tag differs from the linked Ubisoft account name.</p>
    </article>
  `;
}

function renderNoMatchHelper(text) {
  return `
    <article class="tracker-helper">
      <h3>Search guidance</h3>
      <p class="meta-line">${text}</p>
    </article>
  `;
}

function renderPlayerLine(player) {
  return `
    <article class="player-line ${player.form === "hot" ? "hot" : ""}">
      <div class="player-name-stack">
        <strong>${player.name}</strong>
        <span>${player.platform} | Current ${player.currentRank}</span>
      </div>
      <div class="player-cell">
        <span>Peak</span>
        <strong>${player.peakRank}</strong>
      </div>
      <div class="player-cell">
        <span>HS%</span>
        <strong>${player.hsPercent}%</strong>
      </div>
      <div class="player-cell">
        <span>K/D</span>
        <strong>${player.kd.toFixed(2)}</strong>
      </div>
      <div class="player-cell">
        <span>Live</span>
        <strong>${player.kills}-${player.deaths}</strong>
      </div>
      <div class="player-cell">
        <span>Rating</span>
        <strong>${player.rating}</strong>
      </div>
    </article>
  `;
}

function getHighestPeak(match) {
  const roster = [...match.teams.alpha, ...match.teams.bravo];
  return roster.sort((a, b) => (rankTiers[b.peakRank] || 0) - (rankTiers[a.peakRank] || 0))[0].peakRank;
}

function getHighestHs(match) {
  return [...match.teams.alpha, ...match.teams.bravo].reduce((best, player) => Math.max(best, player.hsPercent), 0);
}

function getHighestRating(match) {
  return [...match.teams.alpha, ...match.teams.bravo].reduce((best, player) => Math.max(best, player.rating), 0).toFixed(2);
}

function signalClass(delta) {
  if (delta > 0) return "good";
  if (delta < 0) return "bad";
  return "warn";
}

function signedValue(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

function attachEvents() {
  refs.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  refs.platformFilter.addEventListener("change", (event) => {
    state.platform = event.target.value;
    render();
  });

  refs.sortFilter.addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    render();
  });

  refs.refreshButton.addEventListener("click", () => {
    applyLiveTick();
  });
}

function init() {
  createLiveState();
  attachEvents();
  render();
  window.setInterval(applyLiveTick, 10000);
}

init();
