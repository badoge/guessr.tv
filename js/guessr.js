const elements = {
  toastContainer: document.getElementById("toastContainer"),
  reset: document.getElementById("reset"),
  menuContainer: document.getElementById("menuContainer"),
  gameContainer: document.getElementById("gameContainer"),
  twitchEmbed: document.getElementById("twitchEmbed"),
  mainCard: document.getElementById("mainCard"),

  sliderDiv: document.getElementById("sliderDiv"),
  guessRangeLabel: document.getElementById("guessRangeLabel"),
  guessRange: document.getElementById("guessRange"),
  guessLabel: document.getElementById("guessLabel"),
  guessNumber: document.getElementById("guessNumber"),

  multiChoiceDiv: document.getElementById("multiChoiceDiv"),
  multiChoiceLabel: document.getElementById("multiChoiceLabel"),
  multiChoice1: document.getElementById("multiChoice1"),
  multiChoice2: document.getElementById("multiChoice2"),
  multiChoice3: document.getElementById("multiChoice3"),
  multiChoice4: document.getElementById("multiChoice4"),
  multiChoice5: document.getElementById("multiChoice5"),

  gameNameDiv: document.getElementById("gameNameDiv"),
  gameInput: document.getElementById("gameInput"),
  gameList: document.getElementById("gameList"),

  higherlowerDiv: document.getElementById("higherlowerDiv"),
  higherlowerLabel: document.getElementById("higherlowerLabel"),
  higher: document.getElementById("higher"),
  lower: document.getElementById("lower"),

  irlDiv: document.getElementById("irlDiv"),

  resultsDiv: document.getElementById("resultsDiv"),
  nextRound: document.getElementById("nextRound"),
  endButtons: document.getElementById("endButtons"),
  playAgain: document.getElementById("playAgain"),
  breakdown: document.getElementById("breakdown"),
  scoreProgressBarLabel: document.getElementById("scoreProgressBarLabel"),
  progress: document.getElementById("progress"),
  progressBar: document.getElementById("progressBar"),
  gameEndText: document.getElementById("gameEndText"),

  correction: document.getElementById("correction"),

  scoreDiv: document.getElementById("scoreDiv"),
  round: document.getElementById("round"),
  score: document.getElementById("score"),
  timerDiv: document.getElementById("timerDiv"),
  timer: document.getElementById("timer"),
  infoTime: document.getElementById("infoTime"),
  streamCover: document.getElementById("streamCover"),
  clipCover: document.getElementById("clipCover"),

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

  resetGameModal: document.getElementById("resetGameModal"),

  gameSettingsModal: document.getElementById("gameSettingsModal"),
  streamsVideoType: document.getElementById("streamsVideoType"),
  clipsVideoType: document.getElementById("clipsVideoType"),
  clipCollectionDiv: document.getElementById("clipCollectionDiv"),
  clipCollection: document.getElementById("clipCollection"),
  videoTypeDesc: document.getElementById("videoTypeDesc"),
  timerValue: document.getElementById("timerValue"),
  channelName: document.getElementById("channelName"),
  //drops: document.getElementById("drops"),
  disclaimer: document.getElementById("disclaimer"),
  getSettingsButton: document.getElementById("getSettingsButton"),
  leaderboard: document.getElementById("leaderboard"),
  leaderboardTabs: document.getElementById("leaderboardTabs"),
  totalTab: document.getElementById("totalTab"),
  roundTab: document.getElementById("roundTab"),
  leaderboardList: document.getElementById("leaderboardList"),
  leaderboardListRound: document.getElementById("leaderboardListRound"),
  chatHint: document.getElementById("chatHint"),
};

const { animate, utils } = anime;

let channelBadges = { subscriber: [], bits: [] };
let globalBadges = {};
let customBadges = [];

const powerupIcons = {
  p5050: `<i class="material-icons notranslate" title="50-50">theater_comedy</i>`,
  pSkip: `<i class="material-icons notranslate" title="Round skipped">skip_next</i>`,
};

let channelName;
let channelId;
let streamerColor;
let mainList = [];
let gameList = [];
let emoteList = [];
let guessList = [];
let seenChannels = [];
let seenClips = [];
let roundResults = []; // collecting stuff for final screen
let usedPowerups = []; // list of powerups used in current round
let round = 0;
let score = 0;
let player = null;
let max = 0;
let previousNumber = null;
let timer;
let emoteChoices = { a: 1, b: 2, c: 3, d: 4, e: 5 };
let gameSettings = {
  mode: "viewers", // viewers - higherlower - game - emote - irl
  clips: false, // false: game will show streams - true: game will show clips
  collection: "random", // "random", "short", "long", "popular", "hottub", "forsen"
  chat: false, // true - false
};
let powerups = {
  p5050: 0,
  pSkip: 0,
};

let skipSexual = true;
let unloadWarning = false;
let gameRunning = false;
let highscores = {
  viewersHS: 0,
  gameStreak: 0,
  emoteStreak: 0,
  viewersHigherlowerStreak: 0,
};

let gameSettingsModal, resetGameModal;
let client;
let roundActive = false;
let chatters = new Map();
let usernameSent = false;
let totalTab, roundTab;

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
    elements.guessRange.value = 0;
    elements.guessNumber.value = "";
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
    let response = await fetch(`https://guessr.donk.workers.dev/clips/${gameSettings.collection}?time=${Date.now()}`, requestOptions);
    let list = await response.json();
    mainList = JSON.parse(list[0].clips);
    elements.guessRange.value = 0;
    elements.guessNumber.value = "";
    elements.infoTime.innerHTML = `Clip set generated on 2025/06/08`;
  } catch (error) {
    console.log(error);
  }
} //getClipSet

async function getEmoteList() {
  try {
    let response = await fetch(`https://api.okayeg.com/guess/emotes?time=${Date.now()}`);
    let json = await response.json();
    emoteList = json.random;
  } catch (error) {
    console.log(error);
  }
} //getEmoteList

async function loadGameList() {
  let response = await fetch(`/games.json`);
  gameList = await response.json();
  elements.gameList.innerHTML = "";
  shuffleArray(gameList);
  for (let index = 0; index < gameList.length; index++) {
    elements.gameList.innerHTML += `<option value="${gameList[index].name}"></option>`;
  }
} //loadGameList

