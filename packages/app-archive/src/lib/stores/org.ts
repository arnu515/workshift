import type { Organisation } from "@prisma/client";
import axios from "$lib/axios";
import { toast } from "@zerodevx/svelte-toast";
import { getMessage } from "../util";
import { writable } from "svelte/store";

export const org = (() => {
  const { set, update, subscribe } = writable<Organisation[]>(null);

  const refresh = async () => {
    const res = await axios.get("/organisations");
    if (!res.status.toString().startsWith("2")) {
      toast.push(getMessage(res));
    }
    set(res.data.organisations);
  };

  return { set, update, subscribe, refresh };
})();
