<script>
  import { onMount } from "svelte";

  import IcBaselineSearch from "~icons/ic/baseline-search";
  import IcOutlineInfo from "~icons/ic/outline-info";
  import IcBaselineClear from "~icons/ic/baseline-clear";
  import { animate, createDraggable, stagger } from "animejs";

  let { bingoSize, bingoBoard, gameState, embedHover = $bindable() } = $props();
  let searchBarExpanded = $state(false);

  onMount(async () => {
    const draggable = createDraggable("#board", {
      container: "body",
      onGrab: () => {
        embedHover.disabled = true;
      },
      onRelease: () => {
        embedHover.disabled = false;
      },
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "F3" || ((event.ctrlKey || event.metaKey) && event.code === "KeyF")) {
        event.preventDefault();
        toggleSearchBar();
      }

      if (event.code === "KeyR" && document.activeElement.tagName !== "INPUT") {
        document.getElementById("board").style = "top: 6%; left: 6%; scale: 1;";
        hidePreview();
      }
    });
    setTimeout(() => {
      animate(".bingo-cell", {
        opacity: [1, 0.5, 1, 0],
        delay: stagger(100, {
          grid: [bingoSize, bingoSize],
          from: "center",
        }),
        onComplete: (self) => {
          animate(".bingo-cell", {
            opacity: [0, 1],
            delay: stagger(100, {
              grid: [bingoSize, bingoSize],
              from: "center",
            }),
            duration: 200,
          });

          self.targets.forEach((el) => {
            el.classList.remove("filled");
          });
        },
        duration: 1000,
      });
    }, 300);
  }); //onMount

  export function animateBoard() {
    setTimeout(() => {
      animate(".bingo-cell", {
        opacity: [1, 0.5, 0],
        delay: stagger(50, {
          grid: [bingoSize, bingoSize],
          from: "last",
        }),
        onComplete: (self) => {
          animate(".bingo-cell", {
            opacity: [0, 1],
            delay: stagger(50, {
              grid: [bingoSize, bingoSize],
              from: "first",
            }),
            duration: 200,
          });

          self.targets.forEach((el) => {
            el.classList.remove("filled");
          });
        },
        duration: 200,
      });
    }, 300);
  } //animateBoard

  function checkDuplicatesOnBoard() {
    const values = bingoBoard.map((item) => item.value.toLowerCase());
    const duplicates = new Set(values.filter((v) => values.indexOf(v) !== values.lastIndexOf(v)));

    if (duplicates.size > 0) {
      const cells = document.querySelectorAll(".bingo-cell");
      for (let i = 0; i < bingoBoard.length; i++) {
        const value = bingoBoard[i].value.toLowerCase();
        cells[i].classList.toggle("duplicate", value && duplicates.has(value));
      }
    } else {
      document.querySelectorAll(".bingo-cell").forEach((c) => c.classList.remove("duplicate"));
    }
  } //checkDuplicatesOnBoard

  function toggleSearchBar() {
    document.getElementById("boardSearchBar").value = "";
    searchBarExpanded = !searchBarExpanded;
    if (searchBarExpanded) {
      document.getElementById("boardSearchBar").focus();
      document.getElementById("boardSearchBar").select();
    } else {
      hideSearchBar();
    }
  } //toggleSearchBar

  function doBoardSearch() {
    const value = (document.getElementById("boardSearchBar").value || "").trim().toLowerCase();
    const cells = document.querySelectorAll(".bingo-cell");

    if (value) {
      for (let i = 0; i < bingoBoard.length; i++) {
        const isMatching = bingoBoard[i].value && bingoBoard[i].value.toLowerCase().includes(value);
        cells[i].classList.toggle("matching", isMatching);
      }
    }

    if (!document.getElementById("boardSearchBar")?.value) {
      hideSearchBar();
    }
  } //doBoardSearch

  function hideSearchBar() {
    searchBarExpanded = false;
    document.getElementById("boardSearchBar")?.blur();
    document.querySelectorAll(".bingo-cell").forEach((c) => c.classList.remove("matching"));
  } //hideSearchBar

  /**
   * @type {number | undefined}
   */
  let refreshCooldown;

  /**
   * @param {number} id
   */
  function fillCell(id) {
    if (gameState == "inactive") {
      let textInput = document.querySelector(`input[data-item-id="${id + 1}"]`);
      if (!textInput) {
        return;
      }
      textInput.scrollIntoView({ behavior: "smooth" });
      textInput.select();
      textInput.focus();
      return;
    }
    const cell = document.querySelector(`div[data-id="${id}"]`);

    clearTimeout(refreshCooldown);
    cell.classList.toggle("filled");
    console.log(cell.classList);
    hideSearchBar();

    //checkWin(board, true);
    // if (TWITCH?.channel) {
    //   refreshCooldown = setTimeout(() => {
    //     updateLeaderboard();
    //   }, 3000);
    // }
  } //fillCell

  /**
   * @param {number} row
   * @param {number} column
   */
  function getExtraStyle(row, column) {
    if (bingoSize == 1) {
      return `border-radius: 0.75rem`;
    }
    if (row == 0 && column == 0) {
      return `border-top-left-radius: 0.75rem`;
    }
    if (row == 0 && column == bingoSize - 1) {
      return `border-top-right-radius: 0.75rem`;
    }
    if (row == bingoSize - 1 && column == 0) {
      return `border-bottom-left-radius: 0.75rem`;
    }
    if (row == bingoSize - 1 && column == bingoSize - 1) {
      return `border-bottom-right-radius: 0.75rem`;
    }
  }

  /**
   * @param {{ dataset: { itemId: any; }; }} element
   */
  export function activateCellById(element) {
    const itemId = element.dataset.itemId;
    const itemCell = document.querySelector(`.bingo-cell[data-id="${itemId}"]`);
    itemCell.classList.add("selected");
  } //activateCellById

  /**
   * @param {{ dataset: { itemId: any; }; }} element
   */
  export function deactivateCellById(element) {
    const itemId = element.dataset.itemId;
    const itemCell = document.querySelector(`.bingo-cell[data-id="${itemId}"]`);
    itemCell.classList.remove("selected");
  } //deactivateCellById
