let itemPacks = [
  {
    name: "Default Twitch bingo",
    items: [
      "VTuber",
      "Streamer AFK",
      "Over 10,000 viewers",
      "Pet cam",
      "IRL stream",
      "Movie/TV show",
      "Streamer you recognize",
      "Console stream",
      "Speedrunner",
      "Empty chat",
      "Gambling",
      "Sleeping",
      "Dancing",
      "#AD stream",
      "Sponsors overlay",
      "Reacting to videos",
      "Low quality cam",
      "Low quality mic",
      "NotLikeThis screen",
      "ASMR stream",
      "1k+ viewers & inactive chat",
      "Hand cam",
      "Cosplaying",
      "Random gifs in overlay",
      "Driving stream",
      "Esports tournament",
      "Playing an instrument",
      "Subscribers only chat",
      "RGB lights in background",
      "Follow goal overlay",
      "Sub count overlay",
      "Default profile picture",
      "Eating",
      "Same game 2 times in a row",
      "Top gifter 100+ gifts",
      "Top cheerer 10k+ bits",
      "Only mods & VIPs in chat",
      "Game older than 20 years",
      "24/7 music stream",
      "DJ",
      "Activate Windows watermark",
      "Singing",
      "Cooking",
      "Only bots in chat",
      "Hype Train active",
      "Wrong stream category",
      "Neon username sign",
      "Subathon",
      "Always on animals stream",
      "Affiliate/Partner anniversary",
      "Birthday stream",
      "Numbers in username",
      "Art stream",
      "Social links overlay",
      "Streamer you follow",
      "Fullscreen facecam",
      "Chat overlay",
      "Emotes overlay",
      "Pinned chat message",
      "Drops enabled",
      "Mobile stream",
      "Programming stream",
      "Streamer doesn't speak for 1m",
      "Donation goal overlay",
      "Stream ending",
      "Wearing their own merch",
      "TTS",
      "Emoji in title",
      "AI stream",
    ],
  },
];
let selectedPacks = [0];
let currentItems = [];

const elements = {
  leaderboardCount: document.getElementById("leaderboardCount"),
  leaderboard: document.getElementById("leaderboard"),
  infoTime: document.getElementById("infoTime"),
  skipSexual: document.getElementById("skipSexual"),
  unloadWarningBingo: document.getElementById("unloadWarningBingo"),
  seenChannels: document.getElementById("seenChannels"),
  resetSeenChannels: document.getElementById("resetSeenChannels"),
  loginExpiredModal: document.getElementById("loginExpiredModal"),
  packsModal: document.getElementById("packsModal"),
  packEditorSelect: document.getElementById("packEditorSelect"),
  packEditorName: document.getElementById("packEditorName"),
  packEditorItems: document.getElementById("packEditorItems"),
  deletePackButton: document.getElementById("deletePackButton"),
  packSwitchesDiv: document.getElementById("packSwitchesDiv"),
  packDropdownButton: document.getElementById("packDropdownButton"),
  allowDiagonals: document.getElementById("allowDiagonals"),
  twitchBingo: document.getElementById("twitchBingo"),
  customBingo: document.getElementById("customBingo"),
  bingoTypeDescription: document.getElementById("bingoTypeDescription"),
  customBingoName: document.getElementById("customBingoName"),
  customBingoNameDiv: document.getElementById("customBingoNameDiv"),
  bingoSize: document.getElementById("bingoSize"),
  bingoSizeLabel: document.getElementById("bingoSizeLabel"),
  boardInputs: document.getElementById("boardInputs"),
  board: document.getElementById("board"),
  boardSearch: document.getElementById("board-search"),
  boardSearchBar: document.getElementById("board-search-bar"),
  boardSearchToggle: document.getElementById("board-search-toggle"),
  bingoStats: document.getElementById("bingoStats"),
  bingoStatsTooltip: document.getElementById("bingoStatsTooltip"),
  boardContent: document.getElementById("board-inner"),
  previewDiv: document.getElementById("previewDiv"),
  previewBoard: document.getElementById("previewBoard"),
  previewUsername: document.getElementById("previewUsername"),
  toastContainer: document.getElementById("toastContainer"),
  settingsCard: document.getElementById("settingsCard"),
  start: document.getElementById("start"),
  mainCard: document.getElementById("mainCard"),
  twitchEmbedDiv: document.getElementById("twitchEmbedDiv"),
  twitchEmbed: document.getElementById("twitchEmbed"),
  boardSize: document.getElementById("boardSize"),
  boardOpacity: document.getElementById("boardOpacity"),
  loginButton: document.getElementById("loginButton"),
  loginInfo: document.getElementById("loginInfo"),
  loginDescription: document.getElementById("loginDescription"),
  loginInfoPFP: document.getElementById("loginInfoPFP"),
  bingoLink: document.getElementById("bingoLink"),
  copyButton: document.getElementById("copyButton"),
  previousStream: document.getElementById("previousStream"),
  bingoPopover: document.getElementById("bingoPopover"),
  nextStream: document.getElementById("nextStream"),
};

let TWITCH = {
  channel: "",
  access_token: "",
  userID: "",
};

