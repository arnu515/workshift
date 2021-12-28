import axios from "../axios";
import { writable } from "svelte/store";
import { toast } from "@zerodevx/svelte-toast";
import type { Organisation, OrganisationInvites } from "@prisma/client";
import { getMessage } from "../util";

export const organisations = (() => {
  const { set, update, subscribe } = writable<Organisation[]>();

  const refresh = async () => {
    const { status, data } = await axios.get<{
      organisations: Organisation[];
      message: any;
    }>("/organisations");
    if (status === 200) set(data.organisations);
    else toast.push(getMessage({ status, data }));
  };

  return {
    set,
    update,
    subscribe,
    refresh
  };
})();

export const invites = (() => {
  const { set, update, subscribe } = writable<OrganisationInvites[]>();

  const refresh = async () => {
    const { status, data } = await axios.get<{
      invites: OrganisationInvites[];
      message: any;
    }>("/organisations/invites");
    if (status === 200) set(data.invites);
    else toast.push(getMessage({ status, data }));
  };

  return {
    set,
    update,
    subscribe,
    refresh
  };
})();

export const organisation = (() => {
  const { set, update, subscribe } = writable<Organisation | null>();

  const refresh = async (orgId: string) => {
    const { status, data } = await axios.get("/organisations/" + orgId);
    if (status === 200) set(data);
    else toast.push(getMessage({ status, data }));
  };

  return {
    set,
    update,
    subscribe,
    refresh
  };
})();
