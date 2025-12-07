import { ChaosTrigger } from "./trigger.js";

const CHAOS_INTERVAL = 12;

/** @type {ChaosTrigger} */
let trigger = null;

window.initChaosMod = async function () {
  if (trigger) {
    await trigger.kill();
  }

  console.log("😈 Chaos mode started!");

  trigger = new ChaosTrigger(CHAOS_INTERVAL);
  await trigger.start();
};