let loginExpiredModal, packsModal;
let bingoStatsTooltip;
let streamerScore;
let copyButton;
let mainList = [];
let seenChannels = [];
let previousChannels = [];
let player;
let retryLimit = 0;
let customBadges = [];
let refreshCooldown;
let channelName;
let skipSexual = true;
let unloadWarningBingo = true;
let userInteracted = false;
let bingoPopover;
let bingoType = "twitch";
let bingoSize = 5;

let board = [];
let won = false;
let boardCreated = false;

async function getMainList() {
  let requestOptions = {
    headers: {
      pragma: "no-cache",
      "cache-control": "no-cache",
    },
  };
  try {
    let response = await fetch(`https://api.okayeg.com/guess?dank=${Date.now()}`, requestOptions);
    let list = await response.json();
    mainList = list.guess.guess;
    elements.infoTime.innerHTML = `Channel list updated on ${new Date(list.guess.time)}`;
  } catch (error) {
    console.log(error);
    showToast("Could not load channel list :(", "danger", "5000");
  }
} //getMainList

async function nextStream() {
  let currentChannel = player?.getChannel() || 0;
  let currentIndex = previousChannels.findIndex((x) => x == currentChannel);
  if (previousChannels[currentIndex + 1]) {
    showPreviousStream(currentIndex, true);
    return;
  }

  elements.nextStream.disabled = true;
  setTimeout(() => {
    elements.nextStream.disabled = false;
  }, 2000);

  if (previousChannels.length > 0) {
    elements.previousStream.disabled = false;
  }

  let channel = mainList.pop();
  //reroll if channel already seen or if it has the sexual label and the skip sexual option is checked
  while (seenChannels.includes(channel.username) || (channel.sexual && skipSexual)) {
    channel = mainList.pop();
  }
  if (mainList.length == 0 || !channel) {
    showToast("No more channels left on the list ...getting new list", "danger", "3000");
    await getMainList();
    shuffleArray(mainList);
    nextStream();
    return;
  }
  if (retryLimit > 5) {
    showToast("Too many retries, something might be wrong :(", "danger", "3000");
    return;
  }

  //update stream info
  try {
    let response = await fetch(`https://helper.guessr.tv/twitch/streams?user_id=${channel.userid}`);
    let stream = await response.json();
    if (!stream.data[0]) {
      retryLimit++;
      return nextStream();
    }

    retryLimit = 0;
    let options = {
      width: "100%",
      height: "100%",
      channel: channel.username,
      layout: "video-with-chat",
      theme: "dark",
      parent: ["guessr.tv", "127.0.0.1"],
    };
    if (!player) {
      player = new Twitch.Embed("twitchEmbed", options);
    } else {
      player.setChannel(channel.username);
    }
    previousChannels.push(channel.username);
    seenChannels.push(channel.username);
    localforage.setItem("seenChannels", JSON.stringify(seenChannels));
    elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();

    if (channel.username == channelName) {
      showConfetti(2);
      sendUsername(" - dank ⚠️ ⚠️ ⚠️");
    }
    updateStatsTooltip();
  } catch (error) {
    console.log(error);
    retryLimit++;
    return nextStream();
  }
} //nextStream

function previousStream() {
  let currentChannel = player.getChannel();
  let currentIndex = previousChannels.findIndex((x) => x == currentChannel);
  if (currentIndex == 0) {
    showToast("Can't go further back", "danger", "3000");
    return;
  }
  showPreviousStream(currentIndex, false);
} //previousStream

function showPreviousStream(currentIndex, forward) {
  player.setChannel(previousChannels[(currentIndex += forward ? 1 : -1)]);
} //showPreviousStream

function fillCell(event) {
  if (!boardCreated) {
    let textInput = document.querySelector(`input[data-item-id="${event.target.dataset.id}"]`);
    textInput.scrollIntoView({ behavior: "smooth" });
    textInput.select();
    textInput.focus();
    return;
  }
  clearTimeout(refreshCooldown);
  event.target.classList.toggle("filled");
  hideSearchBar();
  let cellNumber = parseInt(event.target.dataset.id, 10) - 1;
  board[cellNumber].filled = !board[cellNumber].filled;
  checkWin(board, true);
  if (TWITCH?.channel) {
    refreshCooldown = setTimeout(() => {
      updateLeaderboard();
    }, 3000);
  }
  updateStatsTooltip();
} //fillCell

function randomize(event) {
  const id = event.target.dataset.itemId;
  const input = document.querySelector(`[data-item-id="${id}"]`);
  const bingoItems = document.querySelectorAll(".bingo-item");
  const taken = [...bingoItems].map((x) => x.value).filter(Boolean);
  let random = currentItems[Math.floor(Math.random() * currentItems.length)];
  if (taken.length >= currentItems.length) {
    showToast("No more presets left", "danger", 3000);
    return;
  }
  while (taken.includes(random)) {
    random = currentItems[Math.floor(Math.random() * currentItems.length)];
  }

  input.value = random;
  loadItems();
  userInteracted = true;
  changeSiteLinkTarget("_blank");
} //randomize

