const elements = {
  toastContainer: document.getElementById("toastContainer"),
  reset: document.getElementById("reset"),
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

  resultsDiv: document.getElementById("resultsDiv"),
  nextRound: document.getElementById("nextRound"),
  playAgain: document.getElementById("playAgain"),
  gameEndText: document.getElementById("gameEndText"),
  scoreProgressBarLabel: document.getElementById("scoreProgressBarLabel"),
  progress: document.getElementById("progress"),
  progressBar: document.getElementById("progressBar"),

  correction: document.getElementById("correction"),

  scoreDiv: document.getElementById("scoreDiv"),
  round: document.getElementById("round"),
  score: document.getElementById("score"),
  timerDiv: document.getElementById("timerDiv"),
  timer: document.getElementById("timer"),
  infoTime: document.getElementById("infoTime"),
  streamCover: document.getElementById("streamCover"),
  clipCover: document.getElementById("clipCover"),

  resetHighScore: document.getElementById("resetHighScore"),
  viewersHS: document.getElementById("viewersHS"),
  followersHS: document.getElementById("followersHS"),
  resetMaxStreaks: document.getElementById("resetMaxStreaks"),
  viewersStreak: document.getElementById("viewersStreak"),
  followersStreak: document.getElementById("followersStreak"),
  gameStreak: document.getElementById("gameStreak"),
  emoteStreak: document.getElementById("emoteStreak"),
  viewersHigherlowerStreak: document.getElementById("viewersHigherlowerStreak"),
  followersHigherlowerStreak: document.getElementById("followersHigherlowerStreak"),

  resetSeenChannels: document.getElementById("resetSeenChannels"),
  seenChannels: document.getElementById("seenChannels"),
  resetSeenClips: document.getElementById("resetSeenClips"),
  seenClips: document.getElementById("seenClips"),

  gameSettingsModal: document.getElementById("gameSettingsModal"),
  streamsVideoType: document.getElementById("streamsVideoType"),
  clipsVideoType: document.getElementById("clipsVideoType"),
  clipCollectionDiv: document.getElementById("clipCollectionDiv"),
  clipCollection: document.getElementById("clipCollection"),
  videoTypeDesc: document.getElementById("videoTypeDesc"),
  controlsTypeDiv: document.getElementById("controlsTypeDiv"),
  sliderControls: document.getElementById("sliderControls"),
  choicesControls: document.getElementById("choicesControls"),
  higherlowerControls: document.getElementById("higherlowerControls"),
  controlsDesc: document.getElementById("controlsDesc"),
  timerValue: document.getElementById("timerValue"),
  chatSettingsDiv: document.getElementById("chatSettingsDiv"),
  channelName: document.getElementById("channelName"),
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

const requestOptions = {
  method: "GET",
  redirect: "follow",
};

let channelBadges = { subscriber: [], bits: [] };
let globalBadges = {};

const viewersSVG = `<svg class="viewers-svg" width="24px" height="24px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
  <g>
    <path
      fill-rule="evenodd"
      d="M5 7a5 5 0 116.192 4.857A2 2 0 0013 13h1a3 3 0 013 3v2h-2v-2a1 1 0 00-1-1h-1a3.99 3.99 0 01-3-1.354A3.99 3.99 0 017 15H6a1 1 0 00-1 1v2H3v-2a3 3 0 013-3h1a2 2 0 001.808-1.143A5.002 5.002 0 015 7zm5 3a3 3 0 110-6 3 3 0 010 6z"
      clip-rule="evenodd"
    ></path>
  </g>
</svg>`;

const followSVG = `<svg type="color-fill-current" width="24px" height="24px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="follow-svg">
<g>
  <path
    fill-rule="evenodd"
    d="M9.171 4.171A4 4 0 006.343 3H6a4 4 0 00-4 4v.343a4 4 0 001.172 2.829L10 17l6.828-6.828A4 4 0 0018 7.343V7a4 4 0 00-4-4h-.343a4 4 0 00-2.829 1.172L10 5l-.829-.829zm.829 10l5.414-5.414A2 2 0 0016 7.343V7a2 2 0 00-2-2h-.343a2 2 0 00-1.414.586L10 7.828 7.757 5.586A2 2 0 006.343 5H6a2 2 0 00-2 2v.343a2 2 0 00.586 1.414L10 14.172z"
    clip-rule="evenodd"
  ></path>
</g>
</svg>`;

const spinner = `<div class="spinner-border" role="status">
<span class="visually-hidden">Loading...</span>
</div>`;

let channelName;
let mainList = [];
let gameList = [];
let emoteList = [];
let guessList = [];
let seenChannels = [];
let seenClips = [];
let round = 0;
let score = 0;
let player = null;
let max = 0;
let previousNumber = null;
let timer;
let emoteChoices = { a: 1, b: 2, c: 3, d: 4, e: 5 };
let gameSettings = {
  game: "viewers", // viewers - followers - gamename - emote
  video: "streams", // streams - clips
  collection: "random", // "random", "short", "long", "popular", "hottub", "forsen"
  controls: "slider", // slider - choices - text - higherlower
  chat: false, // true - false
};
let viewersHS = 0;
let followersHS = 0;
let viewersStreak = 0;
let followersStreak = 0;
let gameStreak = 0;
let emoteStreak = 0;
let viewersHigherlowerStreak = 0;
let followersHigherlowerStreak = 0;
let gameSettingsModal;
let client;
let roundActive = false;
let chatters = [];
let usernameSent = false;
let totalTab, roundTab;

async function getMainList() {
  try {
    let response = await fetch(`https://api.okayeg.com/guess`, requestOptions);
    let list = await response.json();
    mainList = list.guess.guess;
    max = Math.max(...mainList.map((o) => o.viewers || 0)) + Math.floor(Math.random() * 1000);
    elements.guessNumber.max = max;
    elements.guessRange.value = 0;
    elements.guessNumber.value = "";
    elements.infoTime.innerHTML = `Channel list updated on ${new Date(list.guess.time)}`;
  } catch (error) {
    console.log(error);
  }
} //getMainList

async function getMainListClips() {
  try {
    let response = await fetch(`https://api.okayeg.com/guess/clips/${gameSettings.collection}?time=${Date.now()}`, requestOptions);
    let list = await response.json();
    mainList = list.random[0].clips;
    max = Math.max(...mainList.map((o) => o.viewers || 0)) + Math.floor(Math.random() * 1000);
    elements.guessNumber.max = max;
    elements.guessRange.value = 0;
    elements.guessNumber.value = "";
    elements.infoTime.innerHTML = `Clip set generated on ${new Date(list.random[0].time)}`;
  } catch (error) {
    console.log(error);
  }
} //getMainListClips

async function loadGameList() {
  let response = await fetch(`/games.json`, requestOptions);
  gameList = await response.json();
  elements.gameList.innerHTML = "";
  shuffleArray(gameList);
  for (let index = 0; index < gameList.length; index++) {
    elements.gameList.innerHTML += `<option value="${gameList[index].name}"></option>`;
  }
} //loadGameList

async function loadEmoteList() {
  try {
    let response = await fetch(`https://api.okayeg.com/guess/emotes?time=${Date.now()}`, requestOptions);
    let json = await response.json();
    emoteList = json.random;
  } catch (error) {
    console.log(error);
  }
} //loadEmoteList

function toggleControls(hide = false) {
  if (hide) {
    elements.sliderDiv.style.display = "none";
    elements.multiChoiceDiv.style.display = "none";
    elements.gameNameDiv.style.display = "none";
    elements.higherlowerDiv.style.display = "none";
    return;
  }

  switch (gameSettings.controls) {
    case "slider":
      elements.sliderDiv.style.display = "";
      elements.multiChoiceDiv.style.display = "none";
      elements.gameNameDiv.style.display = "none";
      elements.higherlowerDiv.style.display = "none";
      break;
    case "choices":
      elements.sliderDiv.style.display = "none";
      elements.multiChoiceDiv.style.display = "";
      elements.gameNameDiv.style.display = "none";
      elements.higherlowerDiv.style.display = "none";
      break;
    case "text":
      elements.sliderDiv.style.display = "none";
      elements.multiChoiceDiv.style.display = "none";
      elements.gameNameDiv.style.display = "";
      elements.higherlowerDiv.style.display = "none";
      break;
    case "higherlower":
      elements.sliderDiv.style.display = "none";
      elements.multiChoiceDiv.style.display = "none";
      elements.gameNameDiv.style.display = "none";
      elements.higherlowerDiv.style.display = "";
      break;
    default:
      break;
  }
} //toggleControls

async function startGame() {
  guessList = [];
  chatters = [];
  score = 0;
  elements.leaderboardList.innerHTML = "";
  elements.leaderboardListRound.innerHTML = "";

  //get a new clip set and then use helper to update view count and make sure clips still exist
  if (gameSettings.video == "clips") {
    await getClipsGuessList();
  } //clips

  if (gameSettings.game == "gamename") {
    gameSettings.controls = "text";
    await loadGameList();
  } //game

  if (gameSettings.game == "emote") {
    gameSettings.controls = "choices";
    await loadEmoteList();
  } //game

  //reset player
  if (!player) {
    elements.twitchEmbed.innerHTML = "";
  }

  //change score label for streaks
  if (gameSettings.controls == "slider") {
    elements.round.innerHTML = `Round <br />1/5`;
    elements.score.innerHTML = `Score <br />0`;
    elements.scoreDiv.style.display = "";
  } else {
    elements.round.innerHTML = "Streak <br />0";
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
  round = 0;
  previousNumber = null;
} //startGame

async function getRandomStream() {
  //pick a random stream from the main list which has ~700 streams
  let random = mainList[Math.floor(Math.random() * mainList.length)];

  //check if channel is already seen
  if (seenChannels.some((e) => e === random.username)) {
    return await getRandomStream();
  }

  //update stream info
  try {
    let response = await fetch(`https://helper.pepega.workers.dev/twitch/streams?user_id=${random.userid}`, requestOptions);
    let stream = await response.json();

    if (stream.data[0]) {
      //get follower count if game mode is followers
      if (gameSettings.game == "followers") {
        try {
          let response = await fetch(`https://helper.pepega.workers.dev/twitch/channels/followers?broadcaster_id=${random.userid}`, requestOptions);
          let followers = await response.json();
          random.followers = followers.total;
        } catch (error) {
          showToast("Something went wrong while updating the follow count :(", "danger", 3000);
          console.log(error);
          return await getRandomStream();
        }
      } //followers

      //get a new stream if current one has no category
      if (!stream.data[0].game_name && gameSettings.game == "gamename") {
        return await getRandomStream();
      }

      //update stream info
      random.viewers = stream.data[0].viewer_count;
      random.game_name = stream.data[0].game_name;
      return random;
    } else {
      //stream is offline so remove it from the main list and get a new one
      mainList = mainList.filter((e) => e.username != random.username);
      return await getRandomStream();
    }
  } catch (error) {
    showToast("Something went wrong while updating the view count :(", "danger", 3000);
    console.log(error);
    return await getRandomStream();
  }
} //getRandomStream

async function getClipsGuessList() {
  await getMainListClips(); // needs to be fetched before each game bcz list has 5 clips only
  let ids = mainList.map((e) => e.id);
  try {
    let response = await fetch(`https://helper.pepega.workers.dev/twitch/clips?id=${ids.join(",")}`, requestOptions);
    if (response.status != 200) {
      showToast("Something went wrong while updating clip view counts :(", "danger", 3000);
      // await getClipsGuessList();
      return;
    }
    let clips = await response.json();
    for (let index = 0; index < clips.data.length; index++) {
      let clipIndex = mainList.findIndex((e) => e.id == clips.data[index].id);
      mainList[clipIndex].viewers = clips.data[index].view_count; //update clips from the bot with up to date view count from helper
    }
    guessList = mainList.filter((n) => clips.data.some((n2) => n.id == n2.id));
    //remove seen clips
    guessList = mainList.filter((n) => !seenClips.includes(n.id));
    max = Math.max(...guessList.map((o) => o.viewers || 0)) + Math.floor(Math.random() * 1000);
    if (guessList.length < 5) {
      showToast("Clips set contains deleted/already seen clips, getting new set...", "info", 2000);
      return await getClipsGuessList();
    }
    //get follower counts now if the video type is clips - if the video type is streams the follower count will be fetched in getRandomStream()
    if (gameSettings.game == "followers") {
      await getClipsFollowerCount();
    }
  } catch (error) {
    showToast("Something went wrong while updating clip view counts :(", "danger", 3000);
    //await getClipsGuessList();
    console.log(error);
  }
} //getClipsGuessList

async function getClipsFollowerCount() {
  let fetched = 0;
  for (let index = 0; index < 5; index++) {
    try {
      let response = await fetch(`https://helper.pepega.workers.dev/twitch/channels/followers?broadcaster_id=${guessList[index].userid}`, requestOptions);
      if (response.status != 200) {
        showToast("Something went wrong while updating the follow counts :(", "danger", 3000);
        return;
      }
      let followers = await response.json();
      guessList[index].followers = followers.total;
      fetched++;
    } catch (error) {
      showToast("Something went wrong while updating the follow counts :(", "danger", 3000);
      console.log(error);
    }
  }
  if (fetched < 5) {
    guessList = [];
    showToast("Clips set contains deleted/already seen clips, getting new set...", "info", 2000);
    return await getClipsGuessList();
  }
  max = Math.max(...guessList.map((o) => o.followers || 0)) + Math.floor(Math.random() * 1000);
} //getClipsFollowerCount

async function nextRound() {
  elements.nextRound.disabled = true;
  elements.nextRound.innerHTML = spinner;

  //get new clips list if game uses streaks after 5 rounds
  if (round == 5 && gameSettings.video == "clips" && (gameSettings.controls == "choices" || gameSettings.controls == "text" || gameSettings.controls == "higherlower")) {
    await getClipsGuessList();
    //reset round counter becuase the guess list will get reset
    round = 0;
    chatters.map((e) => (e.lastGuess = 0));
  }

  //get a random stream with updated info and add it to guessList
  if (gameSettings.video == "streams") {
    guessList.push(await getRandomStream());
  }

  round++;
  roundActive = true;
  elements.guessNumber.max = max;
  elements.guessRange.value = 0;
  elements.guessNumber.value = "";
  elements.gameInput.value = "";

  toggleControls();

  if (gameSettings.game == "viewers") {
    elements.guessRangeLabel.innerHTML = "How many viewers does this stream have?";
    elements.multiChoiceLabel.innerHTML = "How many viewers does this stream have?";
    if (gameSettings.video == "clips") {
      elements.guessRangeLabel.innerHTML = "How many views does this clip have?";
      elements.multiChoiceLabel.innerHTML = "How many views does this clip have?";
    }
  }

  if (gameSettings.game == "followers") {
    elements.guessRangeLabel.innerHTML = "How many followers does this stream have?";
    elements.multiChoiceLabel.innerHTML = "How many followers does this stream have?";
    elements.guessLabel.innerHTML = "Followers";
    elements.guessNumber.max = 99999999;
    elements.guessNumber.value = "";
  }

  if (gameSettings.game == "gamename") {
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

  if (gameSettings.game == "emote") {
    elements.multiChoiceDiv.style.display = "none"; //hide now and show in generateEmoteChoices when it is done so that all emotes load at once
    elements.multiChoiceLabel.innerHTML = "Which emote belongs to this channel?";
    await generateEmoteChoices(guessList[round - 1].userid);
  }

  if (gameSettings.controls == "choices" && gameSettings.game != "emote") {
    generateChoices(guessList[round - 1][gameSettings.game]);
  }

  //set random number for previousNumber in first round
  if (gameSettings.controls == "higherlower") {
    if (previousNumber == null) {
      previousNumber = Math.floor(Math.random() * (gameSettings.game == "viewers" ? 1000 : 50000));
      elements.higherlowerLabel.innerHTML = `Does this ${gameSettings.video == "streams" ? "stream" : "clip"} have a higher or lower ${
        gameSettings.game == "viewers" ? "view count" : "follow count"
      } than <span class="previous-number">${previousNumber.toLocaleString()}?</span> 
      <i class="material-icons notranslate" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="The first round has a random starting number, later rounds will be compared to the previous stream">info</i>`;
      enableTooltips();
    } else {
      elements.higherlowerLabel.innerHTML = `Does this ${gameSettings.video == "streams" ? "stream" : "clip"} have a higher or lower ${
        gameSettings.game == "viewers" ? "view count" : "follow count"
      } than the previous ${gameSettings.video == "streams" ? "stream" : "clip"} <span class="previous-number">(${previousNumber.toLocaleString()})?</span>`;
    }
  }

  //blur stream based on video type
  if (gameSettings.video == "streams") {
    elements.streamCover.style.display = "";
  } else {
    elements.clipCover.style.display = "";
  }

  if (gameSettings.controls == "slider") {
    elements.round.innerHTML = `Round <br />${round}/5`;
    elements.score.innerHTML = `Score <br />${score.toLocaleString()}`;
  } else {
    elements.round.innerHTML = `Streak <br />${score.toLocaleString()}`;
    elements.score.innerHTML = "";
  }

  if (gameSettings.video == "streams") {
    let options = {
      width: "100%",
      height: "100%",
      allowfullscreen: false,
      layout: "video",
      channel: guessList[round - 1].username,
      parent: ["guessr.tv"],
    };
    if (!player) {
      player = new Twitch.Player("twitchEmbed", options);
    } else {
      player.setChannel(guessList[round - 1].username);
    }
    seenChannels.push(guessList[round - 1].username);
  }

  if (gameSettings.video == "clips") {
    elements.twitchEmbed.innerHTML = `
    <iframe 
    src="https://clips.twitch.tv/embed?clip=${guessList[round - 1].id}&parent=guessr.tv&autoplay=true" 
    height="100%" 
    width="100%" 
    preload="auto" 
    >
    </iframe>`;
    seenClips.push(guessList[round - 1].id);
  }

  if (gameSettings.controls == "slider") {
    //reset round leaderboard and switch to total tab
    elements.leaderboardListRound.innerHTML = "";
    totalTab.show();
  }

  elements.correction.innerHTML = "";
  elements.nextRound.disabled = false;
  elements.nextRound.innerHTML = "Next round";
  elements.nextRound.style.display = "none";
  elements.playAgain.disabled = false;
  elements.playAgain.innerHTML = "Play again";
  elements.playAgain.style.display = "none";
  elements.resultsDiv.style.display = "none";

  startTimer();
} //nextRound

function generateChoices(answer) {
  let patterns = [
    [Math.floor(Math.random() * max * 1.5), Math.floor(Math.random() * answer * 4), Math.floor(Math.random() * answer), Math.floor(Math.random() * 5)],
    [Math.floor(Math.random() * max), Math.floor(Math.random() * max), Math.floor(Math.random() * max), 0],
    [Math.floor(Math.random() * 10000) + 10000, Math.floor(Math.random() * 10000) + 10000, Math.floor(Math.random() * 10000) + 10000, 0],
    [Math.floor(Math.random() * 2) + 2, Math.floor(Math.random() * 2) + 2, Math.floor(Math.random() * 2) + 2, Math.floor(Math.random() * 2) + 2],
    [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)],
    [Math.floor(Math.random() * 10) + 10, Math.floor(Math.random() * 10) + 100, Math.floor(Math.random() * 10) + 1000, Math.floor(Math.random() * 10) + 10000],
    [answer + 1, answer + 2, answer + 3, answer + 4],
    [(1, 2, 3, 4)],
  ];
  let options = [];
  options.push(...patterns[Math.floor(Math.random() * patterns.length)]);
  options.push(answer);

  //remove duplicates
  while (hasDuplicates(options)) {
    options = options.map(function (option) {
      if (options.indexOf(option) !== options.lastIndexOf(option)) {
        return Math.floor(Math.random() * (answer + 1) * 10);
      }
      return option;
    });
  }
  //check if answer is included in the options
  if (!options.includes(answer)) {
    options.pop();
    options.push(answer);
  }
  //shuffle
  options.sort(function () {
    return 0.5 - Math.random();
  });
  for (let index = 0; index < options.length; index++) {
    elements[`multiChoice${index + 1}`].dataset.answer = options[index];
    elements[`multiChoice${index + 1}`].innerHTML = options[index].toLocaleString();
  }
} //generateChoices

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
  try {
    let response = await fetch(`https://helper.pepega.workers.dev/twitch/chat/emotes?broadcaster_id=${userid}`, requestOptions);
    let emotes = await response.json();
    if (emotes?.data?.length > 0) {
      let emote = emotes.data[Math.floor(Math.random() * emotes.data.length)].id;
      await checkEmote(emote);
      random.push({ emote: emote, id: userid });
      guessList[round - 1].emote = emote;
    } else {
      showToast("Channel has no emotes :) added TriHard as a temporary emote till I fix this :)", "info", 3000);
      random.push({ emote: "120232", id: userid }); //channel has no emotes so add TriHard
      guessList[round - 1].emote = "120232";
    }
    shuffleArray(random);
    for (let index = 0; index < random.length; index++) {
      elements[`multiChoice${index + 1}`].dataset.answer = random[index].id;
      elements[`multiChoice${index + 1}`].dataset.emote = random[index].emote;
      elements[`multiChoice${index + 1}`].innerHTML = `${
        gameSettings.chat ? Object.keys(emoteChoices).find((e) => emoteChoices[e] === index + 1) : ""
      } <img src="https://static-cdn.jtvnw.net/emoticons/v2/${random[index].emote}/default/dark/3.0" alt="emote #${index + 1}">`;
    }
  } catch (error) {
    console.log("generateEmoteChoices error", error);
  }
  elements.multiChoiceDiv.style.display = "";
} //generateEmoteChoices

function hasDuplicates(array) {
  return new Set(array).size !== array.length;
} //hasDuplicates

async function checkEmote(id) {
  try {
    const res = await fetch(`https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`);
    const buff = await res.blob();
    return buff.type.startsWith("image/");
  } catch (error) {
    return false;
  }
} //checkEmote

async function guess(choice, timeUp) {
  roundActive = false;
  let answer;

  switch (choice) {
    case "slider":
      answer = parseInt(elements.guessNumber.value, 10);
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
      answer = elements.gameInput.value.replace(/\s+/g, "").toLowerCase();
      //show warning if no answer is provided but only if timer is not over
      if (!answer && !timeUp) {
        showToast("Invalid answer", "warning", 2000);
        elements.gameInput.value = "";
        return;
      }
      //show warning if answer does not exist in the game list
      if (!gameList.some((x) => x.name.replace(/\s+/g, "").toLowerCase() === answer) && !timeUp) {
        showToast("Answer must be from the suggestions list", "warning", 2000);
        elements.gameInput.value = "";
        return;
      }
      break;

    default:
      //user did not answer and time is up so set answer to -1 so they get 0 points
      answer = -1;
  }

  //show warning if no answer is selected
  if ((isNaN(answer) || answer === null) && gameSettings.game != "gamename" && gameSettings.controls != "higherlower") {
    showToast("Invalid answer", "warning", 2000);
    return;
  }

  //stop timer here because checks above can show some warning instead of ending the round
  stopTimer();

  let { points, percent, diff, color } = calculateScore(answer);

  score += points;
  elements.streamCover.style.display = "none";
  elements.clipCover.style.display = "none";
  toggleControls(true);
  elements.nextRound.style.display = "";
  elements.resultsDiv.style.display = "";

  //update score display top left
  if (gameSettings.controls == "slider") {
    elements.score.innerHTML = `Score <br />${score.toLocaleString()}`;
  } else {
    elements.round.innerHTML = `Streak <br />${score.toLocaleString()}`;
  }

  //show progress bar and correction for viewers or followers mode - slider controls - streams or clips
  if ((gameSettings.game == "viewers" || gameSettings.game == "followers") && gameSettings.controls == "slider") {
    let overUnder =
      answer - guessList[round - 1][gameSettings.game] > 0 ? `<i class="material-icons notranslate">arrow_upward</i>` : `<i class="material-icons notranslate">arrow_downward</i>`;

    elements.scoreProgressBarLabel.innerHTML = `${points.toLocaleString()} ${points == 1 ? "Point" : "Points"}${points == 0 ? " 💀" : ""}`;
    elements.progress.ariaValueNow = percent;
    elements.progressBar.style.width = `${percent}%`;

    if (gameSettings.game == "viewers") {
      elements.correction.innerHTML = `
    The ${gameSettings.video == "streams" ? "stream" : "clip"} has ${viewersSVG}
    <strong>${guessList[round - 1][gameSettings.game].toLocaleString()}</strong>
     ${guessList[round - 1].viewers == 1 ? `${gameSettings.video == "streams" ? "viewer" : "view"}` : `${gameSettings.video == "streams" ? "viewers" : "views"}`}<br>
    ${
      points == 5000
        ? "You nailed the view count perfectly ✌"
        : `${answer == -1 ? "You did not submit an answer" : `Your guess was off by ${overUnder} <span class="${color}">${diff.toLocaleString()}</span> ${diff == 1 ? "view" : "views"}`}`
    }`;
    } else {
      elements.correction.innerHTML = `
      The stream has ${followSVG} <strong>${guessList[round - 1][gameSettings.game].toLocaleString()}</strong>
       ${guessList[round - 1].followers == 1 ? "follower" : "followers"}<br>
      ${
        points == 5000
          ? "You nailed the follower count perfectly ✌"
          : `${
              answer == -1
                ? "You did not submit an answer"
                : `Your guess was off by ${overUnder} <span class="${color}">${diff.toLocaleString()}</span> ${diff == 1 ? "follower" : "followers"}`
            }`
      }`;
    }
  }

  //show progress bar and correction for viewers - multi choice controls - streams or clips
  if (gameSettings.game == "viewers" && gameSettings.controls == "choices") {
    let overUnder = answer - guessList[round - 1].viewers > 0 ? `<i class="material-icons notranslate">arrow_upward</i>` : `<i class="material-icons notranslate">arrow_downward</i>`;
    diff = Math.abs(answer - guessList[round - 1].viewers);
    percent = (score / viewersStreak) * 100;

    elements.scoreProgressBarLabel.innerHTML =
      score > viewersStreak
        ? `You beat your high score! Your new highscore is ${score.toLocaleString()}`
        : `${viewersStreak - score + 1} more ${viewersStreak - score + 1 == 1 ? "round" : "rounds"} till you beat your highscore`;
    elements.progress.ariaValueNow = percent;
    elements.progressBar.style.width = `${percent}%`;

    elements.correction.innerHTML = `
      The ${gameSettings.video == "streams" ? "stream" : "clip"} has ${viewersSVG}<strong>${guessList[round - 1].viewers.toLocaleString()}</strong>
       ${guessList[round - 1].viewers == 1 ? `${gameSettings.video == "streams" ? "viewer" : "view"}` : `${gameSettings.video == "streams" ? "viewers" : "views"}`}<br>
      ${
        points == 1
          ? "You nailed the view count perfectly ✌"
          : `${answer == -1 ? "You did not select an answer" : `Your guess was off by ${overUnder} <span class="${color}">${diff.toLocaleString()}</span> ${diff == 1 ? "view" : "views"}`}`
      }`;

    if (points == 0) {
      elements.nextRound.style.display = "none";
      elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
      elements.playAgain.style.display = "";
      elements.gameEndText.style.display = "";

      if (score > viewersStreak) {
        elements.gameEndText.innerHTML += `<br>New High Score!`;
        viewersStreak = score;
        localStorage.setItem("viewersStreak", viewersStreak);
      } else {
        elements.gameEndText.innerHTML += `<br>High Score: ${viewersStreak.toLocaleString()}`;
      }
    }
  }

  //show progress bar and correction for followers game - multi choice controls - streams or clips
  if (gameSettings.game == "followers" && gameSettings.controls == "choices") {
    let overUnder = answer - guessList[round - 1].followers > 0 ? `<i class="material-icons notranslate">arrow_upward</i>` : `<i class="material-icons notranslate">arrow_downward</i>`;
    diff = Math.abs(answer - guessList[round - 1].followers);
    percent = (score / followersStreak) * 100;

    elements.scoreProgressBarLabel.innerHTML =
      score > followersStreak
        ? `You beat your high score! Your new highscore is ${score.toLocaleString()}`
        : `${followersStreak - score + 1} more ${followersStreak - score + 1 == 1 ? "round" : "rounds"} till you beat your highscore`;
    elements.progress.ariaValueNow = percent;
    elements.progressBar.style.width = `${percent}%`;

    elements.correction.innerHTML = `The stream has ${followSVG}<strong>${guessList[round - 1].followers.toLocaleString()}</strong> ${
      guessList[round - 1].followers == 1 ? "follower" : "followers"
    }<br>
      ${
        points == 1
          ? "You nailed the follower count perfectly ✌"
          : `${
              answer == -1
                ? "You did not select an answer"
                : `Your guess was off by ${overUnder} <span class="${color}">${diff.toLocaleString()}</span> ${diff == 1 ? "follower" : "followers"}`
            }`
      }`;

    if (points == 0) {
      elements.nextRound.style.display = "none";
      elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
      elements.playAgain.style.display = "";
      elements.gameEndText.style.display = "";

      if (score > followersStreak) {
        elements.gameEndText.innerHTML += `<br>New High Score!`;
        followersStreak = score;
        localStorage.setItem("followersStreak", followersStreak);
      } else {
        elements.gameEndText.innerHTML += `<br>High Score: ${followersStreak.toLocaleString()}`;
      }
    }
  }

  //show progress bar and correction for gamename game - multi choice controls - streams or clips
  if (gameSettings.game == "gamename") {
    percent = (score / gameStreak) * 100;

    elements.scoreProgressBarLabel.innerHTML =
      score > gameStreak
        ? `You beat your high score! Your new highscore is ${score}`
        : `${gameStreak - score + 1} more ${gameStreak - score + 1 == 1 ? "round" : "rounds"} till you beat your highscore`;
    elements.progress.ariaValueNow = percent;
    elements.progressBar.style.width = `${percent}%`;

    elements.correction.innerHTML = `The streamer was playing <strong>${guessList[round - 1].game_name}</strong><br>
    ${points == 1 ? "You guessed the game correctly ✌" : `${answer == -1 ? "You did not select an answer" : `Your guess was <span class="${color}">${elements.gameInput.value}</span>`}`}`;

    if (points == 0) {
      elements.nextRound.style.display = "none";
      elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
      elements.playAgain.style.display = "";
      elements.gameEndText.style.display = "";

      if (score > gameStreak) {
        elements.gameEndText.innerHTML += `<br>New High Score!`;
        gameStreak = score;
        localStorage.setItem("gameStreak", gameStreak);
      } else {
        elements.gameEndText.innerHTML += `<br>High Score: ${gameStreak.toLocaleString()}`;
      }
    }
  }

  //show progress bar and correction for emote mode - multi choice controls - streams or clips
  if (gameSettings.game == "emote") {
    let emote = elements[`multiChoice${choice}`].dataset.emote;

    percent = (score / emoteStreak) * 100;

    elements.scoreProgressBarLabel.innerHTML =
      score > emoteStreak
        ? `You beat your high score! Your new highscore is ${score}`
        : `${emoteStreak - score + 1} more ${emoteStreak - score + 1 == 1 ? "round" : "rounds"} till you beat your highscore`;
    elements.progress.ariaValueNow = percent;
    elements.progressBar.style.width = `${percent}%`;

    elements.correction.innerHTML = `The streamer's emote was <img style="height: 56px;" 
    src="https://static-cdn.jtvnw.net/emoticons/v2/${guessList[round - 1].emote}/default/dark/3.0" alt="emote"><br>
    ${
      points == 1
        ? "You guessed the emote correctly ✌"
        : `${
            answer == -1
              ? "You did not select an asnwer"
              : `Your guess was <img style="height: 56px;" 
              src="https://static-cdn.jtvnw.net/emoticons/v2/${emote}/default/dark/3.0" alt="emote">`
          }`
    }`;

    if (points == 0) {
      elements.nextRound.style.display = "none";
      elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
      elements.playAgain.style.display = "";
      elements.gameEndText.style.display = "";

      if (score > emoteStreak) {
        elements.gameEndText.innerHTML += `<br>New High Score!`;
        emoteStreak = score;
        localStorage.setItem("emoteStreak", emoteStreak);
      } else {
        elements.gameEndText.innerHTML += `<br>High Score: ${emoteStreak.toLocaleString()}`;
      }
    }
  }

  //show progress bar and correction for viewers or followers mode - higherlower controls - streams or clips
  if ((gameSettings.game == "viewers" || gameSettings.game == "followers") && gameSettings.controls == "higherlower") {
    let streak = gameSettings.game == "viewers" ? viewersHigherlowerStreak : followersHigherlowerStreak;
    percent = (score / streak) * 100;
    elements.scoreProgressBarLabel.innerHTML =
      score > streak ? `You beat your high score! Your new highscore is ${score}` : `${streak - score + 1} more ${streak - score + 1 == 1 ? "round" : "rounds"} till you beat your highscore`;
    elements.progress.ariaValueNow = percent;
    elements.progressBar.style.width = `${percent}%`;

    elements.correction.innerHTML = `The ${gameSettings.video == "streams" ? "channel" : "clips"} has ${gameSettings.game == "viewers" ? viewersSVG : followSVG}<strong>${guessList[
      round - 1
    ][gameSettings.game].toLocaleString()}</strong> ${
      gameSettings.game == "viewers" ? `${guessList[round - 1][gameSettings.game] == 1 ? "viewer" : "viewers"}` : `${guessList[round - 1][gameSettings.game] == 1 ? "follower" : "followers"}`
    }${guessList[round - 1][gameSettings.game] == previousNumber ? " (same as previous channel!)" : ""}<br>
    ${
      points == 1
        ? `The ${gameSettings.video == "streams" ? "stream" : "clip"} has a ${choice} ${gameSettings.game == "viewers" ? "view count" : "follow count"}!`
        : `${
            answer == -1
              ? "You did not select an answer"
              : `The previous ${gameSettings.video == "streams" ? "channel" : "clips"} had ${previousNumber.toLocaleString()} ${gameSettings.game}`
          }`
    }`;

    previousNumber = guessList[round - 1][gameSettings.game]; //set now for next round

    if (points == 0) {
      elements.nextRound.style.display = "none";
      elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
      elements.playAgain.style.display = "";
      elements.gameEndText.style.display = "";
      if (score > streak) {
        elements.gameEndText.innerHTML += `<br>New High Score!`;
        gameSettings.game == "viewers" ? (viewersHigherlowerStreak = score) : (followersHigherlowerStreak = score);
        localStorage.setItem(gameSettings.game == "viewers" ? "viewersHigherlowerStreak" : "followersHigherlowerStreak", score);
      } else {
        elements.gameEndText.innerHTML += `<br>High Score: ${score.toLocaleString()}`;
      }
    }
  }

  //update streamers score on the lb and then update all viewers scores
  if (gameSettings.chat) {
    let username = elements.channelName.value.replace(/\s+/g, "").toLowerCase();
    let pos = chatters.map((e) => e.username).indexOf(username);
    if (pos === -1) {
      chatters.push({
        username: username,
        score: points,
        round: points,
        lastGuess: round,
        color: "#FFFFFF",
      });
    } else {
      chatters[pos].score += points;
      chatters[pos].round = points;
      chatters[pos].lastGuess = round;
    }
    updateLeaderboard();
  }

  //multi choice and text and higherlower controls are endless so return and dont end game
  if (round == 5 && (gameSettings.controls == "choices" || gameSettings.controls == "text" || gameSettings.controls == "higherlower")) {
    return;
  }

  //end game if game on 5th round and mode is viewers
  if (round == 5 && gameSettings.game == "viewers") {
    elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
    if (score > viewersHS) {
      elements.gameEndText.innerHTML += `<br>New High Score!`;
      viewersHS = score;
      localStorage.setItem("viewersHS", viewersHS);
    } else {
      elements.gameEndText.innerHTML += `<br>High Score: ${viewersHS.toLocaleString()}`;
    }
    elements.nextRound.style.display = "none";
    elements.playAgain.style.display = "";
    elements.gameEndText.style.display = "";
  }
  //end game if game on 5th round and mode is followers
  if (round == 5 && gameSettings.game == "followers") {
    elements.gameEndText.innerHTML = `Final Score: ${score.toLocaleString()}`;
    if (score > followersHS) {
      elements.gameEndText.innerHTML += `<br>New High Score!`;
      followersHS = score;
      localStorage.setItem("followersHS", followersHS);
    } else {
      elements.gameEndText.innerHTML += `<br>High Score: ${followersHS.toLocaleString()}`;
    }
    elements.nextRound.style.display = "none";
    elements.playAgain.style.display = "";
    elements.gameEndText.style.display = "";
  }
} //guess

function calculateScore(answer) {
  let points = 0;
  let percent = 0;
  let diff = 0;
  let color;

  //check emote mode answer
  if (gameSettings.game == "emote") {
    if (answer == guessList[round - 1].userid) {
      points = 1;
    } else {
      points = 0;
    }
  }

  //calculate score for viewers mode - streams or clips- slider controls
  if (gameSettings.game == "viewers" && gameSettings.controls == "slider") {
    //get max view count of current game
    let roundMax = Math.max(...guessList.slice(0, 5).map((o) => o.viewers || 0));
    //get scaled decay between 200 and 3000
    let decay = (guessList[round - 1].viewers / roundMax) * (3000 - 200) + 200;
    diff = Math.abs(answer - guessList[round - 1].viewers);
    points = Math.round(5000 * Math.exp(-diff / decay));
    percent = Math.round((points / 5000) * 100);
  }

  //calculate score for followers mode - streams or clips - slider controls
  if (gameSettings.game == "followers" && gameSettings.controls == "slider") {
    //get max follow count for current game
    let roundMax = Math.max(...guessList.slice(0, 5).map((o) => o.followers || 0));
    //get scaled decay between 10000 and 300000
    let decay = (guessList[round - 1].followers / roundMax) * (300000 - 10000) + 10000;
    diff = Math.abs(answer - guessList[round - 1].followers);
    points = Math.round(5000 * Math.exp(-diff / decay));
    percent = Math.round((points / 5000) * 100);
  }

  //check if answer is corrent for multi choice controls - viewers or followers game - streams or clips
  if (gameSettings.controls == "choices" && (gameSettings.game == "viewers" || gameSettings.game == "followers")) {
    if (answer == guessList[round - 1][gameSettings.game]) {
      points = 1;
    } else {
      points = 0;
    }
  }

  //check if answer is corrent for higherlower controls - viewers or followers game - streams or clips
  if (gameSettings.controls == "higherlower" && (gameSettings.game == "viewers" || gameSettings.game == "followers")) {
    if ((answer == "higher" && guessList[round - 1][gameSettings.game] >= previousNumber) || (answer == "lower" && guessList[round - 1][gameSettings.game] <= previousNumber)) {
      points = 1;
    } else {
      points = 0;
    }
  }

  //get points for game guesser mode
  if (gameSettings.game == "gamename") {
    if (answer == guessList[round - 1].game_name.replace(/\s+/g, "").toLowerCase()) {
      points = 1;
    } else {
      points = 0;
    }
  }

  //guess() was called by timer and user did not provide an answer so give user 0 points
  if (answer == -1) {
    points = 0;
    percent = 0;
  }

  //get color class name for correction text
  if (points >= 4500) {
    color = "text-success";
  } else if (points < 4500 && points >= 2000) {
    color = "text-warning";
  } else if (points < 2000) {
    color = "text-danger";
  }

  return { points: points, percent: percent, diff: diff, color: color };
} //calculateScore

function reset() {
  stopTimer();
  guessList = [];
  elements.round.innerHTML = `Round <br />1/5`;
  elements.score.innerHTML = `Score <br />0`;
  elements.scoreDiv.style.display = "none";
  elements.sliderDiv.style.display = "none";
  elements.multiChoiceDiv.style.display = "none";
  elements.gameNameDiv.style.display = "none";
  elements.higherlowerDiv.style.display = "none";
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

  channelBadges = { subscriber: [], bits: [] };
  globalBadges = {};

  round = 0;
  score = 0;
  player = null;
  roundActive = false;
  if (client) {
    client.disconnect();
    client = null;
  }
  elements.twitchEmbed.innerHTML = `<div class="card mt-5" id="welcomeCard">
  <div class="card-header"><img src="/pics/guessr.png" alt="logo" style="height: 24px; width: 24px" class="d-inline-block align-top" /> Guessr.tv</div>
  <div class="card-body">
    <div class="container-fluid">
      <div class="row mb-3">
        <div class="card game-card cursor-pointer" onclick="showSettings('viewers')">
          <div class="card-body">
            <h2>
              Viewers
              <svg class="viewers-svg" width="48px" height="48px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
                <g>
                  <path
                    fill-rule="evenodd"
                    d="M5 7a5 5 0 116.192 4.857A2 2 0 0013 13h1a3 3 0 013 3v2h-2v-2a1 1 0 00-1-1h-1a3.99 3.99 0 01-3-1.354A3.99 3.99 0 017 15H6a1 1 0 00-1 1v2H3v-2a3 3 0 013-3h1a2 2 0 001.808-1.143A5.002 5.002 0 015 7zm5 3a3 3 0 110-6 3 3 0 010 6z"
                    clip-rule="evenodd"
                  ></path>
                </g>
              </svg>
            </h2>
            <div class="hidden">
              A random Twitch streamer will be shown and you will have to guess how many viewers they have. The closer you are to the target view count the more points you'll
              earn.
            </div>
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="card game-card cursor-pointer" onclick="showSettings('followers')">
          <div class="card-body">
            <h2>
              Followers
              <svg type="color-fill-current" width="48px" height="48px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="follow-svg">
                <g>
                  <path
                    fill-rule="evenodd"
                    d="M9.171 4.171A4 4 0 006.343 3H6a4 4 0 00-4 4v.343a4 4 0 001.172 2.829L10 17l6.828-6.828A4 4 0 0018 7.343V7a4 4 0 00-4-4h-.343a4 4 0 00-2.829 1.172L10 5l-.829-.829zm.829 10l5.414-5.414A2 2 0 0016 7.343V7a2 2 0 00-2-2h-.343a2 2 0 00-1.414.586L10 7.828 7.757 5.586A2 2 0 006.343 5H6a2 2 0 00-2 2v.343a2 2 0 00.586 1.414L10 14.172z"
                    clip-rule="evenodd"
                  ></path>
                </g>
              </svg>
            </h2>
            <div class="hidden">Same as the above but you'll be guessing how many followers the random streamers have.</div>
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="card game-card cursor-pointer" onclick="showSettings('gamename')">
          <div class="card-body">
            <h2>
              Game
              <i class="material-icons notranslate mp-icon">sports_esports</i>
            </h2>
            <div class="hidden">You will be shown a random Twitch stream and you will have to guess what game they are playing.</div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="card game-card cursor-pointer" onclick="showSettings('emote')">
          <div class="card-body">
            <h2>
              Emote
              <i class="material-icons notranslate mp-icon">emoji_emotions</i>
            </h2>
            <div class="hidden">You will be shown a random Twitch stream and you will have to guess which emote belongs to them.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
} //reset

function showToast(msg, type, timeout) {
  let id = Date.now();
  let toast = `<div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert" data-bs-autohide="false" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
      <div class="toast-body" style="font-size:1.2em">${msg}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      </div>`;
  elements.toastContainer.innerHTML += toast;
  let toastElList = [].slice.call(document.querySelectorAll(".toast"));
  let toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl, {
      animation: false,
    });
  });
  toastList[toastList.length - 1].show();
  //dismiss this way bcz built in dismiss wont work if there are multiple toasts FeelsDankMan
  setTimeout(function () {
    toastList[toastList.length - 1].hide();
    document.getElementById(id).remove();
  }, timeout);
} //showToast

async function showSettings(game) {
  gameSettings.game = game;

  //hide controls selector if game does not support it
  if (game == "viewers" || game == "followers") {
    elements.controlsTypeDiv.style.display = "";
  } else {
    elements.controlsTypeDiv.style.display = "none";
  }

  //update controlsDesc
  if (gameSettings.controls == "higherlower") {
    elements.controlsDesc.innerHTML = `You will have to guess if the current stream has a higher or lower ${
      game == "followers" ? "follow" : "view"
    } count than the previous one  - Keep playing till you get a wrong answer`;
  }
  if (gameSettings.controls == "slider") {
    elements.controlsDesc.innerHTML = `You will have to guess the exact ${
      gameSettings.game == "followers" ? "follow" : "view"
    } count - 5 rounds - 5,000 points per round based on how close you are to the correct number`;
  }

  //add disclaimer
  elements.disclaimer.style.display = "";
  switch (game) {
    case "viewers":
      elements.disclaimer.innerHTML = "The answer will not always be the same as the view count seen on the stream because the API does not update as fast";
      break;
    case "gamename":
      elements.disclaimer.innerHTML = "Some streamers could forget to update their category or set it incorrectly, expect to be Jebaited :)";
      break;
    case "emote":
      elements.disclaimer.innerHTML = `Some channels might not have any emotes, in that case <img src="https://static-cdn.jtvnw.net/emoticons/v2/120232/default/dark/3.0" alt="TriHard" title="TriHard" width=28> will be added as a placeholder `;
      break;
    default:
      elements.disclaimer.style.display = "none";
  }

  gameSettingsModal.show();
} //showSettings

async function getSettings() {
  elements.getSettingsButton.innerHTML = spinner;
  elements.getSettingsButton.disabled = true;

  gameSettings.video = document.querySelector('input[name="videoTypeSelect"]:checked').value || "streams";
  gameSettings.collection = elements.clipCollection.value || "random";
  gameSettings.controls = document.querySelector('input[name="controlsSelect"]:checked').value || "slider";

  if (gameSettings.game == "gamename" && gameSettings.collection == "hottub" && gameSettings.video == "clips") {
    showToast("Hmmm today I'll pick game guessr mode then pick a clip collection that has 1 category only 🤙", "info", 5000);
    reset();
    return;
  }
  if (gameSettings.game == "emote" && gameSettings.collection == "forsen" && gameSettings.video == "clips") {
    showToast("Hmmm today I'll pick emote guessr mode then pick a clip collection that has 1 channel only 🤙", "info", 5000);
    reset();
    return;
  }
  if (gameSettings.game == "followers" && gameSettings.collection == "forsen" && gameSettings.video == "clips") {
    showToast("Hmmm today I'll pick followers mode then pick a clip collection that has 1 channel only 🤙", "info", 5000);
    reset();
    return;
  }

  //update chat hint based on mode
  switch (gameSettings.game) {
    case "gamename":
      elements.chatHint.innerHTML = `Type <kbd class="notranslate">!guess [game name]</kbd> in chat to guess`;
      break;
    case "emote":
      elements.chatHint.innerHTML = "Type an emote's letter (a/b/c/d/e) in chat to guess";
      break;
    default:
      elements.chatHint.innerHTML = "Type a number in chat to guess";
      break;
  }
  if (gameSettings.controls == "higherlower" && (gameSettings.game == "viewers" || gameSettings.game == "followers")) {
    elements.chatHint.innerHTML = `Type <kbd class="notranslate">higher</kbd> or <kbd class="notranslate">lower</kbd> in chat to guess`;
  }

  channelName = elements.channelName.value.replace(/\s+/g, "").toLowerCase();
  if (channelName) {
    localStorage.setItem("channelName", channelName);
    gameSettings.chat = true;
    connectChat();
    channelBadges = await getChannelBadges(channelName);
    globalBadges = await getGlobalBadges();
  } else {
    localStorage.setItem("channelName", "");
    gameSettings.chat = false;
  }

  if (gameSettings.video == "streams") {
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

    if (gameSettings.controls !== "higherlower" && (gameSettings.game == "viewers" || gameSettings.game == "followers")) {
      let answer = parseAnswer(input[0]);
      if (answer === null || answer === undefined || answer === "" || answer < 0) {
        return;
      }
      results = calculateScore(answer);
    }

    if (gameSettings.controls == "higherlower" && (gameSettings.game == "viewers" || gameSettings.game == "followers")) {
      if (input[0]?.toLowerCase() !== "higher" && input[0]?.toLowerCase() !== "lower") {
        return;
      }
      results = calculateScore(input[0].toLowerCase());
    }

    if (gameSettings.game == "gamename") {
      if (input[0]?.toLowerCase() !== "!guess") {
        return;
      }
      results = calculateScore(input.slice(1).join("").replace(/\s+/g, "").toLowerCase());
    }

    if (gameSettings.game == "emote") {
      if (!emoteChoices.hasOwnProperty(input[0]?.toLowerCase())) {
        return;
      }
      let answer = parseInt(elements[`multiChoice${emoteChoices[input[0].toLowerCase()]}`].dataset.answer, 10);
      results = calculateScore(answer);
    }

    let pos = chatters.map((e) => e.username).indexOf(context.username);
    //set points to 😵 to eliminate chatter if they get first answer wrong
    if ((gameSettings.controls == "choices" || gameSettings.controls == "higherlower" || gameSettings.game == "gamename") && results.points == 0) {
      results.points = "😵";
    }
    if (pos === -1) {
      //add the chatter to the array if they are not already in
      chatters.push({
        username: context.username,
        score: results.points,
        round: results.points,
        lastGuess: round,
        color: context.color,
        badges: context.badges,
      });
      //add chatter to the top of the leaderboard if 1st round or at the end otherwise
      elements.leaderboardList.insertAdjacentHTML(
        `${round == 1 ? "afterbegin" : "beforeend"}`,
        `<li class="list-group-item"><span>🔵</span><span style="color:${context.color || "#FFFFFF"};">${addBadges(context.badges)} ${context.username}:</span> 🙈</li>`
      );
      if (gameSettings.controls == "slider") {
        //add chatter to the round leaderboard if game uses slider controls
        elements.leaderboardListRound.insertAdjacentHTML(
          `${round == 1 ? "afterbegin" : "beforeend"}`,
          `<li class="list-group-item"><span style="color:${context.color || "#FFFFFF"};">${addBadges(context.badges)} ${context.username}:</span> 🙈</li>`
        );
      }
    } else if (chatters[pos].lastGuess < round && chatters[pos].score != "😵") {
      //chatter is already in the array so check if they already guessed this round and are not eliminated
      if (gameSettings.controls == "choices" || gameSettings.controls == "higherlower" || gameSettings.game == "gamename") {
        //if the game has multi choice controls increment the score by 1
        chatters[pos].score++;
        if (results.points == "😵") {
          //if chatter got the answer wrong set score to 😵 to eliminate them
          chatters[pos].score = "😵";
        }
      } else {
        //if the game has slider controls add the points to the total score
        chatters[pos].score += results.points;
        chatters[pos].round = results.points;
      }
      chatters[pos].lastGuess = round;
      document.getElementById(`${context.username}_dot`).style.visibility = "visible";
      if (gameSettings.controls == "slider") {
        //add chatter to the round leaderboard if game uses slider controls
        elements.leaderboardListRound.insertAdjacentHTML(
          `${round == 1 ? "afterbegin" : "beforeend"}`,
          `<li class="list-group-item"><span style="color:${context.color || "#FFFFFF"};">${addBadges(context.badges)} ${context.username}:</span> 🙈</li>`
        );
      }
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

function isInt(value) {
  if (isNaN(value)) {
    return false;
  }
  let x = parseFloat(value);
  return (x | 0) === x;
} //inInt

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
    guess(null, true);
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
  if (gameSettings.controls == "slider") {
    //if game uses a slider then show the total standings/round results tabs in the leaderboard
    elements.leaderboardTabs.style.display = "";
  } else {
    //if game uses any other controls then hide the tabs and switch to total tab
    elements.leaderboardTabs.style.display = "none";
    totalTab.show();
  }
} //showLeaderboard

