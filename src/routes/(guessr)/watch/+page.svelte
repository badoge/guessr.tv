<script>
  import { onMount } from "svelte";
  import { Slider } from "bits-ui";
  import localforage from "localforage";
  import { getLanguage } from "$lib/functions";
  import { showToast } from "../../+layout.svelte";
  import { SvelteMap } from "svelte/reactivity";

  import IcBaselineSkipNext from "~icons/ic/baseline-skip-next";
  import IcBaselineSkipPrevious from "~icons/ic/baseline-skip-previous";
  import IcBaselineSearch from "~icons/ic/baseline-search";
  import IcBaselineLanguage from "~icons/ic/baseline-language";
  import IcBaselineLabel from "~icons/ic/baseline-label";
  import IcBaselineSportsEsports from "~icons/ic/baseline-sports-esports";
  import IcBaselineArrowRightAlt from "~icons/ic/baseline-arrow-right-alt";
  import ViewersSVG from "$lib/ViewersSVG.svelte";

  import pkg from "validator";
  const { escape } = pkg;

  let nextStreamCooldown = $state(false);

  /**
   * @typedef {Object} currentChannel
   * @property {string} avatar
   * @property {string} username
   * @property {string} displayName
   * @property {string} title
   * @property {string} category
   * @property {string[]} tags
   *
   */
  let currentChannel = $state({
    avatar: undefined,
    username: undefined,
    displayName: undefined,
    title: undefined,
    category: undefined,
    tags: [],
  });

  let mainList = new Map();
  let filteredList = $state(new Map());

  let allLanguages = new SvelteMap();
  let selectedLanguages = new SvelteMap();
  let filteredLanguages = new SvelteMap();

  let allTags = new SvelteMap();
  let selectedTags = new SvelteMap();
  let filteredTags = new SvelteMap();

  let allCategories = new SvelteMap();
  let selectedCategories = new SvelteMap();
  let filteredCategories = new SvelteMap();

  let maxViewCount = $state(0);
  let viewCountFilterSlider = $state([0, 100]);
  let viewCountFilter = $derived.by(() => {
    let min = Math.round(Math.exp((Math.log(maxViewCount) / 100) * viewCountFilterSlider[0]));
    let max = Math.round(Math.exp((Math.log(maxViewCount) / 100) * viewCountFilterSlider[1]));

    if (viewCountFilterSlider[0] == 0) {
      min = 0;
    }
    if (viewCountFilterSlider[1] == 0) {
      max = 0;
    }
    return [min, max];
  });

  /**
   * @type {any[]}
   */
  let seenChannels = [];

  /**
   * @type {any[]}
   */
  let previousChannels = $state([]);

  /**
   * @type {Twitch.Embed}
   */
  let player;

  let retryLimit = 0;

  onMount(async () => {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "guessr.tv/watch",
      version: 1.0,
      storeName: "watch",
      description: "watch",
    });

    seenChannels = JSON.parse(await localforage.getItem("seenChannels")) || [];

    //elements.seenChannels.innerHTML = seenChannels.length;
    // elements.resetSeenChannels.onclick = function () {
    //   localforage.setItem("seenChannels", JSON.stringify([]));
    //   elements.seenChannels.innerHTML = 0;
    //   seenChannels = [];
    //   showToast("Seen channels reset", "alert-success", 2000);
    // };

    await getMainList();
    loadFilters();
    nextStream();
  });

  async function getMainList() {
    let requestOptions = {
      headers: {
        pragma: "no-cache",
        "cache-control": "no-cache",
      },
    };
    try {
      let response = await fetch(`https://guessr.donk.workers.dev/watch?dank=${Date.now()}`, requestOptions);
      let result = await response.json();
      for (let index = 0; index < result.length; index++) {
        if (result[index][1].viewer_count > maxViewCount) {
          maxViewCount = result[index][1].viewer_count;
        }
        if (result[index][1].game_name == "") {
          result[index][1].game_name = "No category";
        }
      }

      mainList = new Map(result);
      filteredList = new Map(result);
    } catch (error) {
      showToast("Could not load channel list :(", "alert-error", 5000);
      console.log(error);
    }
  } //getMainList

  function loadFilters() {
    let languages = new Map();
    let tags = new Map();
    let categories = new Map();

    //make maps out of all the data on the main list
    mainList.forEach((value, key, map) => {
      languages.set(value.language, (languages.get(value.language) ?? 0) + 1);
      categories.set(value.game_name, (categories.get(value.game_name) ?? 0) + 1);
      for (let index = 0; index < value?.tags?.length; index++) {
        tags.set(value.tags[index], (tags.get(value.tags[index]) ?? 0) + 1);
      }
    });

    const sortedLanguages = [...languages.entries()].sort((a, b) => b[1] - a[1]);
    for (const [key, value] of sortedLanguages) {
      allLanguages.set(key, value);
      filteredLanguages.set(key, value);
    }

    const sortedTags = [...tags.entries()].sort((a, b) => b[1] - a[1]);
    for (const [key, value] of sortedTags) {
      allTags.set(key, value);
      if (filteredTags.size < 10) {
        filteredTags.set(key, value);
      }
    }

    const sortedCategories = [...categories.entries()].sort((a, b) => b[1] - a[1]);
    for (const [key, value] of sortedCategories) {
      allCategories.set(key, value);
      if (filteredCategories.size < 10) {
        filteredCategories.set(key, value);
      }
    }
  } //loadFilters

  function updateFilteredList() {
    filteredList = new Map(mainList);

    const languages = Array.from(selectedLanguages).map(([key]) => key);
    const tags = Array.from(selectedTags).map(([key]) => key);
    const categories = Array.from(selectedCategories).map(([key]) => key);

    for (const [key, value] of filteredList) {
      if (languages.length && !languages.includes(value.language)) {
        filteredList.delete(key);
      }
      if (tags.length && !tags.some((tag) => value.tags?.includes(tag))) {
        filteredList.delete(key);
      }
      if (categories.length && !categories.includes(value.game_name)) {
        filteredList.delete(key);
      }

      if (value.viewer_count < viewCountFilter[0]) {
        filteredList.delete(key);
      }

      if (value.viewer_count > viewCountFilter[1]) {
        filteredList.delete(key);
      }
    }
  } //updateFilteredList

  function updateSelectedLanguages() {
    const selected = Array.from(document.querySelectorAll(".language-filter:checked")).map((e) => e.value);
    for (const [key, value] of allLanguages) {
      if (selected.includes(key)) {
        selectedLanguages.set(key, value);
      } else {
        selectedLanguages.delete(key);
      }
    }
    updateFilteredList();
  } //updateSelectedLanguages

  function updateSelectedTags() {
    const selected = Array.from(document.querySelectorAll(".tag-filter:checked")).map((e) => e.value);
    for (const [key, value] of allTags) {
      if (selected.includes(key)) {
        selectedTags.set(key, value);
      } else {
        selectedTags.delete(key);
      }
    }
    updateFilteredList();
  } //updateSelectedTags

  function updateSelectedCategories() {
    const selected = Array.from(document.querySelectorAll(".category-filter:checked")).map((e) => e.value);
    for (const [key, value] of allCategories) {
      if (selected.includes(key)) {
        selectedCategories.set(key, value);
      } else {
        selectedCategories.delete(key);
      }
    }
    updateFilteredList();
  } //updateSelectedCategories

  function searchLanguages() {
    const search = document.getElementById("searchLanguages")?.value;
    let searchedLanguages;

    if (search) {
      searchedLanguages = Array.from(allLanguages.entries())
        .filter(([key, value]) => getLanguage(key).toLowerCase().includes(search))
        .map(([key]) => key);
    } else {
      for (const [key, value] of allLanguages) {
        filteredLanguages.set(key, value);
      }
      return;
    }

    for (const [key, value] of allLanguages) {
      if (searchedLanguages?.includes(key)) {
        filteredLanguages.set(key, value);
      } else {
        filteredLanguages.delete(key);
      }
    }
  } //searchLanguages

  function searchTags() {
    const search = document.getElementById("searchTags")?.value;
    let searchedTags;

    if (search) {
      searchedTags = Array.from(allTags.entries())
        .filter(([key, value]) => key.toLowerCase().includes(search))
        .map(([key]) => key)
        .slice(0, 10);
    } else {
      for (const [key, value] of allTags) {
        if (filteredTags.size - selectedTags.size == 10) {
          return;
        }
        filteredTags.set(key, value);
      }
    }

    for (const [key, value] of allTags) {
      if (searchedTags?.includes(key)) {
        filteredTags.set(key, value);
      } else {
        filteredTags.delete(key);
      }
    }
  } //searchTags

  function searchCategories() {
    const search = document.getElementById("searchCategories")?.value;
    let searchedCategories;

    if (search) {
      searchedCategories = Array.from(allCategories.entries())
        .filter(([key, value]) => key.toLowerCase().includes(search))
        .map(([key]) => key)
        .slice(0, 10);
    } else {
      for (const [key, value] of allCategories) {
        if (filteredCategories.size - selectedCategories.size == 10) {
          return;
        }
        filteredCategories.set(key, value);
      }
    }

    for (const [key, value] of allCategories) {
      if (searchedCategories?.includes(key)) {
        filteredCategories.set(key, value);
      } else {
        filteredCategories.delete(key);
      }
    }
  } //searchCategories

  async function nextStream() {
    let embeddedChannel = player?.getChannel() || 0;
    let currentIndex = previousChannels.findIndex((x) => x.username == embeddedChannel);

    if (previousChannels[currentIndex + 1]) {
      showPreviousStream(currentIndex, true);
      return;
    }

    currentChannel.avatar = undefined;
    currentChannel.username = undefined;
    currentChannel.displayName = undefined;
    currentChannel.title = undefined;
    currentChannel.category = undefined;
    currentChannel.tags = [];

    nextStreamCooldown = true;
    setTimeout(() => {
      nextStreamCooldown = false;
    }, 2000);

    let channelIDs = Array.from(filteredList.keys());
    let randomIndex = Math.floor(Math.random() * channelIDs.length);
    let channelID = channelIDs[randomIndex];
    filteredList.delete(channelID);
    channelIDs.splice(randomIndex, 1);
    while (seenChannels.includes(channelID)) {
      channelID = Math.floor(Math.random() * channelIDs.length);
      filteredList.delete(channelID);
      channelIDs.splice(randomIndex, 1);
    }

    if (filteredList.size == 0 || !channelID) {
      showToast("No more channels left on the list, change your filters or refresh to get a new list", "alert-error", 5000);
      return;
    }
    if (retryLimit > 5) {
      showToast("Too many retries, something might be wrong :(", "alert-error", 4000);
      return;
    }

    //update stream info
    try {
      let response = await fetch(`https://helper.guessr.tv/twitch/streams?user_id=${channelID}`);
      let stream = await response.json();
      if (!stream.data[0]) {
        retryLimit++;
        return nextStream();
      }
      let response2 = await fetch(`https://helper.guessr.tv/twitch/users?id=${channelID}`);
      let user = await response2.json();
      currentChannel.avatar = user.data[0]?.profile_image_url || "/guessr.png";
      currentChannel.username = stream.data[0]?.user_login || "";
      currentChannel.displayName = stream.data[0]?.user_name || "";
      currentChannel.title = stream.data[0]?.title || "";
      currentChannel.category = stream.data[0]?.game_name || "";
      currentChannel.tags = stream.data[0]?.tags || [];

      retryLimit = 0;
      let options = {
        autoplay: true,
        width: "100%",
        height: "100%",
        channel: stream.data[0].user_login,
        layout: "video-with-chat",
        theme: "dark",
        parent: ["guessr.tv", "127.0.0.1"],
      };
      if (!player) {
        player = new Twitch.Embed("twitchEmbed", options);
      } else {
        player.setChannel(stream.data[0].user_login);
      }

      previousChannels.push($state.snapshot(currentChannel));
      seenChannels.push(channelID);
      localforage.setItem("seenChannels", JSON.stringify(seenChannels));
      //elements.seenChannels.innerHTML = seenChannels.length;
    } catch (error) {
      console.log(error);
      retryLimit++;
      return nextStream();
    }
  } //nextStream

  function previousStream() {
    let embeddedChannel = player.getChannel();
    let currentIndex = previousChannels.findIndex((x) => x.username == embeddedChannel);
    if (currentIndex == 0) {
      showToast("Can't go further back", "alert-error", 3000);
      return;
    }
    showPreviousStream(currentIndex, false);
  } //previousStream

  /**
   * @param {number} currentIndex
   * @param {boolean} forward
   */
  function showPreviousStream(currentIndex, forward) {
    currentChannel = $state.snapshot(previousChannels[(currentIndex += forward ? 1 : -1)]);
    player.setChannel(currentChannel.username);
  } //showPreviousStream
