<script>
  import { onMount } from "svelte";

  import IcBaselineSearch from "~icons/ic/baseline-search";

  let x = 0;
  let y = 0;
  function mouseDownHandler(e) {
    if (e.target.classList.contains("bingo-cell") && e.button !== 1) {
      return;
    }
    document.getElementById("twitchEmbedDiv").style.pointerEvents = "none";
    x = e.clientX;
    y = e.clientY;
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  } //mouseDownHandler

  function mouseMoveHandler(e) {
    document.getElementById("board").style.top = document.getElementById("board").offsetTop + e.clientY - y + "px";
    document.getElementById("board").style.left = document.getElementById("board").offsetLeft + e.clientX - x + "px";
    x = e.clientX;
    y = e.clientY;
  } //mouseMoveHandler

  function mouseUpHandler() {
    document.getElementById("twitchEmbedDiv").style.pointerEvents = "all";
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  } //mouseUpHandler

  onMount(async () => {
    window.addEventListener("keydown", (event) => {
      if (event.code === "F3" || ((event.ctrlKey || event.metaKey) && event.code === "KeyF")) {
        event.preventDefault();
        toggleSearchBar();
      }

      if (event.code === "KeyR" && document.activeElement.tagName !== "INPUT") {
        document.getElementById("board").style = "top: 6%; left: 6%; scale: 1;";
        mouseUpHandler();
        hidePreview();
      }
    });
  });

  function toggleSearchBar() {
    document.getElementById("boardSearchBar").value = "";
    if (document.getElementById("boardSearchToggle").querySelector("i").innerText == "search") {
      document.getElementById("boardSearchToggle").querySelector("i").innerText = "clear";
      document.getElementById("boardSearchBar").classList.add("expanded");
      document.getElementById("boardSearchBar").focus();
      document.getElementById("boardSearchBar").select();
    } else {
      hideSearchBar();
    }
  } //toggleSearchBar

  let { size } = $props();

  function doBoardSearch() {
    const value = (elements.boardSearchBar.value || "").trim().toLowerCase();
    const cells = document.querySelectorAll(".bingo-cell");

    if (value) {
      for (let i = 0; i < board.length; i++) {
        const isMatching = board[i].value && board[i].value.toLowerCase().includes(value);
        cells[i].classList.toggle("matching", isMatching);
      }
    }

    if (elements.boardSearchBar.value) {
      elements.boardSearchToggle.querySelector("i").innerText = "clear";
    } else {
      hideSearchBar();
    }
  } //doBoardSearch

  function hideSearchBar() {
    elements.boardSearchToggle.querySelector("i").innerText = "search";
    elements.boardSearchBar.classList.remove("expanded");
    elements.boardSearchBar.blur();
    document.querySelectorAll(".bingo-cell").forEach((c) => c.classList.remove("matching"));
  } //hideSearchBar
</script>

<div class="container-fluid" id="board" style="top: 6%; left: 6%">
  <div class="container-fluid p-0">
    {#each { length: size || 5 }, row}
      <div class="flex flex-row m-0">
        {#each { length: size || 5 }, column}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div onclick={fillCell} data-id={row + column} class="col bingo-cell">
            {row * size + column + 1}
          </div>

          <!-- 
            let extraStyle = "";
  // :)
  if (index == 0 && index2 == 0) {
    extraStyle = `style="border-top-left-radius: 6px"`;
  }
  if (index == 0 && index2 == size - 1) {
    extraStyle = `style="border-top-right-radius: 6px"`;
  }
  if (index == size - 1 && index2 == 0) {
    extraStyle = `style="border-bottom-left-radius: 6px"`;
  }
  if (index == size - 1 && index2 == size - 1) {
    extraStyle = `style="border-bottom-right-radius: 6px"`;
  }
  if (size == 1) {
    extraStyle = `style="border-radius: 6px"`;
  } -->
        {/each}
      </div>
    {/each}
  </div>
  <div id="board-search">
    <button
      class="btn btn-secondary"
      onclick={toggleSearchBar}
      type="button"
      data-bs-toggle="tooltip"
      data-bs-title="Search board (F3 / CTRL + F)"
      data-bs-placement="top"
      id="board-search-toggle"
    >
      <IcBaselineSearch />
    </button>
    <input type="text" class="form-control" id="board-search-bar" placeholder="Quick search" oninput={doBoardSearch} />
  </div>

  <div id="bingoStats">
    <button
      class="btn btn-secondary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-html="true"
      data-bs-title="<strong>Stats</strong><hr><em>Watched channels:</em> 0<br><em>BINGO score:</em> 0<br>"
      data-bs-placement="top"
      id="bingoStatsTooltip"
    >
      <i class="material-icons notranslate pointer-events-none">info_outline</i>
    </button>
  </div>
</div>

<style>
  #board {
    position: fixed;
    width: max-content;
    border: 2px solid var(--bs-secondary-border-subtle);
    background-color: var(--bs-tertiary-bg);
    border-radius: 6px;
    padding: 20px;
    cursor: grab;
    box-shadow: 3px 3px 10px #000000;
    z-index: 10;
    scale: 1;
    user-select: none;
  }

  #board:active {
    cursor: grabbing;
  }

  .bingo-cell {
    text-align: center;
    color: var(--bs-light-text-emphasis);
    background-color: var(--bs-secondary-bg);
    min-width: 12vh;
    min-height: 12vh;
    max-width: 12vh;
    max-height: 12vh;
    border: 2px solid var(--bs-light-border-subtle);
    cursor: pointer;
    font-weight: 700;
    overflow: hidden;
    word-wrap: break-word;
    font-size: 100%;
    padding: 5px;
  }

  .bingo-cell.duplicate {
    box-shadow: 0px 0px 2rem var(--bs-danger);
    z-index: 2;
  }

  .bingo-cell.matching {
    box-shadow: 0px 0px 2rem var(--bs-warning);
    z-index: 3;
  }

  .bingo-cell.selected {
    box-shadow: 0px 0px 2rem var(--bs-info);
    z-index: 4;
  }

  #board-search {
    position: absolute;
    display: inline-flex;
    bottom: -3px;
    left: -3px;
  }

  #board-search-toggle {
    border-radius: 50%;
    aspect-ratio: 1/1;
    padding: 2px;
    cursor: pointer;
    scale: 0.5;
  }

  #board-search-bar {
    border-radius: 20px;
    border-radius: 20px;
    border-color: transparent;
    box-shadow: 5px 5px 10px #000000;
    position: absolute;
    width: 0;
    left: 100%;
    opacity: 0;
    transition:
      width 0.3s ease,
      opacity 0.3s ease;
    outline: none;
    z-index: 5;
  }
  #board-search-bar.expanded {
    width: 250px;
    opacity: 1;
  }

  #bingoStats {
    position: absolute;
    display: inline-flex;
    bottom: -3px;
    right: -3px;
  }

  #bingoStatsTooltip {
    border-radius: 50%;
    aspect-ratio: 1/1;
    padding: 2px;
    cursor: pointer;
    scale: 0.5;
  }

  .filled {
    background-color: green;
  }
</style>
