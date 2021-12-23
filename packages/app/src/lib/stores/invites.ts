import type { OrganisationInvites, Organisation, User } from "@prisma/client";
import axios from "$lib/axios";
import { toast } from "@zerodevx/svelte-toast";
import { getMessage } from "../util";
import { writable } from "svelte/store";

export interface Invite extends OrganisationInvites {
  organisation: Organisation & { owner: User };
}

export const invites = (() => {
  const { set, update, subscribe } = writable<Invite[]>(null);

  const refresh = async () => {
    const res = await axios.get("/organisations/invites");
    if (!res.status.toString().startsWith("2")) {
      toast.push(getMessage(res));
    }
    set(res.data.invites);
  };

  const acceptOrDeclineInvite = async ({
    id,
    orgId,
    action
  }: {
    id: string;
    orgId: string;
    action: "accept" | "decline";
  }) => {
    const res = await axios.patch(`/organisations/${orgId}/invites/${id}`, { action });
    if (!res.status.toString().startsWith("2")) {
      toast.push(getMessage(res));
    }
    return res.data;
  };

  return { set, update, subscribe, refresh, acceptOrDeclineInvite };
})();