function randomizeAll() {
  const bingoItems = document.querySelectorAll(".bingo-item");

  if (![...bingoItems].map((e) => e.value).includes("")) {
    showToast("Board is full", "warning", 2000);
    return;
  }

  let options = shuffleArray(structuredClone(currentItems));
  for (let index = 0; index < bingoItems.length; index++) {
    let option = options.pop();
    if (!option) {
      showToast("No more presets left", "danger", 3000);
      break;
    }
    if (!bingoItems[index].value) {
      bingoItems[index].value = option;
    }
  }
  loadItems();
  userInteracted = true;
  changeSiteLinkTarget("_blank");
} //randomizeAll

function clearAll() {
  const bingoItems = document.querySelectorAll(".bingo-item");
  const bingoCells = document.querySelectorAll(".bingo-cell");
  for (let index = 0; index < bingoItems.length; index++) {
    bingoItems[index].value = "";
    bingoCells[index].innerText = index + 1;
    bingoCells[index].classList.remove("duplicate");
  }
  userInteracted = false;
  changeSiteLinkTarget("_self");
} //clearAll

async function start() {
  elements.start.innerHTML = spinner;

  await uploadBoard();
  if (!boardCreated) {
    elements.start.innerHTML = `<i class="material-icons notranslate">celebration</i> Start!`;
    return;
  }

  if (bingoType == "twitch") {
    await getMainList();
    shuffleArray(mainList);
    nextStream();
    elements.twitchEmbedDiv.style.display = "";
  }

  elements.settingsCard.style.display = "none";
  elements.board.style.display = "";
  elements.mainCard.style.display = "";
  userInteracted = true;
  changeSiteLinkTarget("_blank");
} //start

function loadItems() {
  const bingoItems = document.querySelectorAll(".bingo-item");
  const cells = document.querySelectorAll(".bingo-cell");

  const itemValues = [...bingoItems].map((x) => x.value.trim());

  for (let index = 0; index < cells.length; index++) {
    cells[index].innerText = itemValues[index] || index + 1;
    cells[index].title = itemValues[index];
    cells[index].classList.remove("filled");
    cells[index].classList.remove("selected");
    board[index].value = itemValues[index];
    board[index].filled = false;
  }

  checkDuplicatesOnBoard();
} //loadItems

function updateSingleItem(element) {
  const itemId = parseInt(element.dataset.itemId, 10);
  const index = itemId - 1;
  const itemCell = document.querySelector(`.bingo-cell[data-id="${itemId}"]`);

  const itemValue = element.value.trim();
  board[index].value = itemValue.trim();
  board[index].filled = false;

  itemCell.innerText = itemValue.trim();
  itemCell.title = itemValue.trim();
  itemCell.classList.remove("filled");

  checkDuplicatesOnBoard();
} //updateSingleItem

function move(event) {
  let currentId = parseInt(event.target.dataset.itemId, 10);
  switch (event.key) {
    case "ArrowLeft": {
      if (event.target.selectionStart > 0) {
        return;
      }

      if (Math.abs(currentId % 2) == 1) {
        return;
      }
      let textInput = document.querySelector(`input[data-item-id="${currentId - 1}"]`);
      if (!textInput) {
        return;
      }
      textInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
      textInput.select();
      textInput.focus();
      break;
    }

    case "ArrowRight": {
      if (event.target.selectionStart < event.target.value.length) {
        return;
      }

      if (currentId % 2 == 0) {
        return;
      }

      let textInput = document.querySelector(`input[data-item-id="${currentId + 1}"]`);
      if (!textInput) {
        return;
      }
      textInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
      textInput.select();
      textInput.focus();
      break;
    }

    case "ArrowUp": {
      let textInput = document.querySelector(`input[data-item-id="${currentId - 2}"]`);
      if (!textInput) {
        return;
      }
      textInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
      textInput.select();
      textInput.focus();
      break;
    }

    case "ArrowDown": {
      let textInput = document.querySelector(`input[data-item-id="${currentId + 2}"]`);
      if (!textInput) {
        return;
      }
      textInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
      textInput.select();
      textInput.focus();
      break;
    }

    case "Tab": {
      event.preventDefault();
      if (event.shiftKey) {
        let textInput = document.querySelector(`input[data-item-id="${currentId - 1}"]`);
        if (!textInput) {
          textInput = document.querySelector(`input[data-item-id="${bingoSize * bingoSize}"]`);
        }
        textInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
        textInput.select();
        textInput.focus();
      } else {
        let textInput = document.querySelector(`input[data-item-id="${currentId + 1}"]`);
        if (!textInput) {
          textInput = document.querySelector(`input[data-item-id="1"]`);
        }
        textInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
        textInput.select();
        textInput.focus();
      }
      break;
    }
  }
}

function activateCellById(element) {
  const itemId = element.dataset.itemId;
  const itemCell = document.querySelector(`.bingo-cell[data-id="${itemId}"]`);
  itemCell.classList.add("selected");
} //activateCellById

function deactivateCellById(element) {
  const itemId = element.dataset.itemId;
  const itemCell = document.querySelector(`.bingo-cell[data-id="${itemId}"]`);
  itemCell.classList.remove("selected");
} //deactivateCellById

