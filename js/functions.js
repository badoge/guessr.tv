const viewersSVG = `<svg class="viewers-svg" width="24px" height="24px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
<g>
  <path
    fill-rule="evenodd"
    d="M5 7a5 5 0 116.192 4.857A2 2 0 0013 13h1a3 3 0 013 3v2h-2v-2a1 1 0 00-1-1h-1a3.99 3.99 0 01-3-1.354A3.99 3.99 0 017 15H6a1 1 0 00-1 1v2H3v-2a3 3 0 013-3h1a2 2 0 001.808-1.143A5.002 5.002 0 015 7zm5 3a3 3 0 110-6 3 3 0 010 6z"
    clip-rule="evenodd"
  ></path>
</g>
</svg>`;

const spinner = `<div class="spinner-border" role="status">
<span class="visually-hidden">Loading...</span>
</div>`;

const CLIENT_ID = "ed2ch5dsxogpczmisjnbfnm92n4zps";

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

async function getTwitchUserId(username) {
  try {
    let response = await fetch(`https://helper.donk.workers.dev/twitch/users?login=${username}`);
    let result = await response.json();
    if (!result?.data || !result?.data[0]?.id) {
      return null;
    }
    return result.data[0].id;
  } catch (error) {
    console.log("getTwitchUserId error", error);
    return null;
  }
} //getTwitchUserId

async function getChannelBadges(username) {
  try {
    let twitchUserId = await getTwitchUserId(username);
    if (!twitchUserId) {
      return { subscriber: [], bits: [] };
    }
    let response = await fetch(`https://helper.donk.workers.dev/twitch/chat/badges?broadcaster_id=${twitchUserId}`);
    let result = await response.json();
    if (!result?.data || result?.data?.length < 1) {
      return { subscriber: [], bits: [] };
    }
    let badges = { subscriber: [], bits: [] };
    let subBadges = [];
    let bitBadges = [];
    if (result?.data[0]?.versions?.length > 0) {
      if (result.data[0].set_id == "subscriber") {
        subBadges = result.data[0].versions;
      }
      if (result.data[0].set_id == "bits") {
        bitBadges = result.data[0].versions;
      }
    }
    if (result?.data[1]?.versions?.length > 0) {
      if (result.data[1].set_id == "subscriber") {
        subBadges = result.data[1].versions;
      }
      if (result.data[1].set_id == "bits") {
        bitBadges = result.data[1].versions;
      }
    }
    for (let index = 0, j = subBadges.length; index < j; index++) {
      badges.subscriber.push({ id: subBadges[index].id, url: subBadges[index].image_url_4x });
    }
    for (let index = 0, j = bitBadges.length; index < j; index++) {
      badges.bits.push({ id: bitBadges[index].id, url: bitBadges[index].image_url_4x });
    }
    return badges;
  } catch (error) {
    console.log("getChannelBadges error", error);
    return { subscriber: [], bits: [] };
  }
} //getChannelBadges

async function getGlobalBadges() {
  try {
    let response = await fetch(`https://helper.donk.workers.dev/twitch/chat/badges/global`);
    let result = await response.json();
    if (!result.data || result.data.length == 0) {
      return {};
    }
    if (result.data.length > 0) {
      let badges = {};
      for (let index = 0, j = result.data.length; index < j; index++) {
        badges[result.data[index].set_id] = result.data[index].versions;
      }
      return badges;
    }
  } catch (error) {
    console.log("getGlobalBadges error", error);
    return {};
  }
} //getGlobalBadges

async function get7TVPFP(userID) {
  if (!userID) {
    return "/pics/donk.png";
  }
  try {
    let response = await fetch(`https://7tv.io/v3/users/twitch/${userID}`);
    if (response.status !== 200) {
      return "/pics/donk.png";
    }
    let result = await response.json();
    if (!result?.user?.avatar_url) {
      return "/pics/donk.png";
    } else {
      return result.user.avatar_url;
    }
  } catch (error) {
    console.log("getprofilepic 7tv error", error);
    return "/pics/donk.png";
  }
} //get7TVPFP

async function getTwitchPFP(username, access_token) {
  let requestOptions = {
    headers: {
      "client-id": CLIENT_ID,
      Authorization: `Bearer ${access_token}`,
    },
  };
  try {
    let response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, requestOptions);
    let result = await response.json();
    return result.data[0].profile_image_url;
  } catch (error) {
    console.log("getprofilepic twitch error", error);
    return "/pics/donk.png";
  }
} //getTwitchPFP

