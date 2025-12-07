import { BaseChaosEffect } from "../base.js";

export class NegativeEffect extends BaseChaosEffect {
  constructor() {
    super("Why so negative?");
    this.seconds = 20;
  }

  async start() {
    Array.from(document.body.children).forEach((child) => {
      if (!child.classList.contains("chaos-container")) {
        child.classList.add("inverted");
      }
    });

    return super.start();
  }

  async destroy() {
    Array.from(document.body.children).forEach((child) => {
      child.classList.remove("inverted");
    });

    return super.destroy();
  }
}
