<script>
  import Contact from "$lib/Contact.svelte";
</script>

<div class="card card-border border-info bg-base-200 shadow-sm mb-3">
  <div class="card-body">
    <h2 class="card-title">About</h2>

    <article class="prose max-w-none">
      <p>If you like finding new random streams by playing on Guessr.tv but don't like having to guess each round then this page is for you :)</p>
      <p>The page has a list of every single channel that is currently live on Twitch</p>
      <p>More info <a target="_blank" rel="noopener noreferrer" href="https://github.com/badoge/guessr.tv#readme">here</a></p>

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
        If you want to opt out from being shown on the site, use the <kbd class="kbd">=optout guessr</kbd> command in
        <a target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/popout/okayegbot/chat?popout=">OkayegBOT's chat</a>
      </p>
    </article>
  </div>
</div>

<Contact />