function checkDuplicatesOnBoard() {
  const values = board.map((item) => item.value.toLowerCase());
  const duplicates = new Set(values.filter((v) => values.indexOf(v) !== values.lastIndexOf(v)));

  if (duplicates.size > 0) {
    const cells = document.querySelectorAll(".bingo-cell");
    for (let i = 0; i < board.length; i++) {
      const value = board[i].value.toLowerCase();
      cells[i].classList.toggle("duplicate", value && duplicates.has(value));
    }
  } else {
    document.querySelectorAll(".bingo-cell").forEach((c) => c.classList.remove("duplicate"));
  }
} //checkDuplicatesOnBoard

function doBoardSearch() {
  const value = (elements.boardSearchBar.value || "").trim().toLowerCase();
  const cells = document.querySelectorAll(".bingo-cell");

  if (value) {
    for (let i = 0; i < board.length; i++) {
      const isMatching = board[i].value && board[i].value.toLowerCase().includes(value);
      cells[i].classList.toggle("matching", isMatching);
    }
  }

  if (elements.boardSearchBar.value) {
    elements.boardSearchToggle.querySelector("i").innerText = "clear";
  } else {
    hideSearchBar();
  }
} //doBoardSearch

function toggleSearchBar() {
  elements.boardSearchBar.value = "";
  if (elements.boardSearchToggle.querySelector("i").innerText == "search") {
    elements.boardSearchToggle.querySelector("i").innerText = "clear";
    elements.boardSearchBar.classList.add("expanded");
    elements.boardSearchBar.focus();
    elements.boardSearchBar.select();
  } else {
    hideSearchBar();
  }
} //toggleSearchBar

function hideSearchBar() {
  elements.boardSearchToggle.querySelector("i").innerText = "search";
  elements.boardSearchBar.classList.remove("expanded");
  elements.boardSearchBar.blur();
  document.querySelectorAll(".bingo-cell").forEach((c) => c.classList.remove("matching"));
} //hideSearchBar

async function uploadBoard() {
  let itemValues = [];
  const bingoItems = document.querySelectorAll(".bingo-item");
  const cells = document.querySelectorAll(".bingo-cell");
  if (TWITCH?.userID) {
    itemValues = shuffleArraySeed(
      [...bingoItems].map((x) => x.value.trim()),
      TWITCH.userID
    );
  } else {
    itemValues = shuffleArray([...bingoItems].map((x) => x.value.trim()));
  }

  if (itemValues.includes("")) {
    showToast("Board must be full", "warning", 2000);
    return;
  }
  const values = board.map((item) => item.value.toLowerCase());
  const duplicates = new Set(values.filter((v) => values.indexOf(v) !== values.lastIndexOf(v)));
  if (duplicates.size > 0) {
    showToast("Board must not have duplicates", "warning", 2000);
    return;
  }

  document.querySelectorAll(".bingo-cell").forEach((cell) => {
    cell.classList.remove("duplicate");
    cell.classList.remove("selected"); // shouldn't be a problem, but you never know
  });

  for (let index = 0; index < cells.length; index++) {
    cells[index].innerText = itemValues[index];
    cells[index].title = itemValues[index];
    cells[index].classList.remove("filled");
    board[index].value = itemValues[index];
    board[index].filled = false;
  }

  if (TWITCH?.access_token) {
    let body = JSON.stringify({
      userid: TWITCH.userID,
      username: TWITCH.channel,
      access_token: TWITCH.access_token,
      time: new Date(),
      board: board,
      title: bingoType == "twitch" ? "Twitch Bingo" : elements.customBingoName.value || "Custom Bingo",
      allowDiagonals: elements.allowDiagonals.checked,
    });
    let requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body,
    };
    try {
      let response = await fetch(`https://bingo.guessr.tv/save`, requestOptions);
      let result = await response.json();
      if (response.status == 200) {
        boardCreated = true;
      }
      showToast(result.message, "info", 3000);
    } catch (error) {
      showToast("Could not upload board", "danger", 3000);
      console.log("save error", error);
    }
  } else {
    boardCreated = true;
  }
} //uploadBoard

function checkWin(board, streamer = false) {
  let rows = [];
  let columns = [];
  let diagonals = [[], []];
  let size = Math.sqrt(board.length);

  for (let index = 0; index < size; index++) {
    let currentRow = [];
    for (let index2 = 0; index2 < size; index2++) {
      currentRow.push(board[index2 + index * size]);
    }
    rows.push(currentRow);
  }

  for (let index = 0; index < rows.length; index++) {
    let currentColumn = [];
    for (let index2 = 0; index2 < rows[index].length; index2++) {
      currentColumn.push(rows[index2][index]);
    }
    columns.push(currentColumn);
  }

  for (let index = 0; index < size; index++) {
    diagonals[0].push(rows[index][index]);
  }
  for (let index = 0; index < size; index++) {
    diagonals[1].push(rows[index][size - index - 1]);
  }

  let result = {
    bingos: 0,
    score: 0,
  };

  let scoring = {
    0: 0,
    1: 0,
    2: 1,
    3: 10,
    4: 50,
    5: 100,
    6: 200,
    7: 300,
    8: 400,
    9: 500,
    10: 1000,
  };

  for (let index = 0; index < size; index++) {
    let currentRow = rows[index];
    let currentColumn = columns[index];
    let currentRowScore = currentRow.reduce((score, cell) => score + cell.filled, 0);
    let currentColumnScore = currentColumn.reduce((score, cell) => score + cell.filled, 0);

    result.score += scoring[currentRowScore];
    result.score += scoring[currentColumnScore];

    if (currentRow.every((e) => e.filled)) {
      result.bingos++;
    }

    if (currentColumn.every((e) => e.filled)) {
      result.bingos++;
    }
  }

  if (elements.allowDiagonals.checked) {
    let diagonalScore1 = diagonals[0].reduce((score, cell) => score + cell.filled, 0);
    let diagonalScore2 = diagonals[1].reduce((score, cell) => score + cell.filled, 0);
    result.score += scoring[diagonalScore1];
    result.score += scoring[diagonalScore2];

    if (diagonals[0].every((e) => e.filled)) {
      result.bingos++;
    }
    if (diagonals[1].every((e) => e.filled)) {
      result.bingos++;
    }
  }

  result.score += result.bingos * 1000;

  if (streamer && result.bingos > 0 && !won) {
    showConfetti(2);
    won = true;
  }
  if (streamer && result.bingos == 0) {
    won = false;
  }
  return result;
} //checkWin

