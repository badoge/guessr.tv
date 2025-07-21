const elements = {
  leaderboardCount: document.getElementById("leaderboardCount"),
  leaderboard: document.getElementById("leaderboard"),
  toastContainer: document.getElementById("toastContainer"),
  loginExpiredModal: document.getElementById("loginExpiredModal"),
  loginButton: document.getElementById("loginButton"),
  loginInfo: document.getElementById("loginInfo"),
  username: document.getElementById("username"),
  score: document.getElementById("score"),
  refresh: document.getElementById("refresh"),
  loginInfoPFP: document.getElementById("loginInfoPFP"),
  board: document.getElementById("board"),
  previewDiv: document.getElementById("previewDiv"),
  previewBoard: document.getElementById("previewBoard"),
  previewUsername: document.getElementById("previewUsername"),
  channel: document.getElementById("channel"),
  time: document.getElementById("time"),
};

let TWITCH = {
  channel: "",
  access_token: "",
  userID: "",
};

let board = [];
let allowDiagonals = false;

let won = false;
let loginExpiredModal;
let customBadges = [];
let streamerID;

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
} //loadInfo

function loadBoard() {
  elements.board.innerHTML = "";
  elements.previewBoard.innerHTML = "";

  let shuffled = shuffleArraySeed(structuredClone(board), TWITCH.userID);

  let result = checkWin(shuffled, true);
  elements.score.innerText = `Score: ${result.score} ${result.score == 1 ? "point" : "points"} ${result.bingos > 0 ? `(${result.bingos} ${result.bingos == 1 ? "BINGO" : "BINGOs"})` : ""}`;

  let size = Math.sqrt(shuffled.length);
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
      <div data-id="${order}" class="col bingo-cell ${shuffled[order - 1].filled ? "filled" : ""}" ${extraStyle}>
      ${encodeHTML(shuffled[order - 1].value)}
      </div>`;
      romPreview += `
      <div data-id="${order}" class="col bingo-cell-preview" ${extraStyle}>
      ${encodeHTML(shuffled[order - 1].value)}
      </div>`;
    }

    elements.board.insertAdjacentHTML(
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

async function updateLeaderboard(users) {
  for (let index = 0; index < users.length; index++) {
    if (users[index].userid == streamerID) {
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
    elements.leaderboard.insertAdjacentHTML(
      "afterbegin",
      `<li class="list-group-item ${users[index].userid == TWITCH.userID ? "active" : ""}">
      ${addBadges(users[index].userid == streamerID ? "streamer" : [], users[index].userid)} ${users[index].username}: ${users[index].result.score.toLocaleString()} ${
        users[index].result.score == 1 ? "point" : "points"
      } ${users[index].result.bingos > 0 ? `(${users[index].result.bingos} ${users[index].result.bingos == 1 ? "BINGO" : "BINGOs"})` : ""}
      <i class="material-icons notranslate float-end cursor-pointer" 
      onmouseout="hidePreview()" onmouseover="showPreview('${users[index].username}','${users[index].userid}',${users[index].result.score},${users[index].result.bingos})">
      preview
      </i>
      </li>`
    );
  }
} //updateLeaderboard

async function refresh() {
  elements.refresh.innerHTML = spinner;
  elements.refresh.disabled = true;
  elements.leaderboard.innerHTML = spinner;
  elements.leaderboardCount.innerHTML = "Loading...";

  try {
    let response = await fetch(`https://bingo.guessr.tv/${elements.channel.innerText}/refresh`);
    let result = await response.json();
    console.log(result);

    allowDiagonals = result.data.allowDiagonals ?? false;
    elements.time.innerHTML = `Updated on: ${new Date(result.data.time)}`;
    streamerID = result.data.userid;

    for (let index = 0; index < result.data.board.length; index++) {
      board[index].value = result.data.board[index].value;
      board[index].filled = result.data.board[index].filled;
    }
    loadBoard();
    updateLeaderboard(result.users);

    showToast("Board & leaderboard refreshed", "info", 3000);
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

  if (allowDiagonals) {
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
  };
  try {
    let response = await fetch(`https://bingo.guessr.tv/join`, requestOptions);
    let result = await response.json();
    console.log(result);
    board = result.data.board;
    allowDiagonals = result.data.allowDiagonals;
    showToast(result.message, "info", 3000);
  } catch (error) {
    showToast("Could not join game", "danger", 3000);
    console.log("join error", error);
  }
} //join

function showPreview(username, userid, score, bingos) {
  elements.previewUsername.innerHTML = `
  ${encodeHTML(username)}'s bingo board<br>Score: ${score.toLocaleString()} ${score == 1 ? "point" : "points"} ${bingos > 0 ? `(${bingos} ${bingos == 1 ? "BINGO" : "BINGOs"})` : ""}`;
  let preview = [];

  if (userid == streamerID) {
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
    await join();
    loadBoard();
    elements.board.classList.remove("blur");
  }

  enableTooltips();
  customBadges = await getCustomBadges();
}; //onload
