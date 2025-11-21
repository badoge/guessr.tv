import { BaseChaosEffect } from "../base.js";

export class FadeOutEffect extends BaseChaosEffect {
  constructor() {
    super("Fade Out");
    this.seconds = 60;
    this.overlay = null;
  }

  async start() {
    const wrapper = await super.start();

    this.overlay = document.createElement("div");
    this.overlay.className = "fadeout-overlay";
    document.body.appendChild(this.overlay);

    setTimeout(() => {
      this.overlay.style.transition = `opacity ${this.duration}ms linear`;
      this.overlay.style.opacity = "1";
    }, 10);

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