function login() {
  elements.loginInfoPFP.src = "/pics/donk.png";
  elements.bingoLink.value = `Loading...`;
  elements.loginButton.innerHTML = spinner;
  window.open("/prompt.html", "loginWindow", "toolbar=0,status=0,scrollbars=0,width=500px,height=800px");
  return false;
} //login

function resetLoginButton() {
  elements.loginButton.innerHTML = `<span class="twitch-icon"></span> Sign in with Twitch`;
  elements.loginDescription.style.display = "";
} //resetLoginButton

function logout() {
  TWITCH = { channel: "", access_token: "", userID: "" };
  localStorage.setItem("TWITCH", JSON.stringify(TWITCH));
  elements.loginButton.disabled = false;
  elements.loginButton.innerHTML = `<span class="twitch-icon"></span> Sign in with Twitch`;
  elements.loginDescription.style.display = "";
  elements.loginInfo.style.display = "none";
  elements.loginInfoPFP.src = "/pics/donk.png";
  elements.bingoLink.value = `https://bingo.guessr.tv`;
} //logout

async function loadPFP() {
  let pfpURL = await get7TVPFP(TWITCH.userID);
  if (pfpURL == "/pics/donk.png" && TWITCH.access_token) {
    pfpURL = await getTwitchPFP(TWITCH.channel, TWITCH.access_token);
  }
  elements.loginInfoPFP.src = pfpURL;
} //loadPFP

function loadInfo() {
  TWITCH = JSON.parse(localStorage.getItem("TWITCH"));
  elements.loginButton.disabled = true;
  elements.loginButton.innerHTML = `<span class="twitch-icon"></span><i class="material-icons notranslate">done</i>Logged in as <strong>${TWITCH.channel}</strong>`;
  elements.loginInfo.style.display = "";
  elements.loginDescription.style.display = "none";
  elements.bingoLink.value = `https://bingo.guessr.tv/${TWITCH.channel}`;
  loadPFP();
} //loadInfo

function copyLink() {
  elements.bingoLink.select();
  elements.bingoLink.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(elements.bingoLink.value);
  copyButton.show();
  setTimeout(() => {
    copyButton.hide();
  }, 1000);
} //copyLink

let chatWinner = false;
async function updateLeaderboard() {
  elements.leaderboard.innerHTML = spinner;
  elements.leaderboardCount.innerHTML = "Loading...";

  let body = JSON.stringify({
    userid: TWITCH.userID,
    username: TWITCH.channel,
    access_token: TWITCH.access_token,
    time: new Date(),
    board: board,
    allowDiagonals: elements.allowDiagonals.checked,
  });
  let requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body,
  };

  try {
    let response = await fetch(`https://bingo.guessr.tv/update`, requestOptions);
    let result = await response.json();
    console.log(result);
    let users = result.users;
    for (let index = 0; index < users.length; index++) {
      if (users[index].userid == TWITCH.userID) {
        //dont shuffle board for streamer
        users[index].board = structuredClone(board);
      } else {
        users[index].board = shuffleArraySeed(structuredClone(board), users[index].userid);
      }
      users[index].result = checkWin(users[index].board);
    }

    users.sort((a, b) => a.result.score - b.result.score);

    elements.leaderboardCount.innerHTML = users.length;
    elements.leaderboard.innerHTML = "";
    for (let index = 0; index < users.length; index++) {
      if (!chatWinner && users[index].result.bingos > 0) {
        chatWinner = true;
        bingoPopover.show();
        setTimeout(() => {
          bingoPopover.hide();
        }, 3000);
      }
      elements.leaderboard.insertAdjacentHTML(
        "afterbegin",
        `<li class="list-group-item ${users[index].userid == TWITCH.userID ? "active" : ""}">
        ${addBadges(users[index].userid == TWITCH.userID ? "streamer" : [], users[index].userid)} ${users[index].username}: ${users[index].result.score.toLocaleString()} ${
          users[index].result.score == 1 ? "point" : "points"
        } ${users[index].result.bingos > 0 ? `(${users[index].result.bingos} ${users[index].result.bingos == 1 ? "BINGO" : "BINGOs"})` : ""}
        <i class="material-icons notranslate float-end cursor-pointer" 
        onmouseout="hidePreview()" onmouseover="showPreview('${users[index].username}','${users[index].userid}',${users[index].result.score},${users[index].result.bingos})">
        preview
        </i>
        </li>`
      );
    }
  } catch (error) {
    showToast("Could not refresh leaderboard", "danger", 3000);
    console.log("updateLeaderboard error", error);
  }
} //updateLeaderboard

