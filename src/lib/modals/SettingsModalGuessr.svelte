<script>
  import IcBaselineNoAdultContent from "~icons/ic/baseline-no-adult-content";
  import IcBaselineNotificationImportant from "~icons/ic/baseline-notification-important";
  import IcBaselineRestartAlt from "~icons/ic/baseline-restart-alt";
</script>

<label class="label text-base-content text-balance mb-3">
  <input type="checkbox" class="toggle toggle-accent" id="skipSexual" checked />
  <IcBaselineNoAdultContent class="text-2xl inline align-text-bottom" /> Skip streams with the "Sexual Themes" Content Classification Label
</label>

<label class="label text-base-content text-balance">
  <input type="checkbox" class="toggle toggle-accent" id="unloadWarning" />
  <IcBaselineNotificationImportant class="text-2xl inline align-text-bottom" /> Show a warning before quitting
</label>
<br />
<small class="opacity-70">Prevents you from losing your game progress when leaving the site or refreshing </small>

<div class="divider"></div>
<span class="text-2xl">Reset stats</span>
<br />

<div class="join mt-2 mb-3">
  <button class="btn join-item btn-outline btn-warning pointer-events-none">Viewers mode high score</button>
  <button class="btn join-item btn-outline btn-warning pointer-events-none" id="viewersHS">0</button>
  <button class="btn join-item btn-warning" onclick={() => resetHighScore("viewersHS")}><IcBaselineRestartAlt /></button>
</div>

<div class="join mb-3">
  <button class="btn join-item btn-outline btn-warning pointer-events-none">Higher Lower mode high score</button>
  <button class="btn join-item btn-outline btn-warning pointer-events-none" id="viewersHigherlowerStreak">0</button>
  <button class="btn join-item btn-warning" onclick={() => resetHighScore("viewersHigherlowerStreak")}><IcBaselineRestartAlt /></button>
</div>

<div class="join mb-3">
  <button class="btn join-item btn-outline btn-warning pointer-events-none">Game name mode high score</button>
  <button class="btn join-item btn-outline btn-warning pointer-events-none" id="gameStreak">0</button>
  <button class="btn join-item btn-warning" onclick={() => resetHighScore("gameStreak")}><IcBaselineRestartAlt /></button>
</div>

<div class="join">
  <button class="btn join-item btn-outline btn-warning pointer-events-none">Emote mode high score</button>
  <button class="btn join-item btn-outline btn-warning pointer-events-none" id="emoteStreak">0</button>
  <button class="btn join-item btn-warning" onclick={() => resetHighScore("emoteStreak")}><IcBaselineRestartAlt /></button>
</div>

<div class="divider"></div>

<span class="text-2xl">Reset history</span>
<br />

<div class="join mt-2">
  <button class="btn join-item btn-outline btn-warning pointer-events-none">Seen Channels</button>
  <button class="btn join-item btn-outline btn-warning pointer-events-none" id="seenChannels">0</button>
  <button class="btn join-item btn-warning" id="resetSeenChannels"><IcBaselineRestartAlt /></button>
</div>
<br />
<small class="opacity-70">Resets your channel history. The channel history keeps track of which channels you've seen to not show them again</small>
<br />
<div class="join mt-3">
  <button class="btn join-item btn-outline btn-warning pointer-events-none">Seen clips</button>
  <button class="btn join-item btn-outline btn-warning pointer-events-none" id="seenClips">0</button>
  <button class="btn join-item btn-warning" id="resetSeenClips"><IcBaselineRestartAlt /></button>
</div>
<br />
<small class="opacity-70">Resets your clip history. The clip history keeps track of the clips that you've seen to not show them again</small>
