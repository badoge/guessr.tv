<script>
  import localforage from "localforage";
  import { onMount } from "svelte";
  import { showToast } from "../+layout.svelte";
  import { ToggleGroup } from "bits-ui";
  import { slide } from "svelte/transition";
  import { animate, utils } from "animejs";
  import tmi from "@tmi.js/chat";
  import {
    addBadges,
    checkSimilarity,
    cleanString,
    getChannelBadges,
    getChannelId,
    getCustomBadges,
    getGlobalBadges,
    getStreamerColor,
    isInt,
    sendUsername,
    showConfetti,
    shuffleArray,
    checkEmote,
  } from "$lib/functions";

  import IcBaselineTheaterComedy from "~icons/ic/baseline-theater-comedy";
  import IcBaselineSkipNext from "~icons/ic/baseline-skip-next";
  import IcBaselinePublic from "~icons/ic/baseline-public";
  import IcBaselineEmojiEmotions from "~icons/ic/baseline-emoji-emotions";
  import IcBaselineSportsEsports from "~icons/ic/baseline-sports-esports";
  import IcBaselineImportExport from "~icons/ic/baseline-import-export";
  import IcBaselineClose from "~icons/ic/baseline-close";
  import IcBaselineLiveTv from "~icons/ic/baseline-live-tv";
  import IcBaselineMovie from "~icons/ic/baseline-movie";
  import IcBaselineTimer from "~icons/ic/baseline-timer";
  import IcBaselineOndemandVideo from "~icons/ic/baseline-ondemand-video";
  import IcBaselineWarning from "~icons/ic/baseline-warning";
  import IcBaselineKeyboardDoubleArrowDown from "~icons/ic/baseline-keyboard-double-arrow-down";
  import IcBaselineKeyboardDoubleArrowUp from "~icons/ic/baseline-keyboard-double-arrow-up";
  import IcBaselineInfo from "~icons/ic/baseline-info";
  import MdiTwitch from "~icons/mdi/twitch";
  import ViewersSVG from "$lib/ViewersSVG.svelte";
  import TwitchEmbed from "$lib/TwitchEmbed.svelte";
  import ScoreProgress from "$lib/ScoreProgress.svelte";
  import Correction from "$lib/Correction.svelte";
  import RoundAndScore from "$lib/RoundAndScore.svelte";

  let elements;

  /**
   * @type {string}
   * @description stream - clip
   */
  let videoType = $state("stream");

  /**
   * @type {string}
   * @description "random", "short", "long", "popular", "hottub", "forsen"
   */
  let clipCollection = $state("random");

  /**
   * @type {string}
   * @description viewers - higherlower - game - emote - irl
   */
  let gameMode = $state("viewers");

  /**
   * @type {string}
   * @description channel that we will connect to
   */
  let channelName = $state("");

  /**
   * @type {boolean}
   * @description if this is true then chat can play along in this game mode, so we should connect to chat and show the leaderboard
   */
  let chatEnabled = $state(false);

  /**
   * @type {string}
   * @description inactive - active - roundEnded - gameEnded | used to display the game selector or controls or round results or game results
   */
  let gameState = $state("inactive");

  let embeddedChannel = $state("");
  let embeddedClip = $state("");

  let channelBadges = { subscriber: [], bits: [] };
  let globalBadges = {};
  let customBadges = [];

  const powerupIcons = {
    p5050: `<i class="material-icons notranslate" title="50-50">theater_comedy</i>`,
    pSkip: `<i class="material-icons notranslate" title="Round skipped">skip_next</i>`,
  };

  /**
   * @type {any}
   */
  let channelId;
  /**
   * @type {any}
   */
  let streamerColor;
  /**
   * @type {any[]}
   */
  let mainList = [];
  /**
   * @type {{ name: any; }[]}
   */
  let gameList = $state([]);
  /**
   * @type {string | any[]}
   */
  let emoteList = [];
  /**
   * @type {any[]}
   */
  let guessList = [];
  /**
   * @type {any[]}
   */
  let seenChannels = [];
  /**
   * @type {any[]}
   */
  let seenClips = [];
  /**
   * @type {{ answer: any; correct: any; points: number; diff: number; color: string | undefined; }[]}
   */
  let roundResults = []; // collecting stuff for final screen
  /**
   * @type {any[]}
   */
  let usedPowerups = []; // list of powerups used in current round
  let round = $state(0);
  let totalScore = $state(0);
  let roundPoints = $state(0);

  let correctAnswer = $state();
  let userAnswer = $state();

  /**
   * @type { any[]}
   */
  let emoteChoices = $state([]);
  let emotesReady = $state(false);

  let emoteChatChoices = { a: 1, b: 2, c: 3, d: 4, e: 5 };

  let max = 0;
  /**
   * @type {number | null}
   */
  let higherlowerPreviousNumber = $state(null);
  /**
   * @type {{ addEventListener: (arg0: string, arg1: { (e: any): void; (e: any): void; }) => void; getTimeValues: () => { (): any; new (): any; toString: { (arg0: string[]): string; new (): any; }; }; reset: () => void; stop: () => void; start: (arg0: { countdown: boolean; precision: string; startValues: { seconds: number; }; }) => void; isRunning: () => any; }}
   */
  let timer;

  let powerups = {
    p5050: 0,
    pSkip: 0,
  };

  let skipSexual = true;
  let unloadWarning = false;

  /**
   * @type {any}
   */
  let highScores = $state({
    viewers: 0,
    game: 0,
    emote: 0,
    higherlower: 0,
  });

  let tmiClient;
  let chatters = new Map();
  let usernameSent = false;

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
      console.log(result);
      mainList = result.list;
      elements.infoTime.innerHTML = `Channel list updated on ${new Date(result.time)}`;
    } catch (error) {
      console.log(error);
    }
  } //getMainList

  async function getClipSet() {
    let requestOptions = {
      headers: {
        pragma: "no-cache",
        "cache-control": "no-cache",
      },
    };
    try {
      let response = await fetch(`https://guessr.donk.workers.dev/clips/${clipCollection}?time=${Date.now()}`, requestOptions);
      let list = await response.json();
      mainList = JSON.parse(list[0].clips);
      elements.infoTime.innerHTML = `Clip set generated on 2025/06/08`;
    } catch (error) {
      console.log(error);
    }
  } //getClipSet

  async function getEmoteList() {
    try {
      let response = await fetch(`https://api.okayeg.com/guess/emotes?time=${Date.now()}`);
      emoteList = await response.json();
    } catch (error) {
      console.log(error);
    }
  } //getEmoteList

  async function loadGameList() {
    let response = await fetch(`/games.json`);
    gameList = shuffleArray(await response.json());
  } //loadGameList

  async function startGame() {
    gameState = "active";
    guessList = [];
    chatters = new Map();
    roundResults = [];
    totalScore = 0;

    //get a new clip set and then use helper to update view count and make sure clips still exist
    if (videoType == "clip") {
      await getClipsGuessList();
    }

    //load the auto complete list for game names
    if (gameMode == "game") {
      await loadGameList();
    }

    //get a list of random emotes for the wrong choices
    if (gameMode == "emote") {
      await getEmoteList();
    }

    //elements.breakdown.disabled = false;

    round = 0;
    higherlowerPreviousNumber = null;

    for (const pType in powerups) {
      powerups[pType] = 1;
    }
  } //startGame

  async function getRandomStream() {
    //pick a random stream from the main list which has ~700 streams
    let randomUserid = mainList[Math.floor(Math.random() * mainList.length)];
    let randomStream = { userid: randomUserid };

    //check if channel is already seen
    if (seenChannels.includes(randomStream.userid)) {
      return await getRandomStream();
    }

    //update stream info
    try {
      let response = await fetch(`https://helper.guessr.tv/twitch/streams?user_id=${randomStream.userid}`);
      let stream = await response.json();

      if (stream.data[0]) {
        let response2 = await fetch(`https://helper.guessr.tv/twitch/channels?broadcaster_id=${randomStream.userid}`);
        let result2 = await response2.json();

        //get a new stream if skip sexual is checked
        if (result2?.data[0]?.content_classification_labels?.includes("SexualThemes") && skipSexual) {
          return await getRandomStream();
        }

        //get 1 channel emote if mode is emote
        if (gameMode == "emote") {
          let tries = 0;
          try {
            let response = await fetch(`https://helper.guessr.tv/twitch/chat/emotes?broadcaster_id=${randomStream.userid}`);
            let emotes = await response.json();
            if (emotes?.data?.length > 0) {
              let emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
              while (!(await checkEmote(emote))) {
                if (++tries > 3) {
                  showToast("Something went wrong while fetching the channel's emotes :(", "alert-error", 3000);
                  //console.log(error);
                  return await getRandomStream();
                }
                emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
              }
              randomStream.emote = emote;
            } else {
              showToast("Channel has no emotes, getting new channel...", "alert-info", 3000);

              return await getRandomStream();
            }
          } catch (error) {
            showToast("Something went wrong while fetching the channel's emotes :(", "alert-error", 3000);

            console.log(error);
            return await getRandomStream();
          }
        } //emote

        //get a new stream if current one has no category in game name mode
        if (!stream.data[0].game_name && gameMode == "game") {
          return await getRandomStream();
        }

        //update stream info
        randomStream.username = stream.data[0].user_login;
        randomStream.viewers = stream.data[0].viewer_count;
        randomStream.game_name = stream.data[0].game_name;
        randomStream.game_name_clean = cleanString(stream.data[0].game_name);
        randomStream.thumbnail = stream.data[0].thumbnail_url || "";

        if (gameMode == "viewers") {
          //set the max slider value
          max = randomStream.viewers + Math.floor(Math.random() * 10000);
          document.getElementById("guessNumber").max = max;
        }

        return randomStream;
      } else {
        //stream is offline so remove it from the main list and get a new one
        const index = mainList.indexOf(randomStream.userid);
        if (index > -1) {
          mainList.splice(index, 1);
        }
        return await getRandomStream();
      }
    } catch (error) {
      showToast("Something went wrong while updating the view count :(", "alert-error", 3000);

      console.log(error);
      return await getRandomStream();
    }
  } //getRandomStream

  async function getClipsGuessList() {
    await getClipSet(); // needs to be fetched before each game bcz list has 5 clips only
    let ids = mainList.map((e) => e.id);
    try {
      let response = await fetch(`https://helper.guessr.tv/twitch/clips?id=${ids.join(",")}`);
      if (response.status != 200) {
        showToast("Something went wrong while updating clip view counts :(", "alert-error", 3000);

        // await getClipsGuessList();
        return;
      }
      let clips = await response.json();
      for (let index = 0; index < clips.data.length; index++) {
        let clipIndex = mainList.findIndex((e) => e.id == clips.data[index].id);
        mainList[clipIndex].viewers = clips.data[index].view_count; //update clips from the bot with up to date view count from helper
        mainList[clipIndex].thumbnail = clips.data[index].thumbnail_url || "";
      }

      //remove deleted clips
      guessList = mainList.filter((n) => clips.data.some((/** @type {{ id: any; }} */ n2) => n.id == n2.id));
      if (guessList.length < 5) {
        showToast("Clip set contains deleted clips, getting new set...", "alert-info", 2000);
        return await getClipsGuessList();
      }

      //remove seen clips
      guessList = guessList.filter((n) => !seenClips.includes(n.id));
      if (guessList.length < 5) {
        showToast("Clip set contains already seen clips, getting new set...", "alert-info", 2000);
        return await getClipsGuessList();
      }

      //update max slider value
      max = Math.max(...guessList.map((o) => o.viewers || 0)) + Math.floor(Math.random() * 10000);
      document.getElementById("guessNumber").max = max;

      //get an emote for each channel
      if (gameMode == "emote") {
        await getClipsEmotes();
      }
    } catch (error) {
      showToast("Something went wrong while updating clip view counts :(", "alert-error", 3000);
      //await getClipsGuessList();
      console.log(error);
    }
  } //getClipsGuessList

  async function getClipsEmotes() {
    let fetched = 0;
    for (let index = 0; index < 5; index++) {
      let tries = 0;
      try {
        let response = await fetch(`https://helper.guessr.tv/twitch/chat/emotes?broadcaster_id=${guessList[index].userid}`);
        if (response.status != 200) {
          showToast("Something went wrong while fetching the channel's emotes :(", "alert-error", 3000);
          return;
        }
        let emotes = await response.json();
        if (emotes?.data?.length > 0) {
          let emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
          while (!(await checkEmote(emote))) {
            if (++tries > 3) {
              showToast("Something went wrong while fetching the channel's emotes :(", "alert-error", 3000);
              return await getClipsGuessList();
            }
            emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
          }
          guessList[index].emote = emote;
          fetched++;
        } else {
          showToast("Channel has no emotes, getting new clip set...", "alert-info", 3000);
          return await getClipsGuessList();
        }
      } catch (error) {
        showToast("Something went wrong while fetching the channel's emotes :(", "alert-error", 3000);
        console.log(error);
      }
    }
    if (fetched < 5) {
      guessList = [];
      showToast("Clip set contains deleted clips, getting new set...", "alert-info", 3000);
      return await getClipsGuessList();
    }
  } //getClipsEmotes

  async function nextRound() {
    gameState = "active";

    //get new clip set if game uses streaks after 5 rounds
    if (round == 5 && videoType == "clip" && gameMode !== "viewers") {
      await getClipsGuessList();
      //reset round counter because the guess list will get reset
      round = 0;
    }

    //get a random stream with updated info and add it to guessList
    if (videoType == "stream") {
      guessList.push(await getRandomStream());
    }

    round++;
    if (gameMode == "viewers") {
      document.getElementById("guessRange").value = 0;
      document.getElementById("guessNumber").value = "";
    }
    if (gameMode == "game") {
      document.getElementById("gameInput").value = "";
    }

    //set random number for higherlowerPreviousNumber in first round or update it for next round on other rounds
    if (gameMode == "higherlower") {
      if (higherlowerPreviousNumber === null) {
        higherlowerPreviousNumber = Math.floor(Math.random() * 100);
      } else {
        higherlowerPreviousNumber = guessList[round - 2].viewers;
      }
    }

    // update powerup count
    usedPowerups = [];
    const addedPowerups = {};
    if (round > 1) {
      if (round % 3 === 0) {
        addedPowerups.p5050 = 1;
      }
      if (round % 7 === 0) {
        addedPowerups.pSkip = 1;
      }
    }
    for (const pType in powerups) {
      if (pType in addedPowerups) {
        powerups[pType] += addedPowerups[pType];
      }
      // updates available powerup counter
      document.querySelectorAll(`.powerup-${pType}-count`).forEach((elem) => {
        elem.innerText = powerups[pType];
      });
      // updates animated incrementor
      document.querySelectorAll(`.powerup-${pType}-added`).forEach((elem) => {
        elem.innerText = pType in addedPowerups ? "+" + addedPowerups[pType] : "";
      });
    }

    if (gameMode == "game") {
      //add the answer to the options list
      if (!gameList.some((e) => e.name === guessList[round - 1].game_name)) {
        gameList.push({ name: guessList[round - 1].game_name });
        shuffleArray(gameList);
      }
    }

    if (gameMode == "emote") {
      await generateEmoteChoices(guessList[round - 1].userid);
    }

    if (videoType == "stream") {
      embeddedChannel = guessList[round - 1].username;
      seenChannels.push(guessList[round - 1].username);
    }

    if (chatEnabled && guessList[round - 1].username == channelName) {
      showConfetti(2);
      sendUsername(" - dank ⚠️ ⚠️ ⚠️");
    }

    if (videoType == "clip") {
      embeddedClip = guessList[round - 1].id;
      seenClips.push(guessList[round - 1].id);
    }

    if (gameMode == "viewers") {
      //reset round leaderboard and switch to total tab
      //elements.leaderboardListRound.innerHTML = "";
    }

    startTimer();
  } //nextRound

  /**
   * @param {any} userid
   */
  async function generateEmoteChoices(userid) {
    emoteChoices = [];
    emotesReady = false;
    //add the correct emote to the array
    emoteChoices.push({ emoteId: guessList[round - 1].emote, channelId: userid });

    //add 4 random emotes to the array
    for (let index = 0; index < 4; index++) {
      const randomChannel = emoteList[Math.floor(Math.random() * emoteList.length)];
      const randomChannelEmotes = [...randomChannel?.bitstier, ...randomChannel?.follower, ...randomChannel?.subscriptions];

      //check if channel has no emotes or if we already picked this channel
      if (randomChannelEmotes.length < 1 || emoteChoices.some((e) => e.channelId === randomChannel._id)) {
        index--;
        continue;
      }

      let emote = randomChannelEmotes[Math.floor(Math.random() * randomChannelEmotes.length)].id;
      //check if emote url loads
      if (!(await checkEmote(emote))) {
        index--;
        continue;
      }

      emoteChoices.push({ emoteId: emote, channelId: randomChannel._id });
    }

    shuffleArray(emoteChoices);
    emotesReady = true;
  } //generateEmoteChoices

  /**
   * @param {number} lat1
   * @param {number} lon1
   * @param {number} lat2
   * @param {number} lon2
   */
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const toRad = (/** @type {number} */ angle) => angle * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // in kilometers
  }

  /**
   * @param {string | number | null} choice
   */
  async function guess(choice, timeUp = false, skipped = false) {
    if (gameMode == "irl") {
      if (!markerAnswer) {
        showToast("No location selected", "alert-warning", 2000);
        return;
      }

      let diff = getDistance(markerAnswer.latitude, markerAnswer.longitude, irlLocation.latitude, irlLocation.longitude);

      L.marker([irlLocation.latitude, irlLocation.longitude]).addTo(map);

      map.flyTo(L.latLng(irlLocation.latitude, irlLocation.longitude));

      document.getElementById("irlCorrection").innerHTML = `Your guess was <strong>${Math.round(
        diff,
      ).toLocaleString()} km</strong> away from the streamer<br><small><span class="text-danger">Refresh the page</span> to reset and pick a new stream :)</small>`;

      console.log(diff);
      return;
    }

    switch (choice) {
      case "slider":
        userAnswer = parseInt(document.getElementById("guessNumber").value, 10);
        if (timeUp && !userAnswer) {
          userAnswer = -1;
        }
        break;

      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        userAnswer = emoteChoices[choice - 1].channelId;
        break;

      case "higher":
      case "lower":
        userAnswer = choice;
        break;

      case "game":
        userAnswer = cleanString(document.getElementById("gameInput").value);
        //show warning if no answer is provided but only if timer is not over
        if (!userAnswer && !timeUp) {
          showToast("Invalid answer", "alert-warning", 2000);
          document.getElementById("gameInput").value = "";
          return;
        }
        //show warning if answer does not exist in the game list
        if (!gameList.some((x) => cleanString(x.name) === userAnswer) && !timeUp) {
          showToast("Answer must be from the suggestions list", "alert-warning", 2000);
          document.getElementById("gameInput").value = "";
          return;
        }
        if (timeUp && !userAnswer) {
          userAnswer = -1;
        }
        break;

      default:
        //user did not answer and time is up so set userAnswer to -1 so they lose a point when calculateScore() is called
        //also works when `skipped` is 'true'
        userAnswer = -1;
    }

    //show warning if no answer is selected
    if ((isNaN(userAnswer) || userAnswer === null) && gameMode !== "game" && gameMode !== "higherlower" && !timeUp) {
      showToast("Invalid answer", "alert-warning", 2000);
      return;
    }

    //stop timer here because checks above can show some warning instead of ending the round
    stopTimer();
    gameState = "roundEnded";

    let points = calculateScore(userAnswer, skipped);

    // store some data for final screen:
    let roundResult = {
      userAnswer: userAnswer,
      points: points,
      task: guessList[round - 1],
      powerups: usedPowerups,
    };
    roundResults.push(roundResult);

    totalScore += points;
    roundPoints = points;

    //show progress bar and correction for viewers mode - streams or clips
    if (gameMode == "viewers") {
      correctAnswer = guessList[round - 1].viewers;
    }

    //show progress bar and correction for gamename game - text controls - streams or clips
    if (gameMode == "game") {
      correctAnswer = guessList[round - 1].game_name;
      userAnswer = userAnswer == -1 ? userAnswer : document.getElementById("gameInput").value;

      if (totalScore > highScores.game) {
        highScores.game = totalScore;
        localStorage.setItem("gameStreak", totalScore.toString());
      }
    }

    //show progress bar and correction for emote mode - multi choice controls - streams or clips
    if (gameMode == "emote") {
      correctAnswer = guessList[round - 1].emote;
      let emote = choice === null ? null : emoteChoices[choice - 1].emoteId;
      userAnswer = userAnswer == -1 ? userAnswer : emote;

      if (totalScore > highScores.emote) {
        highScores.emote = totalScore;
        localStorage.setItem("emoteStreak", totalScore.toString());
      }
    }

    //show progress bar and correction for higherlower mode - streams or clips
    if (gameMode == "higherlower") {
      correctAnswer = guessList[round - 1].viewers;

      if (totalScore > highScores.higherlower) {
        highScores.higherlower = totalScore;
        localStorage.setItem("viewersHigherlowerStreak", totalScore.toString());
      }
    }

    // remember the correction content - will reuse it on the final screen
    //roundResult.correctionHTML = elements.correction.innerHTML;

    //update streamer's answer in the chatters map and then update all viewers' scores when updating the leaderboard
    if (chatEnabled) {
      let username = channelName.replace(/\s+/g, "").toLowerCase();
      let streamer = chatters.get(username);
      if (!streamer) {
        chatters.set(username, {
          username: username,
          totalScore: 0,
          currentRound: points,
          currentAnswer: userAnswer,
          color: streamerColor,
          badges: addBadges("streamer", channelId),
        });
      } else {
        streamer.currentRound = points;
        streamer.currentAnswer = userAnswer;
        chatters.set(username, streamer);
      }
      updateLeaderboard();
    }

    //higherlower and game and emote modes are endless so return and dont end game
    if (gameMode !== "viewers") {
      return;
    }

    //end game if game on 5th round and mode is viewers
    if (round == 5 && gameMode == "viewers") {
      elements.gameEndText.innerHTML = `Final Score: ${totalScore.toLocaleString()}`;
      if (totalScore > highScores.viewers) {
        elements.gameEndText.innerHTML += `<br>New High Score!`;
        highScores.viewers = totalScore;
        localStorage.setItem("viewersHS", highScores.viewers.toString());
      } else {
        elements.gameEndText.innerHTML += `<br>High Score: ${highScores.viewers.toLocaleString()}`;
      }
      elements.gameEndText.style.display = "";
      gameState = "gameEnded";
    }
  } //guess

  function showBreakdown() {
    const thumbSize = [640, 360];

    const roundDataMap = roundResults.map((data, i) => {
      const u = data.task.username.toLowerCase();

      const thumbnail = String(data.task.thumbnail).replace("{width}", thumbSize[0]).replace("{height}", thumbSize[1]);
      const channelLink = `<a href="https://twitch.tv/${u}" target="_blank">${data.task.display_name || data.task.username}</a>`;

      let iframe;
      if (videoType == "clip") {
        iframe = `
      <iframe height="100%" width="100%" preload="metadata"
      src="https://clips.twitch.tv/embed?clip=${data.task.id}&parent=${window.location.hostname}&autoplay=true" 
      ></iframe>`;
      } else {
        iframe = `<iframe src="https://player.twitch.tv/?channel=${u}&parent=${window.location.hostname}" width="100%" height="100%" allowfullscreen autoplay="false"></iframe>`;
      }

      let pointsText = data.points.toLocaleString() + " Point";
      if (data.points % 10 !== 1 || data.points % 100 === 11) {
        pointsText += "s";
      }
      if (data.points === 0) {
        pointsText += " 💀";
      }

      const answer = data.answer === -1 ? "❌" : data.answer;

      let roundResultBlock;
      switch (gameMode) {
        case "emote":
          roundResultBlock = `<p class='m-0'>${data.correctionHTML}</p>`;
          break;

        case "game":
          roundResultBlock = `
        <p class='m-0'>
          Your guess: <span class="text-${i + 1 < roundResults.length ? "success" : "danger"}">${answer}</span>
          <br /><br />
          Correct answer: <span class="text-info">${data.correct}</span>
        </p>`;
          break;

        case "viewers":
          roundResultBlock = `
        <div class="col-8">
          <div class="fs-5">
            <span>${pointsText}</span><br />
            <div class="progress" role="progressbar" aria-label="score" aria-valuenow="${data.percent}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar" style="width:${data.percent}%"></div>
            </div>
          </div>
        </div>
        <div class="col-4">
          ${data.correctionHTML}
        </div>`;
          break;

        case "higherlower":
          roundResultBlock = `
        <div class="col-6">
          <p>Your guess:</p>
          <div>
            <button class="btn btn-outline-${i + 1 < roundResults.length ? "success" : "danger"}  m-0">${answer}</button>
          </div>
        </div>
        <div class="col-6">
          <p>Correct answer</p>
          <div>
            <button class="btn btn-outline-info  m-0">${data.correct}</button>
          </div>
        </div>`;
          break;
      }

      return `<div class="row mb-3">
    <div class="card p-0">
      <div class="card-body d-flex flex-row p-0">
        <div class="final-small-embed rounded-start" onclick='this.innerHTML=\`${iframe}\`'>
          <img class="h-100 w-auto rounded-start" src="${thumbnail}" width="${thumbSize[0]}" height="${thumbSize[1]}" alt="">
          <div class="embed-playbutton"><i class="material-icons notranslate mp-icon">play_arrow</i></div>
        </div>
        <div class="col">
          <div class="d-flex flex-row m-2 align-items-center text-start">
            <h4 class="flex-grow-1 m-0"><b>${1 + i}</b> &ndash; ${channelLink}</h4>
            <div class="d-flex flex-row gap-1" style="cursor:default">
              ${data.powerups.map((/** @type {string | number} */ p) => powerupIcons[p]).join(" ")}
            </div>
          </div>
          <div class="divider"></div>
          <div class="row px-2">
            ${roundResultBlock}
          </div>
        </div>
      </div>
    </div>
  </div>`;
    });

    elements.twitchEmbed.innerHTML = `<div class="card w-100 gameover-card">
    <div class="card-header fs-3 position-sticky top-0 bg-body-tertiary z-1">Game breakdown</div>
    <div class="card-body">
      <div class="container-fluid">
        ${roundDataMap.join("\n")}
      </div>
    </div>
  </div>`;

    elements.breakdown.disabled = true;
  } //showBreakdown

  /**
   * @param {number|string} answer
   */
  function calculateScore(answer, skipped = false) {
    let points = 0;

    //check emote mode answer
    if (gameMode == "emote") {
      if (answer == guessList[round - 1].userid) {
        points = 1;
      } else {
        points = -1;
      }
      if (skipped) {
        points = 0;
      }
    }

    //calculate score for viewers mode - streams or clips
    if (gameMode == "viewers") {
      //get max view count of current game
      let roundMax = Math.max(...guessList.slice(0, 5).map((o) => o.viewers || 0));
      //get scaled decay between 100 and 5000
      let decay = (guessList[round - 1].viewers / roundMax) * (5000 - 100) + 100;
      let diff = Math.abs(answer - guessList[round - 1].viewers);
      points = Math.round(5000 * Math.exp(-diff / decay));
    }

    //check if answer is corrent for higherlower mode - streams or clips
    if (gameMode == "higherlower") {
      let correctAnswer = answer; // will match if prev number is equal to current number
      if (guessList[round - 1].viewers > (higherlowerPreviousNumber || 0)) {
        correctAnswer = "higher";
      } else {
        correctAnswer = "lower";
      }

      if (answer === correctAnswer) {
        points = 1;
      } else {
        points = -1;
      }
      if (skipped) {
        points = 0;
      }
    }

    //get points for game guesser mode
    if (gameMode == "game") {
      let correctGuess = false;
      if (/\d/.test(guessList[round - 1].game_name_clean)) {
        //if the game name has numbers then compare the exact value
        correctGuess = guessList[round - 1].game_name_clean === answer;
      } else {
        correctGuess = checkSimilarity(answer, guessList[round - 1].game_name_clean);
      }
      if (correctGuess) {
        points = 1;
      } else {
        points = -1;
      }
      if (skipped) {
        points = 0;
      }
    }

    //guess() was called by the timer and user did not provide an answer so give user 0 points for viewers mode and -1 for other modes
    if (!skipped && answer == -1) {
      switch (gameMode) {
        case "higherlower":
        case "emote":
        case "game":
          points = -1;
          break;
        case "viewers":
          points = 0;
          break;
      }
    }

    return points;
  } //calculateScore

  function reset() {
    stopTimer();
    guessList = [];

    elements.getSettingsButton.innerHTML = "Start";
    elements.getSettingsButton.disabled = false;
    elements.guessLabel.innerHTML = "View count";
    elements.leaderboardList.innerHTML = "";

    round = 0;
    totalScore = 0;

    if (tmiClient) {
      tmiClient.disconnect();
      tmiClient = null;
    }
    embeddedChannel = "";
    embeddedClip = "";

    gameState = "inactive";
  } //reset

  /**
   * @param {string} mode
   */
  async function showSettings(mode) {
    gameMode = mode;
    gameSettingsModal.showModal();
  } //showSettings

  let irlid = "";
  async function getSettings() {
    elements.getSettingsButton.disabled = true;

    if (gameMode == "game" && clipCollection == "hottub" && videoType == "clip") {
      showToast("Hmmm today I'll pick game guessr mode then pick a clip collection that has 1 category only 🤙", "alert-info", 5000);
      reset();
      return;
    }
    if (gameMode == "emote" && clipCollection == "forsen" && videoType == "clip") {
      showToast("Hmmm today I'll pick emote guessr mode then pick a clip collection that has 1 channel only 🤙", "alert-info", 5000);
      reset();
      return;
    }

    channelName = channelName.replace(/\s+/g, "").toLowerCase();

    if (channelName.includes("://") || channelName.includes(".")) {
      showToast("Invalid username. Input your username only not the link", "alert-warning", 3000);
      reset();
      return;
    }

    if (gameMode == "irl") {
      irlid = parseInt(document.getElementById("channelId").value, 10);
      document.getElementById("channelId").value = "";
      if (!irlid) {
        showToast("no irl channel id provided", "alert-error", 3000);
        reset();
        return;
      }

      let response = await fetch(`https://helper.guessr.tv/twitch/streams?user_id=${irlid}`);
      let stream = await response.json();
      if (!stream?.data[0] || !stream?.data[0]?.user_login) {
        showToast("stream offline/not found", "alert-warning", 3000);
        reset();
        return;
      }

      embeddedChannel = stream.data[0].user_login;
    }

    if (channelName && gameMode !== "irl") {
      localStorage.setItem("channelName", channelName);
      chatEnabled = true;
      connectChat();
      channelBadges = await getChannelBadges(channelName);
      globalBadges = await getGlobalBadges();
      customBadges = await getCustomBadges();
      if (!channelId) {
        channelId = await getChannelId(channelName);
      }
      if (!streamerColor) {
        streamerColor = await getStreamerColor(channelId);
      }
    } else {
      localStorage.setItem("channelName", "");
      chatEnabled = false;
    }

    if (videoType == "stream") {
      await getMainList(); // only needs to be fetched once per visit bcz list has ~700 channels
    }

    await startGame();
    nextRound();

    gameSettingsModal.close();
  } //getSettings

  async function connectChat() {
    let options = {
      channels: [channelName],
    };
    tmiClient = new tmi.Client(options);

    tmiClient.on("message", (event) => {
      const { channel, user, message } = event;
      console.log(channel);
      console.log(user);
      console.log(message);
    });

    tmiClient.on("asd", async (target, context, msg, self) => {
      if (!chatEnabled || gameState !== "active" || context.username == channelName) {
        return;
      }

      let points = 0;
      let chatterAnswer;
      let input = msg.split(" ").filter(Boolean);

      if (gameMode == "viewers") {
        chatterAnswer = parseAnswer(input[0]);
        if (chatterAnswer === null || chatterAnswer === undefined || chatterAnswer === "" || chatterAnswer < 0) {
          return;
        }
        points = calculateScore(chatterAnswer);
      }

      if (gameMode == "higherlower") {
        chatterAnswer = input[0]?.toLowerCase();
        if (chatterAnswer !== "higher" && chatterAnswer !== "lower") {
          return;
        }
        points = calculateScore(input[0].toLowerCase());
      }

      if (gameMode == "game") {
        if (input[0]?.toLowerCase() !== "!guess") {
          return;
        }
        chatterAnswer = input.slice(1);
        points = calculateScore(cleanString(input.slice(1).join("")));
      }

      if (gameMode == "emote") {
        if (!emoteChatChoices.hasOwnProperty(input[0]?.toLowerCase())) {
          return;
        }
        chatterAnswer = parseInt(elements[`multiChoice${emoteChatChoices[input[0].toLowerCase()]}`].dataset.answer, 10);
        points = calculateScore(chatterAnswer);
      }

      let chatter = chatters.get(context.username);
      if (!chatter) {
        //add the chatter to the map if they are not already in
        let badges = addBadges(context.badges, context["user-id"]);
        chatters.set(context.username, {
          username: context.username,
          totalScore: 0,
          currentRound: points,
          currentAnswer: chatterAnswer,
          color: context.color,
          badges: badges,
        });

        //add chatter to the top of the leaderboard if 1st round or at the end otherwise
        elements.leaderboardList.insertAdjacentHTML(
          `${round == 1 ? "afterbegin" : "beforeend"}`,
          `<li class="list-group-item"><span id="${context.username}_dot">🔵</span><span style="color:${context.color || "#FFFFFF"};">${badges} ${context.username}:</span> 🙈</li>`,
        );
        if (gameMode == "viewers") {
          //add chatter to the round leaderboard if mode is viewers
          elements.leaderboardListRound.insertAdjacentHTML(
            `${round == 1 ? "afterbegin" : "beforeend"}`,
            `<li class="list-group-item"><span style="color:${context.color || "#FFFFFF"};">${badges} ${context.username}:</span> 🙈</li>`,
          );
        }
      } else {
        //chatter is already in the map so save their answer
        //check if the chatter already answered before adding them to the round leaderboard
        if (gameMode == "viewers" && !chatter.answer) {
          //add chatter to the round leaderboard if mode is viewers
          elements.leaderboardListRound.insertAdjacentHTML(
            `${round == 1 ? "afterbegin" : "beforeend"}`,
            `<li class="list-group-item"><span style="color:${context.color || "#FFFFFF"};">${chatter.badges} ${context.username}:</span> 🙈</li>`,
          );
        }
        chatter.currentRound = points;
        chatter.currentAnswer = chatterAnswer;
        chatters.set(context.username, chatter);
        document.getElementById(`${context.username}_dot`).style.visibility = "visible";
      }
    }); //message

    // tmiClient.on("connected", (address, port) => {
    //   if (!usernameSent && channelName) {
    //     sendUsername();
    //   }
    //   showToast(`Connected to ${channelName}`, "alert-success", 2000);
    // }); //connected

    // tmiClient.on("disconnected", (reason) => {
    //   showToast(`Disconnected: ${reason}`, "alert-error", 2000);
    // }); //disconnected

    // tmiClient.on("notice", (channel, msgid, message) => {
    //   showToast(`Disconnected: ${message}`, "alert-error", 2000);
    // }); //notice

    tmiClient.connect();
  } //connectChat

  /**
   * @param {string | number} input
   */
  function parseAnswer(input) {
    try {
      input = input.toLowerCase().replace(/,/g, "");

      //millions
      if (input.endsWith("m")) {
        input = parseFloat(input.slice(0, -1)) * 1000000;
        if (isInt(input)) {
          return Math.round(input);
        }
        return null;
      }

      //thousands
      if (input.endsWith("k")) {
        input = parseFloat(input.slice(0, -1)) * 1000;
        if (isInt(input)) {
          return Math.round(input);
        }
        return null;
      }

      //number
      if (isInt(parseInt(input, 10))) {
        return parseInt(input, 10);
      }
      return null;
    } catch (error) {
      return null;
    }
  } //parseAnswer

  function startTimer() {
    let timerValue = parseFloat(elements.timerValue.value) * 60;
    if (!timerValue) {
      return;
    }
    timer = new easytimer.Timer();
    timer.addEventListener("secondTenthsUpdated", function (/** @type {any} */ e) {
      document.querySelector("#timer").innerHTML = timer.getTimeValues().toString(["minutes", "seconds", "secondTenths"]);
    });
    timer.addEventListener("targetAchieved", function (/** @type {any} */ e) {
      switch (gameMode) {
        case "viewers":
          guess("slider", true);
          break;
        case "game":
          guess("game", true);
          break;
        default:
          guess(null, true);
          break;
      }
      elements.timerDiv.style.display = "none";
      timer.reset();
      timer.stop();
    });
    document.querySelector("#timer").innerHTML = timer.getTimeValues().toString(["minutes", "seconds", "secondTenths"]);
    elements.timerDiv.style.display = "";
    timer.start({
      countdown: true,
      precision: "secondTenths",
      startValues: {
        seconds: timerValue,
      },
    });
  } //startTimer

  function stopTimer() {
    if (timer && timer.isRunning()) {
      timer.reset();
      timer.stop();
      elements.timerDiv.style.display = "none";
    }
  } //stopTimer

  function updateLeaderboard() {
    //update the scores for everyone
    //needed bcz users can change answer so we need to add the current round points to the total now when the round is over
    for (const [key, value] of chatters.entries()) {
      if (value?.currentAnswer === null || value?.currentAnswer === undefined) {
        //skip chatters that didn't play this round
        continue;
      }
      value.totalScore += value?.currentRound;
      chatters.set(key, value);
    }

    const sortedChatters = new Map([...chatters.entries()].sort((a, b) => b[1].totalScore - a[1].totalScore));
    let username = channelName.replace(/\s+/g, "").toLowerCase();
    let list = "";
    for (const [key, value] of sortedChatters.entries()) {
      list += `
    <li class="list-group-item ${username == value.username ? "bg-primary" : ""}">
      <span id="${value.username}_dot" style="visibility: hidden">🔵</span>
      <span style="color:${value.color || "#FFFFFF"};">${value.badges} ${value.username}:</span> ${value.totalScore.toLocaleString()}
    </li>`;
    }
    elements.leaderboardList.innerHTML = list;

    //update round leaderboard for viewers mode
    if (gameMode == "viewers") {
      const roundSortedChatters = new Map([...chatters.entries()].sort((a, b) => b[1].currentRound - a[1].currentRound));
      let list = "";
      for (const [key, value] of roundSortedChatters.entries()) {
        if (value?.currentAnswer === null || value?.currentAnswer === undefined) {
          //skip chatters that didn't play this round
          continue;
        }
        list += `
      <li class="list-group-item ${username == value.username ? "bg-primary" : ""}">
        <span style="color:${value.color || "#FFFFFF"};">${value.badges} ${value.username}:</span> ${value.currentRound.toLocaleString()}
      </li>`;
      }
      elements.leaderboardListRound.innerHTML = list;
    }

    //reset answers for everyone for next round
    for (const [key, value] of chatters.entries()) {
      value.currentRound = null;
      value.currentAnswer = null;
      chatters.set(key, value);
    }
  } //updateLeaderboard

  async function playAgain() {
    const oldContent = elements.playAgain.innerHTML;
    elements.playAgain.disabled = true;
    await startGame();
    nextRound();
    elements.playAgain.innerHTML = oldContent;
    elements.playAgain.disabled = false;
  } // playAgain

  /**
   * @param {string} scoreName
   */
  function resetHighScore(scoreName) {
    localStorage.setItem(scoreName, "0");
    highScores[scoreName] = 0;
    elements[scoreName].innerHTML = 0;
  } //resetHighScore

  /**
   * @param {string} pType
   */
  function usePowerup(pType) {
    if (!(pType in powerups)) {
      throw new Error("Unknown powerup type requested: " + pType);
    }
    if (usedPowerups.indexOf(pType) >= 0) {
      console.warn(`You have already used powerup [${pType}] on this round!`);
      return;
    }
    if (powerups[pType] <= 0) {
      console.warn(`Not enough points to use [${pType}] powerup!`);
      return;
    }

    switch (pType) {
      case "pSkip": {
        if (gameMode === "higherlower" || gameMode === "emote") {
          // call `guess()` with empty answer, but add "skipped" flag to award 0 points
          guess(null, false, true);
        } else {
          throw new Error(`Powerup [${pType}] not allowed for game mode [${gameMode}]`);
        }
        break;
      }
      case "p5050": {
        if (gameMode === "emote") {
          const correct = Number(guessList[round - 1].userid);

          const choiceBtns = Array.from(document.querySelectorAll(".multiChoice-btn"));
          const answers = choiceBtns.map((el) => parseInt(el.dataset.answer, 10));

          const indexList = shuffleArray(answers.map((e, i) => i));
          const correctIndex = answers.indexOf(correct);
          let fakeIndex = -1;

          // find a 'fake' button which has incorrect answer
          while (indexList.length > 0) {
            const newFakeIndex = indexList.pop();
            if (newFakeIndex !== correctIndex) {
              fakeIndex = newFakeIndex;
              break;
            }
          }

          // leave two active buttons: one correct, one incorrect (fake)
          for (let i = 0; i < choiceBtns.length; i++) {
            if (i !== fakeIndex && i !== correctIndex) {
              choiceBtns[i].disabled = true;
              choiceBtns[i].classList.remove("btn-outline-success");
              choiceBtns[i].classList.add("btn-outline-secondary");
            }
          }
        } else {
          throw new Error(`Powerup [${pType}] not allowed for game mode [${gameMode}]`);
        }
        break;
      }
    }

    // if no error up to this point - hint usage was successful
    usedPowerups.push(pType);
    powerups[pType] -= 1;
    document.querySelectorAll(`.powerup-${pType}-count`).forEach((elem) => {
      elem.innerText = powerups[pType];
    });
  } //usePowerup

  /**
   * @type {{ flyTo: (arg0: any) => void; setView: (arg0: number[], arg1: number) => void; eachLayer: (arg0: { (layer: any): void; (layer: any): void; }) => void; on: (arg0: string, arg1: (e: any) => void) => void; }}
   */
  let map;
  /**
   * @type {{ latitude: any; longitude: any; }}
   */
  let markerAnswer;
  /**
   * @type {{ latitude: any; longitude: any; }}
   */
  let irlLocation;
  function loadMap() {
    if (map) {
      //reset map and marker if we already loaded it
      map.setView([40, 16], 2);
      map.eachLayer((/** @type {{ remove: () => void; }} */ layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
    } else {
      //load map if it doesn't exist yet
      map = L.map("map", {
        center: [40, 16],
        zoom: 2,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
      }).addTo(map);

      map.on("click", function (/** @type {{ latlng: { lat: any; lng: any; }; }} */ e) {
        const { lat, lng } = e.latlng;
        console.log(` Latitude ${lat.toFixed(5)}, Longitude ${lng.toFixed(5)}`);

        map.eachLayer((/** @type {{ remove: () => void; }} */ layer) => {
          if (layer instanceof L.Marker) {
            layer.remove();
          }
        });
        L.marker([lat, lng]).addTo(map);
        markerAnswer = { latitude: lat, longitude: lng };
      });
    }

    dankdank = RealtimeIRL.forStreamer("twitch", irlid).addLocationListener(function (/** @type {any} */ location) {
      irlLocation = location;
      console.log(irlLocation);
    });
  } //loadMap
  let dankdank;

  onMount(async () => {
    elements = {
      reset: document.getElementById("reset"),

      guessLabel: document.getElementById("guessLabel"),

      higher: document.getElementById("higher"),
      lower: document.getElementById("lower"),

      playAgain: document.getElementById("playAgain"),
      breakdown: document.getElementById("breakdown"),
      progress: document.getElementById("progress"),
      progressBar: document.getElementById("progressBar"),

      round: document.getElementById("round"),
      score: document.getElementById("score"),
      timerDiv: document.getElementById("timerDiv"),
      timer: document.getElementById("timer"),
      infoTime: document.getElementById("infoTime"),

      skipSexual: document.getElementById("skipSexual"),
      unloadWarning: document.getElementById("unloadWarning"),
      viewersHS: document.getElementById("viewersHS"),
      gameStreak: document.getElementById("gameStreak"),
      emoteStreak: document.getElementById("emoteStreak"),
      viewersHigherlowerStreak: document.getElementById("viewersHigherlowerStreak"),

      resetSeenChannels: document.getElementById("resetSeenChannels"),
      seenChannels: document.getElementById("seenChannels"),
      resetSeenClips: document.getElementById("resetSeenClips"),
      seenClips: document.getElementById("seenClips"),

      timerValue: document.getElementById("timerValue"),
      getSettingsButton: document.getElementById("getSettingsButton"),
      leaderboardTabs: document.getElementById("leaderboardTabs"),
      leaderboardList: document.getElementById("leaderboardList"),
      leaderboardListRound: document.getElementById("leaderboardListRound"),
    };

    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "guessr.tv",
      version: 1.0,
      storeName: "guessr",
      description: "guessr",
    });

    seenChannels = JSON.parse(await localforage.getItem("seenChannels")) || [];
    //elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();
    seenClips = JSON.parse(await localforage.getItem("seenClips")) || [];
    //elements.seenClips.innerHTML = seenClips.length.toLocaleString();
    skipSexual = (localStorage.getItem("skipSexual") || "true") === "true";
    //elements.skipSexual.checked = skipSexual;
    unloadWarning = (localStorage.getItem("unloadWarning") || "false") === "true";
    //elements.unloadWarning.checked = unloadWarning;
    highScores.viewers = parseInt(localStorage.getItem("viewersHS"), 10) || 0;
    highScores.game = parseInt(localStorage.getItem("gameStreak"), 10) || 0;
    highScores.emote = parseInt(localStorage.getItem("emoteStreak"), 10) || 0;
    highScores.higherlower = parseInt(localStorage.getItem("viewersHigherlowerStreak"), 10) || 0;
    channelName = localStorage.getItem("channelName") || "";

    // elements.viewersHS.innerHTML = highScores.viewers.toLocaleString();
    // elements.gameStreak.innerHTML = highScores.game.toLocaleString();
    // elements.emoteStreak.innerHTML = highScores.emote.toLocaleString();
    // elements.viewersHigherlowerStreak.innerHTML = highScores.higherlower.toLocaleString();

    // elements.skipSexual.onchange = function () {
    //   skipSexual = this.checked;
    //   localStorage.setItem("skipSexual", skipSexual);
    // };

    // elements.unloadWarning.onchange = function () {
    //   unloadWarning = this.checked;
    //   localStorage.setItem("unloadWarning", unloadWarning);
    // };

    // elements.resetSeenChannels.onclick = function () {
    //   localforage.setItem("seenChannels", JSON.stringify([]));
    //   seenChannels = [];
    //   elements.seenChannels.innerHTML = 0;
    //   showToast("Seen channels reset", "alert-success", 2000);

    // elements.resetSeenClips.onclick = function () {
    //   localforage.setItem("seenClips", JSON.stringify([]));
    //   seenClips = [];
    //   elements.seenClips.innerHTML = 0;
    //   showToast("Seen clips reset", "alert-success", 2000);
    // };

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.get("irl") === "true") {
      document.getElementById("irl").style.display = "";
    }
  }); //onMount

  function higherlowerAnimation() {
    higherAnimation = animate(".higher-arrow", {
      keyframes: [{ translateY: { from: 0, to: "-100%" } }, { translateY: { from: "100%", to: 0 } }],
      duration: 600,
      ease: "linear",
      autoplay: false,
      loop: true,
    });

    lowerAnimation = animate(".lower-arrow", {
      keyframes: [{ translateY: { from: 0, to: "100%" } }, { translateY: { from: "-100%", to: 0 } }],
      duration: 600,
      ease: "linear",
      autoplay: false,
      loop: true,
    });
  } //higherlowerAnimation

  /**
   * @type {import("animejs").JSAnimation}
   */
  let higherAnimation;
  /**
   * @type {import("animejs").JSAnimation}
   */
  let lowerAnimation;

  function nextRoundOnClick() {
    localforage.setItem("seenChannels", JSON.stringify(seenChannels));
    localforage.setItem("seenClips", JSON.stringify(seenClips));
    elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();
    elements.seenClips.innerHTML = seenClips.length.toLocaleString();
    nextRound();
  }

  function guessNumberOnInput(event) {
    let value = parseInt(event.target.value, 10);
    document.getElementById("guessRange").value = (100 * Math.log(value)) / Math.log(max);
    if (value == 0) {
      document.getElementById("guessRange").value = 0;
    }
  }

  function guessRangeOnInput(event) {
    let value = parseInt(event.target.value, 10);
    document.getElementById("guessNumber").value = Math.round(Math.exp((Math.log(max) / 100) * value));
    if (value == 0) {
      document.getElementById("guessNumber").value = 0;
    }
  }

  // window.onbeforeunload = function () {
  //   if (unloadWarning && gameState == "active") {
  //     return "Unload warning enabled. You can turn it off in the settings.";
  //   }
  //   return null;
  // }; //onbeforeunload
