<script>
  import { onMount } from "svelte";
  import localforage from "localforage";
  import { toaster, getLanguage, escapeString } from "$lib/functions";
  import { Popover, ProgressRing, Slider } from "@skeletonlabs/skeleton-svelte";
  import IcBaselineSkipNext from "~icons/ic/baseline-skip-next";
  import IcBaselineSkipPrevious from "~icons/ic/baseline-skip-previous";
  import IcBaselineSearch from "~icons/ic/baseline-search";
  import IcBaselineLanguage from "~icons/ic/baseline-language";
  import IcBaselineLabel from "~icons/ic/baseline-label";
  import IcBaselineSportsEsports from "~icons/ic/baseline-sports-esports";

  let openStateLanguage = $state(false);
  let openStateTags = $state(false);
  let openStateCategory = $state(false);
  let openStateViewCount = $state(false);
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

  let filteredList = $state(new Map());

  let mainList = new Map();
  let filterLanguages = $state(new Map());
  let filterTags = $state(new Map());
  let filterCategories = $state(new Map());
  let filterViewCountSlider = $state([0, 100]);
  let maxViewCount = $state(0);
  let filterViewCount = $derived.by(() => {
    let min = Math.round(Math.exp((Math.log(maxViewCount) / 100) * filterViewCountSlider[0]));
    let max = Math.round(Math.exp((Math.log(maxViewCount) / 100) * filterViewCountSlider[1]));

    if (filterViewCountSlider[0] == 0) {
      min = 0;
    }
    if (filterViewCountSlider[1] == 0) {
      max = 0;
    }
    return [min, max];
  });

  /**
   * @type {[any, any][]}
   */
  let topTags = $state([]);
  /**
   * @type {string | any[]}
   */
  let topCategories = $state([]);

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
    elements = {
      selectedLanguages: document.getElementById("selectedLanguages"),
      searchLanguages: document.getElementById("searchLanguages"),

      selectedTags: document.getElementById("selectedTags"),
      searchTags: document.getElementById("searchTags"),
      tagsDiv: document.getElementById("tagsDiv"),

      selectedCategories: document.getElementById("selectedCategories"),
      searchCategories: document.getElementById("searchCategories"),
      categoriesDiv: document.getElementById("categoriesDiv"),

      languageFilterCount: document.getElementById("languageFilterCount"),
      tagFilterCount: document.getElementById("tagFilterCount"),
      categoryFilterCount: document.getElementById("categoryFilterCount"),
    };

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
    //   toaster.create({
    //     type: "success",
    //     title: "Seen channels reset",
    //     duration: 2000,
    //   });
    // };

    await getMainList();
    loadFilters();
    nextStream();
  });

  let elements;

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
      filteredList = new Map(mainList);
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Could not load channel list :(",
        duration: 5000,
      });
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

    //sort the maps and update the values of the state filter vars so that the filter popovers load
    filterLanguages = new Map([...languages.entries()].sort((a, b) => b[1] - a[1]));
    filterTags = new Map([...tags.entries()].sort((a, b) => b[1] - a[1]));
    filterCategories = new Map([...categories.entries()].sort((a, b) => b[1] - a[1]));

    topTags = Array.from(filterTags.entries()).slice(0, 10);
    topCategories = Array.from(filterCategories.entries()).slice(0, 10);
  } //loadFilters

  function updateLanguages() {
    const selected = Array.from(document.querySelectorAll(".language-filter:checked")).map((e) => e.value);
    const search = elements.searchLanguages.value;
    let languages;

    if (search) {
      languages = Array.from(filterLanguages.entries()).filter(([key, value]) => getLanguage(key).toLowerCase().includes(search));
    } else {
      languages = Array.from(filterLanguages.entries());
    }

    if (selected.length == 0) {
      elements.selectedLanguages.innerHTML = `<span class="opacity-60">None (will show all languages)</span>`;
    } else {
      elements.selectedLanguages.innerHTML = "";
    }
    elements.languagesDiv.innerHTML = "";

    for (let index = 0; index < selected.length; index++) {
      elements.selectedLanguages.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input checked class="form-check-input language-filter" type="checkbox" value="${selected[index]}" id="${selected[index]}_language_checkbox" onchange="updateLanguages()">
        <label class="form-check-label" for="${selected[index]}_language_checkbox">
          ${getLanguage(selected[index])} <span class="opacity-60">(${filterLanguages.get(selected[index]).toLocaleString()})</span>
        </label>
      </div>`,
      );
    }

    for (let index = 0; index < languages.length; index++) {
      if (selected.includes(languages[index][0])) {
        continue;
      }
      elements.languagesDiv.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input class="form-check-input language-filter" type="checkbox" value="${languages[index][0]}" id="${languages[index][0]}_language_checkbox" onchange="updateLanguages()">
        <label class="form-check-label" for="${languages[index][0]}_language_checkbox">
          ${getLanguage(languages[index][0])} <span class="opacity-60">(${languages[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    if (languages.length == 0) {
      elements.languagesDiv.innerHTML = `<span class="opacity-60">No results</span>`;
    }

    updateFilteredCount();
  } //updateLanguages

  function updateTags() {
    const selected = Array.from(document.querySelectorAll(".tag-filter:checked")).map((e) => e.value);
    const search = elements.searchTags.value;
    let tags;

    if (search) {
      tags = Array.from(filterTags.entries())
        .filter(([key, value]) => key.toLowerCase().includes(search))
        .slice(0, 10);
    } else {
      tags = Array.from(filterTags.entries()).slice(0, 10);
    }

    if (selected.length == 0) {
      elements.selectedTags.innerHTML = `<span class="opacity-60">None (will show all tags)</span>`;
    } else {
      elements.selectedTags.innerHTML = "";
    }
    elements.tagsDiv.innerHTML = "";

    for (let index = 0; index < selected.length; index++) {
      elements.selectedTags.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input checked class="form-check-input tag-filter" type="checkbox" value="${selected[index]}" id="${selected[index]}_tag_checkbox" onchange="updateTags()">
        <label class="form-check-label" for="${selected[index]}_tag_checkbox">
          ${selected[index]} <span class="opacity-60">(${filterTags.get(selected[index]).toLocaleString()})</span>
        </label>
      </div>`,
      );
    }

    for (let index = 0; index < tags.length; index++) {
      if (selected.includes(tags[index][0])) {
        continue;
      }
      elements.tagsDiv.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input class="form-check-input tag-filter" type="checkbox" value="${tags[index][0]}" id="${tags[index][0]}_tag_checkbox" onchange="updateTags()">
        <label class="form-check-label" for="${tags[index][0]}_tag_checkbox">
          ${tags[index][0]} <span class="opacity-60">(${tags[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    if (tags.length == 0) {
      elements.tagsDiv.innerHTML = `<span class="opacity-60">No results</span>`;
    }
    updateFilteredCount();
  } //updateTags

  function updateCategories() {
    const selected = Array.from(document.querySelectorAll(".category-filter:checked")).map((e) => e.value);
    const search = elements.searchCategories.value;
    let categories;

    if (search) {
      categories = Array.from(filterCategories.entries())
        .filter(([key, value]) => key.toLowerCase().includes(search))
        .slice(0, 10);
    } else {
      categories = Array.from(filterCategories.entries()).slice(0, 10);
    }

    if (selected.length == 0) {
      elements.selectedCategories.innerHTML = `<span class="opacity-60">None (will show all categories)</span>`;
    } else {
      elements.selectedCategories.innerHTML = "";
    }
    elements.categoriesDiv.innerHTML = "";

    for (let index = 0; index < selected.length; index++) {
      elements.selectedCategories.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input checked class="form-check-input category-filter" type="checkbox" value="${selected[index]}" id="${selected[index].replace(
          /\s+/g,
          "_",
        )}_category_checkbox" onchange="updateCategories()">
        <label class="form-check-label" for="${selected[index].replace(/\s+/g, "_")}_category_checkbox">
          ${selected[index] == "No category" ? `<em class="opacity-60">No category</em>` : escapeString(selected[index])} <span class="opacity-60">(${filterCategories
            .get(selected[index])
            .toLocaleString()})</span>
        </label>
      </div>`,
      );
    }

    for (let index = 0; index < categories.length; index++) {
      if (selected.includes(categories[index][0])) {
        continue;
      }
      elements.categoriesDiv.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input class="form-check-input category-filter" type="checkbox" value="${categories[index][0]}" id="${categories[index][0].replace(
          /\s+/g,
          "_",
        )}_category_checkbox" onchange="updateCategories()">
        <label class="form-check-label" for="${categories[index][0].replace(/\s+/g, "_")}_category_checkbox">
          ${categories[index][0] == "No category" ? `<em class="opacity-60">No category</em>` : escapeString(categories[index][0])} <span class="opacity-60">(${categories[
            index
          ][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    if (categories.length == 0) {
      elements.categoriesDiv.innerHTML = `<span class="opacity-60">No results</span>`;
    }
    updateFilteredCount();
  } //updateCategories

  function updateFilteredCount() {
    filteredList = new Map(mainList);
    let selectedLanguages = Array.from(document.querySelectorAll(".language-filter:checked")).map((e) => e.value);
    let selectedTags = Array.from(document.querySelectorAll(".tag-filter:checked")).map((e) => e.value);
    let selectedCategories = Array.from(document.querySelectorAll(".category-filter:checked")).map((e) => e.value);

    for (const [key, value] of filteredList) {
      if (selectedLanguages.length && !selectedLanguages.includes(value.language)) {
        filteredList.delete(key);
      }
      if (selectedTags.length && !selectedTags.some((tag) => value.tags?.includes(tag))) {
        filteredList.delete(key);
      }
      if (selectedCategories.length && !selectedCategories.includes(value.game_name)) {
        filteredList.delete(key);
      }

      if (value.viewer_count < filterViewCount[0]) {
        filteredList.delete(key);
      }

      if (value.viewer_count > filterViewCount[1]) {
        filteredList.delete(key);
      }
    }

    elements.languageFilterCount.innerHTML = selectedLanguages.length ? ` (${selectedLanguages.length})` : "";
    elements.tagFilterCount.innerHTML = selectedTags.length ? ` (${selectedTags.length})` : "";
    elements.categoryFilterCount.innerHTML = selectedCategories.length ? ` (${selectedCategories.length})` : "";
  } //updateFilteredCount

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
      toaster.create({
        type: "error",
        title: "No more channels left on the list, change your filters or refresh to get a new list",
        duration: 4000,
      });
      return;
    }
    if (retryLimit > 5) {
      toaster.create({
        type: "error",
        title: "Too many retries, something might be wrong :(",
        duration: 3000,
      });
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
      toaster.create({
        type: "error",
        title: "Can't go further back",
        duration: 3000,
      });
      return;
    }
    showPreviousStream(currentIndex, false);
  } //previousStream

  function showPreviousStream(currentIndex, forward) {
    currentChannel = $state.snapshot(previousChannels[(currentIndex += forward ? 1 : -1)]);
    player.setChannel(currentChannel.username);
  } //showPreviousStream
</script>

<svelte:head>
  <script src="https://embed.twitch.tv/embed/v1.js" async></script>
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
  <main class="p-3">
    <div id="twitchEmbed"></div>
  </main>

  <footer class="sticky bottom-2 z-10 p-3 h-22">
    <div class="flex flex-row justify-between">
      <div class="flex flex-row">
        <div class="shrink-0 me-2">
          {#if currentChannel?.avatar}
            <img class="rounded-full size-18" src={currentChannel.avatar} alt="avatar" />
          {:else}
            <div class="placeholder-circle animate-pulse size-18"></div>
          {/if}
        </div>

        <div class="flex flex-col shrink">
          <div>
            {#if currentChannel?.username && currentChannel?.displayName}
              <a class="anchor font-bold" target="_blank" rel="noopener noreferrer" href="https://twitch.tv/{currentChannel.username}">
                {currentChannel.username === currentChannel.displayName.toLowerCase() ? currentChannel.username : `${currentChannel.displayName} (${currentChannel.username})`}
              </a>
            {:else}
              <div class="placeholder animate-pulse w-30 h-4 m-1"></div>
            {/if}
          </div>

          <div>
            {#if currentChannel?.title === ""}
              <span class="opacity-60 italic">No title</span>
            {:else if currentChannel?.title}
              {currentChannel.title}
            {:else}
              <div class="placeholder animate-pulse w-100 h-4 m-1"></div>
            {/if}
          </div>

          <div class="flex flex-row">
            <div class="me-2">
              {#if currentChannel?.category === ""}
                <div class="opacity-60 italic">No category</div>
              {:else if currentChannel?.category}
                <a class="anchor font-thin" target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/search?term={encodeURIComponent(currentChannel.category)}">
                  {currentChannel.category}
                </a>
              {:else}
                <div class="placeholder animate-pulse w-35 h-4 m-1"></div>
              {/if}
            </div>

            <div>
              {#if currentChannel?.tags?.length}
                {#each currentChannel?.tags as tag}
                  <a class="anchor" target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/directory/all/tags/{tag}">
                    <span class="badge rounded-full preset-filled-surface-100-900 me-1 text-xs">{tag}</span>
                  </a>
                {:else}
                  <span class="opacity-60">No tags</span>
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
          <span style="writing-mode: sideways-lr; text-orientation: mixed">Filters</span>
          <div class="card w-full bg-surface-900 p-2 text-center">
            <Popover
              open={openStateLanguage}
              onOpenChange={(e) => (openStateLanguage = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-success text-lg h-9"
              contentBase="card bg-success-950 shadow-xl opacity-90 p-4"
            >
              {#snippet trigger()}<IcBaselineLanguage />Languages<span id="languageFilterCount"></span>{/snippet}
              {#snippet content()}
                <article class="h-100 w-80 p-1 overflow-auto">
                  <h5 class="text-xl">Selected languages:</h5>
                  <div class="mb-3" id="selectedLanguages"><span class="opacity-60">None (will show all languages)</span></div>
                  <hr class="hr border-success-700 mb-3" />

                  <div class="input-group grid-cols-[auto_1fr_auto] mb-3">
                    <div class="ig-cell bg-surface-800"><IcBaselineSearch /></div>
                    <input id="searchLanguages" class="ig-input bg-surface-900" type="text" placeholder="Search" oninput={updateLanguages} />
                  </div>

                  <div id="languagesDiv">
                    {#if filterLanguages.size}
                      <form class="space-y-1">
                        {#each filterLanguages as [key, value]}
                          <label class="flex items-center space-x-1">
                            <input class="checkbox language-filter" type="checkbox" value={key} onchange={updateLanguages} />
                            <p>{getLanguage(key)} <span class="opacity-60">({value.toLocaleString()})</span></p>
                          </label>
                        {/each}
                      </form>
                    {:else}
                      <ProgressRing value={null} classes="place-self-center" size="size-15" meterStroke="stroke-surface-900" trackStroke="stroke-surface-500" />
                    {/if}
                  </div>
                </article>
              {/snippet}
            </Popover>

            <Popover
              open={openStateTags}
              onOpenChange={(e) => (openStateTags = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-error text-lg h-9"
              contentBase="card bg-error-950 shadow-xl opacity-90 p-4"
            >
              {#snippet trigger()}<IcBaselineLabel />Tags<span id="tagFilterCount"></span>{/snippet}
              {#snippet content()}
                <article class="h-100 w-80 p-1 overflow-auto">
                  <h5 class="text-xl">Selected tags:</h5>
                  <div class="mb-3" id="selectedTags"><span class="opacity-60">None (will show all tags)</span></div>
                  <hr class="hr border-error-700 mb-3" />

                  <div class="input-group grid-cols-[auto_1fr_auto] mb-3">
                    <div class="ig-cell bg-surface-800"><IcBaselineSearch /></div>
                    <input id="searchTags" class="ig-input bg-surface-900" type="text" placeholder="Search" oninput={updateTags} />
                  </div>

                  <div id="tagsDiv">
                    {#if topTags.length}
                      <form class="space-y-1">
                        {#each topTags as tag}
                          <label class="flex items-center space-x-1">
                            <input class="checkbox tag-filter" type="checkbox" value={tag[0]} onchange={updateTags} />
                            <p>{escapeString(tag[0])} <span class="opacity-60">({tag[1].toLocaleString()})</span></p>
                          </label>
                        {/each}
                      </form>

                      <div class="opacity-60 mt-3">{(filterTags.size - topTags.length).toLocaleString()} more tags. Use the search box above to find more</div>
                    {:else}
                      <ProgressRing value={null} classes="place-self-center" size="size-15" meterStroke="stroke-surface-900" trackStroke="stroke-surface-500" />
                    {/if}
                  </div>
                </article>
              {/snippet}
            </Popover>

            <Popover
              open={openStateCategory}
              onOpenChange={(e) => (openStateCategory = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-warning text-lg h-9"
              contentBase="card bg-warning-950 shadow-xl opacity-90 p-4"
            >
              {#snippet trigger()}<IcBaselineSportsEsports />Categories<span id="categoryFilterCount"></span>{/snippet}
              {#snippet content()}
                <article class="h-100 w-80 p-1 overflow-auto">
                  <h5 class="text-xl">Selected categories:</h5>
                  <div class="mb-3" id="selectedCategories"><span class="opacity-60">None (will show all categories)</span></div>
                  <hr class="hr border-warning-700 mb-3" />

                  <div class="input-group grid-cols-[auto_1fr_auto] mb-3">
                    <div class="ig-cell bg-surface-800"><IcBaselineSearch /></div>
                    <input id="searchCategories" class="ig-input bg-surface-900" type="text" placeholder="Search" oninput={updateCategories} />
                  </div>

                  <div id="categoriesDiv">
                    {#if topCategories.length}
                      <form class="space-y-1">
                        {#each topCategories as category}
                          <label class="flex items-center space-x-1">
                            <input class="checkbox category-filter" type="checkbox" value={category[0]} onchange={updateCategories} />

                            {#if category[0] == "No category"}
                              <p class="opacity-60 italic">No category <span class="opacity-60">({category[1].toLocaleString()})</span></p>
                            {:else}
                              <p>{escapeString(category[0])}<span class="opacity-60">({category[1].toLocaleString()})</span></p>
                            {/if}
                          </label>
                        {/each}
                      </form>

                      <div class="opacity-60 mt-3">{(filterCategories.size - topCategories.length).toLocaleString()} more categories. Use the search box above to find more</div>
                    {:else}
                      <ProgressRing value={null} classes="place-self-center" size="size-15" meterStroke="stroke-surface-900" trackStroke="stroke-surface-500" />
                    {/if}
                  </div>
                </article>
              {/snippet}
            </Popover>

            <Popover
              open={openStateViewCount}
              onOpenChange={(e) => (openStateViewCount = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-tertiary text-lg h-9"
              contentBase="card bg-tertiary-950 shadow-xl opacity-90 p-4"
            >
              {#snippet trigger()}
                <svg
                  style="filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(201deg) brightness(106%) contrast(106%)"
                  width="24px"
                  height="24px"
                  version="1.1"
                  viewBox="0 0 20 20"
                  x="0px"
                  y="0px"
                >
                  <g>
                    <path
                      fill-rule="evenodd"
                      d="M5 7a5 5 0 116.192 4.857A2 2 0 0013 13h1a3 3 0 013 3v2h-2v-2a1 1 0 00-1-1h-1a3.99 3.99 0 01-3-1.354A3.99 3.99 0 017 15H6a1 1 0 00-1 1v2H3v-2a3 3 0 013-3h1a2 2 0 001.808-1.143A5.002 5.002 0 015 7zm5 3a3 3 0 110-6 3 3 0 010 6z"
                      clip-rule="evenodd"
                    >
                    </path>
                  </g>
                </svg>
                View count
              {/snippet}
              {#snippet content()}
                <article class="h-30 w-200 p-1 overflow-auto">
                  <h5 class="text-2xl">View count range:</h5>
                  <div class="flex flex-row justify-between m-2 p-2">
                    <span>Minimum view count: {filterViewCount[0].toLocaleString()}</span>
                    <span>Maximum view count: {filterViewCount[1].toLocaleString()}</span>
                  </div>
                  <Slider value={filterViewCountSlider} onValueChange={(e) => (filterViewCountSlider = e.value)} />
                </article>
              {/snippet}
            </Popover>
          </div>
        </div>

        <div class="flex flex-row gap-2">
          <div class="flex flex-col">
            <button disabled={previousChannels.length <= 1} type="button" onclick={previousStream} class="btn btn-lg preset-filled-surface-500 w-30 h-12" title="Previous stream">
              <IcBaselineSkipPrevious class="align-top" />
            </button>
            <small class="opacity-60 text-center">
              {previousChannels.length}
              {previousChannels.length == 1 ? "stream" : "streams"} watched
            </small>
          </div>
          <div class="flex flex-col">
            <button type="button" onclick={nextStream} class="btn btn-lg preset-filled-success-500 h-12" disabled={nextStreamCooldown}>
              <IcBaselineSkipNext /> Next stream
            </button>
            <small class="opacity-60 text-center">
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
