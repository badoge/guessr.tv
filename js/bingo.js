const suggestions = [
  "VTuber",
  "Streamer AFK",
  "Over 10,000 viewers",
  "Pet cam",
  "IRL stream",
  "Hottub stream",
  "Movie/TV show",
  "Streamer you follow",
  "Console stream",
  "Speedrunning",
  "Empty chat",
  "Gambling",
  "Sleeping",
  "Korean dancer",
  "#AD stream",
  "Reacting to videos",
  "Low quality cam",
  "Cam bigger than gameplay",
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
  "Room full of RGB lights",
  "Follow/sub goal overlay",
  "Default profile picture",
  "Eating",
  "Same game 2 times in a row",
];

const elements = {
  leaderboardCount: document.getElementById("leaderboardCount"),
  leaderboard: document.getElementById("leaderboard"),
  infoTime: document.getElementById("infoTime"),
  seenChannels: document.getElementById("seenChannels"),
  resetSeenChannels: document.getElementById("resetSeenChannels"),
  loginExpiredModal: document.getElementById("loginExpiredModal"),
  editModal: document.getElementById("editModal"),
  allowDiagonals: document.getElementById("allowDiagonals"),
  bingoItems: document.querySelectorAll(".bingo-item"),
  randomize: document.querySelectorAll(".bingo-random"),
  bingoSave: document.getElementById("bingoSave"),
  board: document.getElementById("board"),
  previewBoard: document.getElementById("previewBoard"),
  previewUsername: document.getElementById("previewUsername"),
  cells: document.querySelectorAll(".bingo-cell"),
  previewCells: document.querySelectorAll(".bingo-cell-preview"),
  toastContainer: document.getElementById("toastContainer"),
  welcomeCard: document.getElementById("welcomeCard"),
  start: document.getElementById("start"),
  twitchEmbed: document.getElementById("twitchEmbed"),
  boardSize: document.getElementById("boardSize"),
  boardOpacity: document.getElementById("boardOpacity"),
  loginButton: document.getElementById("loginButton"),
  loginInfo: document.getElementById("loginInfo"),
  loginInfoPFP: document.getElementById("loginInfoPFP"),
  bingoLink: document.getElementById("bingoLink"),
  copyButton: document.getElementById("copyButton"),
  previousStream: document.getElementById("previousStream"),
  nextStream: document.getElementById("nextStream"),
};

let TWITCH = {
  channel: "",
  access_token: "",
  userID: "",
};

let loginExpiredModal, editModal;
let copyButton;
let mainList = [];
let seenChannels = [];
let previousChannels = [];
let player;
let retryLimit = 0;
let customBadges = [];
let refreshCooldown;
let channelName;

let board = [
  { filled: false, value: "1" },
  { filled: false, value: "2" },
  { filled: false, value: "3" },
  { filled: false, value: "4" },
  { filled: false, value: "5" },
  { filled: false, value: "6" },
  { filled: false, value: "7" },
  { filled: false, value: "8" },
  { filled: false, value: "9" },
  { filled: false, value: "10" },
  { filled: false, value: "11" },
  { filled: false, value: "12" },
  { filled: false, value: "13" },
  { filled: false, value: "14" },
  { filled: false, value: "15" },
  { filled: false, value: "16" },
  { filled: false, value: "17" },
  { filled: false, value: "18" },
  { filled: false, value: "19" },
  { filled: false, value: "20" },
  { filled: false, value: "21" },
  { filled: false, value: "22" },
  { filled: false, value: "23" },
  { filled: false, value: "24" },
  { filled: false, value: "25" },
];
let won = false;
let boardCreated = false;

