<!--
  @component
  dank
-->

<script>
  /**
   * @typedef {Object} props - dank
   * @prop {any} round - round
   * @prop {any} totalScore - totalScore
   * @prop {any} gameMode - gameMode
   */

  /**
   * @type {props}
   */
  let { round, totalScore, gameMode } = $props();
</script>

<div class="flex flex-col place-content-evenly text-lg">
  {#if gameMode == "viewers"}
    <div>
      <strong>Round</strong>
      <br />
      {round}/5
    </div>
    <div>
      <strong>Score</strong>
      <br />
      {totalScore.toLocaleString()}
    </div>
  {:else}
    <div>
      <strong>Round</strong>
      <br />
      {round}
    </div>
    <div>
      <strong>Score</strong>
      <br />
      {totalScore.toLocaleString()}
    </div>
  {/if}
</div>
