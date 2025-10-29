<script>
  let player;
  let { channel = null, clip = null, videoType = null } = $props();

  $effect(() => {
    if (!channel && !clip) {
      return;
    }
    if (player) {
      player.setChannel(channel);
    } else {
      let options = {
        autoplay: true,
        muted: false,
        width: "100%",
        height: "100%",
        allowfullscreen: false,
        layout: "video",
        channel: channel,
        parent: ["guessr.tv"],
      };
      player = new Twitch.Player("twitchEmbed", options);
    }
  });
</script>

{#if videoType == "stream" && channel}
  <div class="h-full" id="twitchEmbed"></div>
{:else if videoType == "clip" && clip}
  <iframe class="h-full" title="clip player" src="https://clips.twitch.tv/embed?clip={clip}&parent={window.location.hostname}&autoplay=true" height="100%" width="100%" preload="auto"
  ></iframe>
{/if}
