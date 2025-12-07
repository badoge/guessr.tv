import { BaseChaosEffect } from "../base.js";

export class NothingEffect extends BaseChaosEffect {
  constructor() {
    super("Nothing");
    this.seconds = 0;
  }
}
