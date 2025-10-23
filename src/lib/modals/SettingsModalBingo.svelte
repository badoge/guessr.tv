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
  <input type="checkbox" class="toggle toggle-accent" id="unloadWarningBingo" />
  <IcBaselineNotificationImportant class="text-2xl inline align-text-bottom" /> Show a warning before quitting
</label>
<br />
<small class="opacity-70">Prevents you from losing your game progress or board when leaving the site</small>

<div class="divider"></div>

<span class="text-2xl">Reset history</span>
<br />
<div class="join mt-2">
  <button class="btn join-item btn-outline btn-warning">Seen Channels</button>
  <button class="btn join-item btn-outline btn-warning" id="seenChannels">0</button>
  <button class="btn join-item btn-warning" id="resetSeenChannels"><IcBaselineRestartAlt /></button>
</div>
<br />
<small class="opacity-70">Resets your channel history. The channel history keeps track of which channels you've seen to not show them again</small>
