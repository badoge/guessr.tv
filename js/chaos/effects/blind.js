import { BaseChaosEffect } from "../base.js";

export class BlindEffect extends BaseChaosEffect {
  constructor() {
    super("Blind");
    this.seconds = 5;
  }

  async start() {
    Array.from(document.body.children).forEach((child) => {
      if (!child.classList.contains("chaos-container")) {
        child.classList.add("transparent");
      }
    });

    return super.start();
  }

  async destroy() {
    Array.from(document.body.children).forEach((child) => {
      child.classList.remove("transparent");
    });

    return super.destroy();
  }
}
