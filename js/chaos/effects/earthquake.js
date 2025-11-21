import { BaseChaosEffect } from "../base.js";

export class EarthquakeEffect extends BaseChaosEffect {
  constructor() {
    super("Earthquake");
    this.seconds = 10;
  }

  async start() {
    const classes = ["earthquake", "earthquake2", "earthquake3"];
    Array.from(document.body.children).forEach((child) => {
      if (!child.classList.contains("chaos-container")) {
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        child.classList.add(randomClass);
      }
    });
    return super.start();
  }

  async destroy() {
    Array.from(document.body.children).forEach((child) => {
      child.classList.remove("earthquake", "earthquake2", "earthquake3");
    });
    return super.destroy();
  }
}