function toggleControls(hide = false) {
  if (hide) {
    elements.sliderDiv.style.display = "none";
    elements.multiChoiceDiv.style.display = "none";
    elements.gameNameDiv.style.display = "none";
    elements.higherlowerDiv.style.display = "none";
    elements.irlDiv.style.display = "none";
    return;
  }

  switch (gameSettings.mode) {
    case "viewers":
      elements.sliderDiv.style.display = "";
      elements.multiChoiceDiv.style.display = "none";
      elements.gameNameDiv.style.display = "none";
      elements.higherlowerDiv.style.display = "none";
      elements.irlDiv.style.display = "none";
      break;
    case "emote":
      elements.sliderDiv.style.display = "none";
      elements.multiChoiceDiv.style.display = "";
      elements.gameNameDiv.style.display = "none";
      elements.higherlowerDiv.style.display = "none";
      elements.irlDiv.style.display = "none";
      break;
    case "game":
      elements.sliderDiv.style.display = "none";
      elements.multiChoiceDiv.style.display = "none";
      elements.gameNameDiv.style.display = "";
      elements.higherlowerDiv.style.display = "none";
      elements.irlDiv.style.display = "none";
      break;
    case "higherlower":
      elements.sliderDiv.style.display = "none";
      elements.multiChoiceDiv.style.display = "none";
      elements.gameNameDiv.style.display = "none";
      elements.higherlowerDiv.style.display = "";
      elements.irlDiv.style.display = "none";
      break;
    case "irl":
      elements.sliderDiv.style.display = "none";
      elements.multiChoiceDiv.style.display = "none";
      elements.gameNameDiv.style.display = "none";
      elements.higherlowerDiv.style.display = "none";
      elements.irlDiv.style.display = "";
      document.getElementById("irlCorrection").innerHTML = "Where is this streamer?";
      loadMap();
      break;
    default:
      break;
  }
} //toggleControls

async function startGame() {
  guessList = [];
  chatters = new Map();
  roundResults = [];
  score = 0;
  elements.leaderboardList.innerHTML = "";
  elements.leaderboardListRound.innerHTML = "";
  elements.chatHint.style.display = "";

  //get a new clip set and then use helper to update view count and make sure clips still exist
  if (gameSettings.clips) {
    await getClipsGuessList();
  }

  //load the auto complete list for game names
  if (gameSettings.mode == "game") {
    await loadGameList();
  }

  //get a list of random emotes for the wrong choices
  if (gameSettings.mode == "emote") {
    await getEmoteList();
  }

  //reset player
  if (!player) {
    elements.twitchEmbed.innerHTML = "";
    elements.menuContainer.style.display = "none";
    elements.gameContainer.style.display = "";
  }

  //change score label for streaks
  if (gameSettings.mode == "viewers") {
    elements.round.innerHTML = `Round <br />1/5`;
    elements.score.innerHTML = `Score <br />0`;
    elements.scoreDiv.style.display = "";
  } else {
    elements.round.innerHTML = "Score <br />0";
    elements.score.innerHTML = "";
    elements.scoreDiv.style.display = "";
  }

  //show chat leaderboard if channel name is provided
  if (gameSettings.chat) {
    showLeaderboard();
  }

  elements.correction.innerHTML = "";
  elements.gameEndText.innerHTML = "";
  elements.mainCard.style.display = "";
  elements.breakdown.disabled = false;

  round = 0;
  previousNumber = null;

  for (const pType in powerups) {
    powerups[pType] = 1;
  }

  gameRunning = true;
  changeSiteLinkTarget("_blank");
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
      if (gameSettings.mode == "emote") {
        let tries = 0;
        try {
          let response = await fetch(`https://helper.guessr.tv/twitch/chat/emotes?broadcaster_id=${randomStream.userid}`);
          let emotes = await response.json();
          if (emotes?.data?.length > 0) {
            let emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
            while (!(await checkEmote(emote))) {
              if (++tries > 3) {
                showToast("Something went wrong while fetching the channel's emotes :(", "danger", 3000);
                console.log(error);
                return await getRandomStream();
              }
              emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
            }
            randomStream.emote = emote;
          } else {
            showToast("Channel has no emotes, getting new channel...", "info", 3000);
            return await getRandomStream();
          }
        } catch (error) {
          showToast("Something went wrong while fetching the channel's emotes :(", "danger", 3000);
          console.log(error);
          return await getRandomStream();
        }
      } //emote

      //get a new stream if current one has no category in game name mode
      if (!stream.data[0].game_name && gameSettings.mode == "game") {
        return await getRandomStream();
      }

      //update stream info
      randomStream.username = stream.data[0].user_login;
      randomStream.viewers = stream.data[0].viewer_count;
      randomStream.game_name = stream.data[0].game_name;
      randomStream.game_name_clean = cleanString(stream.data[0].game_name);
      randomStream.thumbnail = stream.data[0].thumbnail_url || "";

      //set the max slider value
      max = randomStream.viewers + Math.floor(Math.random() * 10000);
      elements.guessNumber.max = max;
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
    showToast("Something went wrong while updating the view count :(", "danger", 3000);
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
      showToast("Something went wrong while updating clip view counts :(", "danger", 3000);
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
    guessList = mainList.filter((n) => clips.data.some((n2) => n.id == n2.id));
    if (guessList.length < 5) {
      showToast("Clip set contains deleted clips, getting new set...", "info", 2000);
      return await getClipsGuessList();
    }

    //remove seen clips
    guessList = guessList.filter((n) => !seenClips.includes(n.id));
    if (guessList.length < 5) {
      showToast("Clip set contains already seen clips, getting new set...", "info", 2000);
      return await getClipsGuessList();
    }

    //update max slider value
    max = Math.max(...guessList.map((o) => o.viewers || 0)) + Math.floor(Math.random() * 10000);
    elements.guessNumber.max = max;

    //get an emote for each channel
    if (gameSettings.mode == "emote") {
      await getClipsEmotes();
    }
  } catch (error) {
    showToast("Something went wrong while updating clip view counts :(", "danger", 3000);
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
        showToast("Something went wrong while fetching the channel's emotes :(", "danger", 3000);
        return;
      }
      let emotes = await response.json();
      if (emotes?.data?.length > 0) {
        let emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
        while (!(await checkEmote(emote))) {
          if (++tries > 3) {
            showToast("Something went wrong while fetching the channel's emotes :(", "danger", 3000);
            console.log(error);
            return await getClipsGuessList();
          }
          emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
        }
        guessList[index].emote = emote;
        fetched++;
      } else {
        showToast("Channel has no emotes, getting new clip set...", "info", 3000);
        return await getClipsGuessList();
      }
    } catch (error) {
      showToast("Something went wrong while fetching the channel's emotes :(", "danger", 3000);
      console.log(error);
    }
  }
  if (fetched < 5) {
    guessList = [];
    showToast("Clip set contains deleted clips, getting new set...", "info", 2000);
    return await getClipsGuessList();
  }
} //getClipsEmotes

