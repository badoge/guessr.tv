const elements = {
  toastContainer: document.getElementById("toastContainer"),
  loginExpiredModal: document.getElementById("loginExpiredModal"),
  loginButton: document.getElementById("loginButton"),
  loginInfo: document.getElementById("loginInfo"),
  username: document.getElementById("username"),
  score: document.getElementById("score"),
  refresh: document.getElementById("refresh"),
  loginInfoPFP: document.getElementById("loginInfoPFP"),
  cells: document.querySelectorAll(".bingo-cell"),
  board: document.getElementById("board"),
  channel: document.getElementById("channel"),
  time: document.getElementById("time"),
};

let TWITCH = {
  channel: "",
  access_token: "",
  userID: "",
};

let loginExpiredModal;
let allowDiagonals = false;

function login() {
  elements.loginInfoPFP.src = "https://guessr.tv/pics/donk.png";
  elements.loginButton.innerHTML = spinner;
  window.open("https://bingo.guessr.tv/prompt", "loginWindow", "toolbar=0,status=0,scrollbars=0,width=500px,height=800px");
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
  elements.username.innerText = "Loading...";
  elements.score.innerText = "Loading...";
  elements.loginInfoPFP.src = "https://guessr.tv/pics/donk.png";
} //logout

async function loadInfo() {
  TWITCH = JSON.parse(localStorage.getItem("TWITCH"));
  elements.loginButton.style.display = "none";
  elements.loginInfo.style.display = "";
  elements.username.innerText = `Playing as ${TWITCH.channel}`;
  loadPFP();
  elements.board.classList.remove("blur");
  await join();
  let board = [...elements.cells].map((x) => {
    return { value: x.innerText, filled: x.classList.contains("filled") };
  });
  loadBoard(board);
} //loadInfo

function loadBoard(board) {
  let shuffled = shuffleArraySeed(board, TWITCH.userID);
  for (let index = 0; index < shuffled.length; index++) {
    elements.cells[index].innerText = shuffled[index].value;
    shuffled[index].filled ? elements.cells[index].classList.add("filled") : elements.cells[index].classList.remove("filled");
  }
  let result = checkWin(shuffled, true);
  elements.score.innerText = `Score: ${result.score} ${result.score == 1 ? "point" : "points"} ${result.five > 5 ? `(${result.five} ${result.five == 1 ? "BINGO" : "BINGOs"})` : ""}`;
} //loadBoard

async function refresh() {
  elements.refresh.innerHTML = spinner;
  elements.refresh.disabled = true;

  let requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    redirect: "follow",
  };
  try {
    let response = await fetch(`https://bingo.guessr.tv/${elements.channel.innerText}/refresh`, requestOptions);
    let result = await response.json();
    console.log(result);
    allowDiagonals = result.allowDiagonals ?? false;
    loadBoard(result.board);
    elements.time.innerHTML = `Updated on: ${new Date(result.time)}`;
    showToast("Board refreshed", "info", 3000);
    elements.refresh.innerHTML = `<i class="material-icons notranslate">refresh</i>`;
    setTimeout(() => {
      elements.refresh.disabled = false;
    }, 30000);
  } catch (error) {
    showToast("Could not refresh board", "danger", 3000);
    console.log("refresh error", error);
    elements.refresh.innerHTML = `<i class="material-icons notranslate">refresh</i>`;
    setTimeout(() => {
      elements.refresh.disabled = false;
    }, 30000);
  }
} //refresh