async function getMainList() {
  try {
    let response = await fetch(`https://api.okayeg.com/guess`, requestOptions);
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
  while (seenChannels.includes(channel.username)) {
    channel = mainList.pop();
  }
  if (mainList.length == 0 || !channel) {
    showToast("No more channels left on the list, refresh to get a new list", "danger", "3000");
    return;
  }
  if (retryLimit > 5) {
    showToast("Too many retries, something might be wrong :(", "danger", "3000");
    return;
  }

  //update stream info
  try {
    let response = await fetch(`https://helper.pepega.workers.dev/twitch/streams?user_id=${channel.userid}`, requestOptions);
    let stream = await response.json();
    if (!stream.data[0]) {
      showToast("Channel is offline, getting new channel", "info", 1500);
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
    localStorage.setItem("seenChannels_bingo", JSON.stringify(seenChannels));
    elements.seenChannels.innerHTML = seenChannels.length;
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

function dragElement() {
  let x = 0;
  let y = 0;

  const mouseDownHandler = function (e) {
    if (e.target.classList.contains("bingo-cell") && e.button !== 1) {
      return;
    }
    x = e.clientX;
    y = e.clientY;
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    elements.board.style.top = elements.board.offsetTop + e.clientY - y + "px";
    elements.board.style.left = elements.board.offsetLeft + e.clientX - x + "px";
    x = e.clientX;
    y = e.clientY;
  };

  const mouseUpHandler = function () {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  elements.board.addEventListener("mousedown", mouseDownHandler);
} //dragElement

function randomize(event) {
  const id = event.target.dataset.itemId;
  const input = document.querySelector(`[data-item-id="${id}"]`);
  const taken = [...elements.bingoItems].map((x) => x.value);
  let random = suggestions[Math.floor(Math.random() * suggestions.length)];

  while (taken.includes(random)) {
    random = suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  input.value = random;
} //randomize

function randomizeAll() {
  let options = shuffleArray(structuredClone(suggestions));
  for (let index = 0; index < elements.bingoItems.length; index++) {
    elements.bingoItems[index].value = options.pop();
  }
} //randomizeAll

function clearAll() {
  for (let index = 0; index < elements.bingoItems.length; index++) {
    elements.bingoItems[index].value = "";
  }
} //clearAll

async function start() {
  if (!boardCreated) {
    showToast("You need to create and save your board first", "warning", 3000);
    editModal.show();
    return;
  }

  elements.start.innerHTML = spinner;

  await getMainList();
  shuffleArray(mainList);
  nextStream();

  elements.welcomeCard.style.display = "none";
  elements.twitchEmbed.style.display = "";
  elements.board.style.display = "";
} //start

async function bingoSave() {
  elements.bingoSave.innerHTML = spinner;
  let itemValues = [];
  if (TWITCH?.userID) {
    itemValues = shuffleArraySeed(
      [...elements.bingoItems].map((x) => x.value.trim()),
      TWITCH.userID
    );
  } else {
    itemValues = shuffleArray([...elements.bingoItems].map((x) => x.value.trim()));
  }

  if (itemValues.includes("")) {
    showToast("Board must be full", "warning", 2000);
    elements.bingoSave.innerHTML = `<i class="material-icons notranslate">save</i> Save`;
    return;
  }
  if (hasDuplicates(itemValues)) {
    showToast("Board must not have duplicates", "warning", 2000);
    elements.bingoSave.innerHTML = `<i class="material-icons notranslate">save</i> Save`;
    return;
  }

  for (let index = 0; index < elements.cells.length; index++) {
    elements.cells[index].innerText = itemValues[index];
    elements.cells[index].title = itemValues[index];
    elements.cells[index].classList.remove("filled");
    board[index].value = itemValues[index];
    board[index].filled = false;
  }
  won = false;

  if (TWITCH?.access_token) {
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
      redirect: "follow",
    };
    try {
      let response = await fetch(`https://bingo.guessr.tv/save`, requestOptions);
      let result = await response.json();
      showToast(result.message, "info", 3000);
    } catch (error) {
      showToast("Could not upload board", "danger", 3000);
      console.log("save error", error);
    }
  }

  boardCreated = true;
  editModal.hide();
  elements.bingoSave.innerHTML = `<i class="material-icons notranslate">save</i> Save`;
} //bingoSave

function checkWin() {
  let winConditions = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
  ];

  if (elements.allowDiagonals.checked) {
    winConditions.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  }

  let lines = 0;
  for (let index = 0; index < winConditions.length; index++) {
    if (
      board[winConditions[index][0]].filled &&
      board[winConditions[index][1]].filled &&
      board[winConditions[index][2]].filled &&
      board[winConditions[index][3]].filled &&
      board[winConditions[index][4]].filled
    ) {
      lines++;
    }
  }
  if (lines == 1 && !won) {
    showConfetti(2);
    won = true;
  }
  if (lines == 0) {
    won = false;
  }
} //checkWin

function checkWinLeaderboard(board) {
  let winConditions = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
  ];

  if (elements.allowDiagonals.checked) {
    winConditions.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  }

  let lines = 0;
  for (let index = 0; index < winConditions.length; index++) {
    if (
      board[winConditions[index][0]].filled &&
      board[winConditions[index][1]].filled &&
      board[winConditions[index][2]].filled &&
      board[winConditions[index][3]].filled &&
      board[winConditions[index][4]].filled
    ) {
      lines++;
    }
  }
  return lines;
} //checkWinLeaderboard

function login() {
  elements.loginInfoPFP.src = "/pics/donk.png";
  elements.bingoLink.value = `Loading...`;
  elements.loginButton.innerHTML = spinner;
  window.open("/prompt.html", "loginWindow", "toolbar=0,status=0,scrollbars=0,width=500px,height=800px");
  return false;
} //login

function resetLoginButton() {
  elements.loginButton.innerHTML = `<span class="twitch-icon"></span> Sign in with Twitch`;
} //resetLoginButton

function logout() {
  TWITCH = { channel: "", access_token: "", userID: "" };
  localStorage.setItem("TWITCH", JSON.stringify(TWITCH));
  elements.loginButton.style.display = "";
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
  elements.loginButton.style.display = "none";
  elements.loginInfo.style.display = "";
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

async function updateLeaderboard() {
  elements.leaderboard.innerHTML = "";
  elements.leaderboardCount.innerHTML = "";

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
    redirect: "follow",
  };

  try {
    let response = await fetch(`https://bingo.guessr.tv/update`, requestOptions);
    let result = await response.json();
    console.log(result);
    let users = result.users;

    for (let index = 0; index < users.length; index++) {
      users[index].board = shuffleArraySeed(structuredClone(board), users[index].userid);
      users[index].lines = checkWinLeaderboard(users[index].board);
    }

    users.sort((a, b) => a.lines - b.lines);

    elements.leaderboardCount.innerHTML = users.length;
    for (let index = 0; index < users.length; index++) {
      elements.leaderboard.insertAdjacentHTML(
        "afterbegin",
        `<li class="list-group-item">
        ${addBadges([], users[index].userid)} ${users[index].username}: ${users[index].lines} 
        <i class="material-icons notranslate float-end cursor-pointer" onmouseout="hidePreview()" onmouseover="showPreview('${users[index].username}','${users[index].userid}')">preview</i>
        </li>`
      );
    }
  } catch (error) {
    showToast("Could not refresh leaderboard", "danger", 3000);
    console.log("updateLeaderboard error", error);
  }
} //updateLeaderboard

function showPreview(username, userid) {
  elements.previewUsername.innerText = `${username}'s bingo board`;
  let preview = shuffleArraySeed(structuredClone(board), userid);

  for (let j = 0; j < board.length; j++) {
    elements.previewCells[j].classList.remove("filled");
  }

  for (let index = 0; index < elements.previewCells.length; index++) {
    elements.previewCells[index].innerText = preview[index].value;
    elements.previewCells[index].title = preview[index].value;
    if (preview[index].filled) {
      elements.previewCells[index].classList.add("filled");
    }
  }

  elements.previewBoard.style.display = "";
} //showPreview

function hidePreview() {
  elements.previewBoard.style.display = "none";
} //hidePreview

window.onload = async function () {
  seenChannels = JSON.parse(localStorage.getItem("seenChannels_bingo")) || [];
  elements.seenChannels.innerHTML = seenChannels.length;

  elements.resetSeenChannels.onclick = function () {
    localStorage.setItem("seenChannels_bingo", JSON.stringify([]));
    elements.seenChannels.innerHTML = 0;
    seenChannels = [];
    showToast("Seen channels reset", "success", 2000);
  };

  loginExpiredModal = new bootstrap.Modal(elements.loginExpiredModal);
  editModal = new bootstrap.Modal(elements.editModal);
  copyButton = new bootstrap.Tooltip(elements.copyButton);

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

  for (let index = 0; index < elements.cells.length; index++) {
    elements.cells[index].onclick = (event) => {
      clearTimeout(refreshCooldown);
      event.target.classList.toggle("filled");
      let cellNumber = parseInt(event.target.dataset.id, 10) - 1;
      board[cellNumber].filled = !board[cellNumber].filled;
      checkWin();
      if (TWITCH?.channel) {
        refreshCooldown = setTimeout(() => {
          updateLeaderboard();
        }, 3000);
      }
    };
  }
  for (let index = 0; index < elements.randomize.length; index++) {
    elements.randomize[index].onclick = (event) => {
      randomize(event);
    };
  }

  elements.boardSize.oninput = function () {
    elements.board.style.scale = this.value;
  };

  elements.boardOpacity.oninput = function () {
    elements.board.style.opacity = this.value;
  };

  elements.board.addEventListener("mousewheel", (event) => {
    event.preventDefault();
    event.stopPropagation();
    let scale = parseFloat(getComputedStyle(elements.board).getPropertyValue("scale"));
    elements.board.style.scale = event.wheelDelta > 0 ? Math.min(scale + 0.07, 2) : Math.max(scale - 0.07, 0.1);
    elements.boardSize.value = event.wheelDelta > 0 ? scale + 0.07 : scale - 0.07;
  });

  dragElement();
  enableTooltips();

  customBadges = await getCustomBadges();
}; //onload
