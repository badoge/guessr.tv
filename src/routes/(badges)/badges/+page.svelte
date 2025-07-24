<svelte:head>
  <script src="https://embed.twitch.tv/embed/v1.js" async></script>
</svelte:head>
<div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
  <header class="mb-auto">
    <div>
      <h3 class="float-md-start mb-0"><img src="/guessr.png" alt="Guessr.tv" height="40px" /> Guessr.tv</h3>
      <nav class="nav nav-masthead justify-content-center float-md-end">
        <a class="nav-link fw-bold py-1 px-0" href="/">Guessr.tv<i class="material-icons notranslate">outbound</i></a>
        <div class="vr py-1 px-0 mx-3"></div>
        <a class="nav-link fw-bold py-1 px-0 active" aria-current="page" href="#">Badges</a>
        <a class="nav-link fw-bold py-1 px-0" href="/drops">Drops</a>
      </nav>
    </div>
  </header>

  <main class="p-3">
    <h1>:)</h1>
  </main>
</div>

<style>
  body {
    margin-bottom: 400px;
  }

  .cover-container {
    max-width: 50em;
  }

  .nav-masthead .nav-link {
    color: rgba(255, 255, 255, 0.5);
    border-bottom: 0.25rem solid transparent;
  }

  .nav-masthead .nav-link:hover,
  .nav-masthead .nav-link:focus {
    border-bottom-color: rgba(255, 255, 255, 0.25);
  }

  .nav-masthead .nav-link + .nav-link {
    margin-left: 1rem;
  }

  .nav-masthead .active {
    color: #fff;
    border-bottom-color: #fff;
  }

  .twitch-icon {
    display: inline-block;
    width: 22px;
    height: 26px;
    background-image: url(/twitch.png);
    margin: 0 5px -8px 0;
  }

  .btn-twitch {
    color: #ffffff;
    background-color: #9933ff !important;
    border-color: #8744aa !important;
  }

  .btn-twitch:active,
  .btn-twitch:focus,
  .btn-twitch:hover {
    color: #ffffff;
    background-color: #8038de !important;
    border-color: #7f40a1 !important;
  }
</style>
