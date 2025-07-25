<script>
  import "../../app.css";
  import { Toaster } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "$lib/functions";
  import { Navigation } from "@skeletonlabs/skeleton-svelte";
  import IcBaselineGridOn from "~icons/ic/baseline-grid-on";
  import IcBaselineLiveTv from "~icons/ic/baseline-live-tv";
  import IcBaselineInfo from "~icons/ic/baseline-info";
  import IcBaselineSettings from "~icons/ic/baseline-settings";
  import IcBaselineQuestionMark from "~icons/ic/baseline-question-mark";
  import IcBaselineRestartAlt from "~icons/ic/baseline-restart-alt";

  import { Modal } from "@skeletonlabs/skeleton-svelte";
  import { page } from "$app/state";

  let { children } = $props();

  let settingsModalOpenState = $state(false);
  let aboutModalOpenState = $state(false);

  function settingsModalClose() {
    settingsModalOpenState = false;
  }
  function aboutModalClose() {
    aboutModalOpenState = false;
  }
</script>

<div class="card sticky top-0 grid w-full h-screen grid-cols-[auto_1fr]">
  <!-- Component -->
  <Navigation.Rail>
    {#snippet header()}
      <Navigation.Tile label="Guessr.tv beta" title="Guessr.tv" href="/"><img src="/guessr.png" alt="guessr" /></Navigation.Tile>
    {/snippet}
    {#snippet tiles()}
      <Navigation.Tile label="Guessr" href="/" selected={page.route.id === "/(guessr)"}><IcBaselineQuestionMark class="text-2xl" /></Navigation.Tile>
      <Navigation.Tile label="Bingo" href="/bingo" selected={page.route.id === "/(guessr)/bingo"}><IcBaselineGridOn class="text-2xl" /></Navigation.Tile>
      <Navigation.Tile label="Watch" href="/watch" selected={page.route.id === "/(guessr)/watch"}><IcBaselineLiveTv class="text-2xl" /></Navigation.Tile>
    {/snippet}
    {#snippet footer()}
      <Modal
        open={aboutModalOpenState}
        onOpenChange={(e) => (aboutModalOpenState = e.open)}
        triggerBase="btn"
        triggerAriaLabel="About"
        contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
        backdropClasses="backdrop-blur-sm"
      >
        {#snippet trigger()}<IcBaselineInfo class="text-2xl" />{/snippet}
        {#snippet content()}
          <header class="flex justify-between">
            <h2 class="h2">About</h2>
          </header>
          <article>
            <div class="card border mb-3">
              <div class="card-header">About this page</div>
              <div class="card-body">
                If you like finding new random streams by playing on Guessr.tv but don't like having to guess each round then this page is for you :)<br />
                More info <a target="_blank" rel="noopener noreferrer" href="https://github.com/badoge/guessr.tv#readme">here</a><br /><br />

                <br />
                You might encounter a "Preparing your stream..." screen when clicking Next stream, to get rid of the screen you can subscribe to Twitch Turbo or get a better Adblocker :)<br
                />
                If you have Turbo but still see the screen, make sure you are logged in to Twitch on the same browser. If you use Firefox you will need to
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/badoge/guessr.tv#firefox-cross-site-tracking-cookies">allow cross-site tracking cookies</a>
                <hr />
                If you want to optout from being randomly picked you can use the<kbd>=optout guessr</kbd> command in
                <a target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/popout/okayegbot/chat?popout=">OkayegBOT's chat</a>
              </div>
            </div>
            <div class="card border">
              <div class="card-header">Contact info</div>
              <div class="card-body">
                Site by <a target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/badoge">badoge</a> :) <br />
                <p>
                  If you find any issues or if you have suggestions or questions, you can contact me: <br /><a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.twitch.tv/popout/badoge/chat?popout=">in this chat</a
                  >
                  <br />or on <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/FR8bgQdPUT">discord</a> <br />or by
                  <a href="mailto:help@guessr.tv">email</a>
                </p>
              </div>
            </div>
          </article>
          <footer class="flex justify-end gap-4">
            <button type="button" class="btn preset-tonal" onclick={aboutModalClose}>Close</button>
          </footer>
        {/snippet}
      </Modal>

      <Modal
        open={settingsModalOpenState}
        onOpenChange={(e) => (settingsModalOpenState = e.open)}
        triggerBase="btn"
        triggerAriaLabel="Settings"
        contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
        backdropClasses="backdrop-blur-sm"
      >
        {#snippet trigger()}<IcBaselineSettings class="text-2xl ghost" />{/snippet}
        {#snippet content()}
          <header class="flex justify-between">
            <h2 class="h2">Settings</h2>
          </header>
          <article>
            <div class="modal-body">
              <div class="input-group mt-3">
                <span class="input-group-text">Seen Channels:</span>
                <span class="input-group-text" id="seenChannels">0</span>
                <button class="btn btn-outline-warning" type="button" id="resetSeenChannels"><IcBaselineRestartAlt />Reset</button>
              </div>
              <small>Resets your channel history. The channel history keeps track of which channels you've seen to not show them again.</small>
            </div>
          </article>
          <footer class="flex justify-end gap-4">
            <button type="button" class="btn preset-tonal" onclick={settingsModalClose}>Close</button>
          </footer>
        {/snippet}
      </Modal>
    {/snippet}
  </Navigation.Rail>
  <div>
    {@render children()}
  </div>
</div>

<Toaster {toaster}></Toaster>