function checkWin(board, streamer = false) {
  let fives = [
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

  let fours = [
    [0, 1, 2, 3],
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [6, 7, 8, 9],
    [10, 11, 12, 13],
    [11, 12, 13, 14],
    [15, 16, 17, 18],
    [16, 17, 18, 19],
    [20, 21, 22, 23],
    [21, 22, 23, 24],
    [0, 5, 10, 15],
    [5, 10, 15, 20],
    [1, 6, 11, 16],
    [6, 11, 16, 21],
    [2, 7, 12, 17],
    [7, 12, 17, 22],
    [3, 8, 13, 18],
    [8, 13, 18, 23],
    [4, 9, 14, 19],
    [9, 14, 19, 24],
    [0, 2, 3, 4],
    [0, 1, 3, 4],
    [0, 1, 2, 4],
    [5, 7, 8, 9],
    [5, 6, 8, 9],
    [5, 6, 7, 9],
    [10, 12, 13, 14],
    [10, 11, 13, 14],
    [10, 11, 12, 14],
    [15, 17, 18, 19],
    [15, 16, 18, 19],
    [15, 16, 17, 19],
    [20, 22, 23, 24],
    [20, 21, 23, 24],
    [20, 21, 22, 24],
    [0, 10, 15, 20],
    [0, 5, 15, 20],
    [0, 5, 10, 20],
    [1, 11, 16, 21],
    [1, 6, 16, 21],
    [1, 6, 11, 21],
    [2, 12, 17, 22],
    [2, 7, 17, 22],
    [2, 7, 12, 22],
    [3, 13, 18, 23],
    [3, 8, 18, 23],
    [3, 8, 13, 23],
    [4, 14, 19, 24],
    [4, 9, 19, 24],
    [4, 9, 14, 24],
  ];

  let threes = [
    [0, 1, 2],
    [1, 2, 3],
    [2, 3, 4],
    [5, 6, 7],
    [6, 7, 8],
    [7, 8, 9],
    [10, 11, 12],
    [11, 12, 13],
    [12, 13, 14],
    [15, 16, 17],
    [16, 17, 18],
    [17, 18, 19],
    [20, 21, 22],
    [21, 22, 23],
    [22, 23, 24],
    [0, 5, 10],
    [5, 10, 15],
    [10, 15, 20],
    [1, 6, 11],
    [6, 11, 16],
    [11, 16, 21],
    [2, 7, 12],
    [7, 12, 17],
    [12, 17, 22],
    [3, 8, 13],
    [8, 13, 18],
    [13, 18, 23],
    [4, 9, 14],
    [9, 14, 19],
    [14, 19, 24],
  ];

  if (allowDiagonals) {
    fives.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
    fours.push([0, 6, 12, 18], [4, 8, 12, 16], [6, 12, 18, 24], [8, 12, 16, 20], [0, 12, 18, 24], [0, 6, 18, 24], [0, 6, 12, 24], [4, 12, 16, 20], [4, 8, 16, 20], [4, 8, 12, 20]);
    threes.push([0, 6, 12], [6, 12, 18], [12, 18, 24], [4, 8, 12], [8, 12, 16], [12, 16, 20]);
  }
  let result = {
    five: 0,
    four: 0,
    three: 0,
    score: 0,
  };

  for (let index = 0; index < fives.length; index++) {
    if (board[fives[index][0]].filled && board[fives[index][1]].filled && board[fives[index][2]].filled && board[fives[index][3]].filled && board[fives[index][4]].filled) {
      result.five++;
    }
  }

  for (let index = 0; index < fours.length; index++) {
    if (board[fours[index][0]].filled && board[fours[index][1]].filled && board[fours[index][2]].filled && board[fours[index][3]].filled) {
      result.four++;
    }
  }
  for (let index = 0; index < threes.length; index++) {
    if (board[threes[index][0]].filled && board[threes[index][1]].filled && board[threes[index][2]].filled) {
      result.three++;
    }
  }
  result.score = result.three + result.four * 10 + result.five * 110;

  if (streamer && result.five > 0 && !won) {
    showConfetti(2);
    won = true;
  }
  if (streamer && result.five == 0) {
    won = false;
  }
  return result;
} //checkWin

async function loadPFP() {
  let pfpURL = await get7TVPFP(TWITCH.userID);
  if (pfpURL == "/pics/donk.png" && TWITCH.access_token) {
    pfpURL = await getTwitchPFP(TWITCH.channel, TWITCH.access_token);
  }
  elements.loginInfoPFP.src = pfpURL;
} //loadPFP

async function join() {
  let body = JSON.stringify({
    userid: TWITCH.userID,
    username: TWITCH.channel,
    access_token: TWITCH.access_token,
    channel: elements.channel.innerText,
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
    let response = await fetch(`https://bingo.guessr.tv/join`, requestOptions);
    let result = await response.json();
    showToast(result.message, "info", 3000);
  } catch (error) {
    showToast("Could not join game", "danger", 3000);
    console.log("join error", error);
  }
} //join

window.onload = async function () {
  loginExpiredModal = new bootstrap.Modal(elements.loginExpiredModal);

  TWITCH = JSON.parse(localStorage.getItem("TWITCH"));
  if (TWITCH?.access_token && !(await checkToken(TWITCH.access_token))) {
    TWITCH.channel = "";
    TWITCH.access_token = "";
    loginExpiredModal.show();
  }

  if (TWITCH?.channel) {
    loadInfo();
  }

  enableTooltips();
}; //onload
