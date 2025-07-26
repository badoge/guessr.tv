<script>
  import { onMount } from "svelte";
  import localforage from "localforage";
  import { toaster } from "$lib/functions";
  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import IcBaselineLeaderboard from "~icons/ic/baseline-leaderboard";
  import IcBaselineSkipPrevious from "~icons/ic/baseline-skip-previous";
  import IcBaselineSkipNext from "~icons/ic/baseline-skip-next";
  import IcBaselineContentCopy from "~icons/ic/baseline-content-copy";
  import IcBaselineCasino from "~icons/ic/baseline-casino";

  import BingoBoard from "$lib/BingoBoard.svelte";

  let drawerState = $state(false);
  let bingoSize = $state(5);

  function drawerClose() {
    drawerState = false;
  }

  onMount(async () => {
    elements = {
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
      board: document.getElementById("board"),
      boardSearch: document.getElementById("board-search"),
      boardSearchBar: document.getElementById("board-search-bar"),
      boardSearchToggle: document.getElementById("board-search-toggle"),
      bingoStats: document.getElementById("bingoStats"),
      bingoStatsTooltip: document.getElementById("bingoStatsTooltip"),
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
      loginDescription: document.getElementById("loginDescription"),
      loginInfoPFP: document.getElementById("loginInfoPFP"),
      bingoLink: document.getElementById("bingoLink"),
      copyButton: document.getElementById("copyButton"),
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
    elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();

    skipSexual = (localStorage.getItem("skipSexual") || "true") === "true";
    elements.skipSexual.checked = skipSexual;

    unloadWarningBingo = (localStorage.getItem("unloadWarningBingo") || "true") === "true";
    elements.unloadWarningBingo.checked = unloadWarningBingo;

    elements.resetSeenChannels.onclick = function () {
      localforage.setItem("seenChannels", JSON.stringify([]));
      elements.seenChannels.innerHTML = 0;
      seenChannels = [];
      toaster.create({
        type: "success",
        title: "Seen channels reset",
        duration: 2000,
      });
    };

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

    elements.board.addEventListener("mousedown", mouseDownHandler);
    loadPacks();
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
  let currentItems = [];

  let elements;

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
  let bingoType = "twitch";

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
      toaster.create({
        type: "error",
        title: "Could not load channel list :(",
        duration: 5000,
      });
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
      toaster.create({
        type: "error",
        title: "No more channels left on the list ...getting new list",
        duration: 3000,
      });
      await getMainList();
      shuffleArray(mainList);
      nextStream();
      return;
    }
    if (retryLimit > 5) {
      toaster.create({
        type: "error",
        title: "Too many retries, something might be wrong :(",
        duration: 3000,
      });
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
      toaster.create({
        type: "error",
        title: "Can't go further back",
        duration: 3000,
      });
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
      toaster.create({
        type: "error",
        title: "No more presets left",
        duration: 3000,
      });
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
      toaster.create({
        type: "warning",
        title: "Board is full",
        duration: 3000,
      });
      return;
    }

    let options = shuffleArray(structuredClone(currentItems));
    for (let index = 0; index < bingoItems.length; index++) {
      let option = options.pop();
      if (!option) {
        toaster.create({
          type: "error",
          title: "No more presets left",
          duration: 3000,
        });
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
      toaster.create({
        type: "warning",
        title: "Board must be full",
        duration: 2000,
      });
      return;
    }
    const values = board.map((item) => item.value.toLowerCase());
    const duplicates = new Set(values.filter((v) => values.indexOf(v) !== values.lastIndexOf(v)));
    if (duplicates.size > 0) {
      toaster.create({
        type: "warning",
        title: "Board must not have duplicates",
        duration: 2000,
      });
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
        toaster.create({
          type: "info",
          title: result.message,
          duration: 3000,
        });
      } catch (error) {
        toaster.create({
          type: "error",
          title: "Could not upload board",
          duration: 3000,
        });
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
    elements.loginInfoPFP.src = "/donk.png";
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
    elements.loginInfoPFP.src = "/donk.png";
    elements.bingoLink.value = `https://bingo.guessr.tv`;
  } //logout

  async function loadPFP() {
    let pfpURL = await get7TVPFP(TWITCH.userID);
    if (pfpURL == "/donk.png" && TWITCH.access_token) {
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
      toaster.create({
        type: "error",
        title: "Could not refresh leaderboard",
        duration: 3000,
      });
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
    board = [];
    let size = bingoSize * bingoSize || 25;
    for (let index = 0; index < size; index++) {
      board.push({ filled: false, value: "" });
    }
  } //loadInputs

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
      toaster.create({
        type: "warning",
        title: "Pack name already exists",
        duration: 2000,
      });
    }

    if (new Set(packItems.map((x) => x.toLowerCase())).size !== packItems.length) {
      toaster.create({
        type: "warning",
        title: "Pack has duplicates",
        duration: 2000,
      });
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

<!-- <div class="modal" id="loginExpiredModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Login expired</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row justify-content-center">
          Renew login:<br />
          <button type="button" data-bs-dismiss="modal" onclick={login} class="btn btn-twitch"><span class="twitch-icon"></span>Sign in with Twitch</button>
          <br /><small class="text-body-secondary">Logins expire after 2 months.<br />Or after you change your password.</small>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onclick={logout}><i class="material-icons notranslate">logout</i>Logout</button>
      </div>
    </div>
  </div>
</div> -->

<!-- <div class="modal fade" id="howToPlayModal" tabindex="-1" aria-labelledby="howToPlayModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="howToPlayModalLabel">How to play</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        1. Sign in with <span class="twitch-icon"></span>Twitch <small class="text-body-secondary">Optional. Allows viewers to play along</small> <br />
        2. Set the board size and fill it up. If you are playing Twitch bingo you can get random suggestions using the
        <i class="material-icons notranslate pointer-events-none">casino</i> buttons<br />
        3. <i class="material-icons notranslate pointer-events-none text-success">celebration</i> <span class="text-success">Start</span><br />
        <small
          >If you signed in with Twitch you should share your bingo.guessr.tv link with your viewers.<br />
          Viewers only need to sign in to join the game, they don't interact with the board. The site will automatically fill the board for viewers on their uniquely shuffled boards
        </small>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">OK</button>
      </div>
    </div>
  </div>
</div> -->

<!-- <div class="modal fade" id="packsModal" tabindex="-1" aria-labelledby="packsModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="packsModalLabel">Pack editor</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="hstack gap-3 mb-3">
          <div class="form-floating" style="width: 100%">
            <select class="form-select" id="packEditorSelect" onchange={() => changePack(this)} aria-label="Select a pack to edit">
              <option value="0" disabled selected>Loading...</option>
            </select>
            <label for="packEditorSelect">Select a pack to edit</label>
          </div>
          <button id="createPack" onclick={createPack} type="button" class="btn btn-success" data-bs-toggle="tooltip" data-bs-title="Create a new pack">
            <i class="material-icons notranslate">add</i>
          </button>
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
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div> -->

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

<div class="container-fluid pt-3">
  <div class="row">
    <div class="col-5"></div>
    <div class="col-7 position-relative">
      <div class="card" id="settingsCard">
        <div class="card-header text-center"><img src="/guessr.png" alt="logo" style="height: 24px; width: 24px" class="d-inline-block align-top" /> Guessr.tv Bingo</div>
        <div class="card-body">
          <div class="container-fluid p-0">
            <div class="row">
              <div class="col mb-3">
                <button type="button" class="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#howToPlayModal">
                  <i class="material-icons notranslate">help_outline</i> How to play
                </button>
                <br />
                <button id="loginButton" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Sign in to enable sharing with viewers" class="btn btn-twitch" onclick={login}>
                  <span class="twitch-icon"></span> Sign in with Twitch
                </button>
                <br />
                <small id="loginDescription" class="text-body-secondary">Optional. Allows viewers to play along</small>

                <div class="card mt-3">
                  <div class="card-header">
                    <h5><i class="material-icons notranslate">settings</i>Settings</h5>
                  </div>
                  <div class="card-body">
                    <h5><i class="material-icons notranslate">grid_on</i>Board</h5>
                    <label for="bingoSize" id="bingoSizeLabel" class="form-label">Board size: 5x5 (25 items)</label><br />
                    <input type="range" class="form-range" min="1" max="10" step="1" value="5" id="bingoSize" />

                    <div class="mt-3">
                      <h5>Bingo type</h5>
                      <div class="btn-group" role="group" aria-label="Mode">
                        <input type="radio" class="btn-check" name="bingoTypeSelect" value="twitch" id="twitchBingo" autocomplete="off" checked />
                        <label class="btn btn-outline-primary" for="twitchBingo"><span class="twitch-icon"></span>Twitch Bingo</label>
                        <input type="radio" class="btn-check" name="bingoTypeSelect" value="custom" id="customBingo" autocomplete="off" />
                        <label class="btn btn-outline-info" for="customBingo">Custom Bingo</label>
                      </div>
                      <br />
                      <small id="bingoTypeDescription">Random Twitch streams will be shown</small>

                      <div id="customBingoNameDiv" class="input-group mb-3" style="display: none">
                        <span class="input-group-text" id="bingoNameLabel">Bingo name</span>
                        <input id="customBingoName" type="text" class="form-control" placeholder="Custom Bingo" aria-label="Custom Bingo" aria-describedby="bingoNameLabel" />
                      </div>
                    </div>

                    <div class="form-check form-switch mt-3">
                      <input class="form-check-input" type="checkbox" role="switch" id="allowDiagonals" />
                      <label class="form-check-label" for="allowDiagonals"><i class="material-icons notranslate">north_east</i>Allow diagonals</label>
                      <br /><small class="text-body-secondary">Count diagonals when checking for winning patterns</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col">
                <div class="hstack gap-3 mb-3">
                  <div class="input-group" style="min-width: 20vw; padding-left: 12px">
                    <label class="input-group-text">Item pack</label>
                    <button id="packDropdownButton" class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                      Loading...
                    </button>
                    <form class="dropdown-menu p-3">
                      <h6 class="dropdown-header">Pick 1 or more packs</h6>
                      <div id="packSwitchesDiv">Loading...</div>
                    </form>
                    <button class="btn btn-outline-secondary" type="button" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit item packs" onclick={editPacks}>
                      <i class="material-icons notranslate pointer-events-none">edit</i>
                    </button>
                  </div>

                  <div class="btn-group" role="group" aria-label="text input controls">
                    <button type="button" class="btn btn-warning" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Randomize all" onclick={randomizeAll}>
                      <i class="material-icons notranslate pointer-events-none">casino</i>
                    </button>
                    <button type="button" class="btn btn-danger" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Clear all" onclick={clearAll}>
                      <i class="material-icons notranslate pointer-events-none">delete_forever</i>
                    </button>
                  </div>
                </div>

                <div class="container-fluid" style="height: 65vh; overflow: auto">
                  {#each { length: bingoSize * bingoSize || 25 }, index}
                    <div class="input-group mb-1 w-50 pe-1">
                      <input
                        type="text"
                        class="form-control bingo-item"
                        onfocus={activateCellById}
                        onblur={deactivateCellById}
                        oninput={updateSingleItem}
                        onkeydown={moveCursor}
                        placeholder="Bingo item #{index + 1}"
                        data-item-id={index + 1}
                        aria-label="Bingo item #{index + 1}"
                        value={index}
                      />
                      <button class="btn btn-outline-secondary" onclick={randomize} data-item-id={index + 1} type="button" title="Fill with random item">
                        <IcBaselineCasino />
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer text-body-secondary text-end">
          <small class="text-body-secondary"> Don't forget to share the bingo link with your viewers if you logged in with Twitch :)</small>
          <button type="button" class="btn btn-success btn-lg" onclick={start} id="start"><i class="material-icons notranslate">celebration</i> Start!</button>
        </div>
      </div>
    </div>
  </div>

  <div class="row" id="twitchEmbedDiv" style="display: none">
    <div class="col-1"></div>
    <div class="col"><div id="twitchEmbed"></div></div>
  </div>

  <div class="row mb-3 mt-2" id="bottomRow">
    <div class="col-1"></div>
    <div class="col-11">
      <div class="card" id="mainCard" style="display: none">
        <div class="card-body container-fluid">
          <div id="sliderDiv" class="row">
            <div class="col-auto text-center">
              <span
                class="text-info mb-2"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-html="true"
                data-bs-title="
                    scroll: <strong>resize board</strong><br>
                    ALT + scroll: <strong>change board opacity</strong><br>
                    scroll wheel click + drag: <strong>move board</strong><br>
                    R: <strong>reset board position</strong><br>
                    F3 / CTRL + F: <strong>search board</strong>"
              >
                <i class="material-icons notranslate">lightbulb</i>
                <br /><small>Board controls</small>
              </span>
            </div>

            <div class="col-auto">
              <div class="vstack">
                <div>
                  <label for="boardSize" class="form-label float-start"><i class="material-icons notranslate">zoom_in</i>Board size</label>
                  <input type="range" class="form-range align-middle float-end" id="boardSize" value="1" min="0.1" max="2" step="0.01" />
                </div>
                <div>
                  <label for="boardOpacity" class="form-label float-start me-2"><i class="material-icons notranslate">opacity</i>Board opacity</label>
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
                    <a class="dropdown-item" href="#" onclick={logout}><i class="material-icons notranslate">logout</i>Logout</a>
                  </li>
                </ul>
                <input readonly value="asd" id="bingoLink" type="text" class="form-control" aria-label="Bingo share link" />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  id="copyButton"
                  data-bs-toggle="popover"
                  data-bs-trigger="manual"
                  data-bs-placement="top"
                  data-bs-content="Link copied :)"
                  onclick={copyLink}
                >
                  <IcBaselineContentCopy />
                </button>

                <Modal
                  open={drawerState}
                  onOpenChange={(e) => (drawerState = e.open)}
                  triggerBase="btn preset-tonal"
                  contentBase="bg-surface-100-900 p-4 space-y-4 shadow-xl w-[480px] h-screen"
                  positionerJustify="justify-end"
                  positionerAlign=""
                  positionerPadding=""
                  transitionsPositionerIn={{ x: 480, duration: 200 }}
                  transitionsPositionerOut={{ x: 480, duration: 200 }}
                >
                  {#snippet trigger()}<IcBaselineLeaderboard />Chat leaderboard{/snippet}
                  {#snippet content()}
                    <header class="flex justify-between">
                      <h2 class="h2">Bingo leaderboard</h2>
                    </header>
                    <article>
                      <h4>Total players: <span id="leaderboardCount">0</span></h4>
                      <ul class="list-group" id="leaderboard"></ul>
                    </article>
                  {/snippet}
                </Modal>
              </div>
            </div>

            <div class="col">
              <button disabled type="button" id="nextStream" onclick={nextStream} class="btn btn-lg btn-success float-end">
                <IcBaselineSkipNext /> Next stream
              </button>
              <button
                disabled
                type="button"
                id="previousStream"
                onclick={previousStream}
                class="btn btn-lg btn-secondary float-end me-2"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-title="Previous stream"
              >
                <IcBaselineSkipPrevious />
              </button>
            </div>
          </div>
        </div>
      </div>
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
</style>
