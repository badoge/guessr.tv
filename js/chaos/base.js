const SINGLE_SPAWN_INFO_DURATION = 10e3;

export class BaseChaosEffect {
  constructor(id = "Unknown Effect") {
    this.id = id;
    this.seconds = 0;

    this.wrapper = null;
  }

  get duration() {
    return this.seconds * 1000;
  }

  set duration(n) {
    this.seconds = n / 1000;
  }

  async start() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "chaos-wrapper";
    this.wrapper.textContent = this.id;

    const background = document.createElement("div");
    background.className = "chaos-background";
    this.wrapper.appendChild(background);

    setTimeout(() => {
      background.style.transition = `width ${this.duration}ms linear`;
      background.style.width = "0%";
    }, 10);

    setTimeout(async () => await this.destroy(), this.duration || SINGLE_SPAWN_INFO_DURATION);
    return this.wrapper;
  }

  async destroy() {
    this.wrapper.remove();
    this.wrapper = null;
  }
}
