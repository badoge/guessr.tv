const elements = {
  toastContainer: document.getElementById("toastContainer"),
  loginExpiredModal: document.getElementById("loginExpiredModal"),
  loginButton: document.getElementById("loginButton"),
  loginInfo: document.getElementById("loginInfo"),
  username: document.getElementById("username"),
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
  elements.loginInfoPFP.src = "https://guessr.tv/pics/donk.png";
} //logout

function loadInfo() {
  TWITCH = JSON.parse(localStorage.getItem("TWITCH"));
  elements.loginButton.style.display = "none";
  elements.loginInfo.style.display = "";
  elements.username.innerText = `Playing as ${TWITCH.channel}`;
  loadPFP();
  elements.board.classList.remove("blur");
  join();

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