</script>

<svelte:head>
  <script async src="https://player.twitch.tv/js/embed/v1.js"></script>

  <!-- <script src="https://unpkg.com/leaflet/dist/leaflet.js" async></script> -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/@rtirl/api@latest/lib/index.min.js" async></script> -->
</svelte:head>

<dialog id="gameSettingsModal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><IcBaselineClose /></button>
    </form>
    <h3 class="text-xl font-bold">Game settings</h3>
    <div class="max-h-[80vh] overflow-auto">
      {#if gameMode !== "irl"}
        <div class="card card-border border-accent bg-base-100 my-2">
          <div class="card-body p-3">
            <h2 class="card-title"><IcBaselineOndemandVideo />Video type</h2>
            <ToggleGroup.Root type="single" bind:value={videoType} class="rounded-full border border-base-300 bg-base-300 mx-auto w-fit p-2">
              <ToggleGroup.Item
                aria-label="Live streams"
                value="stream"
                class="p-1 text-lg font-bold rounded-full cursor-pointer active:bg-accent data-[state=on]:pointer-events-none data-[state=on]:bg-accent data-[state=on]:text-accent-content inline-flex  items-center justify-center transition-all"
              >
                <IcBaselineLiveTv />Live streams
              </ToggleGroup.Item>
              <ToggleGroup.Item
                aria-label="Clips"
                value="clip"
                class="p-1 text-lg font-bold rounded-full cursor-pointer active:bg-dark-10 data-[state=on]:pointer-events-none data-[state=on]:bg-accent data-[state=on]:text-accent-content inline-flex  items-center justify-center transition-all"
              >
                <IcBaselineMovie />Clips
              </ToggleGroup.Item>
            </ToggleGroup.Root>

            {#if videoType == "clip"}
              <fieldset class="fieldset place-self-center" transition:slide>
                <legend class="fieldset-legend text-lg text-center">Clip collection</legend>
                <select class="select select-accent w-full" bind:value={clipCollection}>
                  <option value="random" selected>Random</option>
                  <option value="short">Short clips (&lt;10s)</option>
                  <option value="long">Long clips (&gt;45s)</option>
                  <option value="popular">Popular clips (&gt;50,000 views)</option>
                  <option value="hottub">Pools, Hot Tubs, and Beaches section :)</option>
                  <option value="forsen">forsen</option>
                </select>
                <!-- <span class="label">asd</span> -->
              </fieldset>
            {/if}

            <p class="opacity-70 text-center">
              {#if videoType == "stream"}
                A random live stream will be picked for you each round. Some streams might have preroll ads
              {:else}
                A random clip will be picked for you each round. Clips don't have ads
              {/if}
            </p>
          </div>
        </div>
      {/if}

      <div class="card card-border border-warning bg-base-100 my-2">
        <div class="card-body p-3">
          <h2 class="card-title"><IcBaselineTimer />Timer - not working yet :)</h2>
          <div class="join mx-auto">
            <button class="btn btn-outline btn-warning join-item pointer-events-none"><IcBaselineTimer />Round timer</button>
            <input class="join-item input input-warning text-center" type="number" id="timerValue" value="0" min="0" max="60" />
            <button class="btn btn-outline btn-warning join-item pointer-events-none">minutes</button>
          </div>
          <p class="opacity-70 text-center">Your guess will be automatically submitted when the timer runs out. Set to 0 to disable</p>
        </div>
      </div>

      <div class="card card-border border-primary bg-base-100 my-2">
        <div class="card-body p-3">
          <h2 class="card-title"><MdiTwitch />Play with chat - not working yet :)</h2>
          <div class="join mx-auto">
            <button class="btn btn-outline btn-primary join-item pointer-events-none">twitch.tv/</button>
            <input class="join-item input input-primary" type="text" bind:value={channelName} placeholder="Username" />
          </div>
          <p class="opacity-70 text-center">Your viewers will be able to play along by guessing in chat</p>
        </div>
      </div>

      {#if gameMode == "irl"}
        <div class="card card-border border-secondary bg-base-100 my-2">
          <div class="card-body p-3">
            <h2 class="card-title"><IcBaselinePublic />IRL stream channel id</h2>
            <div class="join mx-auto">
              <button class="btn btn-outline btn-secondary join-item pointer-events-none">https://rtirl.com/twitch:</button>
              <input class="join-item input input-secondary" type="text" id="channelId" placeholder="123456789" />
            </div>
            <p class="opacity-70 text-center">
              Go to <a href="https://rtirl.com/" target="_blank" rel="noopener noreferrer">RealtimeIRL</a> and pick a random stream and enter their twitch user id above. Example: when you
              click a stream the url will change to https://rtirl.com/twitch:123456789, so enter 123456789 in the field above :)<br />Scuffed proof of concept :) try to get someone else to
              pick a stream for you to not spoil the location
            </p>
          </div>
        </div>
      {/if}

      {#if gameMode == "viewers" || gameMode == "higherlower"}
        <div role="alert" class="alert alert-warning my-2">
          <IcBaselineWarning />
          <span>The answer will not always be the same as the view count seen on the stream because the API does not update as fast</span>
        </div>
      {:else if gameMode == "game"}
        <div role="alert" class="alert alert-warning my-2">
          <IcBaselineWarning />
          <span>Some streamers could forget to update their category or set it incorrectly, expect to be Jebaited :)</span>
        </div>
      {/if}
    </div>

    <div class="modal-action">
      <form method="dialog">
        <button type="button" class="btn btn-xl btn-success" id="getSettingsButton" onclick={() => getSettings()}>Start</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog id="resetGameModal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><IcBaselineClose /></button>
    </form>
    <h3 class="text-lg font-bold">Are you sure?</h3>
    <p class="py-4">Your progress will be lost</p>
    <div class="modal-action">
      <form method="dialog">
        <button type="submit" class="btn btn-warning" onclick={() => reset()}>Reset</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

{#if gameState == "inactive"}
  <div class="w-full mt-10">
    <div class="w-2xl text-center mx-auto">
      <div class="flex flex-row h-25 mb-2">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div
          class="card border border-neutral-700 cursor-pointer bg-base-300 w-1/2 h-25 hover:h-35 hover:z-10 hover:border-neutral-500 overflow-clip mx-1"
          role="button"
          onclick={() => showSettings("viewers")}
        >
          <div class="card-body">
            <span class="text-3xl inline m-1"><ViewersSVG />Viewers</span>
            <div class="card-subtitle">
              {#each "Guess how many viewers the random streamer has".split(" ") as word, index}
                <span class="card-subtitle-word text-lg" style="transition-delay:{index * 40}ms">{word} </span>
              {/each}
            </div>
          </div>
        </div>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div
          class="card border border-neutral-700 cursor-pointer bg-base-300 w-1/2 h-25 hover:h-41 hover:z-10 hover:border-neutral-500 overflow-clip mx-1"
          role="button"
          onclick={() => showSettings("higherlower")}
        >
          <div class="card-body">
            <span class="text-3xl m-1"><IcBaselineImportExport class="inline align-text-bottom" />Higher Lower</span>
            <div class="card-subtitle">
              {#each "Guess if the streamer has a higher or lower view count than the previous one".split(" ") as word, index}
                <span class="card-subtitle-word text-lg" style="transition-delay:{index * 40}ms">{word} </span>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-row h-25 mb-2">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div
          class="card border border-neutral-700 cursor-pointer bg-base-300 w-1/2 h-25 hover:h-35 hover:z-10 hover:border-neutral-500 overflow-clip mx-1"
          role="button"
          onclick={() => showSettings("emote")}
        >
          <div class="card-body">
            <span class="text-3xl m-1"><IcBaselineEmojiEmotions class="inline align-text-bottom" />Emote</span>
            <div class="card-subtitle">
              {#each "Guess which emote belongs to the random streamer".split(" ") as word, index}
                <span class="card-subtitle-word text-lg" style="transition-delay:{index * 40}ms">{word} </span>
              {/each}
            </div>
          </div>
        </div>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <div
          class="card border border-neutral-700 cursor-pointer bg-base-300 w-1/2 h-25 hover:h-35 hover:z-10 hover:border-neutral-500 overflow-clip mx-1"
          role="button"
          onclick={() => showSettings("game")}
        >
          <div class="card-body">
            <span class="text-3xl m-1"><IcBaselineSportsEsports class="inline align-text-bottom" />Game</span>
            <div class="card-subtitle">
              {#each "Guess what game the random streamer is playing".split(" ") as word, index}
                <span class="card-subtitle-word text-lg" style="transition-delay:{index * 40}ms">{word} </span>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="flex flex-row h-25">
      <div class="card border border-neutral cursor-pointer bg-base-300 w-full h-25 hover:h-30 hover:z-10 overflow-clip mx-1" role="button" onclick={() => showSettings("irl")}>
        <div class="card-body">
          <span class="text-3xl m-1"><IcBaselinePublic class="inline align-text-bottom" />IRL streams</span>
          <div class="card-subtitle">
            {#each "Guess where the streamer is".split(" ") as word, index}
              <span class="card-subtitle-word text-lg" style="transition-delay:{index * 40}ms">{word} </span>
            {/each}
          </div>
        </div>
      </div>
    </div> -->
    </div>
  </div>
{/if}

{#if gameState !== "inactive"}
  <div class="flex flex-col h-screen gap-3 p-3 items-center w-full">
    <div class="flex flex-row flex-1 gap-3 max-w-[80vw] w-full">
      <div class="relative grow rounded-xl bg-base-300">
        <TwitchEmbed channel={embeddedChannel} clip={embeddedClip} {videoType} />
        {#if gameState == "active" && videoType == "stream"}
          <div id="streamCover"></div>
        {/if}
        {#if gameState == "active" && videoType == "clip"}
          <div id="clipCover"></div>
        {/if}
      </div>

      {#if chatEnabled}
        <div class="flex flex-col w-70">
          <div class="card bg-base-300 mb-2">
            <div class="card-body p-2">
              <p class="font-bold text-lg text-center text-pretty">
                <MdiTwitch class="inline " />
                {#if gameMode == "viewers"}
                  Type a number in chat to guess
                {:else if gameMode == "emote"}
                  Type an emote's letter in chat to guess <kbd class="notranslate kbd">(a/b/c/d/e)</kbd>
                {:else if gameMode == "game"}
                  Type <kbd class="notranslate kbd">!guess [game name]</kbd> in chat to guess
                {:else if gameMode == "higherlower"}
                  Type <kbd class="notranslate kbd">higher</kbd> or <kbd class="notranslate kbd">lower</kbd> in chat to guess
                {/if}
              </p>
            </div>
          </div>
          <div class="tabs tabs-lift grow">
            <label class="tab rounded-t-xl [--tab-bg:theme(colors.base-300)]">
              <input type="radio" name="leaderboardTabs" checked />
              Total standings
            </label>
            <div class="tab-content rounded-b-xl bg-base-300 border-base-300 p-6">
              <div class="mt-1" id="leaderboardList"></div>
            </div>

            <label class="tab rounded-t-xl [--tab-bg:theme(colors.base-300)]">
              <input type="radio" name="leaderboardTabs" />
              Round results
            </label>
            <div class="tab-content rounded-b-xl bg-base-300 border-base-300 p-6">
              <div class="mt-1" id="leaderboardListRound"></div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="flex flex-row h-[20vh] max-w-[80vw] w-full">
      <div id="controls" class="card grow rounded-xl bg-base-300">
        <div class="card-body flex-row">
          {#if gameState == "active"}
            <RoundAndScore {round} {totalScore} {gameMode} />

            <div id="timerDiv" style="display: none">
              <span>Round ends in</span>
              <span id="timer">0</span>
            </div>

            <div class="divider divider-horizontal"></div>

            {#if gameMode == "viewers"}
              <div class="flex grow">
                <div class="flex-1 flex flex-col">
                  <div class="text-2xl text-center">How many viewers does this {videoType} have?</div>

                  <div class="flex gap-3 my-auto">
                    <input type="range" class="range range-accent range-xl flex-1 self-center" min="0" max="100" step="1" value="0" id="guessRange" oninput={guessRangeOnInput} />
                    <div class="join">
                      <button class="btn btn-xl btn-accent join-item">View count</button>
                      <input
                        type="number"
                        id="guessNumber"
                        class="input input-xl input-accent join-item"
                        min="0"
                        max="5000"
                        step="1"
                        value=""
                        placeholder="Guess"
                        oninput={guessNumberOnInput}
                      />
                    </div>
                  </div>
                </div>
                <div class="divider divider-horizontal"></div>
                <div class="justify-end">
                  <button onclick={() => guess("slider", false)} class="btn btn-xl btn-success h-full w-50 rounded-xl text-4xl">Guess</button>
                </div>
              </div>
            {:else if gameMode == "higherlower"}
              <div class="flex grow" {@attach higherlowerAnimation}>
                <div class="justify-start my-auto">
                  <div class="flex flex-col gap-2 w-45">
                    <button class="btn btn-outline btn-primary btn-lg btn-powerup" onclick={() => usePowerup("pSkip")}>
                      <div><IcBaselineSkipNext class="inline align-text-bottom" /> Skip</div>
                      <div class="grow"></div>
                      <div class="powerup-added powerup-pSkip-added"></div>
                      <div class="powerup-count powerup-pSkip-count">0</div>
                    </button>
                    <button class="btn btn-outline btn-primary btn-lg btn-powerup" onclick={() => usePowerup("p5050")}>
                      <div><IcBaselineTheaterComedy class="inline align-text-bottom" /> 50/50</div>
                      <div class="grow"></div>
                      <div class="powerup-added powerup-p5050-added"></div>
                      <div class="powerup-count powerup-p5050-count">0</div>
                    </button>
                  </div>
                </div>
                <div class="divider divider-horizontal"></div>

                <div class="flex-1 flex flex-row justify-evenly">
                  <div class="text-2xl text-start my-auto">
                    {#if round == 1}
                      Does this {videoType} have a higher or lower view count than <span class="font-bold">{higherlowerPreviousNumber?.toLocaleString()}?</span>
                      <div class="tooltip align-text-bottom" data-tip="The first round has a random starting number, later rounds will be compared to the previous round">
                        <IcBaselineInfo />
                      </div>
                    {:else}
                      Does this {videoType} have a higher or lower view count than <span class="font-bold">{higherlowerPreviousNumber?.toLocaleString()}?</span>
                    {/if}
                  </div>

                  <div class="flex flex-col gap-3 my-auto w-60">
                    <button
                      onmouseenter={() => {
                        higherAnimation.play();
                      }}
                      onmouseleave={() => {
                        higherAnimation.reset();
                      }}
                      onclick={() => guess("higher", false)}
                      class="btn btn-xl btn-success text-3xl font-extrabold justify-between overflow-hidden"
                      id="higher"
                    >
                      <IcBaselineKeyboardDoubleArrowUp class="higher-arrow" />Higher
                    </button>
                    <button
                      onmouseenter={() => {
                        lowerAnimation.play();
                      }}
                      onmouseleave={() => {
                        lowerAnimation.reset();
                      }}
                      onclick={() => guess("lower", false)}
                      class="btn btn-xl btn-error text-3xl font-extrabold justify-between overflow-hidden"
                      id="lower"
                    >
                      <IcBaselineKeyboardDoubleArrowDown class="lower-arrow" />Lower
                    </button>
                  </div>
                </div>
              </div>
            {:else if gameMode == "game"}
              <div class="flex grow">
                <div class="justify-start my-auto">
                  <div class="flex flex-col gap-2 w-45">
                    <button class="btn btn-outline btn-primary btn-lg btn-powerup" onclick={() => usePowerup("pSkip")}>
                      <div><IcBaselineSkipNext class="inline align-text-bottom" /> Skip</div>
                      <div class="grow"></div>
                      <div class="powerup-added powerup-pSkip-added"></div>
                      <div class="powerup-count powerup-pSkip-count">0</div>
                    </button>
                    <button class="btn btn-outline btn-primary btn-lg btn-powerup" onclick={() => usePowerup("p5050")}>
                      <div><IcBaselineTheaterComedy class="inline align-text-bottom" /> 50/50</div>
                      <div class="grow"></div>
                      <div class="powerup-added powerup-p5050-added"></div>
                      <div class="powerup-count powerup-p5050-count">0</div>
                    </button>
                  </div>
                </div>
                <div class="divider divider-horizontal"></div>

                <div class="flex-1 flex flex-col">
                  <div class="text-2xl text-center">What is this game?</div>
                  <div class="flex my-auto">
                    <input type="text" class="input input-xl grow" placeholder="Start typing for suggestions" list="gameList" id="gameInput" />
                    <datalist id="gameList">
                      {#each gameList as game}
                        <option value={game.name}></option>
                      {/each}
                    </datalist>
                  </div>
                </div>

                <div class="divider divider-horizontal"></div>

                <div class="justify-end">
                  <button onclick={() => guess("game", false)} class="btn btn-xl btn-success h-full w-50 rounded-xl text-4xl">Guess</button>
                </div>
              </div>
            {:else if gameMode == "emote"}
              <div class="flex grow">
                <div class="justify-start my-auto">
                  <div class="flex flex-col gap-2 w-45">
                    <button class="btn btn-outline btn-primary btn-lg btn-powerup" onclick={() => usePowerup("pSkip")}>
                      <div><IcBaselineSkipNext class="inline align-text-bottom" /> Skip</div>
                      <div class="grow"></div>
                      <div class="powerup-added powerup-pSkip-added"></div>
                      <div class="powerup-count powerup-pSkip-count">0</div>
                    </button>
                    <button class="btn btn-outline btn-primary btn-lg btn-powerup" onclick={() => usePowerup("p5050")}>
                      <div><IcBaselineTheaterComedy class="inline align-text-bottom" /> 50/50</div>
                      <div class="grow"></div>
                      <div class="powerup-added powerup-p5050-added"></div>
                      <div class="powerup-count powerup-p5050-count">0</div>
                    </button>
                  </div>
                </div>
                <div class="divider divider-horizontal"></div>

                <div class="flex-1 flex flex-row gap-3 justify-evenly">
                  <div class="text-2xl text-start my-auto">Which emote belongs to this channel?</div>

                  <div class="flex gap-3 my-auto">
                    {#each emoteChoices as emote, index}
                      <button onclick={() => guess(index + 1, false)} class="btn btn-xl btn-outline btn-success multiChoice-btn overflow-hidden w-fit h-fit p-0 m-0">
                        {#if emotesReady}
                          <img alt="Emote choice #{index + 1}" src="https://static-cdn.jtvnw.net/emoticons/v2/{emote.emoteId}/default/dark/3.0" />
                          {chatEnabled ? Object.keys(emoteChatChoices).find((e) => emoteChatChoices[e] === index + 1) : ""}
                        {:else}
                          <div class="skeleton size-[112px]"></div>
                        {/if}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            {:else if gameMode == "irl"}
              <div class="row align-items-center">
                <div class="col">
                  <div id="map" style="height: 300px"></div>
                </div>

                <div class="col-3">
                  <p id="irlCorrection">Where is this streamer?</p>
                  <br />
                  <button onclick={() => guess("map", false)} class="btn btn-lg btn-success guess">Guess</button>
                </div>
              </div>
            {/if}
          {:else if gameState == "roundEnded"}
            <div class="flex grow">
              <RoundAndScore {round} {totalScore} {gameMode} />

              <div class="divider divider-horizontal"></div>

              <button onclick={nextRoundOnClick} class="btn btn-xl btn-info h-full w-[10vw] rounded-xl text-4xl">Next Round</button>

              <div class="divider divider-horizontal"></div>

              <ScoreProgress {gameMode} {roundPoints} {totalScore} {highScores} />

              <div class="divider divider-horizontal"></div>

              <Correction {gameMode} {correctAnswer} {userAnswer} {videoType} {higherlowerPreviousNumber} {roundPoints} />
            </div>
          {:else if gameState == "gameEnded"}
            <div class="flex grow">
              <div class="grid gap-2 w-65">
                <button id="playAgain" onclick={playAgain} class="btn btn-lg btn-warning h-full rounded-xl text-2xl">Play Again</button>
                <button id="changeMode" onclick={reset} class="btn btn-lg btn-secondary h-full rounded-xl text-2xl">Change mode</button>
                <button id="breakdown" onclick={showBreakdown} class="btn btn-lg btn-success h-full rounded-xl text-2xl col-span-2">Breakdown</button>
              </div>
              <div class="divider divider-horizontal"></div>
              <ScoreProgress {gameMode} {roundPoints} {totalScore} {highScores} />
              <div class="divider divider-horizontal"></div>
              <div id="gameEndText">
                Final Score: 0<br />
                High Score: 0
              </div>
              <div class="divider divider-horizontal"></div>

              <Correction {gameMode} {correctAnswer} {userAnswer} {videoType} {higherlowerPreviousNumber} {roundPoints} />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* https://codepen.io/Hyperplexed/pen/QWQRGdO */
  .card:hover > .card-body > .card-subtitle > .card-subtitle-word {
    opacity: 1;
    transform: translateY(0%);
    transition:
      opacity 0ms,
      transform 200ms cubic-bezier(0.9, 0.06, 0.15, 0.9);
  }

  .card {
    transition: height 0.1s ease;
  }

  .card-subtitle-word {
    display: inline-block;
    margin: 0vmin 0.3vmin;
    opacity: 0;
    position: relative;
    transform: translateY(40%);
    transition: none;
  }

  #streamCover {
    position: absolute;
    top: 0;
    left: 0;
    height: 9rem;
    width: 30rem;
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-top-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }

  #clipCover {
    position: absolute;
    top: 0;
    left: 0;
    height: 6rem;
    width: 30rem;
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-top-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }
</style>