</script>

<div class="container-fluid" id="board" style="top: 6%; left: 6%">
  <div class="container-fluid p-0">
    {#each { length: bingoSize }, row}
      <div class="flex flex-row m-0">
        {#each { length: bingoSize }, column}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div onclick={() => fillCell(row * bingoSize + column)} data-id={row * bingoSize + column} class="col bingo-cell filled" style={getExtraStyle(row, column)}>
            {#if bingoBoard[row * bingoSize + column]?.value}
              {bingoBoard[row * bingoSize + column].value}
            {:else}
              <span class="opacity-30">{row * bingoSize + column + 1}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <div id="boardSearch">
    <div class="tooltip" data-tip="Search board (F3 / CTRL + F)">
      <button class="btn bg-base-200 hover:bg-base-100" onclick={toggleSearchBar} id="boardSearchToggle">
        {#if searchBarExpanded}
          <IcBaselineClear class="text-2xl" />
        {:else}
          <IcBaselineSearch class="text-2xl" />
        {/if}
      </button>
    </div>

    <input type="text" class="input input-neutral {searchBarExpanded ? 'expanded' : ''}" id="boardSearchBar" placeholder="Quick search" oninput={doBoardSearch} />
  </div>

  <div id="bingoStats">
    <div class="tooltip">
      <div class="tooltip-content">
        <span class="text-xl">Stats</span>
        <div class="divider m-0"></div>
        <em>Watched channels:</em> 0
        <br />
        <em>BINGO score:</em> 0
      </div>
      <button class="btn bg-base-200 hover:bg-base-100" id="bingoStatsTooltip">
        <IcOutlineInfo class="text-2xl" />
      </button>
    </div>
  </div>
</div>

<style>
  #board {
    position: fixed;
    width: max-content;
    border: 1px solid var(--color-neutral);
    background-color: var(--color-base-300);
    border-radius: 0.75rem;
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
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-base-content);
    background-color: var(--color-base-100);
    min-width: 12vh;
    min-height: 12vh;
    max-width: 12vh;
    max-height: 12vh;
    border: 2px solid var(--color-neutral);
    cursor: pointer;
    font-weight: 700;
    overflow: hidden;
    word-wrap: break-word;
    font-size: 100%;
    padding: 5px;
  }

  :global(.bingo-cell.duplicate) {
    box-shadow: 0px 0px 2rem var(--color-error);
    z-index: 2;
  }

  :global(.bingo-cell.matching) {
    box-shadow: 0px 0px 2rem var(--color-warning);
    z-index: 3;
  }

  :global(.bingo-cell.selected) {
    box-shadow: 0px 0px 2rem var(--color-info);
    z-index: 4;
  }

  #boardSearch {
    position: absolute;
    display: inline-flex;
    bottom: -6.5px;
    left: -6.5px;
  }

  #boardSearchToggle {
    border-radius: 50%;
    aspect-ratio: 1/1;
    padding: 3px;
    cursor: pointer;
    scale: 0.5;
  }

  #boardSearchBar {
    border-radius: 20px;
    border-radius: 20px;
    box-shadow: 5px 5px 10px #000000;
    position: absolute;
    width: 0;
    left: 100%;
    opacity: 0;
    transition:
      width 0.3s ease,
      opacity 0.3s ease;
    z-index: 5;
  }
  #boardSearchBar.expanded {
    width: 250px;
    opacity: 1;
  }

  #bingoStats {
    position: absolute;
    display: inline-flex;
    bottom: -6.5px;
    right: -6.5px;
  }

  #bingoStatsTooltip {
    border-radius: 50%;
    aspect-ratio: 1/1;
    padding: 3px;
    cursor: pointer;
    scale: 0.5;
  }

  .filled {
    background-color: var(--color-success);
    color: var(--color-success-content);
  }
</style>
