<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  export const load: Load = ({ page }) => {
    return {
      status: 302,
      redirect: `/org/${page.params.id}/chats`
    };
  };
</script>