function updateLeaderboard() {
  let username = elements.channelName.value.replace(/\s+/g, "").toLowerCase();
  //sort and parse the scores so 😵 get set to 0 and get put at the bottom
  chatters.sort((a, b) => (parseInt(b.score, 10) || 0) - (parseInt(a.score, 10) || 0));
  let list = "";
  for (let index = 0; index < chatters.length; index++) {
    if (chatters[index].lastGuess < round && (gameSettings.controls == "choices" || gameSettings.controls == "higherlower" || gameSettings.game == "gamename")) {
      //eliminate chatter if they did not answer this round if the game has multi choice controls
      chatters[index].score = "😵";
    }
    list += `<li class="list-group-item ${username == chatters[index].username ? "bg-primary" : ""}">
    <span id="${chatters[index].username}_dot" style="visibility: hidden">🔵</span>
    <span style="color:${chatters[index].color || "#FFFFFF"};">${addBadges(chatters[index].badges)} ${chatters[index].username}:</span> 
    ${chatters[index].score.toLocaleString()}</li>`;
  }
  elements.leaderboardList.innerHTML = list;

  //if game uses slider controls then update round leaderboard
  if (gameSettings.controls == "slider") {
    chatters.sort((a, b) => (parseInt(b.round, 10) || 0) - (parseInt(a.round, 10) || 0));
    let list = "";
    for (let index = 0; index < chatters.length; index++) {
      if (chatters[index].lastGuess < round) {
        //skip chatters that didn't play this round
        continue;
      }
      list += `<li class="list-group-item ${username == chatters[index].username ? "bg-primary" : ""}">
      <span style="color:${chatters[index].color || "#FFFFFF"};">${addBadges(chatters[index].badges)} ${chatters[index].username}:</span> 
      ${chatters[index].round.toLocaleString()}</li>`;
    }
    elements.leaderboardListRound.innerHTML = list;
  }
} //updateLeaderboard

