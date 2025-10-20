<script>
  import { onMount } from "svelte";
  import localforage from "localforage";
  import { addBadges, changeSiteLinkTarget, getCustomBadges, sendUsername, showConfetti, shuffleArray, shuffleArraySeed } from "$lib/functions";
  import { createDraggable } from "animejs";
  import IcBaselineLeaderboard from "~icons/ic/baseline-leaderboard";
  import IcBaselineClose from "~icons/ic/baseline-close";

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

  let bingoType = $state("twitch");

  onMount(async () => {
    const draggable = createDraggable("#board", { container: "body" });
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
      packSwitchesDiv: document.getElementById("packSwitchesDiv"),
      packDropdownButton: document.getElementById("packDropdownButton"),
      twitchBingo: document.getElementById("twitchBingo"),
      customBingo: document.getElementById("customBingo"),
      customBingoName: document.getElementById("customBingoName"),
      board: document.getElementById("board"),
      previewDiv: document.getElementById("previewDiv"),
      previewBoard: document.getElementById("previewBoard"),
      previewUsername: document.getElementById("previewUsername"),
      settingsCard: document.getElementById("settingsCard"),
      start: document.getElementById("start"),
      mainCard: document.getElementById("mainCard"),
      twitchEmbedDiv: document.getElementById("twitchEmbedDiv"),
      twitchEmbed: document.getElementById("twitchEmbed"),
      boardSize: document.getElementById("boardSize"),
      boardOpacity: document.getElementById("boardOpacity"),
      loginButton: document.getElementById("loginButton"),
      loginInfo: document.getElementById("loginInfo"),
      loginInfoPFP: document.getElementById("loginInfoPFP"),
      bingoLink: document.getElementById("bingoLink"),
      previousStream: document.getElementById("previousStream"),
      nextStream: document.getElementById("nextStream"),
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
    //   showToast("Seen channels reset", "success", 3000);
    // };

    TWITCH = JSON.parse(localStorage.getItem("TWITCH"));

    if (TWITCH?.channel) {
      channelName = TWITCH.channel;
      loadInfo();
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

    elements.boardSize.oninput = function () {
      elements.board.style.scale = this.value;
    };

    elements.boardOpacity.oninput = function () {
      elements.board.style.opacity = this.value;
    };

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

    //loadPacks();
    customBadges = await getCustomBadges();
  });

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
  /**
   * @type {any[]}
   */
  let currentItems = [];

  /**
   * @type {{ boardSize: any; board: any; boardOpacity: any; infoTime: any; nextStream: any; previousStream: any; seenChannels: any; start: any; twitchEmbedDiv: any; settingsCard: any; mainCard: any; customBingoName: any; bingoLink: any; leaderboard: any; leaderboardCount: any; previewUsername: any; previewDiv: any; packEditorSelect: any; packSwitchesDiv: any; packEditorName: any; packDropdownButton: any; packEditorItems: any; deletePackButton: any; skipSexual?: HTMLElement | null; unloadWarningBingo?: HTMLElement | null; resetSeenChannels?: HTMLElement | null; packsModal?: HTMLElement | null; twitchBingo?: HTMLElement | null; customBingo?: HTMLElement | null; previewBoard?: HTMLElement | null; twitchEmbed?: HTMLElement | null; loginButton?: HTMLElement | null; loginInfo?: HTMLElement | null; loginInfoPFP?: HTMLElement | null; }}
   */
  let elements;

  let TWITCH = {
    channel: "",
    access_token: "",
    userID: "",
  };

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
  let refreshCooldown;

  /**
   * @type {string}
   */
  let channelName;
  let skipSexual = true;
  let unloadWarningBingo = true;
  let userInteracted = false;

  /**
   * @type {any[]}
   */
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
      let response = await fetch(`https://guessr.donk.workers.dev/list?dank=${Date.now()}`, requestOptions);
      let result = await response.json();
      mainList = result.list;
      elements.infoTime.innerHTML = `Channel list updated on ${new Date(result.time)}`;
    } catch (error) {
      console.log(error);
      showToast("Could not load channel list :(", "error", 5000);
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
    //reroll if channel already seen
    while (seenChannels.includes(channel)) {
      channel = mainList.pop();
    }
    if (mainList.length == 0 || !channel) {
      showToast("No more channels left on the list ...getting new list", "error", 5000);

      await getMainList();
      shuffleArray(mainList);
      nextStream();
      return;
    }
    if (retryLimit > 5) {
      showToast("Too many retries, something might be wrong :(", "error", 4000);

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
      showToast("Can't go further back", "error", 3000);

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
   * @param {{ target: { dataset: { itemId: any; }; }; }} event
   */
  function randomize(event) {
    const id = event.target.dataset.itemId;
    const input = document.querySelector(`[data-item-id="${id}"]`);
    const bingoItems = document.querySelectorAll(".bingo-item");
    const taken = [...bingoItems].map((x) => x.value).filter(Boolean);
    let random = currentItems[Math.floor(Math.random() * currentItems.length)];
    if (taken.length >= currentItems.length) {
      showToast("No more presets left", "error", 3000);

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
      showToast("Board is full", "warning", 3000);

      return;
    }

    let options = shuffleArray(structuredClone(currentItems));
    for (let index = 0; index < bingoItems.length; index++) {
      let option = options.pop();
      if (!option) {
        showToast("No more presets left", "error", 3000);

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

  /**
   * @param {{ dataset: { itemId: string; }; value: string; }} element
   */
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

  /**
   * @param {{ dataset: { itemId: any; }; }} element
   */
  function activateCellById(element) {
    const itemId = element.dataset.itemId;
    const itemCell = document.querySelector(`.bingo-cell[data-id="${itemId}"]`);
    itemCell.classList.add("selected");
  } //activateCellById

  /**
   * @param {{ dataset: { itemId: any; }; }} element
   */
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

  async function uploadBoard() {
    let itemValues = [];
    const bingoItems = document.querySelectorAll(".bingo-item");
    const cells = document.querySelectorAll(".bingo-cell");
    if (TWITCH?.userID) {
      itemValues = shuffleArraySeed(
        [...bingoItems].map((x) => x.value.trim()),
        TWITCH.userID,
      );
    } else {
      itemValues = shuffleArray([...bingoItems].map((x) => x.value.trim()));
    }

    if (itemValues.includes("")) {
      showToast("Board must be full", "warning", 3000);

      return;
    }
    const values = board.map((item) => item.value.toLowerCase());
    const duplicates = new Set(values.filter((v) => values.indexOf(v) !== values.lastIndexOf(v)));
    if (duplicates.size > 0) {
      showToast("Board must not have duplicates", "warning", 3000);

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
          boardCreated = true;
        }
        showToast(result.message, "info", 3000);
      } catch (error) {
        showToast("Could not upload board", "error", 3000);

        console.log("save error", error);
      }
    } else {
      boardCreated = true;
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
      board: board,
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
      showToast("Could not refresh leaderboard", "error", 3000);

      console.log("updateLeaderboard error", error);
    }
  } //updateLeaderboard

  function updateStatsTooltip() {
    let score = checkWin(board, true);
    // bingoStatsTooltip.setContent({
    //   ".tooltip-inner": `<strong>Stats</strong><hr><em>Watched channels:</em> ${previousChannels.length}<br><em>BINGO score:</em> ${score.score.toLocaleString()} ${
    //     score.score == 1 ? "point" : "points"
    //   } ${score.bingos > 0 ? `(${score.bingos} ${score.bingos == 1 ? "BINGO" : "BINGOs"})` : ""}<br>`,
    // });
  } //updateStatsTooltip

  /**
   * @param {any} username
   * @param {string} userid
   * @param {number} score
   * @param {number} bingos
   */
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
      </div>`,
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
      elements.packSwitchesDiv.insertAdjacentHTML("beforeend", `<br><button type="button" class="btn btn-primary" onclick="packsModal.showModal()">Create a new pack</button>`);
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

  function updateSelectedPacks() {
    selectedPacks = [];
    let checkBoxes = document.querySelectorAll(".pack-checkbox:checked");
    for (let index = 0; index < checkBoxes.length; index++) {
      selectedPacks.push(parseInt(checkBoxes[index].dataset.id, 10));
    }
    loadPacks();
  } //updateSelectedPacks

  /**
   * @param {{ value: string; }} select
   */
  function changePack(select) {
    loadPacks(parseInt(select.value, 10));
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
      showToast("Pack name already exists", "warning", 3000);
    }

    if (new Set(packItems.map((/** @type {string} */ x) => x.toLowerCase())).size !== packItems.length) {
      showToast("Pack has duplicates", "warning", 3000);
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
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><IcBaselineClose /></button>
    </form>
    <h3 class="text-lg font-bold">Pack editor</h3>
    <div class="hstack gap-3 mb-3">
      <div class="form-floating" style="width: 100%">
        <select class="form-select" id="packEditorSelect" onchange={() => changePack(this)} aria-label="Select a pack to edit">
          <option value="0" disabled selected>Loading...</option>
        </select>
        <label for="packEditorSelect">Select a pack to edit</label>
      </div>

      <div class="tooltip" data-tip="Create a new pack">
        <button id="createPack" onclick={createPack} class="btn btn-success">
          <i class="material-icons notranslate">add</i>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <form class="form-floating mb-3">
          <input type="text" class="form-control" id="packEditorName" onchange={savePacks} placeholder="Custom pack" />
          <label for="packEditorName">Pack name</label>
        </form>
        <div class="form-floating">
          <textarea class="form-control" placeholder="Leave a comment here" id="packEditorItems" onchange={savePacks} style="height: 500px"></textarea>
          <label for="packEditorItems">Items (one per line)</label>
        </div>
        <button id="deletePackButton" type="button" class="btn btn-danger mt-3" onclick={deletePack}>Delete pack</button>
      </div>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <button type="submit" class="btn">Close</button>
      </form>
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
          <small class="opacity-60"> Optional; Allows viewers to play along </small>
        </li>
        <li>
          Set the board size and fill it up
          <small class="opacity-60">
            If you are playing Twitch bingo, you can get random suggestions using the
            <IcBaselineCasino class="inline align-text-bottom" /> buttons. You can also use your own presets if you make an item pack
          </small>
        </li>
        <li>Click the <span class="text-success-500"><IcBaselineCelebration class="inline" /> Start!</span> button</li>
      </ul>
      <br />
      <small class="opacity-60">
        If you signed in with Twitch you should share the bingo.guessr.tv link with your viewers.<br />
        Viewers only need to sign in with Twitch to join the game, they don't interact with the board. The site will automatically fill the board for viewers on their uniquely shuffled boards
      </small>
    </article>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<BingoBoard size={bingoSize} />

<div id="previewDiv" style="display: none">
  <div class="card">
    <div class="card-header">
      <h4 id="previewUsername" class="text-center"></h4>
    </div>
    <div class="card-body p-0">
      <div id="previewBoard"></div>
    </div>
  </div>
</div>

<div class="row" id="twitchEmbedDiv" style="display: none">
  <div class="col-1"></div>
  <div class="col"><div id="twitchEmbed"></div></div>
</div>

<div class="flex justify-end h-screen" id="settingsCard">
  <div class="card bg-surface-900 m-4">
    <div class="flex flex-col h-full">
      <div class="flex flex-row grow p-4 gap-4">
        <div class="w-100">
          <button
            class="btn btn-primary"
            onclick={() => {
              howToPlayModal.showModal();
            }}><IcBaselineHelp />How to play</button
          >

          <div class="card w-full max-w-md bg-tertiary-900 p-1">
            <header><h4 class="h4"><IcBaselineSettings class="inline align-text-bottom" />Settings</h4></header>

            <article class="p-2">
              <section class="w-full mb-6">
                <h6 class="h6"><IcBaselineGridOn class="inline align-text-bottom" />Board size: {bingoSize}x{bingoSize} ({bingoSize * bingoSize} {bingoSize == 1 ? "item" : "items"})</h6>

                <input type="range" min="1" max="10" step="1" class="range range-accent" bind:value={bingoSize} />
              </section>

              <section class="w-full">
                <label class="label">
                  <input type="checkbox" checked="checked" class="toggle toggle-accent" />
                  <IcBaselineNorthEast /> <span class="font-bold">Allow diagonals</span>
                </label>
              </section>
              <small class="opacity-60">Count diagonals when checking for winning patterns</small>

              <div class="mt-6">
                <h6 class="h6"><IcBaselineCategory class="inline align-text-bottom" />Bingo type</h6>

                <!-- <SegmentedControl name="bingoType" classes="bg-primary-500" value={bingoType} onValueChange={(e) => (bingoType = e.value)}>
                  <Segment.Item value="twitch"><MdiTwitch class="inline" />Twitch bingo</Segment.Item>
                  <Segment.Item value="custom"><IcBaselineBuild class="inline" />Custom bingo</Segment.Item>
                </SegmentedControl> -->
                <br />
                <small class="opacity-60">
                  {#if bingoType == "twitch"}
                    Random Twitch streams will be shown
                  {:else}
                    A custom bingo board that can be used to play with your viewers
                  {/if}
                </small>

                {#if bingoType == "custom"}
                  <div class="input-group grid-cols-[auto_1fr_auto]" transition:slide>
                    <div class="ig-cell bg-primary-500">Bingo name</div>
                    <input id="customBingoName" class="ig-input bg-primary-800" type="text" placeholder="Custom Bingo" />
                  </div>
                {/if}
              </div>
            </article>
          </div>
        </div>

        <div class="w-150">
          <div class="flex flex-row justify-end mb-3">
            <div class="input-group" style="min-width: 20vw; padding-left: 12px; display:none">
              <label class="input-group-text">Item pack</label>
              <button id="packDropdownButton" class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                Loading...
              </button>
              <form class="dropdown-menu p-3">
                <h6 class="dropdown-header">Pick 1 or more packs</h6>
                <div id="packSwitchesDiv">Loading...</div>
              </form>

              <div class="tooltip" data-tip="Edit item packs">
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  onclick={() => {
                    packsModal.showModal();
                  }}
                >
                  <IcBaselineEdit />
                </button>
              </div>
            </div>

            <nav class="btn-group preset-filled-surface-200-800 p-2 flex-row">
              <div class="tooltip" data-tip="Randomize all">
                <button type="button" class="btn preset-tonal-warning" onclick={randomizeAll}>
                  <IcBaselineCasino class="text-xl" />
                </button>
              </div>
              <div class="tooltip" data-tip="Clear all">
                <button type="button" class="btn preset-tonal-error" onclick={clearAll}>
                  <IcBaselineDeleteForever class="text-xl" />
                </button>
              </div>
            </nav>
          </div>

          <div class="grid grid-cols-2 gap-3 overflow-y-auto max-h-[70vh]">
            {#each { length: bingoSize * bingoSize || 25 }, index}
              <div class="input-group grid-cols-[1fr_auto] w-full">
                <input
                  type="text"
                  class="ig-input bg-surface-950 bingo-item"
                  onfocus={activateCellById}
                  onblur={deactivateCellById}
                  oninput={updateSingleItem}
                  onkeydown={moveCursor}
                  placeholder="Bingo item #{index + 1}"
                  data-item-id={index + 1}
                  aria-label="Bingo item #{index + 1}"
                />
                <button class="ig-btn preset-tonal" title="Fill with random item" onclick={randomize} data-item-id={index + 1}>
                  <IcBaselineCasino />
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>
      <footer class="flex flex-col">
        <hr class="hr border-t-2 border-surface-700" />
        <div class="flex flex-row justify-between p-4">
          <div class="flex flex-col">
            <Login />
            <small class="opacity-60">Optional. Allows viewers to play along</small>
          </div>

          <div class="flex flex-col">
            <button id="start" type="button" class="btn btn-lg preset-tonal-success" onclick={start}>
              <IcBaselineCelebration class="text-2xl" /> Start!
            </button>
            <small class="opacity-60"> Don't forget to share the bingo link with your viewers if you logged in with Twitch :)</small>
          </div>
        </div>
      </footer>
    </div>
  </div>
</div>

<div class="row" style="display: none;">
  <div class="col-auto text-center">
    <div class="tooltip text-info mb-2">
      <div class="tooltip-content">
        scroll: <strong>resize board</strong><br />
        ALT + scroll: <strong>change board opacity</strong><br />
        scroll wheel click + drag: <strong>move board</strong><br />
        R: <strong>reset board position</strong><br />
        F3 / CTRL + F: <strong>search board</strong>
      </div>
      <IcBaselineLightbulb /><br /><small>Board controls</small>
    </div>
  </div>

  <div class="col-auto">
    <div class="vstack">
      <div>
        <label for="boardSize" class="form-label float-start"><IcBaselineZoomIn />Board size</label>
        <input type="range" class="form-range align-middle float-end" id="boardSize" value="1" min="0.1" max="2" step="0.01" />
      </div>
      <div>
        <label for="boardOpacity" class="form-label float-start me-2"><IcBaselineOpacity />Board opacity</label>
        <input type="range" class="form-range align-middle float-end" id="boardOpacity" value="1" min="0" max="1" step="0.01" />
      </div>
    </div>
  </div>
  <div class="col-auto">
    <div class="input-group" id="loginInfo" style="display: none">
      <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <img id="loginInfoPFP" src="/donk.png" alt="profile pic" style="height: 2em" />
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <a class="dropdown-item" href="#" onclick={logout}><IcBaselineLogout />Logout</a>
        </li>
      </ul>
      <input readonly value="asd" id="bingoLink" type="text" class="form-control" aria-label="Bingo share link" />
      <button class="btn btn-outline-secondary" type="button" onclick={copyLink}>
        <IcBaselineContentCopy />
      </button>

      <div class="drawer drawer-end">
        <input id="my-drawer-5" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content">
          <label for="my-drawer-5" class="drawer-button btn btn-primary"><IcBaselineLeaderboard />Chat leaderboard</label>
        </div>
        <div class="drawer-side">
          <label for="my-drawer-5" aria-label="close sidebar" class="drawer-overlay"></label>
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
  </div>

  <div class="col">
    <button disabled type="button" id="nextStream" onclick={nextStream} class="btn btn-lg btn-success float-end">
      <IcBaselineSkipNext /> Next stream
    </button>

    <div class="tooltip" data-tip="Previous stream">
      <button disabled type="button" id="previousStream" onclick={previousStream} class="btn btn-lg btn-secondary float-end me-2">
        <IcBaselineSkipPrevious />
      </button>
    </div>
  </div>
</div>

<style>
  #previewDiv {
    position: fixed;
    top: 2%;
    left: 50%;
    transform: translate(-800px);
    z-index: 4000;
    pointer-events: none;
    box-shadow: 3px 3px 10px #000000;
    border-radius: 6px;
    transform-origin: top left;
  }

  #previewDiv > .card > .card-body {
    background-color: var(--bs-secondary-border-subtle);
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    align-self: center;
  }

  #previewBoard {
    width: max-content;
    background-color: var(--bs-secondary-border-subtle);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    padding: 20px;
    z-index: 4000;
    scale: 1;
    pointer-events: none;
  }

  .btn-twitch {
    color: #ffffff;
    background-color: #9933ff !important;
    border-color: #8744aa !important;
  }

  .btn-twitch:active,
  .btn-twitch:focus,
  .btn-twitch:hover {
    color: #ffffff;
    background-color: #8038de !important;
    border-color: #7f40a1 !important;
  }
</style>
