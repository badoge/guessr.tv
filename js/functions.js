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

const CLIENT_ID = "ed2ch5dsxogpczmisjnbfnm92n4zps";

const requestOptions = {
  method: "GET",
  redirect: "follow",
};

function addBadges(badges, userid) {
  try {
    let badgesHTML = "";
    for (let index = 0; index < customBadges.length; index++) {
      if (customBadges[index].users.includes(userid) && customBadges[index].sites.includes("guessr.tv")) {
        badgesHTML += `<img src="${customBadges[index].url}" class="chat-badge" title="${customBadges[index].name}"/>`;
      }
    }
    if (badges == "streamer") {
      badgesHTML += `<img src="https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3" class="chat-badge" title="Broadcaster"/>`;
      return badgesHTML;
    }
    for (const badge in badges) {
      if (badge == "subscriber" && badges.subscriber && channelBadges.subscriber.length > 0) {
        let badge = channelBadges.subscriber.find((obj) => obj.id === badges.subscriber);
        badgesHTML += `<img src="${badge.url}" class="chat-badge" title="Subscriber"/>`;
      } else if (badge == "bits" && channelBadges.bits.length > 0) {
        let badge = channelBadges.bits.find((obj) => obj.id === badges.bits);
        badgesHTML += `<img src="${badge.url}" class="chat-badge" title="Bits"/>`;
      } else if (Object.keys(globalBadges).length > 0) {
        let version = globalBadges[badge].find((obj) => obj.id === badges[badge]);
        badgesHTML += `<img src="${version.image_url_4x}" class="chat-badge" title="${badge}"/>`;
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

async function get7TVPFP(userID) {
  if (!userID) {
    return "/pics/donk.png";
  }
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch(`https://7tv.io/v3/users/twitch/${userID}`, requestOptions);
      if (response.status !== 200) {
        resolve("/pics/donk.png");
      }
      let result = await response.json();
      if (!result?.user?.avatar_url) {
        resolve("/pics/donk.png");
      } else {
        resolve(result.user.avatar_url);
      }
    } catch (error) {
      resolve("/pics/donk.png");
      console.log("getprofilepic 7tv error", error);
    }
  });
} //get7TVPFP

async function getTwitchPFP(username, access_token) {
  let myHeaders = new Headers();
  myHeaders.append("client-id", CLIENT_ID);
  myHeaders.append("Authorization", `Bearer ${access_token}`);
  let requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, requestOptions);
      let result = await response.json();
      resolve(result.data[0].profile_image_url);
    } catch (error) {
      resolve("/pics/donk.png");
      console.log("getprofilepic twitch error", error);
    }
  });
} //getTwitchPFP

async function checkToken(access_token) {
  let myHeaders = new Headers();
  myHeaders.append("Authorization", `OAuth ${access_token}`);
  let requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch("https://id.twitch.tv/oauth2/validate", requestOptions);
      if (!response.ok) {
        resolve(false);
      }
      let result = await response.json();
      if (result.expires_in < 600) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (error) {
      console.log("checkToken error", error);
      resolve(false);
    }
  });
} //checkToken

function changeSiteLinkTarget(target) {
  let links = document.getElementsByClassName("site-link");
  for (let index = 0; index < links.length; index++) {
    links[index].setAttribute("target", target);
  }
} //changeSiteLinkTarget
// changeSiteLinkTarget("_self");
// changeSiteLinkTarget("_blank");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
} //shuffleArray

function shuffleArraySeed(array, seed) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  seed = parseInt(seed, 36) || 1;
  let random = function () {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
} //shuffleArraySeed

function checkSimilarity(guess, answer) {
  const distanceMatrix = Array(answer.length + 1)
    .fill(null)
    .map(() => Array(guess.length + 1).fill(null));
  for (let i = 0; i <= guess.length; i++) {
    distanceMatrix[0][i] = i;
  }
  for (let j = 0; j <= answer.length; j++) {
    distanceMatrix[j][0] = j;
  }
  for (let j = 1; j <= answer.length; j++) {
    for (let i = 1; i <= guess.length; i++) {
      const indicator = guess[i - 1] === answer[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(distanceMatrix[j][i - 1] + 1, distanceMatrix[j - 1][i] + 1, distanceMatrix[j - 1][i - 1] + indicator);
    }
  }
  return distanceMatrix[answer.length][guess.length] <= 2;
} //checkSimilarity

function cleanString(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
} //cleanString

function enableTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
} //enableTooltips

function isInt(value) {
  if (isNaN(value)) {
    return false;
  }
  let x = parseFloat(value);
  return (x | 0) === x;
} //inInt

function hasDuplicates(array) {
  return new Set(array).size !== array.length;
} //hasDuplicates

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

async function sendUsername(dank = false) {
  let body = JSON.stringify({ site: `guessr.tv${dank ? " dank" : ""}`, channel: channelName, platform: "twitch" });
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

async function getCustomBadges() {
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch(`https://badges.pepega.workers.dev`, requestOptions);
      let result = await response.json();
      if (!result || result.length == 0) {
        resolve([]);
      }
      resolve(result);
    } catch (error) {
      console.log("getCustomBadges error", error);
      resolve([]);
    }
  });
} //getCustomBadges

async function getChannelId() {
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch(`https://helper.pepega.workers.dev/twitch/users?login=${channelName}`, requestOptions);
      let result = await response.json();
      resolve(result?.data[0]?.id || "");
    } catch (error) {
      console.log("getChannelId error", error);
      resolve("");
    }
  });
} //getChannelId

async function getStreamerColor() {
  return new Promise(async function (resolve, reject) {
    try {
      let response = await fetch(`https://helper.pepega.workers.dev/twitch/chat/color?user_id=${channelId}`, requestOptions);
      let result = await response.json();
      resolve(result?.data[0]?.color || "#FFFFFF");
    } catch (error) {
      console.log("getStreamerColor error", error);
      resolve("#FFFFFF");
    }
  });
} //getStreamerColor

function showConfetti(level) {
  let c, s, d;
  switch (parseInt(level, 10)) {
    case 1:
      c = 100;
      s = 1;
      d = 1000;
      break;
    case 2:
      c = 500;
      s = 2;
      d = 2000;
      break;
    case 3:
      c = 1000;
      s = 3;
      d = 3000;
      break;
    case 4:
      c = 10000;
      s = 5;
      d = 5000;
      break;
    default:
      return;
  }
  confetti.maxCount = c;
  confetti.speed = s;
  confetti.start(d);
} //showConfetti
