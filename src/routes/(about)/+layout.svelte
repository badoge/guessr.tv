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
  {#snippet lead()}
    <a href="/" class="text-2xl mt-1"><IcBaselineArrowBack /></a>
  {/snippet}
  {#snippet trail()}
    <a href="/about" class={page.route.id === "/(about)/about" ? "mt-1 font-bold underline decoration-3 underline-offset-7" : "mt-1"}>
      <IcBaselineInfo class="inline align-text-bottom me-1" />About
    </a>
    <a href="/badges" class={page.route.id === "/(about)/badges" ? "mt-1 font-bold underline decoration-3 underline-offset-7" : "mt-1"}>
      <MdiBadge class="inline align-text-bottom me-1" />Badges
    </a>
    <a href="/drops" class={page.route.id === "/(about)/drops" ? "mt-1 font-bold underline decoration-3 underline-offset-7" : "mt-1"}>
      <StreamlineUltimateTreasureChestBold class="inline align-text-bottom me-1" />Drops
    </a>
  {/snippet}

  <span class="text-2xl"><img src="/guessr.png" alt="Guessr.tv" class="w-8 inline align-bottom me-1" />Guessr.tv</span>
</AppBar>

{@render children()}