async function nextRound() {
  elements.nextRound.disabled = true;
  elements.nextRound.innerHTML = spinner;

  //get new clip set if game uses streaks after 5 rounds
  if (round == 5 && gameSettings.clips && gameSettings.mode !== "viewers") {
    await getClipsGuessList();
    //reset round counter because the guess list will get reset
    round = 0;
  }

  //get a random stream with updated info and add it to guessList
  if (!gameSettings.clips) {
    guessList.push(await getRandomStream());
  }

  round++;
  roundActive = true;
  elements.guessRange.value = 0;
  elements.guessNumber.value = "";
  elements.gameInput.value = "";

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

  toggleControls();

  if (gameSettings.mode == "viewers") {
    elements.guessRangeLabel.innerHTML = "How many viewers does this stream have?";
    if (gameSettings.clips) {
      elements.guessRangeLabel.innerHTML = "How many views does this clip have?";
    }
  }

  if (gameSettings.mode == "game") {
    //add the answer to the options list
    if (!gameList.some((e) => e.name === guessList[round - 1].game_name)) {
      elements.gameList.innerHTML = "";
      gameList.push({ name: guessList[round - 1].game_name });
      shuffleArray(gameList);
      for (let index = 0; index < gameList.length; index++) {
        elements.gameList.innerHTML += `<option value="${gameList[index].name}"></option>`;
      }
    }
  }

  if (gameSettings.mode == "emote") {
    elements.multiChoiceDiv.style.display = "none"; //hide now and show in generateEmoteChoices when it is done so that all emotes load at once
    elements.multiChoiceLabel.innerHTML = "Which emote belongs to this channel?";
    await generateEmoteChoices(guessList[round - 1].userid);
  }

  //set random number for previousNumber in first round
  if (gameSettings.mode == "higherlower") {
    if (previousNumber == null) {
      previousNumber = Math.floor(Math.random() * 100);
      elements.higherlowerLabel.innerHTML = `
      Does this ${gameSettings.clips ? "clip" : "stream"} have a higher or lower view count than <span class="previous-number">${previousNumber.toLocaleString()}?</span> 
      <i style="vertical-align: text-top;" class="material-icons notranslate" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="The first round has a random starting number, later rounds will be compared to the previous round">info</i>`;
      enableTooltips();
    } else {
      elements.higherlowerLabel.innerHTML = `
      Does this ${gameSettings.clips ? "clip" : "stream"} have a higher or lower view count than the previous ${
        gameSettings.clips ? "clip" : "stream"
      } <span class="previous-number">(${previousNumber.toLocaleString()})?</span>`;
    }
  }

  //blur stream based on video type
  if (gameSettings.clips) {
    elements.clipCover.style.display = "";
  } else {
    elements.streamCover.style.display = "";
  }

  if (gameSettings.mode == "viewers") {
    elements.round.innerHTML = `Round <br />${round}/5`;
    elements.score.innerHTML = `Score <br />${score.toLocaleString()}`;
  } else {
    elements.round.innerHTML = `Score <br />${score.toLocaleString()}`;
    elements.score.innerHTML = "";
  }

  if (!gameSettings.clips) {
    let options = {
      width: "100%",
      height: "100%",
      allowfullscreen: false,
      layout: "video",
      channel: gameSettings.mode == "irl" ? irlstream : guessList[round - 1].username,
      parent: ["guessr.tv"],
    };
    if (!player) {
      player = new Twitch.Player("twitchEmbed", options);
    } else {
      player.setChannel(guessList[round - 1].username);
    }
    seenChannels.push(guessList[round - 1].username);
  }

  if (gameSettings.chat && guessList[round - 1].username == channelName) {
    showConfetti(2);
    sendUsername(" - dank ⚠️ ⚠️ ⚠️");
  }

  if (gameSettings.clips) {
    elements.twitchEmbed.innerHTML = `
    <iframe 
    src="https://clips.twitch.tv/embed?clip=${guessList[round - 1].id}&parent=${window.location.hostname}&autoplay=true" 
    height="100%" 
    width="100%" 
    preload="auto" 
    >
    </iframe>`;
    elements.menuContainer.style.display = "none";
    elements.gameContainer.style.display = "";
    seenClips.push(guessList[round - 1].id);
  }

  if (gameSettings.mode == "viewers") {
    //reset round leaderboard and switch to total tab
    elements.leaderboardListRound.innerHTML = "";
    totalTab.show();
  }

  elements.correction.innerHTML = "";
  elements.nextRound.disabled = false;
  elements.nextRound.innerHTML = "Next round";
  elements.nextRound.style.display = "none";
  elements.endButtons.style.display = "none";
  elements.resultsDiv.style.display = "none";

  startTimer();
} //nextRound

async function generateEmoteChoices(userid) {
  let picked = [];
  let random = [];
  for (let index = 0; index < 4; index++) {
    const randomChannel = emoteList[Math.floor(Math.random() * emoteList.length)];
    const randomChannelEmotes = [...randomChannel.bitstier, ...randomChannel.follower, ...randomChannel.subscriptions];
    if (picked.includes(randomChannel._id) || randomChannelEmotes.length < 1) {
      index--;
      continue;
    }
    let emote = randomChannelEmotes[Math.floor(Math.random() * randomChannelEmotes.length)].id;
    if (!(await checkEmote(emote))) {
      index--;
      continue;
    }
    picked.push(randomChannel._id);
    random.push({ emote: emote, id: randomChannel._id });
  }

  random.push({ emote: guessList[round - 1].emote, id: userid });
  shuffleArray(random);
  for (let index = 0; index < random.length; index++) {
    const mcIndex = `multiChoice${index + 1}`;
    elements[mcIndex].disabled = false;
    elements[mcIndex].classList.add("btn-outline-success");
    elements[mcIndex].classList.remove("btn-outline-secondary");
    elements[mcIndex].dataset.answer = random[index].id;
    elements[mcIndex].dataset.emote = random[index].emote;
    elements[mcIndex].innerHTML = `
    ${gameSettings.chat ? Object.keys(emoteChoices).find((e) => emoteChoices[e] === index + 1) : ""} 
    <img src="https://static-cdn.jtvnw.net/emoticons/v2/${random[index].emote}/default/dark/3.0" alt="emote #${index + 1}">`;
  }
  elements.multiChoiceDiv.style.display = "";
} //generateEmoteChoices