function updateStatsTooltip() {
  let score = checkWin(board, true);
  bingoStatsTooltip.setContent({
    ".tooltip-inner": `<strong>Stats</strong><hr><em>Watched channels:</em> ${previousChannels.length}<br><em>BINGO score:</em> ${score.score.toLocaleString()} ${
      score.score == 1 ? "point" : "points"
    } ${score.bingos > 0 ? `(${score.bingos} ${score.bingos == 1 ? "BINGO" : "BINGOs"})` : ""}<br>`,
  });
} //updateStatsTooltip

function showPreview(username, userid, score, bingos) {
  elements.previewUsername.innerHTML = `
  ${encodeHTML(username)}'s bingo board<br>Score: ${score.toLocaleString()} ${score == 1 ? "point" : "points"} ${bingos > 0 ? `(${bingos} ${bingos == 1 ? "BINGO" : "BINGOs"})` : ""}`;
  let preview = [];

  if (userid == TWITCH.userID) {
    //dont shuffle board for streamer
    preview = structuredClone(board);
  } else {
    preview = shuffleArraySeed(structuredClone(board), userid);
  }

  const previewCells = document.querySelectorAll(".bingo-cell-preview");

  for (let j = 0; j < board.length; j++) {
    previewCells[j].classList.remove("filled");
  }

  for (let index = 0; index < previewCells.length; index++) {
    previewCells[index].innerText = preview[index].value;
    previewCells[index].title = preview[index].value;
    if (preview[index].filled) {
      previewCells[index].classList.add("filled");
    }
  }

  elements.previewDiv.style.display = "";
} //showPreview

function hidePreview() {
  elements.previewDiv.style.display = "none";
} //hidePreview

function loadInputs(bingoItems = []) {
  elements.boardInputs.innerHTML = "";
  board = [];
  let size = bingoSize * bingoSize || 25;
  for (let index = 0; index < size; index++) {
    board.push({ filled: false, value: "" });

    elements.boardInputs.insertAdjacentHTML(
      "beforeend",
      `<div class="input-group mb-1 w-50 pe-1">
        <input type="text" class="form-control bingo-item"
        onfocus="activateCellById(this)" onblur="deactivateCellById(this)" oninput="updateSingleItem(this)" onkeydown="move(event)" 
        placeholder="Bingo item #${index + 1}" data-item-id="${index + 1}" aria-label="Bingo item #${index + 1}" value="${bingoItems[index] || ""}" />
        <button class="btn btn-outline-secondary" onclick="randomize(event)" data-item-id="${index + 1}" type="button" title="Fill with random item">
          <i class="material-icons notranslate pointer-events-none">casino</i>
        </button>
      </div>`
    );
  }
} //loadInputs

function loadBoard(bingoItems = []) {
  elements.boardContent.innerHTML = "";
  elements.previewBoard.innerHTML = "";
  elements.board.style.top = "6%";
  elements.board.style.left = "6%";
  elements.board.style.scale = 1;

  let size = bingoSize || 5;
  let order = 0;
  for (let index = 0; index < size; index++) {
    let row = "";
    let romPreview = "";
    for (let index2 = 0; index2 < size; index2++) {
      order++;
      let extraStyle = "";
      // :)
      if (index == 0 && index2 == 0) {
        extraStyle = `style="border-top-left-radius: 6px"`;
      }
      if (index == 0 && index2 == size - 1) {
        extraStyle = `style="border-top-right-radius: 6px"`;
      }
      if (index == size - 1 && index2 == 0) {
        extraStyle = `style="border-bottom-left-radius: 6px"`;
      }
      if (index == size - 1 && index2 == size - 1) {
        extraStyle = `style="border-bottom-right-radius: 6px"`;
      }
      if (size == 1) {
        extraStyle = `style="border-radius: 6px"`;
      }

      row += `
      <div onclick="fillCell(event)" data-id="${order}" class="col bingo-cell" ${extraStyle}>
      ${bingoItems[order - 1] || order}
      </div>`;
      romPreview += `
      <div data-id="${order}" class="col bingo-cell-preview" ${extraStyle}>
      ${order}
      </div>`;
    }

    elements.boardContent.insertAdjacentHTML(
      "beforeend",
      `<div class="row m-0">
      ${row}
      </div>`
    );

    elements.previewBoard.insertAdjacentHTML(
      "beforeend",
      `<div class="row m-0">
      ${romPreview}
      </div>`
    );
  }
} //loadBoard

let x = 0;
let y = 0;
function mouseDownHandler(e) {
  if (e.target.classList.contains("bingo-cell") && e.button !== 1) {
    return;
  }
  elements.twitchEmbedDiv.style.pointerEvents = "none";
  x = e.clientX;
  y = e.clientY;
  document.addEventListener("mousemove", mouseMoveHandler);
  document.addEventListener("mouseup", mouseUpHandler);
} //mouseDownHandler

