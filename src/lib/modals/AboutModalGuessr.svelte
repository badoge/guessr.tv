<script>
  import Contact from "$lib/Contact.svelte";
</script>

<div class="card card-border border-info bg-base-200 shadow-sm mb-3">
  <div class="card-body">
    <h2 class="card-title">About</h2>

    <article class="prose max-w-none">
      <p>More info <a target="_blank" href="https://github.com/badoge/guessr.tv#readme">here</a></p>

      <p>
        <strong>Some things to look out for:</strong> The answer is updated before each round but it can still be a little bit off, because the Twitch API is not as accurate as the view count
        on the embedded stream. Some channels might also go offline before the API updates, in that case the answer will be the view count they had just before going offline
      </p>

      <p>
        You might encounter a "Preparing your stream..." screen at the start of each round, to get rid of it you can subscribe to Twitch Turbo or change the video type to clips or get a
        better Adblocker :)
      </p>
      <p>
        If you have Twitch Turbo but still see the screen, make sure you are logged in to Twitch on the same browser. You might also need to
        <a target="_blank" href="https://github.com/badoge/guessr.tv#firefox-cross-site-tracking-cookies">allow third-party cookies</a> in some browsers
      </p>

      <div class="divider"></div>

      <p>
        If you want to opt out from being randomly picked for the game, use the <kbd class="kbd">=optout guessr</kbd> command in
        <a target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/popout/okayegbot/chat?popout=">OkayegBOT's chat</a>
      </p>

      <div class="divider"></div>

      <p>Channel list updated on <span id="infoTime">[updates when game starts]</span></p>
    </article>
  </div>
</div>

<Contact />
