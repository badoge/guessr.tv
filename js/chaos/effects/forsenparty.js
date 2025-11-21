import { BaseChaosEffect } from "../base.js";

export class ForsenPartyEffect extends BaseChaosEffect {
  constructor() {
    super("forsenParty");
    this.seconds = 20;
    this.overlay = null;
  }

  async start() {
    const wrapper = await super.start();

    this.overlay = document.createElement("div");
    this.overlay.className = "forsenparty-overlay";
    document.body.appendChild(this.overlay);

    return wrapper;
  }

  async destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    await super.destroy();
  }
}