function mouseMoveHandler(e) {
  elements.board.style.top = elements.board.offsetTop + e.clientY - y + "px";
  elements.board.style.left = elements.board.offsetLeft + e.clientX - x + "px";
  x = e.clientX;
  y = e.clientY;
} //mouseMoveHandler

function mouseUpHandler() {
  elements.twitchEmbedDiv.style.pointerEvents = "all";
  document.removeEventListener("mousemove", mouseMoveHandler);
  document.removeEventListener("mouseup", mouseUpHandler);
} //mouseUpHandler

function loadPacks(selectedIndex = 0) {
  //remove Loading... placeholder or old options when updating the list
  elements.packEditorSelect.replaceChildren();
  elements.packSwitchesDiv.innerHTML = "";

  //add the custom packs to the dropdown and editor select
  for (let index = 0; index < itemPacks.length; index++) {
    let option = document.createElement("option");
    option.value = index;
    option.innerText = itemPacks[index].name;
    elements.packEditorSelect.appendChild(option.cloneNode(true));
    elements.packSwitchesDiv.insertAdjacentHTML(
      "beforeend",
      `<div class="form-check form-switch">
        <input class="form-check-input pack-checkbox" type="checkbox" role="switch" id="packSwitch${index}" data-id="${index}" onchange="updateSelectedPacks()" ${
        selectedPacks.includes(index) ? "checked" : ""
      } />
        <label class="form-check-label" for="packSwitch${index}">${itemPacks[index].name}</label>
      </div>`
    );
  }

  elements.packEditorSelect.selectedIndex = selectedIndex;
  elements.packEditorName.value = itemPacks[selectedIndex].name;

  if (selectedPacks.length == 0) {
    elements.packDropdownButton.innerHTML = `<i class="material-icons notranslate">warning</i>No packs selected`;
  } else {
    elements.packDropdownButton.innerText = `${itemPacks[selectedPacks[0]].name} ${selectedPacks.length > 1 ? `(+${selectedPacks.length - 1})` : ""}`;
  }

  //default pack has no raw text
  if (selectedIndex == 0) {
    elements.packEditorItems.value = itemPacks[selectedIndex].items.join("\n");
  } else {
    elements.packEditorItems.value = itemPacks[selectedIndex].raw;
  }

  //add hints if user has no custom packs
  if (itemPacks.length == 1) {
    let option = document.createElement("option");
    option.value = -1;
    option.disabled = true;
    option.innerText = "Create a pack using the green button on the right :)";
    elements.packEditorSelect.appendChild(option);
    elements.packSwitchesDiv.insertAdjacentHTML("beforeend", `<br><button type="button" class="btn btn-primary" onclick="editPacks()">Create a new pack</button>`);
  }

  //disable editing for default pack
  if (selectedIndex == 0) {
    elements.deletePackButton.disabled = true;
    elements.packEditorName.disabled = true;
    elements.packEditorItems.disabled = true;
  } else {
    elements.deletePackButton.disabled = false;
    elements.packEditorName.disabled = false;
    elements.packEditorItems.disabled = false;
  }

  currentItems = [];
  for (let index = 0; index < selectedPacks.length; index++) {
    currentItems.push(...itemPacks[selectedPacks[index]].items);
  }
} //loadPacks

function createPack() {
  itemPacks.push({ name: `Custom pack #${itemPacks.length}`, items: [], raw: "" });
  selectedPacks.push(itemPacks.length - 1);
  loadPacks(itemPacks.length - 1);
  localforage.setItem("itemPacks", JSON.stringify(itemPacks.slice(1)));
} //createPack

function editPacks() {
  packsModal.show();
} //editPacks

function updateSelectedPacks() {
  selectedPacks = [];
  let checkeboxes = document.querySelectorAll(".pack-checkbox:checked");
  for (let index = 0; index < checkeboxes.length; index++) {
    selectedPacks.push(parseInt(checkeboxes[index].dataset.id, 10));
  }
  loadPacks();
} //updateSelectedPacks

function changePack(select) {
  loadPacks(parseInt(select.value, 10));
} //changePack

function savePacks() {
  let id = parseInt(elements.packEditorSelect.value, 10);

  let packName = elements.packEditorName.value.trim();
  let packItemsRaw = elements.packEditorItems.value;
  let packItems = elements.packEditorItems.value
    .split(String.fromCharCode(10))
    .map((x) => x.trim())
    .filter(Boolean);

  itemPacks[id].name = packName;
  itemPacks[id].raw = packItemsRaw;
  itemPacks[id].items = packItems;

  if (itemPacks.filter((e) => e.name === packName).length > 1) {
    showToast("Pack name already exists", "warning", 2000);
  }

  if (new Set(packItems.map((x) => x.toLowerCase())).size !== packItems.length) {
    showToast("Pack has duplicates", "danger", 2000);
  }

  loadPacks(id);

  localforage.setItem("itemPacks", JSON.stringify(itemPacks.slice(1)));
} //savePacks

function deletePack() {
  let id = parseInt(elements.packEditorSelect.value, 10);
  itemPacks.splice(id, 1);
  const index = selectedPacks.indexOf(id);
  if (index > -1) {
    selectedPacks.splice(index, 1);
  }
  loadPacks(--id);
  localforage.setItem("itemPacks", JSON.stringify(itemPacks.slice(1)));
} //deletePack

