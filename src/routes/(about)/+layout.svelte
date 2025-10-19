<script>
  import "../../app.css";
  import IcBaselineArrowBack from "~icons/ic/baseline-arrow-back";
  import StreamlineUltimateTreasureChestBold from "~icons/streamline-ultimate/treasure-chest-bold";
  import MdiBadge from "~icons/mdi/badge";
  import IcBaselineInfo from "~icons/ic/baseline-info";
  import { page } from "$app/state";
  let { children } = $props();
</script>

<div class="navbar bg-base-200 shadow-sm">
  <div class="navbar-start">
    <a href="/" class="text-2xl mt-1"><IcBaselineArrowBack /></a>
  </div>
  <div class="navbar-center">
    <span class="text-2xl"><img src="/guessr.png" alt="Guessr.tv" class="w-8 inline align-bottom me-1" />Guessr.tv beta</span>
  </div>
  <div class="navbar-end">
    <a href="/about" class={page.route.id === "/(about)/about" ? "font-bold underline decoration-3 underline-offset-7 me-2" : "me-2"}>
      <IcBaselineInfo class="inline align-text-bottom " />About
    </a>
    <a href="/badges" class={page.route.id === "/(about)/badges" ? "font-bold underline decoration-3 underline-offset-7 me-2" : "me-2"}>
      <MdiBadge class="inline align-text-bottom" />Badges
    </a>
    <a href="/drops" class={page.route.id === "/(about)/drops" ? "font-bold underline decoration-3 underline-offset-7 me-2" : "me-2"}>
      <StreamlineUltimateTreasureChestBold class="inline align-text-bottom" />Drops
    </a>
  </div>
</div>

{@render children()}
