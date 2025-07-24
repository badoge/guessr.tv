<script>
  import { onMount } from "svelte";

  onMount(async () => {
    getUsername();
  });
  async function getUsername() {
    let url = window.location.href;
    let access_token;
    try {
      access_token = url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
      if (!access_token) {
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
    } catch (error) {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    let requestOptions = {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Client-Id": "ed2ch5dsxogpczmisjnbfnm92n4zps",
      },
    };
    try {
      let response = await fetch("https://api.twitch.tv/helix/users", requestOptions);
      if (response.status != 200) {
        document.getElementById("login").innerHTML = `<span class="text-danger">Could not login</span>`;
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
      let result = await response.json();
      localStorage.setItem(
        "DROPS",
        JSON.stringify({
          channel: result.data[0].login,
          userID: result.data[0].id,
        }),
      );
      document.getElementById("login").innerHTML = `<span class="text-success">Twitch account connected!</span>`;
      window.history.replaceState(null, "", window.location.pathname);
    } catch (error) {
      console.log("error", error);
      document.getElementById("login").innerHTML = `<span class="text-danger">Could not login</span>`;
      window.history.replaceState(null, "", window.location.pathname);
    }
  }
</script>

<div class="w-200 h-full mx-auto mb-100">
  <h1 class="h1">Guessr.tv Twitch drops</h1>

  <p class="m-2">
    Watch <a class="anchor" href="https://www.twitch.tv/directory/category/guessr-tv" target="_blank" rel="noopener noreferrer">Guessr.tv</a> streams for 30 minutes to earn a Donk badge
    <img src="https://chat.vote/badges/donk.png" class="h-6 inline" alt="donk badge" />
    that will show up on the leaderboard when you play.
    <span class="text-error-500">Not a Twitch chat badge, the badge will only show up on the site</span>
  </p>

  <div id="login">
    <h3>Sign in with Twitch to enable drops</h3>
    <a class="btn btn-twitch" href="https://id.twitch.tv/oauth2/authorize?client_id=ed2ch5dsxogpczmisjnbfnm92n4zps&redirect_uri=https://guessr.tv/drops.html&response_type=token">
      <span class="twitch-icon"></span> Sign in with Twitch
    </a>
  </div>

  <p class="text-warning-500">
    Drops have ended :) Make sure to claim the badge in your <a href="https://www.twitch.tv/drops/inventory" target="_blank" rel="noopener noreferrer">drops inventory</a> before it's too late
    :)
  </p>

  <h2 class="h2 my-5">FAQ</h2>

  <blockquote class="blockquote">Who is eligible?</blockquote>

  <p>
    Any streamer can enable this drop for their viewers by streaming <a href="https://guessr.tv" target="_blank" rel="noopener noreferrer">Guessr.tv</a> for 30 minutes.
  </p>
  <ul class="list-inside list-disc space-y-2">
    <li class="mb-5">
      Your stream must be in the <a class="anchor" href="https://www.twitch.tv/directory/category/guessr-tv" target="_blank" rel="noopener noreferrer">Guessr.tv</a> Twitch category <br />
      <img src="/category.png" alt="twitch category" class="h-100 ms-6" />
    </li>
    <li class="mb-5">
      You should fill in your Twitch username in the Play with chat section in the Game settings<br />
      <img src="/username.png" alt="play with chat settings" class="h-120 ms-6" />
    </li>
  </ul>

  <blockquote class="blockquote">What will I earn?</blockquote>
  <p>
    Streamers/Viewers that stream/watch for 30 minutes will earn a special Donk badge <img class="h-6 inline" alt="donk badge" src="https://chat.vote/badges/donk.png" /> that will show up on
    the Guessr.tv chat leaderboard while playing. <br /><img class="inline" alt="donk badge site example" src="/example1.png" />
  </p>
  <small class="opacity-60">You will need to refresh the site to see the badge after claiming the drop</small>
  <br />
  <br />

  <small class="opacity-60">
    Some users might not get the badge on the site till after the drops end on Nov 1st, just make sure that the badge is claimed in the
    <a class="anchor" href="https://www.twitch.tv/drops/inventory" target="_blank" rel="noopener noreferrer">drops inventory</a>
  </small>
  <br />
  <small class="opacity-60">The badge will also show up on <a class="anchor" href="https://chat.vote" target="_blank" rel="noopener noreferrer">chat.vote</a></small>
  <br />
  <small class="opacity-60"
    >If you encounter any issues while claiming your badge, contact <a class="anchor" href="https://twitch.tv/badoge" target="_blank" rel="noopener noreferrer">badoge</a></small
  >
</div>

<style>
  .twitch-icon {
    display: inline-block;
    width: 22px;
    height: 26px;
    background-image: url(/twitch.png);
    margin: 0 5px -8px 0;
  }

  .btn-twitch {
    color: #ffffff;
    background-color: #9933ff !important;
    border-color: #8744aa !important;
  }

  .btn-twitch:active,
  .btn-twitch:focus,
  .btn-twitch:hover {
    color: #ffffff;
    background-color: #8038de !important;
    border-color: #7f40a1 !important;
  }
</style>
