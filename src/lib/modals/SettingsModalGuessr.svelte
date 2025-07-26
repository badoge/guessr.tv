<div class="form-check form-switch mb-3">
  <input class="form-check-input" type="checkbox" role="switch" id="skipSexual" checked />
  <label class="form-check-label" for="skipSexual">
    <i class="material-icons notranslate">18_up_rating</i><i class="material-icons notranslate">skip_next</i>Skip streams with the "Sexual Themes" Content Classification Label
  </label>
</div>

<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="unloadWarning" />
  <label class="form-check-label" for="unloadWarning">
    <i class="material-icons notranslate">notification_important</i>Show a warning before quitting <br />
    <small class="text-body-secondary">Prevents you from losing your game progress when leaving the site or resetting </small>
  </label>
</div>
<hr />
<h5>Reset stats</h5>
<div class="input-group mb-3">
  <span class="input-group-text">Viewers mode high score</span>
  <span class="input-group-text" id="viewersHS">0</span>
  <button class="btn btn-outline-warning" type="button" onclick={() => resetHighScore("viewersHS")}><i class="material-icons notranslate">restart_alt</i>Reset</button>
</div>
<div class="input-group mb-3">
  <span class="input-group-text">Higher Lower mode high score</span>
  <span class="input-group-text" id="viewersHigherlowerStreak">0</span>
  <button class="btn btn-outline-warning" type="button" onclick={() => resetHighScore("viewersHigherlowerStreak")}><i class="material-icons notranslate">restart_alt</i>Reset</button>
</div>
<div class="input-group mb-3">
  <span class="input-group-text">Game name mode high score</span>
  <span class="input-group-text" id="gameStreak">0</span>
  <button class="btn btn-outline-warning" type="button" onclick={() => resetHighScore("gameStreak")}><i class="material-icons notranslate">restart_alt</i>Reset</button>
</div>
<div class="input-group mb-3">
  <span class="input-group-text">Emote mode high score</span>
  <span class="input-group-text" id="emoteStreak">0</span>
  <button class="btn btn-outline-warning" type="button" onclick={() => resetHighScore("emoteStreak")}><i class="material-icons notranslate">restart_alt</i>Reset</button>
</div>

<hr />
<div class="input-group mt-3">
  <span class="input-group-text">Seen Channels</span>
  <span class="input-group-text" id="seenChannels">0</span>
  <button class="btn btn-outline-warning" type="button" id="resetSeenChannels"><i class="material-icons notranslate">restart_alt</i>Reset</button>
</div>
<small class="text-body-secondary">Resets your channel history. The channel history keeps track of which channels you've seen to not show them again.</small>
<div class="input-group mt-3">
  <span class="input-group-text">Seen clips</span>
  <span class="input-group-text" id="seenClips">0</span>
  <button class="btn btn-outline-warning" type="button" id="resetSeenClips"><i class="material-icons notranslate">restart_alt</i>Reset</button>
</div>
<small class="text-body-secondary">Resets your clip history. The clip history keeps track of the clips that you've seen to not show them again.</small>
