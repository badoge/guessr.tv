import { BaseChaosEffect } from "./base.js";
import { MirrorUIEffect } from "./effects/flip.js";
import { BlindEffect } from "./effects/blind.js";
import { NothingEffect } from "./effects/nothing.js";
import { FadeOutEffect } from "./effects/fadeout.js";
import { ForsenPartyEffect } from "./effects/forsenparty.js";
import { NegativeEffect } from "./effects/negative.js";
import { EarthquakeEffect } from "./effects/earthquake.js";
import { ForceBingoEffect } from "./effects/forcebingo.js";

const EFFECTS = [MirrorUIEffect, BlindEffect, NothingEffect, FadeOutEffect, ForsenPartyEffect, NegativeEffect, EarthquakeEffect, ForceBingoEffect];

/**
 * @template T
 * @typedef {new (...args: any[]) => T} Class
 */

//for testing purposes - enter any values here:
/** @type {Class<BaseChaosEffect>} */
const FORCE_EFFECT_DEBUG = null;
/** @type {number} */
const FORCE_EFFECT_DURATION = null;

/** @type {Class<BaseChaosEffect>[]} */
let queue = [];

/** @returns {Class<BaseChaosEffect>} */
function getQueueItem() {
  console.debug("Chaos mod: queue reset. Effects available:", EFFECTS.length);

  if (queue.length === 0) {
    // Create copy of effects array to shuffle
    const effectsCopy = [...EFFECTS];

    // Fisher-Yates shuffle
    for (let i = effectsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [effectsCopy[i], effectsCopy[j]] = [effectsCopy[j], effectsCopy[i]];
    }

    if (FORCE_EFFECT_DEBUG) {
      // push it to first position of queue:
      console.info("First effect will be forced: ", FORCE_EFFECT_DEBUG.name);
      const queuePos = effectsCopy.indexOf(FORCE_EFFECT_DEBUG);
      if (queuePos >= 0) {
        effectsCopy.splice(queuePos, 1);
      }
      effectsCopy.push(FORCE_EFFECT_DEBUG);
    }

    // Add shuffled effects to queue
    queue = effectsCopy;
  }

  return queue.pop();
}

/**
 * @returns {BaseChaosEffect}
 */
export function chooseEffect() {
  const EffectClass = getQueueItem();
  const instance = new EffectClass();
  if (FORCE_EFFECT_DURATION != null) {
    instance.seconds = FORCE_EFFECT_DURATION;
  }

  console.debug("New effect: ", instance.id);
  return instance;
}
