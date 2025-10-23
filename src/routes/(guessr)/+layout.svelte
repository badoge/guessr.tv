<script>
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
  import IcBaselineClose from "~icons/ic/baseline-close";

  import { page } from "$app/state";

  let { children } = $props();
</script>

<dialog id="settingsModal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><IcBaselineClose /></button>
    </form>
    <h3 class="text-lg font-bold">Settings</h3>
    {#if page.route.id === "/(guessr)"}
      <SettingsModalGuessr />
    {:else if page.route.id === "/(guessr)/bingo"}
      <SettingsModalBingo />
    {:else if page.route.id === "/(guessr)/watch"}
      <SettingsModalWatch />
    {:else}
      <p>Nothing here</p>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog id="aboutModal" class="modal">
  <div class="modal-box w-[80vw] max-w-[800px] min-w-[400px]">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-1 top-1 p-1"><IcBaselineClose /></button>
    </form>
    <div class="max-h-[90vh] overflow-auto">
      {#if page.route.id === "/(guessr)"}
        <AboutModalGuessr />
      {:else if page.route.id === "/(guessr)/bingo"}
        <AboutModalBingo />
      {:else if page.route.id === "/(guessr)/watch"}
        <AboutModalWatch />
      {:else}
        <p>Nothing here</p>
      {/if}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<div class="drawer drawer-open">
  <input id="navDrawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- Page content here -->
    {@render children()}
  </div>

  <div class="drawer-side is-drawer-close:overflow-visible">
    <label for="navDrawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <div class="bg-base-200 flex flex-col items-start min-h-full">
      <ul class="menu grow p-1">
        <li>
          <a href="/" class="text-center justify-center block w-14 p-0 hover:bg-base-100">
            <img class="w-12 mx-auto" src="/guessr.png" alt="guessr" />
            <span>Guessr.tv beta - nothing working yet - do not use or you will be banned</span>
          </a>
        </li>
      </ul>
      <ul class="menu grow p-1 gap-2">
        <li>
          <a href="/" class="text-center justify-center block w-14 p-0 hover:bg-base-100 {page.route.id === '/(guessr)' ? 'bg-base-300' : ''}">
            <IcBaselineQuestionMark class="text-2xl mx-auto" />
            <span>Guessr</span>
          </a>
        </li>
        <li>
          <a href="/bingo" class="text-center justify-center block w-14 p-0 hover:bg-base-100 {page.route.id?.startsWith('/(guessr)/bingo') ? 'bg-base-300' : ''}">
            <IcBaselineGridOn class="text-2xl mx-auto" />
            <span>Bingo</span>
          </a>
        </li>
        <li>
          <a href="/watch" class="text-center justify-center block w-14 p-0 hover:bg-base-100 {page.route.id === '/(guessr)/watch' ? 'bg-base-300' : ''}">
            <IcBaselineLiveTv class="text-2xl mx-auto" />
            <span>Watch</span>
          </a>
        </li>
      </ul>

      <div class="place-self-center is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="About">
        <button
          onclick={() => {
            aboutModal.showModal();
          }}
          class="btn btn-ghost btn-circle"
        >
          <IcBaselineInfo class="text-2xl" />
        </button>
      </div>

      <div class="place-self-center is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
        <button
          onclick={() => {
            settingsModal.showModal();
          }}
          class="btn btn-ghost btn-circle"
        >
          <IcBaselineSettings class="text-2xl" />
        </button>
      </div>
    </div>
  </div>
</div>
