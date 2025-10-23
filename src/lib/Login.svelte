<script>
  import { onMount } from "svelte";
  import { donkStorage, resetSettings } from "$lib/donkStorage.svelte";
  import { checkToken, get7TVPFP, getTwitchPFP, getUserID, loadBadges } from "./functions";
  import MdiTwitch from "~icons/mdi/twitch";
  import IcBaselineLogout from "~icons/ic/baseline-logout";
  import IcBaselineArrowDropDown from "~icons/ic/baseline-arrow-drop-down";

  import { CLIENT_ID } from "./consts";

  let { loginEvent = null } = $props();

  let USER = donkStorage("USER", null);

  //logged_out - default state with the login button visible, stays like this if USER local storage is not found
  //login_prompted - gets set when the login button is clicked, login button turns into a loading spinner
  //logged_in - user completed login prompt or USER local storage loaded, login button turns into a pfp + username
  let loginStatus = $state("logged_out");

  let pfpURL = $state("");

  onMount(async () => {
    //listen to storage events from the login windows
    window.onstorage = () => {
      if (localStorage.getItem("loginStatus") !== loginStatus) {
        loginStatus = localStorage.getItem("loginStatus") || "logged_out";

        if (localStorage.getItem("loginStatus") == "logged_in") {
          let USER_TEMP = JSON.parse(localStorage.getItem("USER_TEMP") || "{}");
          USER.value.channel = USER_TEMP.channel;
          USER.value.twitchLogin = USER_TEMP.twitchLogin;
          USER.value.access_token = USER_TEMP.access_token;
          USER.value.userID = USER_TEMP.userID;
          USER.value.platform = USER_TEMP.platform;
          localStorage.setItem("USER_TEMP", "");
          loadBadges(USER?.value.channel);
          //sendUsername(`chat.vote`, USER.value.channel, USER.value.platform == "twitch" ? `twitch - ${USER.value.twitchLogin}` : "youtube");

          if (loginEvent) {
            loginEvent();
          }
          loadPFP();
        }
      }
    };

    //check if the token is still valid if user logged in using twitch
    //if token is not valid set channel to "" to avoid connecting to chat and show the error modal
    if (USER?.value.twitchLogin) {
      let tokenCheck = await checkToken(USER.value.access_token);
      console.log(tokenCheck);
      //tokenCheck is false when the the function throws an error or the get request fails
      if (tokenCheck === false) {
        USER.value.channel = "";
        loginExpiredModal.showModal();
        return;
      }

      //force user to login again if the token will expire soon
      if (tokenCheck?.expires_in < 600) {
        USER.value.channel = "";
        loginExpiredModal.showModal();
        return;
      }

      //user is using a sus token so force them to login again
      if (tokenCheck?.client_id !== CLIENT_ID) {
        USER.value.channel = "";
        loginExpiredModal.showModal();
        return;
      }

      //update username incase it changed
      if (tokenCheck.login !== USER.value.channel) {
        USER.value.channel = tokenCheck.login;
      }
    }

    //user has a valid token or is using manual login so connect to chat
    if (USER?.value.channel) {
      loginStatus = "logged_in";
      loadBadges(USER?.value.channel);
      //sendUsername(`chat.vote`, USER.value.channel, USER.value.platform == "twitch" ? `twitch - ${USER.value.twitchLogin}` : "youtube");

      if (loginEvent) {
        loginEvent();
      }
      loadPFP();
    }
  }); //onMount

  async function loadPFP() {
    pfpURL = await get7TVPFP(USER.value.userID);
    if (pfpURL == "/pics/donk.png" && USER.value.access_token) {
      pfpURL = await getTwitchPFP(USER.value.channel, USER.value.access_token);
    }
  } //loadPFP

  function login() {
    loginStatus = "login_prompted";
    localStorage.setItem("loginStatus", "login_prompted");
    localStorage.setItem("USER_TEMP", "");
    window.open("/prompt", "loginWindow", "toolbar=0,status=0,scrollbars=0,width=500px,height=800px");
    return false;
  } //login

  function logout() {
    loginStatus = "logged_out";
    localStorage.setItem("loginStatus", "logged_out");
    localStorage.setItem("USER_TEMP", "");
    resetSettings("USER");
  } //logout
</script>

<dialog id="loginExpiredModal" class="modal">
  <div class="modal-box">
    <h3 class="text-xl font-bold mb-3">Login expired</h3>

    <button
      onclick={() => {
        loginExpiredModal.close();
        login();
      }}
      class="btn btn-twitch"><MdiTwitch />Renew login</button
    >
    <br />
    <small class="opacity-70">
      Logins expire when: <i>2 months pass</i> <strong>OR</strong> <i>you change your email/password</i> <strong>OR</strong> <i>you disconnect the app in the Twitch settings</i>
    </small>

    <div class="modal-action">
      <form method="dialog">
        <button type="button" class="btn btn-error" onclick={() => resetSettings("USER")}>
          <IcBaselineLogout />Log out
        </button>
      </form>
    </div>
  </div>
</dialog>

{#if loginStatus == "logged_out"}
  <button class="btn btn-twitch" onclick={login}><MdiTwitch />Sign in with Twitch</button>
{:else if loginStatus == "login_prompted"}
  <div class="join">
    <button class="btn btn-twitch join-item" aria-label="Loading..."><span class="loading loading-spinner loading-xl"></span></button>
    <button class="btn btn-twitch join-item p-1" popovertarget="cancelLoginDropdown" style="anchor-name:--cancelLoginDropdownAnchor"><IcBaselineArrowDropDown /></button>
  </div>
  <ul class="dropdown dropdown-end border border-purple-500 menu rounded-box bg-base-300 shadow-sm p-1" popover id="cancelLoginDropdown" style="position-anchor:--cancelLoginDropdownAnchor">
    <li><button onclick={logout}><IcBaselineLogout />Log out</button></li>
  </ul>
{:else if loginStatus == "logged_in"}
  <div class="join">
    <button class="btn btn-outline btn-accent join-item pointer-events-none pfp-container">
      {#if pfpURL}
        <img src={pfpURL} alt="profile pic" class="rounded-s pfp" />
      {:else}
        <div class="skeleton rounded-s rounded-e-none pfp-container"></div>
      {/if}
    </button>

    <button class="btn btn-outline btn-accent join-item pointer-events-none text-lg font-bold">{USER?.value.channel || "Loading..."}</button>

    <button class="btn btn-accent join-item p-1" popovertarget="logoutDropdown" style="anchor-name:--logoutDropdownAnchor"><IcBaselineArrowDropDown /></button>
  </div>
  <ul class="dropdown dropdown-end border border-accent menu rounded-box bg-base-300 shadow-sm p-1" popover id="logoutDropdown" style="position-anchor:--logoutDropdownAnchor">
    <li><button onclick={logout}><IcBaselineLogout />Log out</button></li>
  </ul>
{:else}
  Something went wrong :(
{/if}

<style>
  .pfp-container {
    padding: 0;
    height: 40px;
    width: 40px;
  }
  .pfp {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
    height: auto;
    display: block;
  }

  .btn-twitch {
    color: #ffffff;
    background-color: #9933ff !important;
    border-color: #8744aa !important;
  }

  .btn-twitch:focus,
  .btn-twitch:hover {
    background-color: #8038de !important;
    border-color: #7f40a1 !important;
  }

  .btn-twitch:active {
    background-color: #6b2cbd !important;
    border-color: #6a308a !important;
  }
</style>
