<!--
  @component
  dank
-->

<script>
  import { onMount } from "svelte";
  import { animate, utils } from "animejs";
  import ViewersSVG from "$lib/ViewersSVG.svelte";

  /**
   * @typedef {Object} props - dank
   * @prop {any} gameMode - gameMode
   * @prop {any} correctAnswer - correctAnswer
   * @prop {any} userAnswer - userAnswer
   * @prop {any} videoType - videoType
   * @prop {any} higherlowerPreviousNumber - higherlowerPreviousNumber
   * @prop {any} roundPoints - roundPoints
   */

  /**
   * @type {props}
   */
  let { gameMode, correctAnswer, userAnswer, videoType, higherlowerPreviousNumber, roundPoints } = $props();

  let difference = $state();

  /**
   * @param {number} viewcount
   */
  function viewCountString(viewcount) {
    return `${viewcount?.toLocaleString()} ${viewcount == 1 ? `${videoType == "clip" ? "view" : "viewer"}` : `${videoType == "clip" ? "views" : "viewers"}`}`;
  }

  onMount(async () => {
    difference = Math.abs(correctAnswer - userAnswer).toString();
  });
</script>

<div class="flex flex-col place-content-evenly">
  {#if gameMode == "viewers"}
    <div class="text-lg">
      The {videoType} has <ViewersSVG size="1.7rem" /><strong>{viewCountString(correctAnswer)}</strong><br />
    </div>
    <div class="text-lg">
      {#if difference == 0}
        You nailed the view count perfectly ✌
      {:else if userAnswer == -1}
        You did not submit an answer
      {:else}
        Your guess was off by {difference?.toLocaleString()} {difference == 1 ? "view" : "views"}
      {/if}
    </div>
  {/if}

  {#if gameMode == "emote"}
    <div class="text-lg">
      The streamer's emote is <img style="height: 56px;" src="https://static-cdn.jtvnw.net/emoticons/v2/${userAnswer}/default/dark/3.0" alt="emote" /><br />
    </div>
    <div class="text-lg">
      {#if roundPoints > -1}
        {userAnswer == -1 ? "You skipped this round 🤷" : "You guessed the emote correctly ✌"}
      {:else}
        {userAnswer == -1
          ? "You did not select an emote"
          : `You guessed <img style="height: 56px;" src="https://static-cdn.jtvnw.net/emoticons/v2/${userAnswer}/default/dark/3.0" alt="emote">`}
      {/if}
    </div>
  {/if}

  {#if gameMode == "game"}
    <div class="text-lg">
      The streamer is playing <strong class="text-success">{correctAnswer}</strong><br />
    </div>
    <div class="text-lg">
      {#if roundPoints == 1}
        You guessed the game correctly ✌
      {:else if userAnswer == -1}
        You did not select an answer
      {:else}
        You guessed <strong class="text-error">{userAnswer}</strong>
      {/if}
    </div>
  {/if}

  {#if gameMode == "higherlower"}
    <div class="text-lg">
      The {videoType} has <ViewersSVG /><strong>{viewCountString(correctAnswer)}</strong>{correctAnswer == higherlowerPreviousNumber ? ` (same as previous ${videoType}!)` : ""}<br />
    </div>
    <div class="text-lg">
      {#if roundPoints > -1}
        {#if userAnswer == -1}
          You skipped this round 🤷
        {:else}
          This {videoType} has a <i>{userAnswer}</i> view count than the previous {videoType}
        {/if}
      {:else if userAnswer == -1}
        You did not select an answer
      {:else}
        The previous {videoType} had {viewCountString(higherlowerPreviousNumber)}
      {/if}
    </div>
  {/if}
</div>
