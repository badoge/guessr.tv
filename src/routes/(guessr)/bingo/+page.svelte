<script>
  import localforage from "localforage";
  import { onMount } from "svelte";
  import { ToggleGroup } from "bits-ui";

  import { addBadges, getCustomBadges, sendUsername, showConfetti, shuffleArray, shuffleArraySeed } from "$lib/functions";
  import IcBaselineLeaderboard from "~icons/ic/baseline-leaderboard";
  import IcBaselineClose from "~icons/ic/baseline-close";
  import IcBaselineLink from "~icons/ic/baseline-link";
  import IcBaselineArrowDropDown from "~icons/ic/baseline-arrow-drop-down";
  import IcBaselineSkipPrevious from "~icons/ic/baseline-skip-previous";
  import IcBaselineSkipNext from "~icons/ic/baseline-skip-next";
  import IcBaselineContentCopy from "~icons/ic/baseline-content-copy";
  import IcBaselineCasino from "~icons/ic/baseline-casino";
  import IcBaselineHelp from "~icons/ic/baseline-help";
  import IcBaselineCelebration from "~icons/ic/baseline-celebration";
  import IcBaselineNorthEast from "~icons/ic/baseline-north-east";
  import IcBaselineDone from "~icons/ic/baseline-done";
  import IcBaselinePreview from "~icons/ic/baseline-preview";
  import IcBaselineLogout from "~icons/ic/baseline-logout";
  import IcBaselineOpacity from "~icons/ic/baseline-opacity";
  import IcBaselineZoomIn from "~icons/ic/baseline-zoom-in";
  import IcBaselineLightbulb from "~icons/ic/baseline-lightbulb";
  import IcBaselineDeleteForever from "~icons/ic/baseline-delete-forever";
  import IcBaselineWarning from "~icons/ic/baseline-warning";
  import IcBaselineAdd from "~icons/ic/baseline-add";
  import IcBaselineGridOn from "~icons/ic/baseline-grid-on";
  import IcBaselineEdit from "~icons/ic/baseline-edit";
  import IcBaselineSettings from "~icons/ic/baseline-settings";
  import IcBaselineCategory from "~icons/ic/baseline-category";
  import IcBaselineBuild from "~icons/ic/baseline-build";
  import MdiTwitch from "~icons/mdi/twitch";
  import BingoBoard from "$lib/BingoBoard.svelte";
  import { slide } from "svelte/transition";
  import Login from "$lib/Login.svelte";
  import { showToast } from "../../+layout.svelte";

  let bingoSize = $state(5);
  let allowDiagonals = $state(false);

  let buttonCooldown = $state(false);

  let bingoType = $state("twitch");
  let embedHover = $state({ disabled: false });

  //inactive - uploading - active
  let gameState = $state("inactive");

  let BingoBoardComponent = $state();
  /**
   * @type {any[]}
   */
  let bingoBoard = $state([
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
    { value: "", filled: false },
  ]);

  //runs when bingoSize changes but before the new inputs get added
  //inputs each loop needs bingoBoard.length to be correct
  $effect.pre(() => {
    //if board is already bigger than the set size then just remove the extra items
    if (bingoBoard.length > bingoSize * bingoSize) {
      while (bingoBoard.length > bingoSize * bingoSize) {
        bingoBoard.pop();
      }
    } else {
      //if board is smaller than the set size then add extra items till its the same size
      while (bingoBoard.length < bingoSize * bingoSize) {
        bingoBoard.push({ value: "", filled: false });
      }
    }
  });

  onMount(async () => {
    elements = {
      leaderboardCount: document.getElementById("leaderboardCount"),
      leaderboard: document.getElementById("leaderboard"),
      infoTime: document.getElementById("infoTime"),
      skipSexual: document.getElementById("skipSexual"),
      unloadWarningBingo: document.getElementById("unloadWarningBingo"),
      seenChannels: document.getElementById("seenChannels"),
      resetSeenChannels: document.getElementById("resetSeenChannels"),
      packsModal: document.getElementById("packsModal"),
      packEditorSelect: document.getElementById("packEditorSelect"),
      packEditorName: document.getElementById("packEditorName"),
      packEditorItems: document.getElementById("packEditorItems"),
      deletePackButton: document.getElementById("deletePackButton"),
      twitchBingo: document.getElementById("twitchBingo"),
      customBingo: document.getElementById("customBingo"),
      customBingoName: document.getElementById("customBingoName"),
      boardSize: document.getElementById("boardSize"),
      boardOpacity: document.getElementById("boardOpacity"),
      loginButton: document.getElementById("loginButton"),
      bingoLink: document.getElementById("bingoLink"),
      previousStream: document.getElementById("previousStream"),
    };

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
    //elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();

    skipSexual = (localStorage.getItem("skipSexual") || "true") === "true";
    //elements.skipSexual.checked = skipSexual;

    unloadWarningBingo = (localStorage.getItem("unloadWarningBingo") || "true") === "true";
    //elements.unloadWarningBingo.checked = unloadWarningBingo;

    // elements.resetSeenChannels.onclick = function () {
    //   localforage.setItem("seenChannels", JSON.stringify([]));
    //   elements.seenChannels.innerHTML = 0;
    //   seenChannels = [];
    //   showToast("Seen channels reset", "alert-success", 3000);
    // };

    TWITCH = JSON.parse(localStorage.getItem("TWITCH"));

    if (TWITCH?.channel) {
      channelName = TWITCH.channel;
      sendUsername("/bingo");
    }

    // elements.skipSexual.onchange = function () {
    //   skipSexual = this.checked;
    //   localStorage.setItem("skipSexual", skipSexual);
    // };

    // elements.unloadWarningBingo.onchange = function () {
    //   unloadWarningBingo = this.checked;
    //   localStorage.setItem("unloadWarningBingo", unloadWarningBingo);
    // };

    // elements.boardSize.oninput = function () {
    //   elements.board.style.scale = this.value;
    // };

    // elements.boardOpacity.oninput = function () {
    //   elements.board.style.opacity = this.value;
    // };

    // elements.board.addEventListener("mousewheel", (event) => {
    //   event.preventDefault();
    //   event.stopPropagation();
    //   if (event.altKey) {
    //     let opacity = parseFloat(getComputedStyle(elements.board).getPropertyValue("opacity"));
    //     elements.board.style.opacity = event.wheelDelta > 0 ? Math.min(opacity + 0.07, 1) : Math.max(opacity - 0.07, 0);
    //     elements.boardOpacity.value = event.wheelDelta > 0 ? opacity + 0.07 : opacity - 0.07;
    //   } else {
    //     let scale = parseFloat(getComputedStyle(elements.board).getPropertyValue("scale"));
    //     elements.board.style.scale = event.wheelDelta > 0 ? Math.min(scale + 0.07, 2) : Math.max(scale - 0.07, 0.1);
    //     elements.boardSize.value = event.wheelDelta > 0 ? scale + 0.07 : scale - 0.07;
    //   }
    // });

    loadItemPacks();
    customBadges = await getCustomBadges();

    if (window.location.hash == "#hello") {
      helloModal.show();
    }
  });

  let itemPacks = $state([
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
  ]);
  let selectedPacks = $state([0]);
  /**
   * @type {any[]}
   */
  let currentItems = [];

  let elements;

  let TWITCH = $state({
    channel: "",
    access_token: "",
    userID: "",
  });

  let streamerScore;
  /**
   * @type {any[]}
   */
  let mainList = [];
  /**
   * @type {any[]}
   */
  let seenChannels = [];
  /**
   * @type {any[]}
   */
  let previousChannels = [];
  /**
   * @type {Twitch.Embed}
   */
  let player;
  let retryLimit = 0;
  let customBadges = [];

  /**
   * @type {string}
   */
  let channelName;
  let skipSexual = true;
  let unloadWarningBingo = true;
  let userInteracted = false;

  let won = false;

  async function getMainList() {
    let requestOptions = {
      headers: {
        pragma: "no-cache",
        "cache-control": "no-cache",
      },
    };
    try {
      let response = await fetch(`https://guessr.donk.workers.dev/list?dank=${Date.now()}`, requestOptions);
      let result = await response.json();
      mainList = result.list;
      elements.infoTime.innerHTML = `Channel list updated on ${new Date(result.time)}`;
    } catch (error) {
      console.log(error);
      showToast("Could not load channel list :(", "alert-error", 5000);
    }
  } //getMainList

  async function nextStream() {
    buttonCooldown = true;
    setTimeout(() => {
      buttonCooldown = false;
    }, 1000);
    let currentChannel = player?.getChannel() || 0;
    let currentIndex = previousChannels.findIndex((x) => x == currentChannel);
    if (previousChannels[currentIndex + 1]) {
      showPreviousStream(currentIndex, true);
      return;
    }

    let channel = mainList.pop();
    //reroll if channel already seen
    while (seenChannels.includes(channel)) {
      channel = mainList.pop();
    }
    if (mainList.length == 0 || !channel) {
      showToast("No more channels left on the list ...getting new list", "alert-error", 5000);
      await getMainList();
      shuffleArray(mainList);
      nextStream();
      return;
    }
    if (retryLimit > 5) {
      showToast("Too many retries, something might be wrong :(", "alert-error", 4000);
      return;
    }

    //update stream info
    try {
      let response = await fetch(`https://helper.guessr.tv/twitch/streams?user_id=${channel}`);
      let stream = await response.json();
      console.log(stream);
      if (!stream.data[0]) {
        retryLimit++;
        return nextStream();
      }

      let response2 = await fetch(`https://helper.guessr.tv/twitch/channels?broadcaster_id=${channel}`);
      let result2 = await response2.json();
      console.log(result2);
      //get a new stream if skip sexual is checked
      if (result2?.data[0]?.content_classification_labels?.includes("SexualThemes") && skipSexual) {
        return nextStream();
      }

      retryLimit = 0;
      let options = {
        width: "100%",
        height: "100%",
        channel: stream.data[0].user_login,
        layout: "video-with-chat",
        theme: "dark",
        parent: ["guessr.tv", "127.0.0.1"],
      };
      if (!player) {
        player = new Twitch.Embed("twitchEmbed", options);
      } else {
        player.setChannel(stream.data[0].user_login);
      }
      previousChannels.push(stream.data[0].user_login);
      seenChannels.push(channel);
      localforage.setItem("seenChannels", JSON.stringify(seenChannels));
      elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();

      if (stream.data[0].user_login == channelName) {
        showConfetti(2);
        sendUsername(" - dank ⚠️ ⚠️ ⚠️");
      }
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
      showToast("Can't go further back", "alert-error", 3000);
      return;
    }
    showPreviousStream(currentIndex, false);
  } //previousStream

  /**
   * @param {number} currentIndex
   * @param {boolean} forward
   */
  function showPreviousStream(currentIndex, forward) {
    player.setChannel(previousChannels[(currentIndex += forward ? 1 : -1)]);
  } //showPreviousStream

  /**
   * @param {number} id
   */
  function randomize(id) {
    const input = document.querySelector(`input[data-item-id="${id}"]`);
    if (!input) {
      return;
    }
    const taken = bingoBoard.map((x) => x.value).filter(Boolean);
    let random = currentItems[Math.floor(Math.random() * currentItems.length)];
    if (taken.length >= currentItems.length) {
      showToast("No more presets left", "alert-error", 3000);
      return;
    }
    while (taken.includes(random)) {
      random = currentItems[Math.floor(Math.random() * currentItems.length)];
    }

    input.value = random;
    bingoBoard[id - 1].value = random;
    userInteracted = true;
  } //randomize

  function randomizeAll() {
    if (!bingoBoard.map((e) => e.value).includes("")) {
      showToast("Board is full", "alert-warning", 3000);
      return;
    }

    let options = shuffleArray(structuredClone(currentItems));
    for (let index = 0; index < bingoBoard.length; index++) {
      let option = options.pop();
      if (!option) {
        showToast("No more presets left", "alert-error", 3000);
        break;
      }
      if (!bingoBoard[index].value) {
        bingoBoard[index].value = option;
      }
    }
    userInteracted = true;
  } //randomizeAll

  function clearAll() {
    for (let index = 0; index < bingoBoard.length; index++) {
      bingoBoard[index].value = "";
      //bingoCells[index].classList.remove("duplicate");
    }
    userInteracted = false;
  } //clearAll

  async function start() {
    gameState = "uploading";

    await uploadBoard();

    if (gameState !== "active") {
      return;
    }

    if (bingoType == "twitch") {
      await getMainList();
      shuffleArray(mainList);
      nextStream();
    }

    userInteracted = true;
  } //start

  /**
   * @param {{ target: { dataset: { itemId: string; }; selectionStart: number; value: string | any[]; }; key: any; preventDefault: () => void; shiftKey: any; }} event
   */
  function moveCursor(event) {
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
            textInput = document.querySelector(`input[data-item-id="${bingoBoard.length}"]`);
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

  async function uploadBoard() {
    let itemValues = [];
    if (TWITCH?.userID) {
      itemValues = shuffleArraySeed(
        bingoBoard.map((x) => x.value.trim()),
        TWITCH.userID,
      );
    } else {
      itemValues = shuffleArray(bingoBoard.map((x) => x.value.trim()));
    }

    if (itemValues.includes("")) {
      showToast("Board must be full", "alert-warning", 3000);
      gameState = "inactive";
      return;
    }
    const values = bingoBoard.map((item) => item.value.toLowerCase());
    const duplicates = new Set(values.filter((v) => values.indexOf(v) !== values.lastIndexOf(v)));
    if (duplicates.size > 0) {
      showToast("Board must not have duplicates", "alert-warning", 3000);
      gameState = "inactive";
      return;
    }

    if (TWITCH?.access_token) {
      let body = JSON.stringify({
        userid: TWITCH.userID,
        username: TWITCH.channel,
        access_token: TWITCH.access_token,
        time: new Date(),
        board: bingoBoard,
        title: bingoType == "twitch" ? "Twitch Bingo" : elements.customBingoName.value || "Custom Bingo",
        allowDiagonals: allowDiagonals,
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
          gameState = "active";
        } else {
          gameState = "inactive";
        }
        showToast(result.message, "alert-info", 3000);
      } catch (error) {
        showToast("Could not upload board", "alert-error", 3000);
        gameState = "inactive";
        console.log("uploadBoard error", error);
      }
    } else {
      gameState = "active";
    }
  } //uploadBoard

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

  function copyLink() {
    elements.bingoLink.select();
    elements.bingoLink.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(elements.bingoLink.value);
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
      board: bingoBoard,
      allowDiagonals: allowDiagonals,
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

      users.sort((/** @type {{ result: { score: number; }; }} */ a, /** @type {{ result: { score: number; }; }} */ b) => a.result.score - b.result.score);

      elements.leaderboardCount.innerHTML = users.length;
      elements.leaderboard.innerHTML = "";
      for (let index = 0; index < users.length; index++) {
        if (!chatWinner && users[index].result.bingos > 0) {
          chatWinner = true;
          // bingoPopover.show();
          // setTimeout(() => {
          //   bingoPopover.hide();
          // }, 3000);
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
        </li>`,
        );
      }
    } catch (error) {
      showToast("Could not refresh leaderboard", "alert-error", 3000);
      console.log("updateLeaderboard error", error);
    }
  } //updateLeaderboard

  function loadItemPacks(selectedIndex = 0) {
    elements.packEditorSelect.selectedIndex = selectedIndex;
    elements.packEditorName.value = itemPacks[selectedIndex].name;

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
      //elements.packSwitchesDiv.insertAdjacentHTML("beforeend", `<br><button class="btn btn-primary" onclick="packsModal.showModal()">Create a new pack</button>`);
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
  } //loadItemPacks

  function createPack() {
    itemPacks.push({ name: `Custom pack #${itemPacks.length}`, items: [], raw: "" });
    selectedPacks.push(itemPacks.length - 1);
    loadItemPacks(itemPacks.length - 1);
    localforage.setItem("itemPacks", JSON.stringify(itemPacks.slice(1)));
  } //createPack

  function updateSelectedPacks() {
    selectedPacks = [];
    let checkBoxes = document.querySelectorAll(".pack-checkbox:checked");
    for (let index = 0; index < checkBoxes.length; index++) {
      selectedPacks.push(parseInt(checkBoxes[index].dataset.id, 10));
    }
    loadItemPacks();
  } //updateSelectedPacks

  /**
   * @param {{ value: string; }} select
   */
  function changePack(select) {
    loadItemPacks(parseInt(select.value, 10));
  } //changePack

  function savePacks() {
    let id = parseInt(elements.packEditorSelect.value, 10);

    let packName = elements.packEditorName.value.trim();
    let packItemsRaw = elements.packEditorItems.value;
    let packItems = elements.packEditorItems.value
      .split(String.fromCharCode(10))
      .map((/** @type {string} */ x) => x.trim())
      .filter(Boolean);

    itemPacks[id].name = packName;
    itemPacks[id].raw = packItemsRaw;
    itemPacks[id].items = packItems;

    if (itemPacks.filter((e) => e.name === packName).length > 1) {
      showToast("Pack name already exists", "alert-warning", 3000);
    }

    if (new Set(packItems.map((/** @type {string} */ x) => x.toLowerCase())).size !== packItems.length) {
      showToast("Pack has duplicates", "alert-warning", 3000);
    }

    loadItemPacks(id);

    localforage.setItem("itemPacks", JSON.stringify(itemPacks.slice(1)));
  } //savePacks

  function deletePack() {
    let id = parseInt(elements.packEditorSelect.value, 10);
    itemPacks.splice(id, 1);
    const index = selectedPacks.indexOf(id);
    if (index > -1) {
      selectedPacks.splice(index, 1);
    }
    loadItemPacks(--id);
    localforage.setItem("itemPacks", JSON.stringify(itemPacks.slice(1)));
  } //deletePack

  // window.onbeforeunload = function () {
  //   if (unloadWarningBingo && userInteracted) {
  //     return "Unload warning enabled. You can turn it off in the settings.";
  //   }
  //   return null;
  // }; //onbeforeunload
</script>

<svelte:head>
  <script src="https://embed.twitch.tv/embed/v1.js" async></script>
</svelte:head>

<dialog id="packsModal" class="modal">
  <div class="modal-box overflow-visible">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><IcBaselineClose /></button>
    </form>
    <h3 class="text-lg font-bold">Item pack editor</h3>
    <div class="flex items-end w-full mb-3">
      <fieldset class="fieldset w-full">
        <legend class="fieldset-legend">Select a pack to edit</legend>
        <select class="select w-full" id="packEditorSelect" onchange={() => changePack(this)}>
          {#each itemPacks as pack, index}
            <option value={index} selected={index == 0}>{pack.name}</option>
          {/each}
        </select>
      </fieldset>

      <div class="tooltip p-1" data-tip="Create a new item pack">
        <button id="createPack" class="btn btn-success" onclick={createPack}>
          <IcBaselineAdd />
        </button>
      </div>
    </div>

    <div class="card w-full bg-base-300 border border-info">
      <div class="card-body">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Pack name</legend>
          <input type="text" class="input w-full" id="packEditorName" onchange={savePacks} placeholder="Custom pack" />
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Pack items</legend>
          <textarea class="textarea h-100 w-full" id="packEditorItems" onchange={savePacks} placeholder="(one per line)"></textarea>
        </fieldset>

        <button id="deletePackButton" class="btn btn-error mt-3" onclick={deletePack}><IcBaselineDeleteForever /> Delete pack</button>
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog id="howToPlayModal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><IcBaselineClose /></button>
    </form>
    <h3 class="text-lg font-bold">How to play</h3>
    <article>
      <ul class="list-inside list-decimal space-y-2">
        <li>
          Sign in with <MdiTwitch class="inline" />Twitch
          <small class="opacity-70"> Optional; Allows viewers to play along </small>
        </li>
        <li>
          Set the board size and fill it up
          <small class="opacity-70">
            If you are playing Twitch bingo, you can get random suggestions using the
            <IcBaselineCasino class="inline align-text-bottom" /> buttons. You can also use your own presets if you make an item pack
          </small>
        </li>
        <li>Click the <span class="text-success-500"><IcBaselineCelebration class="inline" /> Start!</span> button</li>
      </ul>
      <br />
      <small class="opacity-70">
        If you signed in with Twitch you should share the bingo.guessr.tv link with your viewers.<br />
        Viewers only need to sign in with Twitch to join the game, they don't interact with the board. The site will automatically fill the board for viewers on their uniquely shuffled boards
      </small>
    </article>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog id="helloModal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><IcBaselineClose /></button>
    </form>
    <h3 class="text-lg font-bold">Welcome to the Guessr.tv Bingo beta!</h3>
    <p class="py-4">This page is still mostly not working :)<br /> What's not working yet: Twitch integration, resizing, items packs, highlighting, scoring</p>
    <p class="py-4">If you have any feedback use any contact method in the About modal bottom left :)</p>
    <div class="modal-action">
      <form method="dialog">
        <button type="submit" class="btn btn-success">OK</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<BingoBoard {bingoSize} {bingoBoard} {gameState} bind:embedHover bind:this={BingoBoardComponent} />

{#if gameState !== "active"}
  <div class="flex justify-end h-screen">
    <div class="card bg-base-300 border-base-100 m-4">
      <div class="card-body">
        <div class="flex flex-row grow gap-4">
          <div class="w-100">
            <button
              class="btn btn-primary mb-4"
              onclick={() => {
                howToPlayModal.showModal();
              }}
              ><IcBaselineHelp />How to play
            </button>

            <div class="card w-full max-w-md bg-base-200 border border-accent">
              <div class="card-body">
                <h2 class="card-title"><IcBaselineSettings class="text-2xl inline align-text-bottom" />Settings</h2>

                <span class="text-lg">
                  <IcBaselineGridOn class="inline align-text-bottom" />
                  Board size: {bingoSize}x{bingoSize} ({bingoSize * bingoSize}
                  {bingoSize == 1 ? "item" : "items"})
                </span>

                <input type="range" min="1" max="10" step="1" class="range range-accent mb-3" onchange={BingoBoardComponent.animateBoard} bind:value={bingoSize} />

                <label class="label text-base-content text-lg">
                  <input type="checkbox" class="toggle toggle-accent" />
                  <IcBaselineNorthEast class="text-lg inline align-text-bottom" /> Allow diagonals
                </label>
                <small class="opacity-70 mb-3">Count diagonals when checking for winning patterns</small>

                <span class="text-lg"><IcBaselineCategory class="inline align-text-bottom" />Bingo type</span>

                <ToggleGroup.Root bind:value={bingoType} type="single" class="rounded border border-base-100 bg-base-100 flex justify-center w-fit p-2">
                  <ToggleGroup.Item
                    aria-label="Twitch Bingo"
                    value="twitch"
                    class="p-1 text-lg font-bold rounded cursor-pointer active:bg-accent data-[state=on]:pointer-events-none data-[state=on]:bg-accent data-[state=on]:text-accent-content inline-flex  items-center justify-center transition-all"
                  >
                    <MdiTwitch />Twitch Bingo
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    aria-label="Custom Bingo"
                    value="custom"
                    class="p-1 text-lg font-bold rounded cursor-pointer active:bg-dark-10 data-[state=on]:pointer-events-none data-[state=on]:bg-accent data-[state=on]:text-accent-content inline-flex  items-center justify-center transition-all"
                  >
                    <IcBaselineBuild />Custom Bingo
                  </ToggleGroup.Item>
                </ToggleGroup.Root>

                <small class="opacity-70">
                  {#if bingoType == "twitch"}
                    Random Twitch streams will be shown
                  {:else}
                    A custom bingo board that can be used to play with your viewers
                  {/if}
                </small>

                {#if bingoType == "custom"}
                  <label class="input" transition:slide>
                    <span class="label">Bingo name</span>
                    <input type="text" id="customBingoName" placeholder="Custom Bingo" />
                  </label>
                {/if}
              </div>
            </div>
          </div>

          <div class="w-150">
            <div class="flex flex-row justify-between mx-1 mb-3">
              <div class="join">
                <button class="btn btn-soft btn-secondary pointer-events-none join-item">Item pack</button>

                <button class="btn btn-outline btn-secondary join-item" popovertarget="itemPackDropdown" style="anchor-name:--itemPackDropdownAnchor">
                  {#if selectedPacks.length == 0}
                    <IcBaselineWarning class="text-warning text-xl" /> No packs selected
                  {:else}
                    {itemPacks[selectedPacks[0]].name} {selectedPacks.length > 1 ? `(+${selectedPacks.length - 1})` : ""} <IcBaselineArrowDropDown />
                  {/if}
                </button>
                <div
                  class="dropdown dropdown-end menu w-52 rounded-box bg-base-100 border border-secondary shadow-sm p-3"
                  popover
                  id="itemPackDropdown"
                  style="position-anchor:--itemPackDropdownAnchor"
                >
                  <span class="opacity-70">Pick 1 or more packs</span>
                  {#each itemPacks as pack, index}
                    <label class="label">
                      <input
                        type="checkbox"
                        checked={selectedPacks.includes(index) ? "checked" : ""}
                        class="checkbox pack-checkbox"
                        id="packSwitch{index}"
                        data-id={index}
                        onchange={updateSelectedPacks}
                      />
                      {pack.name}
                    </label>
                  {/each}
                </div>

                <div class="tooltip tooltip-bottom" data-tip="Edit item packs">
                  <button
                    class="btn btn-outline btn-secondary join-item"
                    onclick={() => {
                      packsModal.showModal();
                    }}
                  >
                    <IcBaselineEdit />
                  </button>
                </div>
              </div>

              <div class="join">
                <div class="tooltip" data-tip="Randomize all">
                  <button class="btn btn-warning join-item" onclick={randomizeAll}>
                    <IcBaselineCasino class="text-xl" />
                  </button>
                </div>
                <div class="tooltip" data-tip="Clear all">
                  <button class="btn btn-error join-item" onclick={clearAll}>
                    <IcBaselineDeleteForever class="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 overflow-y-auto max-h-[70vh]">
              {#each { length: bingoSize * bingoSize }, index}
                <div class="join m-1">
                  <input
                    type="text"
                    class="input join-item bingo-item"
                    onfocus={BingoBoardComponent.activateCellById}
                    onblur={BingoBoardComponent.deactivateCellById}
                    onkeydown={moveCursor}
                    placeholder="Bingo item #{index + 1}"
                    data-item-id={index + 1}
                    aria-label="Bingo item #{index + 1}"
                    name="Bingo item #{index + 1}"
                    bind:value={bingoBoard[index].value}
                  />
                  <button class="btn btn-soft join-item" title="Fill with random item" onclick={() => randomize(index + 1)}>
                    <IcBaselineCasino />
                  </button>
                </div>
              {/each}
            </div>
          </div>
        </div>
        <div class="divider"></div>

        <div class="card-actions justify-between">
          <div class="flex flex-col">
            <Login />
            <small class="opacity-70">Optional. Allows viewers to play along</small>
          </div>

          <div class="flex flex-col">
            <button class="btn btn-success btn-lg" disabled={gameState !== "inactive"} onclick={start}>
              {#if gameState == "inactive"}
                <IcBaselineCelebration class="text-2xl" /> Start!
              {:else}
                <span class="loading loading-spinner loading-xl"></span>
              {/if}
            </button>
            <small class="opacity-70"> Don't forget to share the bingo link with your viewers if you logged in with Twitch :)</small>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if gameState == "active"}
  <div class="h-screen flex flex-col">
    <div class="flex-1 p-3 pb-1">
      {#if bingoType == "twitch"}
        <div class="h-full z-1" class:pointer-events-none={embedHover.disabled} id="twitchEmbed"></div>
      {/if}
    </div>

    <div class="p-3 pt-2">
      <div class="card bg-base-300 shadow-sm">
        <div class="card-body">
          <div class="flex flex-row justify-between items-center">
            <div class="tooltip text-info">
              <div class="tooltip-content">
                scroll: <strong>resize board</strong><br />
                ALT + scroll: <strong>change board opacity</strong><br />
                scroll wheel click + drag: <strong>move board</strong><br />
                R: <strong>reset board position</strong><br />
                F3 / CTRL + F: <strong>search board</strong>
              </div>
              <IcBaselineLightbulb class="text-2xl inline" />Board controls
            </div>

            <div class="flex gap-5">
              <div class="inline-flex items-center gap-1">
                <IcBaselineZoomIn class="text-3xl" />
                <span>Board Size</span>
                <input id="boardSize" type="range" value="1" min="0.1" max="2" step="0.01" class="range range-warning" />
              </div>

              <div class="inline-flex items-center gap-1">
                <IcBaselineOpacity class="text-3xl" />
                <span>Board Opacity</span>
                <input id="boardOpacity" type="range" value="1" min="0" max="1" step="0.01" class="range range-warning" />
              </div>
            </div>

            {#if TWITCH?.access_token}
              <div class="inline-flex">
                <div class="join">
                  <button class="btn btn-accent pointer-events-none join-item" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="/donk.png" alt="profile pic" style="height: 2em" />
                  </button>

                  <label class="input input-accent join-item">
                    <IcBaselineLink />
                    <input class="w-fit max-w-50" type="url" readonly value="beta.guessr.tv/bingo/asd" title="Bingo share link" />
                  </label>

                  <button class="btn btn btn-outline btn-accent join-item" onclick={copyLink}>
                    <IcBaselineContentCopy class="text-lg" />
                  </button>
                </div>
              </div>

              <div class="w-[172px]">
                <div class="drawer drawer-end">
                  <input id="chatLeaderboard" type="checkbox" class="drawer-toggle" />
                  <div class="drawer-content">
                    <label for="chatLeaderboard" class="btn drawer-button btn-primary"><IcBaselineLeaderboard class="text-lg" />Chat leaderboard</label>
                  </div>
                  <div class="drawer-side">
                    <label for="chatLeaderboard" aria-label="close sidebar" class="drawer-overlay"></label>
                    <div class="menu bg-base-200 min-h-full w-80 p-4">
                      <header class="flex justify-between">
                        <h2 class="h2">Bingo leaderboard</h2>
                      </header>
                      <article>
                        <h4>Total players: <span id="leaderboardCount">0</span></h4>
                        <ul class="list-group" id="leaderboard"></ul>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            {/if}

            <div class="inline-flex gap-2">
              <div class="tooltip" data-tip="Previous stream">
                <button onclick={previousStream} disabled={!previousChannels.length || buttonCooldown} class="btn btn-lg btn-secondary">
                  <IcBaselineSkipPrevious />
                </button>
              </div>
              <button onclick={nextStream} disabled={buttonCooldown} class="btn btn-lg btn-success">
                <IcBaselineSkipNext /> Next stream
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