async function checkToken(access_token) {
  let requestOptions = {
    headers: { Authorization: `OAuth ${access_token}` },
  };
  try {
    let response = await fetch("https://id.twitch.tv/oauth2/validate", requestOptions);
    if (!response.ok) {
      return false;
    }
    let result = await response.json();
    if (result.expires_in < 600) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log("checkToken error", error);
    return false;
  }
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

// creates a random number generator function.
function createRandomGenerator(seed) {
  const a = 5486230734; // some big numbers
  const b = 6908969830;
  const m = 9853205067;
  let x = seed;
  // returns a random value 0 <= num < 1
  return function (seed = x) {
    // seed is optional. If supplied sets a new seed
    x = (seed * a + b) % m;
    return x / m;
  };
}
// function creates a 32bit hash of a string
function stringTo32BitHash(str) {
  let v = 0;
  for (let i = 0; i < str.length; i += 1) {
    v += str.charCodeAt(i) << i % 24;
  }
  return v % 0xffffffff;
}
// shuffle array using the str as a key.
function shuffleArraySeed(array, seed) {
  let shuffled = [];
  let random = createRandomGenerator(stringTo32BitHash(seed));
  while (array.length > 1) {
    shuffled.push(array.splice(Math.floor(random() * array.length), 1)[0]);
  }
  shuffled.push(array[0]);
  return shuffled;
} //shuffleArraySeed

function checkSimilarity(guess, answer) {
  if (guess === -1) {
    // timer ran out and the user did not answer
    return false;
  }
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
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) =>
      new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: "hover",
      })
  );
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

async function sendUsername(dank = "") {
  let lastLog = new Date(localStorage.getItem("logTime1"));
  if (new Date() - lastLog > 24 * 60 * 60 * 1000) {
    localStorage.setItem("logTime1", new Date().toISOString());
  } else {
    return;
  }

  let body = JSON.stringify({ site: `guessr.tv${dank}`, channel: channelName, platform: "twitch" });
  let requestOptionsPost = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body,
  };
  try {
    let response = await fetch(`https://helper.guessr.tv/log/username`, requestOptionsPost);
    console.log("sendUsername response", response.status);
    usernameSent = true;
  } catch (error) {
    console.log("sendUsername error", error);
  }
} //sendUsername

async function getCustomBadges() {
  try {
    let response = await fetch(`https://badges.donk.workers.dev`);
    let result = await response.json();
    if (!result || result.length == 0) {
      return [];
    }
    return result;
  } catch (error) {
    console.log("getCustomBadges error", error);
    return [];
  }
} //getCustomBadges

async function getChannelId() {
  try {
    let response = await fetch(`https://helper.guessr.tv/twitch/users?login=${channelName}`);
    let result = await response.json();
    return result?.data[0]?.id || "";
  } catch (error) {
    console.log("getChannelId error", error);
    return "";
  }
} //getChannelId

async function getStreamerColor() {
  try {
    let response = await fetch(`https://helper.guessr.tv/twitch/chat/color?user_id=${channelId}`);
    let result = await response.json();
    return result?.data[0]?.color || "#FFFFFF";
  } catch (error) {
    console.log("getStreamerColor error", error);
    return "#FFFFFF";
  }
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

function encodeHTML(str) {
  return str.replace(/[\u00A0-\u9999<>&]/g, function (i) {
    return `&#${i.charCodeAt(0)};`;
  });
} //encodeHTML

/**
 * @param {string} code
 */
function getLanguage(code) {
  const lang = new Intl.DisplayNames(["en"], { type: "language" });
  return lang.of(code);
} //getLanguage

/**
 * @description replace <, >, &, ', ", `, \ and / with HTML entities. - from https://github.com/validatorjs/validator.js
 * @param {*} str
 * @returns {*}
 */
function escapeString(str) {
  assertString(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
    .replace(/`/g, "&#96;");
} //escapeString

/**
 * @description replace HTML encoded entities with <, >, &, ', ", `, \ and /. - from https://github.com/validatorjs/validator.js
 * @param {*} str
 * @returns {*}
 */
function unescapeString(str) {
  assertString(str);
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x5C;/g, "\\")
    .replace(/&#96;/g, "`")
    .replace(/&amp;/g, "&");
  // &amp; replacement has to be the last one to prevent
  // bugs with intermediate strings containing escape sequences
  // See: https://github.com/validatorjs/validator.js/issues/1827
} //unescapeString

function assertString(input) {
  let isString = typeof input === "string" || input instanceof String;
  if (!isString) {
    let invalidType = _typeof(input);
    if (input === null) invalidType = "null";
    else if (invalidType === "object") invalidType = input.constructor.name;
    throw new TypeError("Expected a string but received a ".concat(invalidType));
  }
} //assertString