async function checkEmote(id) {
  try {
    const res = await fetch(`https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`);
    const buff = await res.blob();
    return buff.type.startsWith("image/");
  } catch (error) {
    return false;
  }
} //checkEmote

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const toRad = (angle) => angle * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in kilometers
}

async function guess(choice, timeUp = false, skipped = false) {
  roundActive = false;
  let answer;

  if (gameSettings.mode == "irl") {
    if (!markerAnswer) {
      showToast("No location selected", "warning", 2000);
      return;
    }

    let diff = getDistance(markerAnswer.latitude, markerAnswer.longitude, irlLocation.latitude, irlLocation.longitude);

    L.marker([irlLocation.latitude, irlLocation.longitude]).addTo(map);

    map.flyTo(L.latLng(irlLocation.latitude, irlLocation.longitude));

    document.getElementById("irlCorrection").innerHTML = `Your guess was <strong>${Math.round(
      diff
    ).toLocaleString()} km</strong> away from the streamer<br><small><span class="text-danger">Refresh the page</span> to reset and pick a new stream :)</small>`;

    console.log(diff);
    return;
  }

  switch (choice) {
    case "slider":
      answer = parseInt(elements.guessNumber.value, 10);
      if (timeUp && !answer) {
        answer = -1;
      }
      break;

    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      answer = parseInt(elements[`multiChoice${choice}`].dataset.answer, 10);
      break;

    case "higher":
    case "lower":
      answer = choice;
      break;

    case "game":
      answer = cleanString(elements.gameInput.value);
      //show warning if no answer is provided but only if timer is not over
      if (!answer && !timeUp) {
        showToast("Invalid answer", "warning", 2000);
        elements.gameInput.value = "";
        return;
      }
      //show warning if answer does not exist in the game list
      if (!gameList.some((x) => cleanString(x.name) === answer) && !timeUp) {
        showToast("Answer must be from the suggestions list", "warning", 2000);
        elements.gameInput.value = "";
        return;
      }
      if (timeUp && !answer) {
        answer = -1;
      }
      break;

    default:
      //user did not answer and time is up so set answer to -1 so they lose a point when calculateScore() is called
      //also works when `skipped` is 'true'
      answer = -1;
  }

  //show warning if no answer is selected
  if ((isNaN(answer) || answer === null) && gameSettings.mode !== "game" && gameSettings.mode !== "higherlower" && !timeUp) {
    showToast("Invalid answer", "warning", 2000);
    return;
  }

  //stop timer here because checks above can show some warning instead of ending the round
  stopTimer();

  let roundResult = calculateScore(answer, skipped);

  // store some data for final screen:
  roundResult.task = guessList[round - 1];
  roundResult.powerups = usedPowerups;
  roundResults.push(roundResult);

  let { points, percent, diff, color } = roundResult;

  score += points;
  elements.streamCover.style.display = "none";
  elements.clipCover.style.display = "none";
  toggleControls(true);
  elements.nextRound.style.display = "";
  elements.resultsDiv.style.display = "";

  //update score display top left
  if (gameSettings.mode == "viewers") {
    elements.score.innerHTML = `Score <br />${score.toLocaleString()}`;
  } else {
    elements.round.innerHTML = `Score <br />${score.toLocaleString()}`;
  }

  //show progress bar and correction for viewers mode - streams or clips
  if (gameSettings.mode == "viewers") {
    animateScore(points, percent);
    showCorrection(guessList[round - 1].viewers, answer, diff, points, color);
  }

  //show progress bar and correction for gamename game - text controls - streams or clips
  if (gameSettings.mode == "game") {
    percent = (score / highscores.gameStreak) * 100;

    animateScore(score, percent, highscores.gameStreak);
    showCorrection(guessList[round - 1].game_name, answer == -1 ? answer : elements.gameInput.value, null, points, color);

    if (score > highscores.gameStreak) {
      highscores.gameStreak = score;
      localStorage.setItem("gameStreak", highscores.gameStreak);
    }
  }

  //show progress bar and correction for emote mode - multi choice controls - streams or clips
  if (gameSettings.mode == "emote") {
    let emote = choice === null ? null : elements[`multiChoice${choice}`].dataset.emote;

    percent = (score / highscores.emoteStreak) * 100;

    animateScore(score, percent, highscores.emoteStreak);
    showCorrection(guessList[round - 1].emote, answer == -1 ? answer : emote, null, points, null);

    if (score > highscores.emoteStreak) {
      highscores.emoteStreak = score;
      localStorage.setItem("emoteStreak", highscores.emoteStreak);
    }
  }

  //show progress bar and correction for higherlower mode - streams or clips
  if (gameSettings.mode == "higherlower") {
    let streak = highscores.viewersHigherlowerStreak;
    percent = (score / streak) * 100;

    animateScore(score, percent, streak);
    showCorrection(guessList[round - 1].viewers, answer, null, points, null);

    previousNumber = guessList[round - 1].viewers; //set now for next round

    if (score > streak) {
      highscores.viewersHigherlowerStreak = score;
      localStorage.setItem("viewersHigherlowerStreak", score);
    }
  }

  // remember the correction content - will reuse it on the final screen
  roundResult.correctionHTML = elements.correction.innerHTML;

  //update streamer's answer in the chatters map and then update all viewers' scores when updating the leaderboard
  if (gameSettings.chat) {
    let username = elements.channelName.value.replace(/\s+/g, "").toLowerCase();
    let streamer = chatters.get(username);
    if (!streamer) {
      chatters.set(username, {
        username: username,
        score: 0,
        round: 0,
        answer: { points: points },
        color: streamerColor,
        badges: addBadges("streamer", channelId),
      });
    } else {
      streamer.answer = { points: points };
      chatters.set(username, streamer);
    }
    updateLeaderboard();
  }

  //higherlower and game and emote modes are endless so return and dont end game
  if (gameSettings.mode !== "viewers") {
    return;
  }

  //end game if game on 5th round and mode is viewers
  if (round == 5 && gameSettings.mode == "viewers") {
    elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
    if (score > highscores.viewersHS) {
      elements.gameEndText.innerHTML += `<br>New High Score!`;
      highscores.viewersHS = score;
      localStorage.setItem("viewersHS", highscores.viewersHS);
    } else {
      elements.gameEndText.innerHTML += `<br>High Score: ${highscores.viewersHS.toLocaleString()}`;
    }
    elements.nextRound.style.display = "none";
    elements.endButtons.style.display = "";
    elements.gameEndText.style.display = "";
    gameRunning = false;
    changeSiteLinkTarget("_self");
  }
} //guess

