<script>
  import Contact from "$lib/Contact.svelte";
</script>

<div class="card card-border border-info bg-base-200 shadow-sm mb-3">
  <div class="card-body">
    <h2 class="card-title">About</h2>

    <article class="prose max-w-none">
      <strong>To use the shareable bingo cards:</strong>
      <ul class="steps steps-vertical sm:steps-horizontal">
        <li class="step step-primary">Login in with Twitch</li>
        <li class="step step-primary">Fill the board</li>
        <li class="step step-primary">Start the game</li>
        <li class="step step-primary">Share link with viewers</li>
      </ul>
      <p>The streamer will fill in the viewers' boards, viewers just need to login using the shared bingo board link</p>
      <div class="divider"></div>
      <p>
        You might encounter a "Preparing your stream..." screen at the start of each round, to get rid of it you can subscribe to Twitch Turbo or change the video type to clips or get a
        better Adblocker :)
      </p>
      <p>
        If you have Twitch Turbo but still see the screen, make sure you are logged in to Twitch on the same browser. You might also need to
        <a target="_blank" href="https://github.com/badoge/guessr.tv#firefox-cross-site-tracking-cookies">allow third-party cookies</a> in some browsers
      </p>
      <p>More info <a target="_blank" href="https://github.com/badoge/guessr.tv#readme">here</a></p>
      <div class="divider"></div>

      <p>
        If you want to opt out from being randomly picked for the game, use the <kbd class="kbd">=optout guessr</kbd> command in
        <a target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/popout/okayegbot/chat?popout=">OkayegBOT's chat</a>
      </p>

      <div class="divider"></div>
      <span id="infoTime">Channel list updated on [updates when game starts]</span><br />
    </article>
  </div>
</div>

<Contact />
