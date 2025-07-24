<script>
  import { onMount } from "svelte";
  import localforage from "localforage";
  import { toaster } from "$lib/functions";

  onMount(async () => {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "guessr.tv/watch",
      version: 1.0,
      storeName: "watch",
      description: "watch",
    });

    seenChannels = JSON.parse(await localforage.getItem("seenChannels")) || [];

    elements.seenChannels.innerHTML = seenChannels.length;

    elements.resetSeenChannels.onclick = function () {
      localforage.setItem("seenChannels", JSON.stringify([]));
      elements.seenChannels.innerHTML = 0;
      seenChannels = [];
      toaster.create({
        type: "success",
        title: "Seen channels reset",
        duration: 2000,
      });
    };

    await getMainList();
    loadCounts();
    loadFilters();
    nextStream();

    elements.enableMaxFilter.addEventListener("change", (event) => {
      elements.maxFilter.disabled = !event.target.checked;
      elements.maxFilterSlider.disabled = !event.target.checked;
    });

    elements.enableMinFilter.addEventListener("change", (event) => {
      elements.minFilter.disabled = !event.target.checked;
      elements.minFilterSlider.disabled = !event.target.checked;
    });

    elements.minFilterSlider.oninput = function () {
      let value = parseInt(this.value, 10);
      elements.minFilter.value = Math.round(Math.exp((Math.log(maxViewCount) / 100) * value));
      if (value == 0) {
        elements.minFilter.value = 0;
      }
    };
    elements.minFilter.oninput = function () {
      let value = parseInt(this.value, 10);
      elements.minFilterSlider.value = (100 * Math.log(value)) / Math.log(maxViewCount);
      if (value == 0) {
        elements.minFilterSlider.value = 0;
      }
    };

    elements.maxFilterSlider.oninput = function () {
      let value = parseInt(this.value, 10);
      elements.maxFilter.value = Math.round(Math.exp((Math.log(maxViewCount) / 100) * value));
      if (value == 0) {
        elements.maxFilter.value = 0;
      }
    };
    elements.maxFilter.oninput = function () {
      let value = parseInt(this.value, 10);
      elements.maxFilterSlider.value = (100 * Math.log(value)) / Math.log(maxViewCount);
      if (value == 0) {
        elements.maxFilterSlider.value = 0;
      }
    };

    elements.minFilterSlider.onchange = function () {
      updateFilteredCount();
    };
    elements.minFilter.onchange = function () {
      updateFilteredCount();
    };
    elements.maxFilterSlider.onchange = function () {
      updateFilteredCount();
    };
    elements.maxFilter.onchange = function () {
      updateFilteredCount();
    };
    elements.enableMinFilter.onchange = function () {
      updateFilteredCount();
    };
    elements.enableMaxFilter.onchange = function () {
      updateFilteredCount();
    };
    enableTooltips();

    elements = {
      seenChannels: document.getElementById("seenChannels"),
      resetSeenChannels: document.getElementById("resetSeenChannels"),
      toastContainer: document.getElementById("toastContainer"),
      twitchEmbed: document.getElementById("twitchEmbed"),
      nextStream: document.getElementById("nextStream"),
      previousStream: document.getElementById("previousStream"),
      pfp: document.getElementById("pfp"),
      username: document.getElementById("username"),
      title: document.getElementById("title"),
      tags: document.getElementById("tags"),

      selectedLanguages: document.getElementById("selectedLanguages"),
      searchLanguages: document.getElementById("searchLanguages"),
      languagesDiv: document.getElementById("languagesDiv"),

      selectedTags: document.getElementById("selectedTags"),
      searchTags: document.getElementById("searchTags"),
      tagsDiv: document.getElementById("tagsDiv"),

      selectedCategories: document.getElementById("selectedCategories"),
      searchCategories: document.getElementById("searchCategories"),
      categoriesDiv: document.getElementById("categoriesDiv"),

      seenCount: document.getElementById("seenCount"),
      remainingCount: document.getElementById("remainingCount"),

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
  });

  let elements;

  let mainList = new Map();
  let filteredList = new Map();
  let categoryCounts = new Map();
  let languageCounts = new Map();
  let tagCounts = new Map();
  let seenChannels = [];
  let previousChannels = [];
  let player;
  let retryLimit = 0;
  let seenCount = 0;
  let maxViewCount = 0;
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
      elements.maxFilter.placeholder = maxViewCount;
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

    elements.seenCount.innerHTML = `0 streams watched`;
    elements.remainingCount.innerHTML = `${mainList.size.toLocaleString()} streams left`;
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
          ${getLanguage(key)} <span class="text-body-secondary">(${value.toLocaleString()})</span>
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
          ${escapeString(topTags[index][0])} <span class="text-body-secondary">(${topTags[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    elements.tagsDiv.insertAdjacentHTML(
      `beforeend`,
      `<br><div class="text-body-secondary">${(tagCounts.size - topTags.length).toLocaleString()} more tags. Use the search box above to find more</div>`,
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
          ${topCategories[index][0] == "No category" ? `<em class="text-body-secondary">No category</em>` : escapeString(topCategories[index][0])} 
          <span class="text-body-secondary">(${topCategories[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    elements.categoriesDiv.insertAdjacentHTML(
      `beforeend`,
      `<br><div class="text-body-secondary">${(categoryCounts.size - topCategories.length).toLocaleString()} more categories. Use the search box above to find more</div>`,
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
      elements.selectedLanguages.innerHTML = `<span class="text-body-secondary">None (will show all languages)</span>`;
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
          ${getLanguage(selected[index])} <span class="text-body-secondary">(${languageCounts.get(selected[index]).toLocaleString()})</span>
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
          ${getLanguage(languages[index][0])} <span class="text-body-secondary">(${languages[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    if (languages.length == 0) {
      elements.languagesDiv.innerHTML = `<span class="text-body-secondary">No results</span>`;
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
      elements.selectedTags.innerHTML = `<span class="text-body-secondary">None (will show all tags)</span>`;
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
          ${selected[index]} <span class="text-body-secondary">(${tagCounts.get(selected[index]).toLocaleString()})</span>
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
          ${tags[index][0]} <span class="text-body-secondary">(${tags[index][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    if (tags.length == 0) {
      elements.tagsDiv.innerHTML = `<span class="text-body-secondary">No results</span>`;
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
      elements.selectedCategories.innerHTML = `<span class="text-body-secondary">None (will show all categories)</span>`;
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
          ${selected[index] == "No category" ? `<em class="text-body-secondary">No category</em>` : escapeString(selected[index])} <span class="text-body-secondary">(${categoryCounts
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
          ${categories[index][0] == "No category" ? `<em class="text-body-secondary">No category</em>` : escapeString(categories[index][0])} <span class="text-body-secondary">(${categories[
            index
          ][1].toLocaleString()})</span>
        </label>
      </div>`,
      );
    }
    if (categories.length == 0) {
      elements.categoriesDiv.innerHTML = `<span class="text-body-secondary">No results</span>`;
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

    updateCounts();
  } //updateFilteredCount

  function updateCounts() {
    elements.seenCount.innerHTML = `${seenCount} ${seenCount == 1 ? "stream" : "streams"} watched`;
    elements.remainingCount.innerHTML = `${filteredList.size.toLocaleString()} ${filteredList.size == 1 ? "stream" : "streams"} left`;
  } //updateCounts

  async function nextStream() {
    let currentChannel = player?.getChannel() || 0;
    let currentIndex = previousChannels.findIndex((x) => x.username == currentChannel);
    if (previousChannels[currentIndex + 1]) {
      showPreviousStream(currentIndex, true);
      return;
    }

    elements.pfp.src = "/guessr.png";
    elements.username.innerHTML = `<span class="placeholder-wave"><span class="placeholder" style="width: 200px"></span></span>`;
    elements.title.innerHTML = `<span class="placeholder-wave"><span class="placeholder" style="width: 500px"></span></span>`;
    elements.tags.innerHTML = `<span class="placeholder-wave"><span class="placeholder" style="width: 500px"></span></span>`;

    elements.nextStream.disabled = true;
    setTimeout(() => {
      elements.nextStream.disabled = false;
    }, 2000);

    if (previousChannels.length > 0) {
      elements.previousStream.disabled = false;
    }

    let channelIDs = Array.from(filteredList.keys());
    let randomIndex = Math.floor(Math.random() * channelIDs.length);
    let channelID = channelIDs[randomIndex];
    filteredList.delete(channelID);
    updateCounts();
    while (seenChannels.includes(channelID)) {
      channelID = Math.floor(Math.random() * channelIDs.length);
      filteredList.delete(channelID);
      updateCounts();
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
      elements.pfp.src = user.data[0].profile_image_url || "/guessr.png";
      let name = stream.data[0].user_name.toLowerCase() == stream.data[0].user_login.toLowerCase() ? stream.data[0].user_name : `${stream.data[0].user_name} (${stream.data[0].user_login})`;
      elements.username.innerHTML = `<a target="_blank" rel="noopener noreferrer" href="https://twitch.tv/${stream.data[0].user_login}">${name}</a>`;
      elements.title.innerText = stream.data[0]?.title || "no title";
      elements.tags.innerHTML = stream.data[0]?.tags.map((tag) => `<span class="badge rounded-pill text-bg-secondary">${tag}</span>`).join(" ") || "no tags";

      retryLimit = 0;
      let options = {
        width: "100%",
        height: "100%",
        channel: stream.data[0].user_login,
        layout: "video-with-chat",
        parent: ["guessr.tv", "127.0.0.1"],
      };
      if (!player) {
        player = new Twitch.Embed("twitchEmbed", options);
      } else {
        player.setChannel(stream.data[0].user_login);
      }

      previousChannels.push({
        username: stream.data[0].user_login,
        displayname: stream.data[0].user_name,
        title: stream.data[0].title,
        tags: elements.tags.innerHTML,
        pfp: user.data[0].profile_image_url || "/guessr.png",
      });
      seenChannels.push(channelID);
      localforage.setItem("seenChannels", JSON.stringify(seenChannels));
      elements.seenChannels.innerHTML = seenChannels.length;
      seenCount++;
      updateCounts();
    } catch (error) {
      console.log(error);
      retryLimit++;
      return nextStream();
    }
  } //nextStream

  function previousStream() {
    let currentChannel = player.getChannel();
    let currentIndex = previousChannels.findIndex((x) => x.username == currentChannel);
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
    let channel = previousChannels[(currentIndex += forward ? 1 : -1)];
    elements.pfp.src = channel.pfp || "/guessr.png";
    let name = channel.displayname.toLowerCase() == channel.username.toLowerCase() ? channel.displayname : `${channel.displayname} (${channel.username})`;
    elements.username.innerHTML = `<a target="_blank" rel="noopener noreferrer" href="https://twitch.tv/${channel.username}">${name}</a>`;
    elements.title.innerText = channel.title;
    elements.tags.innerHTML = channel.tags;
    player.setChannel(channel.username);
  } //showPreviousStream
</script>

<svelte:head>
  <script src="https://embed.twitch.tv/embed/v1.js" async></script>
</svelte:head>

<div class="modal fade" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="settingsModalLabel">Settings</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="input-group mt-3">
          <span class="input-group-text">Seen Channels:</span>
          <span class="input-group-text" id="seenChannels">0</span>
          <button class="btn btn-outline-warning" type="button" id="resetSeenChannels"><i class="material-icons notranslate">restart_alt</i>Reset</button>
        </div>
        <small>Resets your channel history. The channel history keeps track of which channels you've seen to not show them again.</small>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="aboutModalLabel">About</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="card border mb-3">
          <div class="card-header">About this page</div>
          <div class="card-body">
            If you like finding new random streams by playing on Guessr.tv but don't like having to guess each round then this page is for you :)<br />
            More info <a target="_blank" rel="noopener noreferrer" href="https://github.com/badoge/guessr.tv#readme">here</a><br /><br />

            <br />
            You might encounter a "Preparing your stream..." screen when clicking Next stream, to get rid of the screen you can subscribe to Twitch Turbo or get a better Adblocker :)<br />
            If you have Turbo but still see the screen, make sure you are logged in to Twitch on the same browser. If you use Firefox you will need to
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/badoge/guessr.tv#firefox-cross-site-tracking-cookies">allow cross-site tracking cookies</a>
            <hr />
            If you want to optout from being randomly picked you can use the<kbd>=optout guessr</kbd> command in
            <a target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/popout/okayegbot/chat?popout=">OkayegBOT's chat</a>
          </div>
        </div>
        <div class="card border">
          <div class="card-header">Contact info</div>
          <div class="card-body">
            Site by <a target="_blank" rel="noopener noreferrer" href="https://www.twitch.tv/badoge">badoge</a> :) <br />
            <p>
              If you find any issues or if you have suggestions or questions, you can contact me: <br /><a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.twitch.tv/popout/badoge/chat?popout=">in this chat</a
              >
              <br />or on <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/FR8bgQdPUT">discord</a> <br />or by
              <a href="mailto:help@guessr.tv">email</a>
            </p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<ul class="nav nav-underline flex-column position-fixed mt-2">
  <li class="nav-item">
    <a class="nav-link site-link" target="_self" rel="noopener noreferrer" href="/">
      <img src="/guessr.png" alt="logo" style="height: 24px; width: 24px" class="d-inline-block align-top" /> Guessr.tv
    </a>
  </li>
  <li class="nav-item">
    <a class="nav-link site-link" target="_self" rel="noopener noreferrer" href="/bingo.html"><i class="material-icons notranslate">grid_on</i> Bingo</a>
  </li>
  <li class="nav-item">
    <a class="nav-link active site-link" aria-current="page" target="_self" rel="noopener noreferrer" href="/watch.html"><i class="material-icons notranslate">live_tv</i> Watch </a>
  </li>
  <hr class="m-0" />
  <li class="nav-item">
    <a class="nav-link" data-bs-toggle="modal" data-bs-target="#settingsModal"><i class="material-icons notranslate">settings</i> Settings</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" data-bs-toggle="modal" data-bs-target="#aboutModal"><i class="material-icons notranslate">help_outline</i> About</a>
  </li>
</ul>

<div class="container-fluid text-center pt-3">
  <div class="row">
    <div class="col-1">
      <div aria-live="polite" aria-atomic="true" class="position-relative">
        <div id="toastContainer" class="toast-container"></div>
      </div>
    </div>
    <div class="col-11 position-relative">
      <div id="twitchEmbed"></div>
    </div>
  </div>
  <div class="row m-3" id="bottomRow">
    <div class="container-fluid">
      <div class="row gap-2 justify-content-end">
        <div class="col border rounded p-1 bg-body-secondary align-self-center">
          <div class="hstack gap-3">
            <div><img src="/guessr.png" id="pfp" /></div>
            <div id="username">
              <span class="placeholder-wave"><span class="placeholder" style="width: 100px"></span></span>
            </div>
            <div class="vr"></div>
            <div class="vstack">
              <div id="title">
                <span class="placeholder-wave"><span class="placeholder" style="width: 300px"></span></span>
              </div>
              <div id="tags">
                <span class="placeholder-wave"><span class="placeholder" style="width: 300px"></span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-auto border rounded p-1 bg-body-secondary align-self-center">
          <div class="hstack gap-2">
            <span style="writing-mode: sideways-lr; text-orientation: mixed">Filters</span>
            <div class="dropup">
              <button type="button" class="btn btn-success dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                <i class="material-icons notranslate vertical-align-bottom">language</i>Languages<span id="languageFilterCount"></span>
              </button>
              <form class="dropdown-menu p-4" style="height: 400px; width: 300px; overflow-y: auto">
                <h5>Selected languages:</h5>
                <div class="mb-3" id="selectedLanguages"><span class="text-body-secondary">None (will show all languages)</span></div>
                <div class="input-group mb-3">
                  <span class="input-group-text"><i class="material-icons notranslate vertical-align-bottom">search</i></span>
                  <input id="searchLanguages" type="text" class="form-control" placeholder="Search" oninput={updateLanguages} />
                </div>
                <hr />
                <div id="languagesDiv">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </form>
            </div>

            <div class="dropup">
              <button type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                <i class="material-icons notranslate vertical-align-bottom">label</i>Tags<span id="tagFilterCount"></span>
              </button>
              <form class="dropdown-menu p-4" style="height: 400px; width: 300px; overflow-y: auto">
                <h5>Selected tags:</h5>
                <div class="mb-3" id="selectedTags"><span class="text-body-secondary">None (will show all tags)</span></div>
                <div class="input-group mb-3">
                  <span class="input-group-text"><i class="material-icons notranslate vertical-align-bottom">search</i></span>
                  <input id="searchTags" type="text" class="form-control" placeholder="Search" oninput={updateTags} />
                </div>
                <hr />
                <div id="tagsDiv">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </form>
            </div>

            <div class="dropup">
              <button type="button" class="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                <i class="material-icons notranslate vertical-align-bottom">sports_esports</i>Categories<span id="categoryFilterCount"></span>
              </button>
              <form class="dropdown-menu p-4" style="height: 400px; width: 300px; overflow-y: auto">
                <h5>Selected categories:</h5>
                <div class="mb-3" id="selectedCategories"><span class="text-body-secondary">None (will show all categories)</span></div>
                <div class="input-group mb-3">
                  <span class="input-group-text"><i class="material-icons notranslate vertical-align-bottom">search</i></span>
                  <input id="searchCategories" type="text" class="form-control" placeholder="Search" oninput={updateCategories} />
                </div>
                <hr />

                <div id="categoriesDiv">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </form>
            </div>

            <div class="dropup">
              <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
                <svg
                  class="vertical-align-bottom"
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
                    ></path>
                  </g>
                </svg>
                View count
              </button>
              <form class="dropdown-menu p-4" style="height: 150px; width: 700px; overflow-y: auto">
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
              </form>
            </div>
          </div>
        </div>

        <div class="col-auto p-1 align-self-center border rounded bg-body-secondary">
          <div class="hstack">
            <div class="vstack">
              <button
                disabled
                type="button"
                id="previousStream"
                onclick={previousStream}
                class="btn btn-lg btn-secondary float-end me-2"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-title="Previous stream"
              >
                <i class="material-icons notranslate">skip_previous</i>
              </button>
              <small class="text-body-secondary" id="seenCount">
                <span class="placeholder-wave"><span class="placeholder" style="width: 120px"></span></span>
              </small>
            </div>

            <div class="vstack">
              <button type="button" id="nextStream" onclick={nextStream} class="btn btn-lg btn-success float-end">
                <i class="material-icons notranslate">skip_next</i> Next stream
              </button>
              <small class="text-body-secondary" id="remainingCount">
                <span class="placeholder-wave"><span class="placeholder" style="width: 120px"></span></span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
