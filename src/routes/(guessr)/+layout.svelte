<script>
  import "../../app.css";
  import { Toaster } from "@skeletonlabs/skeleton-svelte";
  import { toaster } from "$lib/functions";

  let { children } = $props();
</script>

<Toaster {toaster}></Toaster>

{@render children()}
