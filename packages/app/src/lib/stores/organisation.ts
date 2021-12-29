import axios from "../axios";
import { writable, get } from "svelte/store";
import { toast } from "@zerodevx/svelte-toast";
import type {
  Organisation,
  OrganisationInvites,
  User,
  ChatChannels,
  ChatMessages
} from "@prisma/client";
import { getMessage } from "../util";

export const organisations = (() => {
  const { set, update, subscribe } = writable<Organisation[] | null>(null);

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

export interface Invite extends OrganisationInvites {
  organisation: Organisation & { owner: User };
}

export const invites = (() => {
  const { set, update, subscribe } = writable<Invite[] | null>(null);

  const refresh = async () => {
    const { status, data } = await axios.get<{
      invites: Invite[];
      message: any;
    }>("/organisations/invites");
    if (status === 200) set(data.invites);
    else toast.push(getMessage({ status, data }));
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

  return {
    set,
    update,
    subscribe,
    refresh,
    acceptOrDeclineInvite
  };
})();

export const organisation = (() => {
  const { set, update, subscribe } = writable<Organisation | null>(null);

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

export const channels = (() => {
  const { set, update, subscribe } = writable<ChatChannels[] | null>(null);

  const refresh = async (orgId: string) => {
    const { status, data } = await axios.get("/organisations/" + orgId + "/channels");
    if (status === 200) set(data.channels);
    else toast.push(getMessage({ status, data }));
  };

  return {
    set,
    update,
    subscribe,
    refresh
  };
})();

export const messages = (() => {
  const { set, update, subscribe } = writable<{
    [key: ChatChannels["id"]]: ChatMessages[];
  }>({});

  const refresh = async (orgId: string, channelId: string, force = false) => {
    if (!force && get(messages)[channelId]) return;
    const { status, data } = await axios.get(
      "/organisations/" + orgId + "/channels/" + channelId + "/messages"
    );
    if (status !== 200) {
      toast.push(getMessage({ status, data }));
      return;
    }
    update(x => {
      x[channelId] = data.messages;
      return x;
    });
    lastMessage.update(x => {
      x[channelId] = data.messages[0]?.id;
      return x;
    });
  };

  return {
    set,
    update,
    subscribe,
    refresh
  };
})();

export const lastMessage = writable<{
  [key: ChatChannels["id"]]: ChatMessages["id"] | null | undefined;
}>({});