function addBadges(badges) {
  try {
    let badgesHTML = "";
    for (const badge in badges) {
      if (badge == "subscriber" && badges.subscriber && channelBadges.subscriber.length > 0) {
        let badge = channelBadges.subscriber.find((obj) => obj.id === badges.subscriber);
        badgesHTML += `<img src="${badge.url}" style="height:1.3em;" title="Subscriber"/>`;
      } else if (badge == "bits" && channelBadges.bits.length > 0) {
        let badge = channelBadges.bits.find((obj) => obj.id === badges.bits);
        badgesHTML += `<img src="${badge.url}" style="height:1.3em;" title="Bits"/>`;
      } else if (Object.keys(globalBadges).length > 0) {
        let version = globalBadges[badge].find((obj) => obj.id === badges[badge]);
        badgesHTML += `<img src="${version.image_url_4x}" style="height:1.3em;" title="${badge}"/>`;
      }
    }
    return badgesHTML;
  } catch (error) {
    console.log(error);
    return "";
  }
} //addBadges

async function getChannelBadges(username) {
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch(`https://api.okayeg.com/emotes?channel=${username}`, requestOptions);
      let result = await response.json();
      if (!result.data.badges || result.data.badges.length == 0) {
        resolve({ subscriber: [], bits: [] });
      }
      let badges = { subscriber: [], bits: [] };
      if (result.data.badges.length > 0) {
        let subBadges = [];
        let bitBadges = [];
        if (result.data.badges[0]) {
          if (result.data.badges[0].set_id == "subscriber") {
            subBadges = result.data.badges[0].versions;
          }
          if (result.data.badges[0].set_id == "bits") {
            bitBadges = result.data.badges[0].versions;
          }
        }
        if (result.data.badges[1]) {
          if (result.data.badges[1].set_id == "subscriber") {
            subBadges = result.data.badges[1].versions;
          }
          if (result.data.badges[1].set_id == "bits") {
            bitBadges = result.data.badges[1].versions;
          }
        }
        for (let index = 0, j = subBadges.length; index < j; index++) {
          badges.subscriber.push({ id: subBadges[index].id, url: subBadges[index].image_url_4x });
        }
        for (let index = 0, j = bitBadges.length; index < j; index++) {
          badges.bits.push({ id: bitBadges[index].id, url: bitBadges[index].image_url_4x });
        }
        resolve(badges);
      }
    } catch (error) {
      console.log("getChannelBadges error", error);
      resolve({ subscriber: [], bits: [] });
    }
  });
} //getChannelBadges

