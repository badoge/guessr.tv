const elements = {
  infoTime: document.getElementById("infoTime"),
  seenChannels: document.getElementById("seenChannels"),
  resetSeenChannels: document.getElementById("resetSeenChannels"),
  toastContainer: document.getElementById("toastContainer"),
  twitchEmbed: document.getElementById("twitchEmbed"),
  nextStream: document.getElementById("nextStream"),
  previousStream: document.getElementById("previousStream"),
  pfp: document.getElementById("pfp"),
  username: document.getElementById("username"),
  title: document.getElementById("title"),
  tags: document.getElementById("tags"),
};

let mainList = [];
let seenChannels = [];
let previousChannels = [];
let player;
let retryLimit = 0;

async function getMainList() {
  try {
    let response = await fetch(`https://api.okayeg.com/guess`, requestOptions);
    let list = await response.json();
    mainList = list.guess.guess;
    elements.infoTime.innerHTML = `Channel list updated on ${new Date(list.guess.time)}`;
  } catch (error) {
    console.log(error);
    showToast("Could not load channel list :(", "danger", "5000");
  }
} //getMainList

async function nextStream() {
  elements.pfp.src = "/pics/guessr.png";
  elements.username.innerHTML = `<span class="placeholder-wave"><span class="placeholder" style="width: 200px"></span></span>`;
  elements.title.innerHTML = `<span class="placeholder-wave"><span class="placeholder" style="width: 500px"></span></span>`;
  elements.tags.innerHTML = `<span class="placeholder-wave"><span class="placeholder" style="width: 500px"></span></span>`;

  if (previousChannels.length > 0) {
    elements.previousStream.disabled = false;
  }

  elements.nextStream.disabled = true;
  setTimeout(() => {
    elements.nextStream.disabled = false;
  }, 2000);
  let channel = mainList.pop();
  while (seenChannels.includes(channel.username)) {
    channel = mainList.pop();
  }
  if (mainList.length == 0 || !channel) {
    showToast("No more channels left on the list, refresh to get a new list", "danger", "3000");
    return;
  }
  if (retryLimit > 5) {
    showToast("Too many retries, something might be wrong :(", "danger", "3000");
    return;
  }

  //update stream info
  try {
    let response = await fetch(`https://helper.pepega.workers.dev/twitch/streams?user_id=${channel.userid}`, requestOptions);
    let stream = await response.json();
    if (!stream.data[0]) {
      showToast("Channel is offline, getting new channel", "info", 1000);
      retryLimit++;
      return nextStream();
    }
    let response2 = await fetch(`https://helper.pepega.workers.dev/twitch/users?id=${channel.userid}`, requestOptions);
    let user = await response2.json();
    elements.pfp.src = user.data[0].profile_image_url || "/pics/guessr.png";
    let name = stream.data[0].user_name.toLowerCase() == stream.data[0].user_login.toLowerCase() ? stream.data[0].user_name : `${stream.data[0].user_name} (${stream.data[0].user_login})`;
    elements.username.innerHTML = `<a target="_blank" rel="noopener noreferrer" href="https://twitch.tv/${stream.data[0].user_login}">${name}</a>`;
    elements.title.innerText = stream.data[0].title;
    elements.tags.innerHTML = stream.data[0].tags.map((tag) => `<span class="badge rounded-pill text-bg-secondary">${tag}</span>`).join(" ");

    retryLimit = 0;
    let options = {
      width: "100%",
      height: "100%",
      channel: channel.username,
      layout: "video-with-chat",
      parent: ["guessr.tv", "127.0.0.1"],
    };
    if (!player) {
      player = new Twitch.Embed("twitchEmbed", options);
    } else {
      player.setChannel(channel.username);
    }
    previousChannels.push({
      username: stream.data[0].user_login,
      displayname: stream.data[0].user_name,
      title: stream.data[0].title,
      tags: elements.tags.innerHTML,
      pfp: user.data[0].profile_image_url || "/pics/guessr.png",
    });
    seenChannels.push(channel.username);
    localStorage.setItem("seenChannels_watch", JSON.stringify(seenChannels));
    elements.seenChannels.innerHTML = seenChannels.length;
  } catch (error) {
    console.log(error);
    retryLimit++;
    return nextStream();
  }
} //nextStream

function previousStream() {
  let channel = previousChannels[previousChannels.length - 2];
  if (!channel) {
    showToast("No more channels left", "danger", "3000");
    return;
  }
  previousChannels.pop();
  elements.pfp.src = channel.pfp || "/pics/guessr.png";
  let name = channel.displayname.toLowerCase() == channel.username.toLowerCase() ? channel.displayname : `${channel.displayname} (${channel.username})`;
  elements.username.innerHTML = `<a target="_blank" rel="noopener noreferrer" href="https://twitch.tv/${channel.username}">${name}</a>`;
  elements.title.innerText = channel.title;
  elements.tags.innerHTML = channel.tags;
  player.setChannel(channel.username);
} //previousStream

window.onload = async function () {
  seenChannels = JSON.parse(localStorage.getItem("seenChannels_watch")) || [];
  elements.seenChannels.innerHTML = seenChannels.length;

  elements.resetSeenChannels.onclick = function () {
    localStorage.setItem("seenChannels_watch", JSON.stringify([]));
    elements.seenChannels.innerHTML = 0;
    seenChannels = [];
    showToast("Seen channels reset", "success", 2000);
  };

  await getMainList();
  shuffleArray(mainList);
  nextStream();

  enableTooltips();
}; //onload
