<script>
  import "../../app.css";
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import IcBaselineArrowBack from "~icons/ic/baseline-arrow-back";
  import StreamlineUltimateTreasureChestBold from "~icons/streamline-ultimate/treasure-chest-bold";
  import MdiBadge from "~icons/mdi/badge";
  import IcBaselineInfo from "~icons/ic/baseline-info";
  import { page } from "$app/state";
  let { children } = $props();
</script>

<AppBar>
  <AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
    <AppBar.Lead>
      <a href="/" class="text-2xl mt-1"><IcBaselineArrowBack /></a>
    </AppBar.Lead>
    <AppBar.Headline class="flex justify-center">
      <span class="text-2xl"><img src="/guessr.png" alt="Guessr.tv" class="w-8 inline align-bottom me-1" />Guessr.tv</span>
    </AppBar.Headline>

    <AppBar.Trail>
      <a href="/about" class={page.route.id === "/(about)/about" ? "font-bold underline decoration-3 underline-offset-7 me-2" : "me-2"}>
        <IcBaselineInfo class="inline align-text-bottom" />About
      </a>
      <a href="/badges" class={page.route.id === "/(about)/badges" ? "font-bold underline decoration-3 underline-offset-7 me-2" : "me-2"}>
        <MdiBadge class="inline align-text-bottom" />Badges
      </a>
      <a href="/drops" class={page.route.id === "/(about)/drops" ? "font-bold underline decoration-3 underline-offset-7 me-2" : "me-2"}>
        <StreamlineUltimateTreasureChestBold class="inline align-text-bottom" />Drops
      </a>
    </AppBar.Trail>
  </AppBar.Toolbar>
</AppBar>

{@render children()}
