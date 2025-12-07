import { BaseChaosEffect } from "../base.js";

export class ForceBingoEffect extends BaseChaosEffect {
  constructor() {
    super("🥳 BINGO!!!");
    this.duration = 0;
  }

  async start() {
    // ultra omega bingo of hell:
    document.querySelectorAll(".bingo-cell").forEach((r) => r.classList.add("filled"));
    window.board?.every((e) => (e.filled = true));
    window.checkWin(window.board, true);
    if (window.TWITCH?.channel) {
      setTimeout(() => {
        window.updateLeaderboard();
      }, 3000);
    }
    window.updateStatsTooltip();

    return await super.start();
  }
}
