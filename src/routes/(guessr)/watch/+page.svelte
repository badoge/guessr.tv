<script>
  import { onMount } from "svelte";
  import localforage from "localforage";
  import { toaster } from "$lib/functions";
  import { Popover } from "@skeletonlabs/skeleton-svelte";
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
  let categoryCounts = new Map();
  let languageCounts = new Map();
  let tagCounts = new Map();

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
  let maxViewCount = 0;

  function languagePopoverClose() {
    openStateLanguage = false;
  }
  function tagsPopoverClose() {
    openStateTags = false;
  }
  function categroyPopoverClose() {
    openStateCategory = false;
  }
  function viewCountPopoverClose() {
    openStateViewCount = false;
  }

  onMount(async () => {
    elements = {
      selectedLanguages: document.getElementById("selectedLanguages"),
      searchLanguages: document.getElementById("searchLanguages"),
      languagesDiv: document.getElementById("languagesDiv"),

      selectedTags: document.getElementById("selectedTags"),
      searchTags: document.getElementById("searchTags"),
      tagsDiv: document.getElementById("tagsDiv"),

      selectedCategories: document.getElementById("selectedCategories"),
      searchCategories: document.getElementById("searchCategories"),
      categoriesDiv: document.getElementById("categoriesDiv"),

      languageFilterCount: document.getElementById("languageFilterCount"),
      tagFilterCount: document.getElementById("tagFilterCount"),
      categoryFilterCount: document.getElementById("categoryFilterCount"),

      enableMinFilter: document.getElementById("enableMinFilter"),
      enableMaxFilter: document.getElementById("enableMaxFilter"),
      minFilterSlider: document.getElementById("minFilterSlider"),
      maxFilterSlider: document.getElementById("maxFilterSlider"),
      minFilter: document.getElementById("minFilter"),
      maxFilter: document.getElementById("maxFilter"),
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
    //loadCounts();
    //loadFilters();
    nextStream();

    // elements.enableMaxFilter.addEventListener("change", (event) => {
    //   elements.maxFilter.disabled = !event.target.checked;
    //   elements.maxFilterSlider.disabled = !event.target.checked;
    // });

    // elements.enableMinFilter.addEventListener("change", (event) => {
    //   elements.minFilter.disabled = !event.target.checked;
    //   elements.minFilterSlider.disabled = !event.target.checked;
    // });

    // elements.minFilterSlider.oninput = function () {
    //   let value = parseInt(this.value, 10);
    //   elements.minFilter.value = Math.round(Math.exp((Math.log(maxViewCount) / 100) * value));
    //   if (value == 0) {
    //     elements.minFilter.value = 0;
    //   }
    // };
    // elements.minFilter.oninput = function () {
    //   let value = parseInt(this.value, 10);
    //   elements.minFilterSlider.value = (100 * Math.log(value)) / Math.log(maxViewCount);
    //   if (value == 0) {
    //     elements.minFilterSlider.value = 0;
    //   }
    // };

    // elements.maxFilterSlider.oninput = function () {
    //   let value = parseInt(this.value, 10);
    //   elements.maxFilter.value = Math.round(Math.exp((Math.log(maxViewCount) / 100) * value));
    //   if (value == 0) {
    //     elements.maxFilter.value = 0;
    //   }
    // };
    // elements.maxFilter.oninput = function () {
    //   let value = parseInt(this.value, 10);
    //   elements.maxFilterSlider.value = (100 * Math.log(value)) / Math.log(maxViewCount);
    //   if (value == 0) {
    //     elements.maxFilterSlider.value = 0;
    //   }
    // };

    // elements.minFilterSlider.onchange = function () {
    //   updateFilteredCount();
    // };
    // elements.minFilter.onchange = function () {
    //   updateFilteredCount();
    // };
    // elements.maxFilterSlider.onchange = function () {
    //   updateFilteredCount();
    // };
    // elements.maxFilter.onchange = function () {
    //   updateFilteredCount();
    // };
    // elements.enableMinFilter.onchange = function () {
    //   updateFilteredCount();
    // };
    // elements.enableMaxFilter.onchange = function () {
    //   updateFilteredCount();
    // };
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
      //elements.maxFilter.placeholder = maxViewCount;
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Could not load channel list :(",
        duration: 5000,
      });
      console.log(error);
    }
  } //getMainList

  function loadCounts() {
    languageCounts = new Map();
    tagCounts = new Map();
    categoryCounts = new Map();

    mainList.forEach((value, key, map) => {
      languageCounts.set(value.language, (languageCounts.get(value.language) ?? 0) + 1);
      categoryCounts.set(value.game_name, (categoryCounts.get(value.game_name) ?? 0) + 1);
      for (let index = 0; index < value?.tags?.length; index++) {
        tagCounts.set(value.tags[index], (tagCounts.get(value.tags[index]) ?? 0) + 1);
      }
    });

    languageCounts = new Map([...languageCounts.entries()].sort((a, b) => b[1] - a[1]));
    tagCounts = new Map([...tagCounts.entries()].sort((a, b) => b[1] - a[1]));
    categoryCounts = new Map([...categoryCounts.entries()].sort((a, b) => b[1] - a[1]));
  } //loadCounts

  function loadFilters() {
    elements.languagesDiv.innerHTML = "";
    elements.tagsDiv.innerHTML = "";
    elements.categoriesDiv.innerHTML = "";

    const topTags = Array.from(tagCounts.entries()).slice(0, 10);
    const topCategories = Array.from(categoryCounts.entries()).slice(0, 10);

    languageCounts.forEach((value, key, map) => {
      elements.languagesDiv.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input class="form-check-input language-filter" type="checkbox" value="${key}" id="${key}_language_checkbox" onchange="updateLanguages()">
        <label class="form-check-label" for="${key}_language_checkbox">
          ${getLanguage(key)} <span class="opacity-60">(${value.toLocaleString()})</span>
        </label>
      </div>`,
      );
    });

    for (let index = 0; index < topTags.length; index++) {
      elements.tagsDiv.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input class="form-check-input tag-filter" type="checkbox" value="${topTags[index][0]}" id="${topTags[index][0]}_tag_checkbox" onchange="updateTags()">
        <label class="form-check-label" for="${topTags[index][0]}_tag_checkbox">
          ${escapeString(topTags[index][0])} <span class="opacity-60">(${topTags[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    elements.tagsDiv.insertAdjacentHTML(
      `beforeend`,
      `<br><div class="opacity-60">${(tagCounts.size - topTags.length).toLocaleString()} more tags. Use the search box above to find more</div>`,
    );

    for (let index = 0; index < topCategories.length; index++) {
      elements.categoriesDiv.insertAdjacentHTML(
        `beforeend`,
        `
      <div class="form-check">
        <input class="form-check-input category-filter" type="checkbox" value="${topCategories[index][0]}" id="${topCategories[index][0].replace(
          /\s+/g,
          "_",
        )}_category_checkbox" onchange="updateCategories()">
        <label class="form-check-label" for="${topCategories[index][0].replace(/\s+/g, "_")}_category_checkbox">
          ${topCategories[index][0] == "No category" ? `<em class="opacity-60">No category</em>` : escapeString(topCategories[index][0])} 
          <span class="opacity-60">(${topCategories[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    elements.categoriesDiv.insertAdjacentHTML(
      `beforeend`,
      `<br><div class="opacity-60">${(categoryCounts.size - topCategories.length).toLocaleString()} more categories. Use the search box above to find more</div>`,
    );
  } //loadFilters

  function updateLanguages() {
    const selected = Array.from(document.querySelectorAll(".language-filter:checked")).map((e) => e.value);
    const search = elements.searchLanguages.value;
    let languages;

    if (search) {
      languages = Array.from(languageCounts.entries()).filter(([key, value]) => getLanguage(key).toLowerCase().includes(search));
    } else {
      languages = Array.from(languageCounts.entries());
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
          ${getLanguage(selected[index])} <span class="opacity-60">(${languageCounts.get(selected[index]).toLocaleString()})</span>
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
      tags = Array.from(tagCounts.entries())
        .filter(([key, value]) => key.toLowerCase().includes(search))
        .slice(0, 10);
    } else {
      tags = Array.from(tagCounts.entries()).slice(0, 10);
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
          ${selected[index]} <span class="opacity-60">(${tagCounts.get(selected[index]).toLocaleString()})</span>
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
      categories = Array.from(categoryCounts.entries())
        .filter(([key, value]) => key.toLowerCase().includes(search))
        .slice(0, 10);
    } else {
      categories = Array.from(categoryCounts.entries()).slice(0, 10);
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
          ${selected[index] == "No category" ? `<em class="opacity-60">No category</em>` : escapeString(selected[index])} <span class="opacity-60">(${categoryCounts
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

    let minFilter = parseInt(elements.minFilter.value);
    let maxFilter = parseInt(elements.maxFilter.value);

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

      if (elements.enableMinFilter.checked && value.viewer_count < minFilter) {
        filteredList.delete(key);
      }

      if (elements.enableMaxFilter.checked && value.viewer_count > maxFilter) {
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
          <div class="card w-full preset-filled-surface-100-900 p-2 text-center">
            <Popover
              open={openStateLanguage}
              onOpenChange={(e) => (openStateLanguage = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-success text-lg h-9"
              contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[320px]"
            >
              {#snippet trigger()}<IcBaselineLanguage />Languages<span id="languageFilterCount"></span>{/snippet}
              {#snippet content()}
                <article style="height: 400px; width: 300px; overflow-y: auto">
                  <h5>Selected languages:</h5>
                  <div class="mb-3" id="selectedLanguages"><span class="opacity-60">None (will show all languages)</span></div>
                  <div class="input-group mb-3">
                    <span class="input-group-text"><IcBaselineSearch /></span>
                    <input id="searchLanguages" type="text" class="form-control" placeholder="Search" oninput={updateLanguages} />
                  </div>
                  <hr />
                  <div id="languagesDiv">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </article>
              {/snippet}
            </Popover>

            <Popover
              open={openStateTags}
              onOpenChange={(e) => (openStateTags = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-error text-lg h-9"
              contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[320px]"
            >
              {#snippet trigger()}<IcBaselineLabel />Tags<span id="tagFilterCount"></span>{/snippet}
              {#snippet content()}
                <article style="height: 400px; width: 300px; overflow-y: auto">
                  <h5>Selected tags:</h5>
                  <div class="mb-3" id="selectedTags"><span class="opacity-60">None (will show all tags)</span></div>
                  <div class="input-group mb-3">
                    <span class="input-group-text"><IcBaselineSearch /></span>
                    <input id="searchTags" type="text" class="form-control" placeholder="Search" oninput={updateTags} />
                  </div>
                  <hr />
                  <div id="tagsDiv">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </article>
              {/snippet}
            </Popover>

            <Popover
              open={openStateCategory}
              onOpenChange={(e) => (openStateCategory = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-warning text-lg h-9"
              contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[320px]"
            >
              {#snippet trigger()}<IcBaselineSportsEsports />Categories<span id="categoryFilterCount"></span>{/snippet}
              {#snippet content()}
                <article style="height: 400px; width: 300px; overflow-y: auto">
                  <h5>Selected categories:</h5>
                  <div class="mb-3" id="selectedCategories"><span class="opacity-60">None (will show all categories)</span></div>
                  <div class="input-group mb-3">
                    <span class="input-group-text"><IcBaselineSearch /></span>
                    <input id="searchCategories" type="text" class="form-control" placeholder="Search" oninput={updateCategories} />
                  </div>
                  <hr />

                  <div id="categoriesDiv">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </article>
              {/snippet}
            </Popover>

            <Popover
              open={openStateViewCount}
              onOpenChange={(e) => (openStateViewCount = e.open)}
              positioning={{ placement: "top" }}
              triggerBase="btn preset-tonal-tertiary text-lg h-9"
              contentBase="card bg-surface-200-800 p-4 space-y-4 max-w-[720px]"
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
                View count{/snippet}
              {#snippet content()}
                <article style="height: 150px; width: 700px; overflow-y: auto">
                  <div class="input-group">
                    <div class="input-group-text p-1">
                      <div class="form-check form-switch m-0 ms-1">
                        <input class="form-check-input" type="checkbox" role="switch" id="enableMinFilter" />
                      </div>
                    </div>
                    <span class="input-group-text">Minimum view count</span>
                    <span class="input-group-text" style="width: 300px"><input disabled type="range" class="form-range" id="minFilterSlider" min="0" max="100" step="1" value="0" /></span>
                    <input disabled id="minFilter" placeholder="0" type="number" aria-label="Minimum view count" class="form-control" />
                  </div>
                  <br />
                  <div class="input-group">
                    <div class="input-group-text p-1">
                      <div class="form-check form-switch m-0 ms-1">
                        <input class="form-check-input" type="checkbox" role="switch" id="enableMaxFilter" />
                      </div>
                    </div>
                    <span class="input-group-text">Maximum view count</span>
                    <span class="input-group-text" style="width: 300px"><input disabled type="range" class="form-range" id="maxFilterSlider" min="0" max="100" step="1" value="100" /></span>
                    <input disabled id="maxFilter" placeholder="0" type="number" aria-label="Maximum view count" class="form-control" />
                  </div>
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
