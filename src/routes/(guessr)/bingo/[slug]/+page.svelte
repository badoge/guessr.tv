<script>
  import { onMount } from "svelte";
  import IcBaselineLogout from "~icons/ic/baseline-logout";
  import IcBaselineLeaderboard from "~icons/ic/baseline-leaderboard";
  import IcBaselineRefresh from "~icons/ic/baseline-refresh";
  import { addBadges, encodeHTML, showConfetti, shuffleArraySeed } from "$lib/functions";
  import { showToast } from "../../../+layout.svelte";
  import Login from "$lib/Login.svelte";

  let { data } = $props();

  let channel = $state(data.slug.toLowerCase().replace(/\s/g, ""));

  onMount(async () => {
    elements = {
      leaderboardCount: document.getElementById("leaderboardCount"),
      leaderboard: document.getElementById("leaderboard"),
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

    // if (TWITCH?.channel) {
    //   await join();
    //   loadBoard();
    //   elements.board.classList.remove("blur");
    // }
  });

  /**
   * @type {{ board: any; loginButton: any; loginInfo: any; username: any; previewBoard: any; score: any; leaderboardCount: any; leaderboard: any; refresh: any; channel: any; time: any; previewUsername: any; previewDiv: any; loginInfoPFP?: HTMLElement | null; }}
   */
  let elements;

  /**
   * @type {string | any[]}
   */
  let board = [];
  let allowDiagonals = false;

  let won = false;
  /**
   * @type {any}
   */
  let streamerID;

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
      </div>`,
      );

      elements.previewBoard.insertAdjacentHTML(
        "beforeend",
        `<div class="row m-0">
      ${romPreview}
      </div>`,
      );
    }
  } //loadBoard

  /**
   * @param {any[]} users
   */
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
      </li>`,
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
      showToast("Board & leaderboard refreshed", "alert-info", 3000);
      elements.refresh.innerHTML = `<i class="material-icons notranslate">refresh</i>`;
      setTimeout(() => {
        elements.refresh.disabled = false;
      }, 30000);
    } catch (error) {
      showToast("Could not refresh board", "alert-error", 3000);
      console.log("refresh error", error);
      elements.refresh.innerHTML = `<i class="material-icons notranslate">refresh</i>`;
      setTimeout(() => {
        elements.refresh.disabled = false;
      }, 30000);
    }
  } //refresh

  /**
   * @param {string | any[]} board
   */
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
      showToast(result.message, "alert-info", 3000);
    } catch (error) {
      showToast("Could not join game", "alert-error", 3000);
      console.log("join error", error);
    }
  } //join

  /**
   * @param {string} username
   * @param {any} userid
   * @param {number} score
   * @param {number} bingos
   */
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
</script>

<div id="previewDiv" style="top: 5%; right: 30%; display: none">
  <div class="card">
    <div class="card-header">
      <h4 id="previewUsername" class="text-center"></h4>
    </div>
    <div class="card-body p-0">
      <div id="previewBoard"></div>
    </div>
  </div>
</div>

<div class="container-fluid">
  <div class="row">
    <div class="col text-center">
      <h1>${data.title}</h1>
      <h2 class="text-body-secondary mb-5">Playing with <a href="https://twitch.tv/{channel}" target="_blank" id="channel">{channel}</a></h2>

      <div class="tooltip" data-tip="Sign in to enable the bingo board">
        <Login />
      </div>

      <div class="join" id="loginInfo" style="display: none">
        <button class="btn btn-success" id="refresh" onclick={refresh} title="Refresh the board - 30s cooldown - temporary scuffed solution 🤙">
          <IcBaselineRefresh />
        </button>

        <div class="drawer drawer-end">
          <input id="leaderboardDrawer" type="checkbox" class="drawer-toggle" />
          <div class="drawer-content">
            <label for="leaderboardDrawer" class="drawer-button btn btn-primary join-item"><IcBaselineLeaderboard />Chat leaderboard </label>
          </div>
          <div class="drawer-side">
            <label for="leaderboardDrawer" aria-label="close sidebar" class="drawer-overlay"></label>
            <div class="menu bg-base-200 min-h-full w-80 p-4">
              <header class="flex justify-between">
                <h2 class="h2">Bingo leaderboard <small class="text-body-secondary">Click the green refresh button to update the leaderboard</small></h2>
              </header>
              <article>
                <h4>Total players: <span id="leaderboardCount">0</span></h4>
                <ul class="list-group" id="leaderboard"></ul>
              </article>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary pointer-events-none" id="username">Loading...</button>
        <button class="btn btn-secondary pointer-events-none" id="score">Loading...</button>
        <button class="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
          <img id="loginInfoPFP" src="https://guessr.tv/donk.png" alt="profile pic" style="height: 2em" />
          <span class="visually-hidden">Toggle Dropdown</span>
        </button>
        <ul class="dropdown-menu">
          <li>
            <a class="dropdown-item" href="#"><IcBaselineLogout />Log out</a>
          </li>
        </ul>
      </div>

      <div class="container-fluid mt-3" id="board" style="top: 6%; left: 6%">
        <div class="placeholder-glow">
          <span class="placeholder board-placeholder"></span>
        </div>
      </div>
      <small class="text-body-secondary" id="time">Updated on: Loading...</small>
    </div>
  </div>
</div>
