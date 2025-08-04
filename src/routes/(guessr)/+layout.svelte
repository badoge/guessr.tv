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

  import AboutModalGuessr from "$lib/modals/AboutModalGuessr.svelte";
  import AboutModalBingo from "$lib/modals/AboutModalBingo.svelte";
  import AboutModalWatch from "$lib/modals/AboutModalWatch.svelte";

  import SettingsModalGuessr from "$lib/modals/SettingsModalGuessr.svelte";
  import SettingsModalBingo from "$lib/modals/SettingsModalBingo.svelte";
  import SettingsModalWatch from "$lib/modals/SettingsModalWatch.svelte";

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

<div class="card sticky top-0 col-span-1 grid w-full h-screen grid-cols-[auto_1fr]">
  <!-- Component -->
  <Navigation.Rail width="w-18">
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
            {#if page.route.id === "/(guessr)"}
              <AboutModalGuessr />
            {:else if page.route.id === "/(guessr)/bingo"}
              <AboutModalBingo />
            {:else if page.route.id === "/(guessr)/watch"}
              <AboutModalWatch />
            {:else}
              <p>Nothing here</p>
            {/if}
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
            {#if page.route.id === "/(guessr)"}
              <SettingsModalGuessr />
            {:else if page.route.id === "/(guessr)/bingo"}
              <SettingsModalBingo />
            {:else if page.route.id === "/(guessr)/watch"}
              <SettingsModalWatch />
            {:else}
              <p>Nothing here</p>
            {/if}
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