</script>

<svelte:head>
  <script src="https://embed.twitch.tv/embed/v1.js" async></script>
</svelte:head>

<dialog id="avatarModal" class="modal">
  <div class="modal-box">
    <img class="w-full aspect-square" src={currentChannel.avatar} alt="avatar" />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
  <main class="p-3">
    <div id="twitchEmbed"></div>
  </main>

  <footer class="sticky bottom-2 z-10 p-3 h-22">
    <div class="flex flex-row justify-between">
      <div class="flex flex-row">
        <div class="shrink-0 me-2">
          {#if currentChannel?.avatar}
            <img
              class="rounded-full size-18 cursor-zoom-in"
              onclick={() => {
                avatarModal.showModal();
              }}
              src={currentChannel.avatar}
              alt="avatar"
            />
          {:else}
            <div class="placeholder-circle animate-pulse size-18"></div>
          {/if}
        </div>

        <div class="flex flex-col shrink">
          <div>
            {#if currentChannel?.username && currentChannel?.displayName}
              <a class="hover:link font-bold" target="_blank" rel="noopener noreferrer" href="https://twitch.tv/{currentChannel.username}">
                {currentChannel.username === currentChannel.displayName.toLowerCase() ? currentChannel.username : `${currentChannel.displayName} (${currentChannel.username})`}
              </a>
            {:else}
              <div class="placeholder animate-pulse w-30 h-4 m-1"></div>
            {/if}
          </div>

          <div>
            {#if currentChannel?.title === ""}
              <span class="opacity-70 italic">No title</span>
            {:else if currentChannel?.title}
              {currentChannel.title}
            {:else}
              <div class="placeholder animate-pulse w-100 h-4 m-1"></div>
            {/if}
          </div>

          <div class="flex flex-row">
            <div class="me-2">
              {#if currentChannel?.category === ""}
                <div class="opacity-70 italic">No category</div>
              {:else if currentChannel?.category}
                <a class="hover:link font-thin" target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/search?term={encodeURIComponent(currentChannel.category)}">
                  {currentChannel.category}
                </a>
              {:else}
                <div class="placeholder animate-pulse w-35 h-4 m-1"></div>
              {/if}
            </div>

            <div>
              {#if currentChannel?.tags?.length}
                {#each currentChannel?.tags as tag}
                  <a class="link" target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/directory/all/tags/{tag}">
                    <span class="badge badge-neutral me-1 text-xs">{tag}</span>
                  </a>
                {:else}
                  <span class="opacity-70">No tags</span>
                {/each}
              {:else}
                <div class="flex flex-row">
                  <div class="placeholder animate-pulse rounded-full w-15 h-5 m-1"></div>
                  <div class="placeholder animate-pulse rounded-full w-15 h-5 m-1"></div>
                  <div class="placeholder animate-pulse rounded-full w-15 h-5 m-1"></div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-row shrink-0 items-center gap-2">
        <div class="flex flex-row h-fit items-center">
          <div class="card w-fit bg-base-300 shadow-xl">
            <div class="card-body p-2 flex flex-row">
              <span style="writing-mode: sideways-lr; text-orientation: mixed">Filters</span>

              <button class="btn btn-success" popovertarget="languagePopover" style="anchor-name:--languagePopoverAnchor">
                <IcBaselineLanguage class="text-lg" />Languages ({selectedLanguages.size || allLanguages.size})
              </button>
              <div
                class="dropdown dropdown-top dropdown-center w-52 rounded-box bg-base-300 border border-success shadow-sm p-3"
                popover
                id="languagePopover"
                style="position-anchor:--languagePopoverAnchor"
              >
                <h5 class="text-xl">Selected languages:</h5>
                <div class="max-h-60 overflow-auto w-full">
                  {#if selectedLanguages.size}
                    <form class="space-y-2">
                      {#each Array.from(selectedLanguages) as [key, value] (key)}
                        <label class="flex items-center space-x-1">
                          <input checked class="checkbox language-filter" type="checkbox" value={key} onchange={updateSelectedLanguages} />
                          {#if key}
                            <p>{getLanguage(key)} <span class="opacity-70">({value.toLocaleString()})</span></p>
                          {:else}
                            <p class="opacity-70 italic">Unknown<span class="opacity-70">({value.toLocaleString()})</span></p>
                          {/if}
                        </label>
                      {/each}
                    </form>
                  {:else}
                    <span class="opacity-70">None (will show all languages)</span>
                  {/if}
                </div>

                <div class="divider"></div>

                <label class="input mb-3">
                  <IcBaselineSearch />
                  <input id="searchLanguages" type="search" class="grow" placeholder="Search" oninput={searchLanguages} />
                </label>

                <div class="h-60 overflow-auto w-full">
                  {#if filteredLanguages.size}
                    <form class="space-y-2">
                      {#each Array.from(filteredLanguages) as [key, value] (key)}
                        {#if !selectedLanguages.get(key)}
                          <label class="flex items-center space-x-1">
                            <input class="checkbox language-filter" type="checkbox" value={key} onchange={updateSelectedLanguages} />
                            {#if key}
                              <p>{getLanguage(key)} <span class="opacity-70">({value.toLocaleString()})</span></p>
                            {:else}
                              <p class="opacity-70 italic">Unknown<span class="opacity-70">({value.toLocaleString()})</span></p>
                            {/if}
                          </label>
                        {/if}
                      {/each}
                    </form>
                  {:else if filteredLanguages.size == 0 && allLanguages.size}
                    <div class="text-center">
                      <span class="opacity-70">No results</span>
                    </div>
                  {:else}
                    <div class="text-center">
                      <span class="loading loading-spinner loading-xl"></span>
                    </div>
                  {/if}
                </div>
              </div>

              <button class="btn btn-error" popovertarget="tagsPopover" style="anchor-name:--tagsPopoverAnchor">
                <IcBaselineLabel class="text-lg" />Tags ({(selectedTags.size || allTags.size).toLocaleString()})
              </button>
              <div
                class="dropdown dropdown-top dropdown-center w-52 rounded-box bg-base-300 border border-error shadow-sm p-3"
                popover
                id="tagsPopover"
                style="position-anchor:--tagsPopoverAnchor"
              >
                <h5 class="text-xl">Selected tags:</h5>
                <div class="max-h-60 overflow-auto w-full">
                  {#if selectedTags.size}
                    <form class="space-y-2">
                      {#each Array.from(selectedTags) as [key, value] (key)}
                        <label class="flex items-center space-x-1">
                          <input checked class="checkbox tag-filter" type="checkbox" value={key} onchange={updateSelectedTags} />
                          <p>{escape(key)} <span class="opacity-70">({value.toLocaleString()})</span></p>
                        </label>
                      {/each}
                    </form>
                  {:else}
                    <span class="opacity-70">None (will show all tags)</span>
                  {/if}
                </div>

                <div class="divider"></div>

                <label class="input mb-3">
                  <IcBaselineSearch />
                  <input id="searchTags" type="search" class="grow" placeholder="Search" oninput={searchTags} />
                </label>

                <div class="h-60 overflow-auto w-full">
                  {#if filteredTags.size}
                    <form class="space-y-2 mb-3">
                      {#each Array.from(filteredTags) as [key, value] (key)}
                        {#if !selectedTags.get(key)}
                          <label class="flex items-center space-x-1">
                            <input class="checkbox tag-filter" type="checkbox" value={key} onchange={updateSelectedTags} />
                            <p>{escape(key)} <span class="opacity-70">({value.toLocaleString()})</span></p>
                          </label>
                        {/if}
                      {/each}
                    </form>

                    <small class="opacity-70">{allTags?.size?.toLocaleString()} tags total. Use the search box above to filter them</small>
                  {:else if filteredTags.size == 0 && allTags.size}
                    <div class="text-center">
                      <span class="opacity-70">No results</span>
                    </div>
                  {:else}
                    <div class="text-center">
                      <span class="loading loading-spinner loading-xl"></span>
                    </div>
                  {/if}
                </div>
              </div>

              <button class="btn btn-warning" popovertarget="categoriesPopover" style="anchor-name:--categoriesPopoverAnchor">
                <IcBaselineSportsEsports class="text-lg" />Categories ({(selectedCategories.size || allCategories.size).toLocaleString()})
              </button>
              <div
                class="dropdown dropdown-top dropdown-center w-52 rounded-box bg-base-300 border border-warning shadow-sm p-3"
                popover
                id="categoriesPopover"
                style="position-anchor:--categoriesPopoverAnchor"
              >
                <h5 class="text-xl">Selected categories:</h5>
                <div class="max-h-60 overflow-auto w-full">
                  {#if selectedCategories.size}
                    <form class="space-y-2">
                      {#each Array.from(selectedCategories) as [key, value] (key)}
                        <label class="flex items-center space-x-1">
                          <input checked class="checkbox category-filter" type="checkbox" value={key} onchange={updateSelectedCategories} />
                          <p>{escape(key)} <span class="opacity-70">({value.toLocaleString()})</span></p>
                        </label>
                      {/each}
                    </form>
                  {:else}
                    <span class="opacity-70">None (will show all categories)</span>
                  {/if}
                </div>

                <div class="divider"></div>

                <label class="input mb-3">
                  <IcBaselineSearch />
                  <input id="searchCategories" type="search" class="grow" placeholder="Search" oninput={searchCategories} />
                </label>

                <div class="h-60 overflow-auto w-full">
                  {#if filteredCategories.size}
                    <form class="space-y-2 mb-3">
                      {#each Array.from(filteredCategories) as [key, value] (key)}
                        {#if !selectedCategories.get(key)}
                          <label class="flex items-center space-x-1">
                            <input class="checkbox category-filter" type="checkbox" value={key} onchange={updateSelectedCategories} />
                            <p>{escape(key)} <span class="opacity-70">({value.toLocaleString()})</span></p>
                          </label>
                        {/if}
                      {/each}
                    </form>

                    <small class="opacity-70">{allCategories?.size?.toLocaleString()} categories total. Use the search box above to filter them</small>
                  {:else if filteredCategories.size == 0 && allCategories.size}
                    <div class="text-center">
                      <span class="opacity-70">No results</span>
                    </div>
                  {:else}
                    <div class="text-center">
                      <span class="loading loading-spinner loading-xl"></span>
                    </div>
                  {/if}
                </div>
              </div>

              <button class="btn btn-info" popovertarget="ViewCountPopover" style="anchor-name:--ViewCountPopoverAnchor">
                <span class="text-2xl"><ViewersSVG /></span>View count
                {#if !viewCountFilter[0] && viewCountFilter[1] == maxViewCount}
                  <span></span>
                {:else if viewCountFilter[0] > 0 && viewCountFilter[1] == maxViewCount}
                  &gt;{viewCountFilter[0].toLocaleString()}
                {:else if !viewCountFilter[0] && viewCountFilter[1]}
                  &lt;{viewCountFilter[1].toLocaleString()}
                {:else if viewCountFilter[0] && viewCountFilter[1]}
                  {viewCountFilter[0].toLocaleString()}<IcBaselineArrowRightAlt />{viewCountFilter[1].toLocaleString()}
                {/if}
              </button>
              <div
                class="dropdown dropdown-top dropdown-end w-200 rounded-box bg-base-300 border border-info shadow-sm p-3"
                popover
                id="ViewCountPopover"
                style="position-anchor:--ViewCountPopoverAnchor"
              >
                <h5 class="text-2xl">View count range</h5>
                <div class="flex flex-row justify-between text-lg m-2">
                  <span>Minimum view count: {viewCountFilter[0].toLocaleString()}</span>
                  <span>Maximum view count: {viewCountFilter[1].toLocaleString()}</span>
                </div>
                <Slider.Root
                  type="multiple"
                  bind:value={viewCountFilterSlider}
                  onValueChange={updateFilteredList}
                  min={0}
                  max={100}
                  autoSort={true}
                  class="relative flex w-190 touch-none select-none items-center p-1 mx-auto mb-3"
                >
                  {#snippet children({ thumbItems })}
                    <span class="relative h-3 w-full grow rounded-full bg-base-300 cursor-pointer overflow-hidden">
                      <Slider.Range class="absolute h-full bg-info transition-all" />
                    </span>
                    {#each thumbItems as { index } (index)}
                      <Slider.Thumb {index} class="btn btn-circle btn-sm bg-info focus:outline-none focus:ring-1 focus:ring-info" />
                    {/each}
                  {/snippet}
                </Slider.Root>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-row gap-2">
          <div class="flex flex-col">
            <button disabled={previousChannels.length <= 1} onclick={previousStream} class="btn btn-secondary btn-lg w-30 h-12" title="Previous stream">
              <IcBaselineSkipPrevious class="align-top" />
            </button>
            <small class="opacity-70 text-center">
              {previousChannels.length}
              {previousChannels.length == 1 ? "stream" : "streams"} watched
            </small>
          </div>
          <div class="flex flex-col">
            <button onclick={nextStream} class="btn btn-accent btn-lg h-12" disabled={nextStreamCooldown}>
              <IcBaselineSkipNext /> Next stream
            </button>
            <small class="opacity-70 text-center">
              {filteredList.size.toLocaleString()}
              {filteredList.size == 1 ? "stream" : "streams"} left
            </small>
          </div>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  #twitchEmbed {
    height: 85vh;
    z-index: 1;
  }
</style>
