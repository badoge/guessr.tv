import { browser } from "$app/environment";

/** @type {*} */
const defaultSettings = {
  USER: {
    channel: "",
    twitchLogin: false,
    access_token: "",
    userID: "",
    platform: "",
  },
};

export class DonkStorage {
  value = $state();
  key = "";

  /**
   * @param {string} key
   * @param {any} value
   */
  constructor(key, value) {
    this.key = key;
    this.value = value;

    if (browser) {
      const item = localStorage.getItem(this.key);
      if (item) {
        this.value = JSON.parse(item);
      } else {
        this.value = defaultSettings[this.key];
      }
    }

    $effect(() => {
      localStorage.setItem(this.key, JSON.stringify(this.value));
    });
  }

  refresh() {
    if (browser) {
      const item = localStorage.getItem(this.key);
      if (item) {
        this.value = JSON.parse(item);
      } else {
        this.value = defaultSettings[this.key];
      }
    }
  }
}

/**
 * @param {string} key
 * @param {any} value
 */
export function donkStorage(key, value) {
  if (key) {
    return new DonkStorage(key, value);
  }
}

/**
 * @param {string} key the localstorage key that you want to reset to default settings
 */
export function resetSettings(key) {
  localStorage.setItem(key, JSON.stringify(defaultSettings[key]));
  location.reload();
}
