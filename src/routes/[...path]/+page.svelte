<script>
  import { page } from "$app/state";
  /** @type {{ [key: string]: any }} */
  let aliases = {
    about: ["about", "info", "home", "contact"],
    badges: ["badges", "badge"],
    drops: ["drops", "drops"],
    bingo: ["bingo", "twitchbingo"],
    watch: ["watch", "twitch", "stream", "streams", "random"],
  };
  let path = page.url.pathname.replace("/", "").replace(".html", "").toLowerCase();
  let hint = $state("");

  for (let key in aliases) {
    if (aliases[key].indexOf(path) !== -1) {
      hint = `Did you mean <a class="link" href="/${key}">beta.guessr.tv/${key}</a>?`;
    }
  }
</script>

<svelte:head>
  <title>Guessr.tv/404</title>
  <meta property="og:title" content="Guessr.tv/404" />
  <meta property="og:site_name" content="Guessr.tv/404" />
  <meta property="og:url" content="https://guessr.tv/404" />
</svelte:head>

<div class="flex justify-center">
  <div class="flex flex-col text-center">
    <span class="text-6xl font-extrabold">404</span>
    <span class="text-5xl font-thin">NOTHING HERE</span>
    <br />
    <img src="/guessr.png" alt="logo" class="w-50 mx-auto" />
    <br />
    <p class="font-bold text-2xl" id="hint">{@html hint}</p>
  </div>
</div>
