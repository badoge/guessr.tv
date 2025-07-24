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

<div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
  <header class="mb-auto">
    <div>
      <h3 class="float-md-start mb-0"><img src="/guessr.png" alt="Guessr.tv" height="40px" /> Guessr.tv</h3>
      <nav class="nav nav-masthead justify-content-center float-md-end">
        <a class="nav-link fw-bold py-1 px-0" href="/">Guessr.tv<i class="material-icons notranslate">outbound</i></a>
        <div class="vr py-1 px-0 mx-3"></div>
        <a class="nav-link fw-bold py-1 px-0" href="/badges">Badges</a>
        <a class="nav-link fw-bold py-1 px-0 active" aria-current="page" href="#">Drops</a>
      </nav>
    </div>
  </header>

  <main class="p-3">
    <h1>Guessr.tv drops</h1>
    <p class="lead">
      Watch Guessr.tv streams for 30 minutes to earn a Donk badge <img src="https://chat.vote/badges/donk.png" height="24px" /> that will show up on the leaderboard when you play.
      <span class="text-danger">Not a Twitch chat badge, the badge will only show up on the site</span>
    </p>
    <div id="login">
      <h3>Sign in with Twitch to enable drops</h3>
      <a class="btn btn-twitch" href="https://id.twitch.tv/oauth2/authorize?client_id=ed2ch5dsxogpczmisjnbfnm92n4zps&redirect_uri=https://guessr.tv/drops.html&response_type=token">
        <span class="twitch-icon"></span> Sign in with Twitch
      </a>
    </div>

    <p class="text-warning">
      Drops have ended :) Make sure to claim the badge in your <a href="https://www.twitch.tv/drops/inventory" target="_blank" rel="noopener noreferrer">drops inventory</a> before it's too late
      :)
    </p>
    <hr />
    <h4>Who is eligible</h4>
    <p class="lead">
      Any streamer can enable this drop for their viewers by streaming <a href="https://guessr.tv" target="_blank" rel="noopener noreferrer">Guessr.tv</a> for 30 minutes.
    </p>
    <ul class="list-unstyled">
      <li>
        <ul>
          <li class="mb-5">
            Your stream must be in the <a href="https://www.twitch.tv/directory/category/guessr-tv" target="_blank" rel="noopener noreferrer">Guessr.tv</a> Twitch category <br />
            <img src="/category.png" alt="twitch category" style="height: 40vh" />
          </li>
          <li class="mb-5">
            You should fill in your Twitch username in the Play with chat section in the Game settings<br />
            <img src="/username.png" alt="play with chat settings" style="height: 50vh" />
          </li>
        </ul>
      </li>
    </ul>
    <h4>What will I earn</h4>
    <p class="lead">
      Streamers/Viewers that stream/watch for 30 minutes will earn a special Donk badge <img src="https://chat.vote/badges/donk.png" height="24px" /> that will show up on the Guessr.tv chat
      leaderboard while playing. <br /><img src="/example1.png" height="60px" />
    </p>
    <small>You will need to refresh the site to see the badge after claiming the drop</small>
    <br />
    <small>
      Some users might not get the badge on the site till after the drops end on Nov 1st, just make sure that the badge is claimed in the
      <a href="https://www.twitch.tv/drops/inventory" target="_blank" rel="noopener noreferrer">drops inventory</a>
    </small>
    <br />
    <small>The badge will also show up on <a href="https://chat.vote" target="_blank" rel="noopener noreferrer">chat.vote</a></small>
    <br />
    <small>If you encounter any issues while claiming your badge contact <a href="https://twitch.tv/badoge" target="_blank" rel="noopener noreferrer">badoge</a></small>
  </main>
</div>

<style>
  body {
    margin-bottom: 400px;
  }

  .cover-container {
    max-width: 50em;
  }

  .nav-masthead .nav-link {
    color: rgba(255, 255, 255, 0.5);
    border-bottom: 0.25rem solid transparent;
  }

  .nav-masthead .nav-link:hover,
  .nav-masthead .nav-link:focus {
    border-bottom-color: rgba(255, 255, 255, 0.25);
  }

  .nav-masthead .nav-link + .nav-link {
    margin-left: 1rem;
  }

  .nav-masthead .active {
    color: #fff;
    border-bottom-color: #fff;
  }

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
