import { BaseChaosEffect } from "./base.js";
import { chooseEffect } from "./list.js";

export class ChaosTrigger extends BaseChaosEffect {
  constructor(interval = 10) {
    super("CHAOS MOD");
    this.seconds = interval;

    this.container = document.createElement("div");
    this.container.className = "chaos-container";
    document.body.appendChild(this.container);
  }

  async start() {
    await super.start();
    this.wrapper.classList.add("chaos-triggerbar");
    this.container.appendChild(this.wrapper);
  }

  async restart() {
    await this.spawnEffect();

    // restart animation
    const background = this.wrapper.querySelector(".chaos-background");
    background.style.transition = "none";
    background.style.width = "100%";

    setTimeout(() => {
      background.style.transition = `width ${this.duration}ms linear`;
      background.style.width = "0%";
    }, 10);

    setTimeout(async () => await this.destroy(), this.duration);
  }

  async destroy() {
    return this.restart();
  }

  async kill() {
    return super.destroy();
  }

  async spawnEffect() {
    try {
      const effect = chooseEffect();
      const progressBar = await effect.start();
      this.container.appendChild(progressBar);
    } catch (error) {
      console.error("Error spawning effect:", error);
    }
  }
}