function showBreakdown() {
  const thumbSize = [640, 360];

  const roundDataMap = roundResults.map((data, i) => {
    const u = data.task.username.toLowerCase();

    const thumbnail = String(data.task.thumbnail).replace("{width}", thumbSize[0]).replace("{height}", thumbSize[1]);
    const channelLink = `<a href="https://twitch.tv/${u}" target="_blank">${data.task.display_name || data.task.username}</a>`;

    let iframe;
    if (gameSettings.clips) {
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
    switch (gameSettings.mode) {
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
            <button type="button" class="btn btn-outline-${i + 1 < roundResults.length ? "success" : "danger"} multiChoice-btn m-0">${answer}</button>
          </div>
        </div>
        <div class="col-6">
          <p>Correct answer</p>
          <div>
            <button type="button" class="btn btn-outline-info multiChoice-btn m-0">${data.correct}</button>
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
              ${data.powerups.map((p) => powerupIcons[p]).join(" ")}
            </div>
          </div>
          <hr />
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
  elements.menuContainer.style.display = "none";
  elements.gameContainer.style.display = "";
  elements.scoreDiv.style.display = "none";
  elements.chatHint.style.display = "none";
  elements.breakdown.disabled = true;

  player = null;
} //showBreakdown

function calculateScore(answer, skipped = false) {
  const result = {};

  let points = 0;
  let percent = 0;
  let diff = 0;
  let color;

  //check emote mode answer
  if (gameSettings.mode == "emote") {
    if (answer == guessList[round - 1].userid) {
      points = 1;
    } else {
      points = -1;
    }
    if (skipped) {
      points = 0;
    }
    result.answer = answer;
    result.correct = guessList[round - 1].userid;
  }

  //calculate score for viewers mode - streams or clips
  if (gameSettings.mode == "viewers") {
    //get max view count of current game
    let roundMax = Math.max(...guessList.slice(0, 5).map((o) => o.viewers || 0));
    //get scaled decay between 100 and 5000
    let decay = (guessList[round - 1].viewers / roundMax) * (5000 - 100) + 100;
    diff = Math.abs(answer - guessList[round - 1].viewers);
    points = Math.round(5000 * Math.exp(-diff / decay));
    percent = Math.round((points / 5000) * 100);
    result.answer = answer;
    result.correct = guessList[round - 1].viewers;
  }

  //check if answer is corrent for higherlower mode - streams or clips
  if (gameSettings.mode == "higherlower") {
    let correctAnswer = answer; // will match if prev number is equal to current number
    if (guessList[round - 1].viewers > previousNumber) {
      correctAnswer = "higher";
    }
    if (guessList[round - 1].viewers < previousNumber) {
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
    result.answer = answer;
    result.correct = correctAnswer;
  }

  //get points for game guesser mode
  if (gameSettings.mode == "game") {
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
    result.answer = String(elements.gameInput.value);
    result.correct = guessList[round - 1].game_name;
  }

  //guess() was called by the timer and user did not provide an answer so give user 0 points for slider and -1 for other modes
  if (!skipped && answer == -1) {
    switch (gameSettings.mode) {
      case "higherlower":
      case "emote":
      case "game":
        points = -1;
        break;
      case "viewers":
        points = 0;
        break;
    }
    percent = 0;
    result.answer = gameSettings.mode == "viewers" ? 0 : "⏱️ timed out";
  }

  //get color class name for correction text
  if (points >= 4500) {
    color = "text-success";
  } else if (points < 4500 && points >= 2000) {
    color = "text-warning";
  } else if (points < 2000) {
    color = "text-danger";
  }

  result.points = points;
  result.percent = percent;
  result.diff = diff;
  result.color = color;

  return result;
} //calculateScore

function animateScore(points, percent, streak = null) {
  elements.progressBar.style.width = 0;
  let score = {
    points: 0,
    percent: 0,
  };

  if (streak === null) {
    animate(score, {
      points: points,
      percent: percent,
      modifier: utils.round(0),
      duration: 1000,
      ease: "inOutExpo",
      onUpdate: function () {
        elements.scoreProgressBarLabel.innerHTML = `${score.points.toLocaleString()} ${points == 1 ? "Point" : "Points"}`;
        elements.progressBar.style.width = `${score.percent}%`;
      },
    });
  } else {
    animate(score, {
      points: points,
      percent: percent,
      modifier: utils.round(0),
      duration: 1000,
      ease: "inOutExpo",
      onUpdate: function () {
        elements.scoreProgressBarLabel.innerHTML =
          points > streak
            ? `You beat your high score! Your new highscore is ${score.points.toLocaleString()}`
            : `${streak - score.points + 1} more ${streak - score.points + 1 == 1 ? "round" : "rounds"} till you beat your highscore`;
        elements.progressBar.style.width = `${points > streak ? 100 : score.percent}%`;
      },
    });
  }
  if (points == 0) {
    elements.scoreProgressBarLabel.innerHTML += " 💀";
  }
  elements.progress.ariaValueNow = percent;
} //animateScore

/**temp lidl function that just groups the correction stuff from guess() :)  */
function showCorrection(correct, answer, diff, points, color) {
  let overUnder = answer - correct > 0 ? `<i class="material-icons notranslate">arrow_upward</i>` : `<i class="material-icons notranslate">arrow_downward</i>`;

  if (gameSettings.mode == "viewers") {
    elements.correction.innerHTML = `
    The ${gameSettings.clips ? "clip" : "stream"} has ${viewersSVG}<strong>${correct.toLocaleString()}</strong>
    ${correct == 1 ? `${gameSettings.clips ? "view" : "viewer"}` : `${gameSettings.clips ? "views" : "viewers"}`}<br>
    ${
      diff == 0
        ? "You nailed the view count perfectly ✌"
        : `${
            answer == -1
              ? "You did not submit an answer"
              : `Your guess was off by ${overUnder} <span class="${color}">${diff.toLocaleString()}</span> ${
                  diff == 1 ? `${gameSettings.clips ? "view" : "viewer"}` : `${gameSettings.clips ? "views" : "viewers"}`
                }`
          }`
    }`;
  }

  if (gameSettings.mode == "emote") {
    elements.correction.innerHTML = `
    The streamer's emote is <img style="height: 56px;" src="https://static-cdn.jtvnw.net/emoticons/v2/${correct}/default/dark/3.0" alt="emote"><br>
    ${
      points > -1
        ? answer == -1
          ? "You skipped this round 🤷"
          : "You guessed the emote correctly ✌"
        : answer == -1
        ? "You did not select an emote"
        : `You guessed <img style="height: 56px;" src="https://static-cdn.jtvnw.net/emoticons/v2/${answer}/default/dark/3.0" alt="emote">`
    }`;
  }

  if (gameSettings.mode == "game") {
    elements.correction.innerHTML = `
    The streamer is playing <strong>${correct}</strong><br>
    ${points == 1 ? "You guessed the game correctly ✌" : `${answer == -1 ? "You did not select an answer" : `You guessed <span class="${color}">${answer}</span>`}`}`;
  }

  if (gameSettings.mode == "higherlower") {
    elements.correction.innerHTML = `
    The ${gameSettings.clips ? "clip" : "channel"} has ${viewersSVG}<strong>${guessList[round - 1].viewers.toLocaleString()}</strong>
    ${correct == 1 ? "viewer" : "viewers"}${correct == previousNumber ? " (same as previous channel!)" : ""}<br>
    ${
      points > -1
        ? answer == -1
          ? "<br>You skipped this round 🤷"
          : `This ${gameSettings.clips ? "clip" : "stream"} has a <i>${answer}</i> view count than the previous ${gameSettings.clips ? "clip" : "stream"}`
        : answer == -1
        ? "You did not select an answer"
        : `The previous ${gameSettings.clips ? "clip" : "channel"} had ${previousNumber.toLocaleString()} ${
            previousNumber == 1 ? `${gameSettings.clips ? "view" : "viewer"}` : `${gameSettings.clips ? "views" : "viewers"}`
          }`
    }`;
  }
} //showCorrection

function reset(logoClicked = false) {
  if (logoClicked && gameRunning) {
    resetGameModal.show();
    return;
  }
  stopTimer();
  guessList = [];
  elements.round.innerHTML = `Round <br />1/5`;
  elements.score.innerHTML = `Score <br />0`;
  elements.scoreDiv.style.display = "none";
  elements.sliderDiv.style.display = "none";
  elements.multiChoiceDiv.style.display = "none";
  elements.gameNameDiv.style.display = "none";
  elements.higherlowerDiv.style.display = "none";
  elements.irlDiv.style.display = "none";
  elements.resultsDiv.style.display = "none";
  elements.mainCard.style.display = "none";
  elements.streamCover.style.display = "none";
  elements.clipCover.style.display = "none";
  elements.leaderboard.style.display = "none";
  elements.getSettingsButton.innerHTML = "Start";
  elements.getSettingsButton.disabled = false;
  elements.guessLabel.innerHTML = "View count";
  elements.leaderboardList.innerHTML = "";
  elements.gameEndText.innerHTML = "";
  elements.chatHint.style.display = "";

  round = 0;
  score = 0;
  player = null;
  roundActive = false;
  gameRunning = false;
  changeSiteLinkTarget("_self");
  if (client) {
    client.disconnect();
    client = null;
  }
  elements.twitchEmbed.innerHTML = "";
  elements.menuContainer.style.display = "";
  elements.gameContainer.style.display = "none";
} //reset

async function showSettings(mode) {
  gameSettings.mode = mode;

  //add disclaimer
  elements.disclaimer.style.display = "";
  switch (mode) {
    case "viewers":
    case "higherlower":
      elements.disclaimer.innerHTML = "The answer will not always be the same as the view count seen on the stream because the API does not update as fast";
      break;
    case "game":
      elements.disclaimer.innerHTML = "Some streamers could forget to update their category or set it incorrectly, expect to be Jebaited :)";
      break;
    default:
      elements.disclaimer.style.display = "none";
  }

  if (mode == "irl") {
    document.getElementById("irlSettingsDiv").style.display = "";
    document.getElementById("channelId").value = "";
  } else {
    document.getElementById("irlSettingsDiv").style.display = "none";
  }

  gameSettingsModal.show();
} //showSettings

let irlid = "";
let irlstream = "";
async function getSettings() {
  elements.getSettingsButton.innerHTML = spinner;
  elements.getSettingsButton.disabled = true;

  gameSettings.clips = document.querySelector('input[name="videoTypeSelect"]:checked').value == "clips" ?? false;
  gameSettings.collection = elements.clipCollection.value || "random";

  if (gameSettings.mode == "game" && gameSettings.collection == "hottub" && gameSettings.clips) {
    showToast("Hmmm today I'll pick game guessr mode then pick a clip collection that has 1 category only 🤙", "info", 5000);
    reset();
    return;
  }
  if (gameSettings.mode == "emote" && gameSettings.collection == "forsen" && gameSettings.clips) {
    showToast("Hmmm today I'll pick emote guessr mode then pick a clip collection that has 1 channel only 🤙", "info", 5000);
    reset();
    return;
  }

  //update chat hint based on mode
  switch (gameSettings.mode) {
    case "viewers":
      elements.chatHint.innerHTML = `<h4>Type a number in chat to guess</h4>`;
      break;
    case "emote":
      elements.chatHint.innerHTML = `<h4>Type an emote's letter (a/b/c/d/e) in chat to guess</h4>`;
      break;
    case "game":
      elements.chatHint.innerHTML = `<h4>Type <kbd class="notranslate">!guess [game name]</kbd> in chat to guess</h4>`;
      break;
    case "higherlower":
      elements.chatHint.innerHTML = `<h4>Type <kbd class="notranslate">higher</kbd> or <kbd class="notranslate">lower</kbd> in chat to guess</h4>`;
      break;
  }

  channelName = elements.channelName.value.replace(/\s+/g, "").toLowerCase();

  if (channelName.includes("://") || channelName.includes(".")) {
    showToast("Invalid username. Input your username only not the link", "warning", 3000);
    reset();
    return;
  }

  if (gameSettings.mode == "irl") {
    irlid = parseInt(document.getElementById("channelId").value, 10);

    if (!irlid) {
      showToast("no irl channel id provided", "danger", 2000);
      reset();
      return;
    }

    let response = await fetch(`https://helper.guessr.tv/twitch/streams?user_id=${irlid}`);
    let stream = await response.json();
    if (!stream?.data[0] || !stream?.data[0]?.user_login) {
      showToast("stream not found/offline", "warning", 2000);
      reset();
      return;
    }

    irlstream = stream.data[0].user_login;
  }

  if (channelName && gameSettings.mode !== "irl") {
    localStorage.setItem("channelName", channelName);
    gameSettings.chat = true;
    connectChat();
    channelBadges = await getChannelBadges(channelName);
    globalBadges = await getGlobalBadges();
    customBadges = await getCustomBadges();
    if (!channelId) {
      channelId = await getChannelId();
    }
    if (!streamerColor) {
      streamerColor = await getStreamerColor();
    }
  } else {
    localStorage.setItem("channelName", "");
    gameSettings.chat = false;
  }

  if (!gameSettings.clips) {
    await getMainList(); // only needs to be fetched once per visit bcz list has ~700 channels
  }

  await startGame();
  nextRound();

  gameSettingsModal.hide();
} //getSettings

async function connectChat() {
  let options = {
    connection: {
      secure: true,
      reconnect: true,
    },
    channels: [channelName],
  };
  client = new tmi.client(options);

  client.on("message", async (target, context, msg, self) => {
    if (!gameSettings.chat || !roundActive || context.username == channelName) {
      return;
    }

    let results = { points: "", percent: "", diff: "", color: "" };

    let input = msg.split(" ").filter(Boolean);

    if (gameSettings.mode == "viewers") {
      let answer = parseAnswer(input[0]);
      if (answer === null || answer === undefined || answer === "" || answer < 0) {
        return;
      }
      results = calculateScore(answer);
    }

    if (gameSettings.mode == "higherlower") {
      if (input[0]?.toLowerCase() !== "higher" && input[0]?.toLowerCase() !== "lower") {
        return;
      }
      results = calculateScore(input[0].toLowerCase());
    }

    if (gameSettings.mode == "game") {
      if (input[0]?.toLowerCase() !== "!guess") {
        return;
      }
      results = calculateScore(cleanString(input.slice(1).join("")));
    }

    if (gameSettings.mode == "emote") {
      if (!emoteChoices.hasOwnProperty(input[0]?.toLowerCase())) {
        return;
      }
      let answer = parseInt(elements[`multiChoice${emoteChoices[input[0].toLowerCase()]}`].dataset.answer, 10);
      results = calculateScore(answer);
    }

    let chatter = chatters.get(context.username);
    if (!chatter) {
      //add the chatter to the map if they are not already in
      let badges = addBadges(context.badges, context["user-id"]);
      chatters.set(context.username, {
        username: context.username,
        score: 0,
        round: 0,
        answer: results,
        color: context.color,
        badges: badges,
      });
      //add chatter to the top of the leaderboard if 1st round or at the end otherwise
      elements.leaderboardList.insertAdjacentHTML(
        `${round == 1 ? "afterbegin" : "beforeend"}`,
        `<li class="list-group-item"><span id="${context.username}_dot">🔵</span><span style="color:${context.color || "#FFFFFF"};">${badges} ${context.username}:</span> 🙈</li>`
      );
      if (gameSettings.mode == "viewers") {
        //add chatter to the round leaderboard if mode is viewers
        elements.leaderboardListRound.insertAdjacentHTML(
          `${round == 1 ? "afterbegin" : "beforeend"}`,
          `<li class="list-group-item"><span style="color:${context.color || "#FFFFFF"};">${badges} ${context.username}:</span> 🙈</li>`
        );
      }
    } else {
      //chatter is already in the map so save their answer
      //check if the chatter already answered before adding them to the round leaderboard
      if (gameSettings.mode == "viewers" && !chatter.answer) {
        //add chatter to the round leaderboard if mode is viewers
        elements.leaderboardListRound.insertAdjacentHTML(
          `${round == 1 ? "afterbegin" : "beforeend"}`,
          `<li class="list-group-item"><span style="color:${context.color || "#FFFFFF"};">${chatter.badges} ${context.username}:</span> 🙈</li>`
        );
      }
      chatter.answer = results;
      chatters.set(context.username, chatter);
      document.getElementById(`${context.username}_dot`).style.visibility = "visible";
    }
  }); //message

  client.on("connected", (address, port) => {
    if (!usernameSent && channelName) {
      sendUsername();
    }
    showToast(`Connected to ${channelName}`, "success", 2000);
  }); //connected

  client.on("disconnected", (reason) => {
    showToast(`Disconnected: ${reason}`, "danger", 2000);
  }); //disconnected

  client.on("notice", (channel, msgid, message) => {
    showToast(`Disconnected: ${message}`, "danger", 2000);
  }); //notice

  client.connect().catch(console.error);
} //connectChat

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
  timer.addEventListener("secondTenthsUpdated", function (e) {
    document.querySelector("#timer").innerHTML = timer.getTimeValues().toString(["minutes", "seconds", "secondTenths"]);
  });
  timer.addEventListener("targetAchieved", function (e) {
    switch (gameSettings.mode) {
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

function showLeaderboard() {
  elements.leaderboard.style.display = "";
  if (gameSettings.mode == "viewers") {
    //show the total standings/round results tabs in the leaderboard for viewers mode
    elements.leaderboardTabs.style.display = "";
  } else {
    //hide the tabs and switch to total tab for all other modes
    elements.leaderboardTabs.style.display = "none";
    totalTab.show();
  }
} //showLeaderboard

function updateLeaderboard() {
  //update the scores for everyone
  for (const [key, value] of chatters.entries()) {
    if (!value?.answer) {
      //skip chatters that didn't play this round
      continue;
    }
    value.score += value?.answer.points;
    value.round = value?.answer.points;
    chatters.set(key, value);
  }

  const sortedChatters = new Map([...chatters.entries()].sort((a, b) => b[1].score - a[1].score));
  let username = elements.channelName.value.replace(/\s+/g, "").toLowerCase();
  let list = "";
  for (const [key, value] of sortedChatters.entries()) {
    list += `
    <li class="list-group-item ${username == value.username ? "bg-primary" : ""}">
      <span id="${value.username}_dot" style="visibility: hidden">🔵</span>
      <span style="color:${value.color || "#FFFFFF"};">${value.badges} ${value.username}:</span> ${value.score.toLocaleString()}
    </li>`;
  }
  elements.leaderboardList.innerHTML = list;

  //update round leaderboard for viewers mode
  if (gameSettings.mode == "viewers") {
    const roundSortedChatters = new Map([...chatters.entries()].sort((a, b) => b[1].round - a[1].round));
    let list = "";
    for (const [key, value] of roundSortedChatters.entries()) {
      if (!value?.answer) {
        //skip chatters that didn't play this round
        continue;
      }
      list += `
      <li class="list-group-item ${username == value.username ? "bg-primary" : ""}">
        <span style="color:${value.color || "#FFFFFF"};">${value.badges} ${value.username}:</span> ${value.round.toLocaleString()}
      </li>`;
    }
    elements.leaderboardListRound.innerHTML = list;
  }

  //reset answers for everyone for next round
  for (const [key, value] of chatters.entries()) {
    value.answer = null;
    chatters.set(key, value);
  }
} //updateLeaderboard

async function playAgain() {
  const oldContent = elements.playAgain.innerHTML;
  elements.playAgain.disabled = true;
  elements.playAgain.innerHTML = spinner;
  await startGame();
  nextRound();
  elements.playAgain.innerHTML = oldContent;
  elements.playAgain.disabled = false;
} // playAgain

function resetHighScore(scoreName) {
  localStorage.setItem(scoreName, 0);
  highscores[scoreName] = 0;
  elements[scoreName].innerHTML = 0;
} //resetHighScore

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
      if (gameSettings.mode === "higherlower" || gameSettings.mode === "emote") {
        // call `guess()` with empty answer, but add "skipped" flag to award 0 points
        guess(null, false, true);
      } else {
        throw new Error(`Powerup [${pType}] not allowed for game mode [${gameSettings.mode}]`);
      }
      break;
    }
    case "p5050": {
      if (gameSettings.mode === "emote") {
        const correct = Number(guessList[round - 1].userid);

        const choiceBtns = Array.from(document.querySelectorAll("#multiChoiceDiv .multiChoice-btn"));
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
        throw new Error(`Powerup [${pType}] not allowed for game mode [${gameSettings.mode}]`);
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

let map;
let markerAnswer;
let irlLocation;
function loadMap() {
  if (map) {
    //reset map and marker if we already loaded it
    map.setView([40, 16], 2);
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });
  } else {
    //load map if it doesnt exist yet
    map = L.map("map", {
      center: [40, 16],
      zoom: 2,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
    }).addTo(map);

    map.on("click", function (e) {
      const { lat, lng } = e.latlng;
      console.log(` Latitude ${lat.toFixed(5)}, Longitude ${lng.toFixed(5)}`);

      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
      L.marker([lat, lng]).addTo(map);
      markerAnswer = { latitude: lat, longitude: lng };
    });
  }

  dankdank = RealtimeIRL.forStreamer("twitch", irlid).addLocationListener(function (location) {
    irlLocation = location;
    console.log(irlLocation);
  });
} //loadMap
let dankdank;
window.onload = async function () {
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: "guessr.tv",
    version: 1.0,
    storeName: "guessr",
    description: "guessr",
  });

  seenChannels = JSON.parse(await localforage.getItem("seenChannels")) || [];
  elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();
  seenClips = JSON.parse(await localforage.getItem("seenClips")) || [];
  elements.seenClips.innerHTML = seenClips.length.toLocaleString();
  skipSexual = (localStorage.getItem("skipSexual") || "true") === "true";
  elements.skipSexual.checked = skipSexual;
  unloadWarning = (localStorage.getItem("unloadWarning") || "false") === "true";
  elements.unloadWarning.checked = unloadWarning;
  highscores.viewersHS = parseInt(localStorage.getItem("viewersHS"), 10) || 0;
  highscores.gameStreak = parseInt(localStorage.getItem("gameStreak"), 10) || 0;
  highscores.emoteStreak = parseInt(localStorage.getItem("emoteStreak"), 10) || 0;
  highscores.viewersHigherlowerStreak = parseInt(localStorage.getItem("viewersHigherlowerStreak"), 10) || 0;
  channelName = localStorage.getItem("channelName") || "";
  elements.channelName.value = channelName;

  // if (channelName) {
  //   elements.drops.style.display = "";
  // } else {
  //   elements.drops.style.display = "none";
  // }

  elements.viewersHS.innerHTML = highscores.viewersHS.toLocaleString();
  elements.gameStreak.innerHTML = highscores.gameStreak.toLocaleString();
  elements.emoteStreak.innerHTML = highscores.emoteStreak.toLocaleString();
  elements.viewersHigherlowerStreak.innerHTML = highscores.viewersHigherlowerStreak.toLocaleString();

  gameSettingsModal = new bootstrap.Modal(elements.gameSettingsModal);
  resetGameModal = new bootstrap.Modal(elements.resetGameModal);

  totalTab = new bootstrap.Tab(elements.totalTab);
  roundTab = new bootstrap.Tab(elements.roundTab);

  elements.skipSexual.onchange = function () {
    skipSexual = this.checked;
    localStorage.setItem("skipSexual", skipSexual);
  };

  elements.unloadWarning.onchange = function () {
    unloadWarning = this.checked;
    localStorage.setItem("unloadWarning", unloadWarning);
  };

  elements.streamsVideoType.onchange = function () {
    if (this.checked) {
      elements.videoTypeDesc.innerHTML = "A random live stream will be picked for you each round. Some streams might have preroll ads";
      elements.clipCollectionDiv.style.display = "none";
    }
  };
  elements.clipsVideoType.onchange = function () {
    if (this.checked) {
      elements.videoTypeDesc.innerHTML = "A random clip will be picked for you each round. Clips don't have ads";
      elements.clipCollectionDiv.style.display = "";
    }
  };

  elements.guessRange.oninput = function () {
    let value = parseInt(this.value, 10);
    elements.guessNumber.value = Math.round(Math.exp((Math.log(max) / 100) * value));
    if (value == 0) {
      elements.guessNumber.value = 0;
    }
  };
  elements.guessNumber.oninput = function () {
    let value = parseInt(this.value, 10);
    elements.guessRange.value = (100 * Math.log(value)) / Math.log(max);
    if (value == 0) {
      elements.guessRange.value = 0;
    }
  };

  // elements.channelName.oninput = function () {
  //   if (this.value) {
  //     elements.drops.style.display = "";
  //   } else {
  //     elements.drops.style.display = "none";
  //   }
  // };

  elements.nextRound.onclick = function () {
    localforage.setItem("seenChannels", JSON.stringify(seenChannels));
    localforage.setItem("seenClips", JSON.stringify(seenClips));
    elements.seenChannels.innerHTML = seenChannels.length.toLocaleString();
    elements.seenClips.innerHTML = seenClips.length.toLocaleString();
    nextRound();
  };

  elements.resetSeenChannels.onclick = function () {
    localforage.setItem("seenChannels", JSON.stringify([]));
    seenChannels = [];
    elements.seenChannels.innerHTML = 0;
    showToast("Seen channels reset", "success", 2000);
  };
  elements.resetSeenClips.onclick = function () {
    localforage.setItem("seenClips", JSON.stringify([]));
    seenClips = [];
    elements.seenClips.innerHTML = 0;
    showToast("Seen clips reset", "success", 2000);
  };

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.get("irl") === "true") {
    document.getElementById("irl").style.display = "";
  }
}; //onload

window.onbeforeunload = function () {
  if (unloadWarning && gameRunning) {
    return "Unload warning enabled. You can turn it off in the settings.";
  }
  return null;
}; //onbeforeunload