window.onload = async function () {
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: "guessr.tv/bingo",
    version: 1.0,
    storeName: "bingo",
    description: "bingo",
  });

  let storedItemPacks = JSON.parse(await localforage.getItem("itemPacks")) || [];
  itemPacks.push(...storedItemPacks);
  seenChannels = JSON.parse(await localforage.getItem("seenChannels")) || [];
  elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();

  skipSexual = (localStorage.getItem("skipSexual") || "true") === "true";
  elements.skipSexual.checked = skipSexual;

  unloadWarningBingo = (localStorage.getItem("unloadWarningBingo") || "true") === "true";
  elements.unloadWarningBingo.checked = unloadWarningBingo;

  elements.resetSeenChannels.onclick = function () {
    localforage.setItem("seenChannels", JSON.stringify([]));
    elements.seenChannels.innerHTML = 0;
    seenChannels = [];
    showToast("Seen channels reset", "success", 2000);
  };

  enableTooltips();

  loginExpiredModal = new bootstrap.Modal(elements.loginExpiredModal);
  packsModal = new bootstrap.Modal(elements.packsModal);
  bingoStatsTooltip = new bootstrap.Tooltip(elements.bingoStatsTooltip);
  copyButton = new bootstrap.Popover(elements.copyButton);
  bingoPopover = new bootstrap.Popover(elements.bingoPopover);

  TWITCH = JSON.parse(localStorage.getItem("TWITCH"));
  if (TWITCH?.access_token && !(await checkToken(TWITCH.access_token))) {
    TWITCH.channel = "";
    TWITCH.access_token = "";
    loginExpiredModal.show();
  }

  if (TWITCH?.channel) {
    channelName = TWITCH.channel;
    loadInfo();
    sendUsername("/bingo");
  }

  elements.twitchBingo.onchange = function () {
    if (this.checked) {
      bingoType = "twitch";
      elements.bingoTypeDescription.innerHTML = "Random Twitch streams will be shown";
      elements.customBingoNameDiv.style.display = "none";
    }
  };

  elements.customBingo.onchange = function () {
    if (this.checked) {
      bingoType = "custom";
      elements.bingoTypeDescription.innerHTML = "A custom bingo board that can be used to play with your viewers";
      elements.customBingoNameDiv.style.display = "";
    }
  };

  elements.bingoSize.oninput = function () {
    bingoSize = parseInt(this.value, 10);
    const bingoItems = [...document.querySelectorAll(".bingo-item")].map((e) => e.value);
    elements.bingoSizeLabel.innerHTML = `Board size: ${bingoSize}x${bingoSize} (${bingoSize * bingoSize} ${bingoSize == 1 ? "item" : "items"})`;
    elements.boardSearch.style.display = bingoSize < 3 ? "none" : "";
    switch (bingoSize) {
      case 10:
        elements.previewDiv.style.scale = 0.7;
        break;
      case 9:
        elements.previewDiv.style.scale = 0.8;
        break;
      case 8:
        elements.previewDiv.style.scale = 0.85;
        break;
      default:
        elements.previewDiv.style.scale = 1;
    }
    loadInputs(bingoItems);
    loadBoard(bingoItems);
  };

  elements.skipSexual.onchange = function () {
    skipSexual = this.checked;
    localStorage.setItem("skipSexual", skipSexual);
  };

  elements.unloadWarningBingo.onchange = function () {
    unloadWarningBingo = this.checked;
    localStorage.setItem("unloadWarningBingo", unloadWarningBingo);
  };

  elements.boardSize.oninput = function () {
    elements.board.style.scale = this.value;
  };

  elements.boardOpacity.oninput = function () {
    elements.board.style.opacity = this.value;
  };

  elements.board.addEventListener("mousewheel", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.altKey) {
      let opacity = parseFloat(getComputedStyle(elements.board).getPropertyValue("opacity"));
      elements.board.style.opacity = event.wheelDelta > 0 ? Math.min(opacity + 0.07, 1) : Math.max(opacity - 0.07, 0);
      elements.boardOpacity.value = event.wheelDelta > 0 ? opacity + 0.07 : opacity - 0.07;
    } else {
      let scale = parseFloat(getComputedStyle(elements.board).getPropertyValue("scale"));
      elements.board.style.scale = event.wheelDelta > 0 ? Math.min(scale + 0.07, 2) : Math.max(scale - 0.07, 0.1);
      elements.boardSize.value = event.wheelDelta > 0 ? scale + 0.07 : scale - 0.07;
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "F3" || ((event.ctrlKey || event.metaKey) && event.code === "KeyF")) {
      event.preventDefault();
      toggleSearchBar();
    }

    if (event.code === "KeyR" && document.activeElement.tagName !== "INPUT") {
      elements.board.style = "top: 6%; left: 6%; scale: 1;";
      mouseUpHandler();
      hidePreview();
    }
  });

  elements.board.addEventListener("mousedown", mouseDownHandler);
  loadInputs();
  loadBoard();
  loadPacks();
  customBadges = await getCustomBadges();
}; //onload

window.onbeforeunload = function () {
  if (unloadWarningBingo && userInteracted) {
    return "Unload warning enabled. You can turn it off in the settings.";
  }
  return null;
}; //onbeforeunload
