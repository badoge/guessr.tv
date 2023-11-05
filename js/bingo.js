const suggestions = [
  "VTuber",
  "Streamer AFK",
  "Over 10,000 viewers",
  "Pet cam",
  "IRL stream",
  "Hottub stream",
  "Watching a movie/TV show",
  "Streamer you follow",
  "Console stream",
  "Speedrunning",
  "Empty chat",
  "Playing Slots",
  "Sleeping during a subathon",
  "Korean dancer",
  "#AD stream",
  "Reacting to videos",
  "Low quality cam",
  "Cam bigger than gameplay",
  "NotLikeThis screen",
  "ASMR stream",
  "1k+ viewers with an inactive chat",
  "Hand cam",
  "Cosplaying",
  "Random gifs in overlay",
  "Driving stream",
  "Esports tournament",
  "Playing an instrument",
  "Subscribers only chat",
  "Room full of RGB lights",
];

const elements = {
  bingoItems: document.querySelectorAll(".bingo-item"),
  randomize: document.querySelectorAll(".bingo-random"),
  board: document.getElementById("board"),
  cells: document.querySelectorAll(".bingo-cell"),
  toastContainer: document.getElementById("toastContainer"),
  twitchEmbed: document.getElementById("twitchEmbed"),
  boardSize: document.getElementById("boardSize"),
  boardOpacity: document.getElementById("boardOpacity"),
  nextStream: document.getElementById("nextStream"),
};

let mainList = [];
let player;
let retryLimit = 0;

async function getMainList() {
  try {
    let response = await fetch(`https://api.okayeg.com/guess`, requestOptions);
    let list = await response.json();
    mainList = list.guess.guess;
  } catch (error) {
    console.log(error);
  }
} //getMainList

async function nextStream() {
  elements.nextStream.disabled = true;
  setTimeout(() => {
    elements.nextStream.disabled = false;
  }, 2000);
  if (mainList.length == 0) {
    showToast("No more channels left on the list, refresh to get a new list", "danger", "3000");
    return;
  }
  if (retryLimit > 5) {
    showToast("Too many retries, something might be wrong :(", "danger", "3000");
    return;
  }
  let channel = mainList.pop();
  //update stream info
  try {
    let response = await fetch(`https://helper.pepega.workers.dev/twitch/streams?user_id=${channel.userid}`, requestOptions);
    let stream = await response.json();
    if (!stream.data[0]) {
      showToast("Channel is offline, getting new channel", "info", 1500);
      retryLimit++;
      return nextStream();
    }
  } catch (error) {
    console.log(error);
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
} //nextStream

function dragElement() {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  //MouseUp occurs when the user releases the mouse button
  const dragMouseUp = () => {
    document.onmouseup = null;
    //onmousemove attribute fires when the pointer is moving while it is over an element.
    document.onmousemove = null;
    elements.board.classList.remove("drag");
  };
  const dragMouseMove = (event) => {
    event.preventDefault();
    //clientX property returns the horizontal coordinate of the mouse pointer
    pos1 = pos3 - event.clientX;
    //clientY property returns the vertical coordinate of the mouse pointer
    pos2 = pos4 - event.clientY;
    pos3 = event.clientX;
    pos4 = event.clientY;
    //offsetTop property returns the top position relative to the parent
    elements.board.style.top = `${elements.board.offsetTop - pos2}px`;
    elements.board.style.left = `${elements.board.offsetLeft - pos1}px`;
  };

  elements.board.onmousedown = (event) => {
    if (event.target.classList.contains("bingo-cell") || event.target.classList.contains("material-icons")) {
      return;
    }
    event.preventDefault();
    pos3 = event.clientX;
    pos4 = event.clientY;
    elements.board.classList.add("drag");
    document.onmouseup = dragMouseUp;
    document.onmousemove = dragMouseMove;
  };
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

function bingoSave() {
  const itemValues = shuffleArray([...elements.bingoItems].map((x) => x.value));

  for (let index = 0; index < elements.cells.length; index++) {
    elements.cells[index].innerText = itemValues[index];
    elements.cells[index].title = itemValues[index];
  }
} //bingoSave

window.onload = async function () {
  for (let index = 0; index < elements.cells.length; index++) {
    elements.cells[index].onclick = (event) => {
      event.target.classList.toggle("filled");
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

  await getMainList();
  shuffleArray(mainList);
  nextStream();
}; //onload
