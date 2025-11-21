import { BaseChaosEffect } from "../base.js";

export class MirrorUIEffect extends BaseChaosEffect {
  constructor() {
    super("Mirror UI");
    this.seconds = 20;
  }

  async start() {
    document.body.classList.add("mirror-ui");

    return super.start();
  }

  async destroy() {
    document.body.classList.remove("mirror-ui");

    return super.destroy();
  }
}