async function getGlobalBadges() {
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch(`https://api.okayeg.com/badges/global`, requestOptions);
      let result = await response.json();
      if (!result.data || result.data.length == 0) {
        resolve({});
      }
      if (result.data.length > 0) {
        let badges = {};
        for (let index = 0, j = result.data.length; index < j; index++) {
          badges[result.data[index].set_id] = result.data[index].versions;
        }
        resolve(badges);
      }
    } catch (error) {
      console.log("getGlobalBadges error", error);
      resolve({});
    }
  });
} //getGlobalBadges

async function sendUsername() {
  let body = JSON.stringify({ site: `guessr.tv`, channel: channelName, platform: "twitch" });
  let requestOptionsPost = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body,
    redirect: "follow",
  };
  try {
    let response = await fetch(`https://helper.pepega.workers.dev/log/username`, requestOptionsPost);
    console.log("sendUsername response", response.status);
    usernameSent = true;
  } catch (error) {
    console.log("sendUsername error", error);
  }
} //sendUsername

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
} //shuffleArray

function enableTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
} //enableTooltips

window.onload = async function () {
  seenChannels = JSON.parse(localStorage.getItem("seenChannels")) || [];
  elements.seenChannels.innerHTML = seenChannels.length;
  seenClips = JSON.parse(localStorage.getItem("seenClips")) || [];
  elements.seenClips.innerHTML = seenClips.length;
  viewersHS = parseInt(localStorage.getItem("viewersHS"), 10) || 0;
  followersHS = parseInt(localStorage.getItem("followersHS"), 10) || 0;
  viewersStreak = parseInt(localStorage.getItem("viewersStreak"), 10) || 0;
  followersStreak = parseInt(localStorage.getItem("followersStreak"), 10) || 0;
  gameStreak = parseInt(localStorage.getItem("gameStreak"), 10) || 0;
  emoteStreak = parseInt(localStorage.getItem("emoteStreak"), 10) || 0;
  viewersHigherlowerStreak = parseInt(localStorage.getItem("viewersHigherlowerStreak"), 10) || 0;
  followersHigherlowerStreak = parseInt(localStorage.getItem("followersHigherlowerStreak"), 10) || 0;
  channelName = localStorage.getItem("channelName") || "";
  elements.channelName.value = channelName;

  elements.viewersHS.innerHTML = viewersHS.toLocaleString();
  elements.followersHS.innerHTML = followersHS.toLocaleString();
  elements.viewersStreak.innerHTML = viewersStreak.toLocaleString();
  elements.followersStreak.innerHTML = followersStreak.toLocaleString();
  elements.gameStreak.innerHTML = gameStreak.toLocaleString();
  elements.emoteStreak.innerHTML = emoteStreak.toLocaleString();
  elements.viewersHigherlowerStreak.innerHTML = viewersHigherlowerStreak.toLocaleString();
  elements.followersHigherlowerStreak.innerHTML = followersHigherlowerStreak.toLocaleString();

  gameSettingsModal = new bootstrap.Modal(elements.gameSettingsModal);

  totalTab = new bootstrap.Tab(elements.totalTab);
  roundTab = new bootstrap.Tab(elements.roundTab);

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

  elements.sliderControls.onchange = function () {
    if (this.checked) {
      gameSettings.controls = "slider";
      elements.controlsDesc.innerHTML = `You will have to guess the exact ${
        gameSettings.game == "followers" ? "follow" : "view"
      } count - 5 rounds - 5,000 points per round based on how close you are to the correct number`;
    }
  };
  elements.choicesControls.onchange = function () {
    if (this.checked) {
      gameSettings.controls = "choices";
      elements.controlsDesc.innerHTML = "You will be given 5 options and you will have to pick 1 of them - Keep playing till you get a wrong answer";
    }
  };
  elements.higherlowerControls.onchange = function () {
    if (this.checked) {
      gameSettings.controls = "higherlower";
      elements.controlsDesc.innerHTML = `You will have to guess if the current stream has a higher or lower ${
        gameSettings.game == "followers" ? "follow" : "view"
      } count than the previous one  - Keep playing till you get a wrong answer`;
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

  elements.nextRound.onclick = function () {
    localStorage.setItem("seenChannels", JSON.stringify(seenChannels));
    localStorage.setItem("seenClips", JSON.stringify(seenClips));
    nextRound();
  };
  elements.playAgain.onclick = async function () {
    elements.playAgain.disabled = true;
    elements.playAgain.innerHTML = spinner;
    await startGame();
    nextRound();
  };
  elements.reset.onclick = function () {
    reset();
  };

  elements.resetHighScore.onclick = function () {
    localStorage.setItem("viewersHS", 0);
    localStorage.setItem("followersHS", 0);
    viewersHS = 0;
    followersHS = 0;
    elements.viewersHS.innerHTML = 0;
    elements.followersHS.innerHTML = 0;
    showToast("High scores reset", "success", 2000);
  };
  elements.resetMaxStreaks.onclick = function () {
    localStorage.setItem("viewersStreak", 0);
    localStorage.setItem("followersStreak", 0);
    localStorage.setItem("gameStreak", 0);
    localStorage.setItem("emoteStreak", 0);
    localStorage.setItem("viewersHigherlowerStreak", 0);
    localStorage.setItem("followersHigherlowerStreak", 0);
    viewersStreak = 0;
    followersStreak = 0;
    gameStreak = 0;
    emoteStreak = 0;
    viewersHigherlowerStreak = 0;
    followersHigherlowerStreak = 0;
    elements.viewersStreak.innerHTML = 0;
    elements.followersStreak.innerHTML = 0;
    elements.gameStreak.innerHTML = 0;
    elements.emoteStreak.innerHTML = 0;
    elements.viewersHigherlowerStreak.innerHTML = 0;
    elements.followersHigherlowerStreak.innerHTML = 0;
    showToast("High scores reset", "success", 2000);
  };
  elements.resetSeenChannels.onclick = function () {
    localStorage.setItem("seenChannels", JSON.stringify([]));
    seenChannels = [];
    elements.seenChannels.innerHTML = 0;
    showToast("Seen channels reset", "success", 2000);
  };
  elements.resetSeenClips.onclick = function () {
    localStorage.setItem("seenClips", JSON.stringify([]));
    seenClips = [];
    elements.seenClips.innerHTML = 0;
    showToast("Seen clips reset", "success", 2000);
  };

  // document.addEventListener("keydown", async (e) => {
  //   if (gameSettings.game == "viewers" && elements.guessRange.offsetParent) {
  //     if (e.key === "ArrowRight" || e.key === "ArrowUp") {
  //       elements.guessRange.value++;
  //       let value = parseInt(elements.guessRange.value, 10);
  //       elements.guessNumber.value = Math.round(Math.exp((Math.log(max) / 100) * value));
  //       if (value == 0) {
  //         elements.guessNumber.value = 0;
  //       }
  //       return;
  //     }
  //     if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
  //       elements.guessRange.value--;
  //       let value = parseInt(elements.guessRange.value, 10);
  //       elements.guessNumber.value = Math.round(Math.exp((Math.log(max) / 100) * value));
  //       if (value == 0) {
  //         elements.guessNumber.value = 0;
  //       }
  //       return;
  //     }
  //   }

  //   if (elements.guess.offsetParent && e.key === "Enter") {
  //     guess();
  //     return;
  //   }

  //   if (elements.nextRound.offsetParent && e.key === "Enter") {
  //     localStorage.setItem("seenChannels", JSON.stringify(seenChannels));
  //     localStorage.setItem("seenClips", JSON.stringify(seenClips));
  //     nextRound();
  //     return;
  //   }
  //   if (elements.playAgain.offsetParent && e.key === "Enter") {
  //     await startGame();
  //     nextRound();
  //     return;
  //   }
  // });
}; //onload
