const elements = {
  toastContainer: document.getElementById("toastContainer"),
  twitchEmbed: document.getElementById("twitchEmbed"),
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
    parent: ["guessr.tv", "127.0.0.1"],
  };
  if (!player) {
    player = new Twitch.Embed("twitchEmbed", options);
  } else {
    player.setChannel(channel.username);
  }
} //nextStream

window.onload = async function () {
  await getMainList();
  shuffleArray(mainList);
  nextStream();
}; //onload
