<!--
  @component
  dank
-->

<script>
  import { animate, utils } from "animejs";
  /**
   * @typedef {Object} props - dank
   * @prop {string} gameMode - gameMode
   * @prop {number} roundPoints - roundPoints
   * @prop {number} totalScore - totalScore
   * @prop {any} highScores - highScores
   */

  /**
   * @type {props}
   */
  let { gameMode, roundPoints, totalScore, highScores } = $props();

  function scoreAnimation() {
    document.getElementById("scoreProgress").value = 0;
    document.getElementById("scoreProgressText").innerHTML = `0 Points`;

    let percent = Math.round((roundPoints / 5000) * 100);
    let score = {
      points: 0,
      percent: 0,
    };

    animate(score, {
      points: roundPoints,
      percent: percent,
      modifier: utils.round(0),
      duration: 1000,
      ease: "inOutExpo",
      onUpdate: function () {
        document.getElementById("scoreProgressText").innerHTML = `${score.points.toLocaleString()} ${score.points == 1 ? "Point" : "Points"}`;
        document.getElementById("scoreProgress").value = score.percent;
      },
    });

    if (roundPoints == 0) {
      document.getElementById("scoreProgressText").innerHTML += " 💀";
    }
  } //scoreAnimation

  function streakAnimation() {
    const start = document.getElementById("streakDiv").scrollLeft;
    const end = document.getElementById("streakDiv").scrollWidth - document.getElementById("streakDiv").clientWidth;

    animate("#streakDiv", {
      scrollLeft: end,
      duration: 1000,
      delay: 500,
      ease: "inOutQuart",
    });
  } //streakAnimation
</script>

{#if gameMode == "viewers"}
  <div class="flex flex-1 flex-col place-content-evenly" {@attach scoreAnimation}>
    <div id="scoreProgressText" class="text-2xl text-center">0 Points</div>
    <progress id="scoreProgress" class="progress progress-accent h-6 w-full" value="0" max="100"></progress>
  </div>
{:else}
  <div class="flex flex-1 flex-col place-content-evenly" {@attach streakAnimation}>
    <div class="text-2xl text-center">
      {#if totalScore >= highScores[gameMode]}
        New highscore! ({totalScore})
      {:else}
        {highScores[gameMode] - totalScore + 1} more {highScores[gameMode] - totalScore + 1 == 1 ? "round" : "rounds"} till you beat your highscore ({highScores[gameMode]})
      {/if}
    </div>
    <div class="overflow-x-hidden max-w-[40vw]" id="streakDiv">
      <ul class="steps">
        {#each { length: Math.max(highScores[gameMode] + 5, 10) }, step}
          {#if totalScore > step}
            <li class="step step-primary">{step + 1 == highScores[gameMode] ? "High score" : ""}</li>
          {:else}
            <li class="step">{step + 1 == highScores[gameMode] ? "High score" : ""}</li>
          {/if}
        {/each}
      </ul>
    </div>
  </div>
{/if}
