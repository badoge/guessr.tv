<script>
  let { gameMode } = $props();
</script>

{#if gameMode == "viewers"}
  <div class="flex-1 flex flex-col place-content-evenly">
    <div class="text-2xl text-center">0 points</div>
    <progress class="progress progress-accent h-6 w-full" value="50" max="100"></progress>
  </div>
{:else}
  <div class="flex-1 flex flex-col place-content-evenly">
    <div class="text-2xl text-center">3 more rounds till you beat your high score</div>

    <ul class="steps">
      <li class="step step-primary"></li>
      <li class="step step-primary"></li>
      <li class="step"></li>
      <li class="step">High score</li>
      <li class="step"></li>
    </ul>
  </div>
{/if}
