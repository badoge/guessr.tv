# [<img src="https://github.com/badoge/guessr.tv/assets/18620902/9f3b6cda-1f2f-4d29-9ddb-ad91c5ceb22c" width="56">](https://guessr.tv/) [guessr.tv](https://guessr.tv/)

Twitch stream view count guessing game

:) incomplete readme

## How the site works

Every 30 minutes a bot fetches live channels from the Twitch API to make the channel list. Channels are picked from different view count categories instead of picking completely randomly to increase variety. Channels have a minimum of 10 minutes uptime and a maximum of 9 hours uptime.

The site updates the view count right before starting each game using the Twitch API which does not update as often as the view count on the embedded player, so the view count will be a bit off or the channel might go offline during the time it takes the API to update.

Embeds can't have hidden stream info so part of the stream has to be blurred to not spoil the answer.

You might encounter a "Preparing your stream..." screen or a pre-roll ad at the start of each round, to get rid of them you can subscribe to Twitch Turbo or switch the video type to clips or get a better Adblocker :)
If you have Turbo and still see the screen, make sure you are logged in to Twitch on the same browser.

### Firefox cross-site tracking cookies

If you have Twitch Turbo but still see pre-roll ads and the "Preparing your stream..." screen you will need make some changes to your Enhanced Tracking Protection settings. By default Firefox blocks the cookies that the Twitch player uses to check if you are subscribed to Turbo, so you will need to add an exception for Guessr.tv so that the player can see that you are not supposed to see ads.

<details>
<summary>Video</summary>
  <video src="https://github.com/badoge/guessr.tv/assets/18620902/aa2ce208-09cd-4798-b59d-b3bbed64bca6.mp4" /> 
</details>
    
1. Open Settings
2. Go to Privacy & Security
3. Click on Manage Exceptions...
4. Add guessr.tv to the list and Save Changes

## Opt-out

If you want to optout from being picked for the guess list you can use the `=optout guessr` command in [OkayegBOT's chat](https://www.twitch.tv/popout/okayegbot/chat?popout=)

## FAQ

> The stream is offline, should I guess 0 views?

No, the answer will be the view count the stream had just before going offline.
