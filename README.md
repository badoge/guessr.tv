# <img src="https://github.com/badoge/guessr.tv/assets/18620902/9f3b6cda-1f2f-4d29-9ddb-ad91c5ceb22c" width="56"> [guessr.tv](https://guessr.tv/)

:) incomplete readme

How the site works:
Every 30 minutes a bot fetches live channels from the Twitch API to make the channel list.
Channels are picked from different view count categories instead of picking completely randomly to increase variety.
Channels have a minimum of 30 minute uptime and a maximum of 9 hours uptime.

The site updates the view count right before starting each game using the Twitch API, which is not as accurate as the view count on the embedded stream.
Some channels might also have gone offline during the time it takes the API to update.

You can play using your keyboard only by using the arrow keys to change your guess and enter to submit.

Embeds can't have hidden stream info so part of the stream has to be blurred to not spoil the answer.

You might encounter a "Preparing your stream..." screen at the start of each round, to get rid of them you can subscribe to Twitch Turbo or switch the video type to clips or get a better Adblocker :)
If you have Turbo and still see the screen, make sure you are logged in to Twitch on the same browser.

If you use Firefox you will need to allow cross-site tracking cookies

If you want to optout from being picked for the guess list you can use the <kbd>=optout</kbd> command in [OkayegBOT's chat](https://www.twitch.tv/popout/okayegbot/chat?popout=)
