import { writable, get } from "svelte/store";
import Pusher from "pusher-js";
import { channels, organisation, messages } from "./organisation";
import { toast } from "@zerodevx/svelte-toast";
import user from "./user";
import type { Channel } from "pusher-js";
import type { Organisation } from "@prisma/client";

type Connection = {
  orgId: Organisation["id"];
  channel: Channel;
};

type EventCollection = "chat-channel" | "chat-message" | "organisation";

type EventAction = "insert" | "update" | "delete" | "replace";

type EventData = {
  id: string;
  doc: any;
};

export const createEventHandler = (orgId: Organisation["id"]) => {
  const eventHandler = (eventName: string, data: EventData) => {
    // abort if the event is from pusher
    if (eventName.startsWith("pusher")) return;

    // abort if data is not properly structured
    if (!data || !data.id || !data.doc) return;
    data.doc.id = data.doc._id; // mongodb returns _id, prisma uses id

    // abort if the event was sent by the current user
    console.log("%cNew event: " + eventName, "font-weight: bold; font-size: 20px");
    console.log({ eventName, data });
    if ((data.doc.user_id || data.doc.owner_id) === get(user).id) return;

    const [collection, action] = eventName.split(".") as [EventCollection, EventAction];
    const org = get(organisation);

    switch (collection) {
      case "chat-channel":
        switch (action) {
          case "insert":
            console.log("Channel inserted", data.id);
            if (org.id === orgId) channels.update(channels => [...channels, data.doc]);
            break;
          case "update":
          case "replace":
            console.log("Channel updated", data.id);
            if (org.id === orgId)
              channels.update(channels =>
                channels.map(channel => (channel.id === data.id ? data.doc : channel))
              );
            break;
          case "delete":
            console.log("Channel deleted", data.id);
            if (org.id === orgId)
              channels.update(channels =>
                channels.filter(channel => channel.id !== data.id)
              );
            break;
        }
        break;
      case "chat-message":
        switch (action) {
          case "insert":
            console.log("Message inserted", data.id);
            if (org.id === orgId) {
              // just refresh message because user is not included in data.doc
              messages.refresh(orgId, data.doc.channel_id, true);
              const channel = get(channels).find(
                channel => channel.id === data.doc.channel_id
              );
              if (channel) {
                const t = document.createElement("textarea");
                t.textContent = channel.name;
                const channelName = t.innerHTML;
                t.textContent = data.doc.content;
                const messageContent = t.innerHTML;
                toast.push(
                  "New " +
                    data.doc.type +
                    " message in <strong>" +
                    channelName +
                    "</strong>.<br>" +
                    messageContent,
                  {
                    theme: {
                      "--toastBarBackground": "blue"
                    }
                  }
                );
              }
            }
            break;
          case "update":
          case "replace":
            console.log("Message updated", data.id);
            if (org.id === orgId) {
              // just refresh message because user is not included in data.doc
              messages.refresh(orgId, data.doc.channel_id, true);
            }
            break;
          case "delete":
            console.log("Message deleted", data.id);
            if (org.id === orgId) {
              // just refresh message because user is not included in data.doc
              messages.refresh(orgId, data.doc.channel_id, true);
            }
            break;
        }
        break;
      case "organisation":
        switch (action) {
          // no insert event here.
          case "update":
          case "replace":
            if (org.id === orgId) {
              organisation.refresh(orgId);
            }
            break;
          case "delete":
            if (org.id === orgId) {
              toast.push(
                "This organisation has been deleted. Redirecting you back to the home page."
              );
              setTimeout(() => (window.location.href = "/"), 3000);
            }
            break;
        }
        break;
    }
  };

  return eventHandler;
};

export const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY.toString(), {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER.toString()
});

export const orgConnection = (() => {
  const { set, subscribe, update } = writable<Connection | null>(null);

  const unsub = () => {
    const prevConn = get(orgConnection);
    if (prevConn !== null) {
      console.log(
        "%cUnsubscribed from " + prevConn.orgId,
        "color: red; font-size: 24px;"
      );
      prevConn.channel.unbind_all();
      prevConn.channel.unsubscribe();
    }
  };

  const sub = (id: Organisation["id"]) => {
    unsub();
    console.log("%cSubscribed to " + id, "color: green; font-size: 24px;");
    const channel = pusher.subscribe("organisation-" + id);
    channel.bind_global(createEventHandler(id));
    set({ orgId: id, channel });
  };

  return {
    set,
    subscribe,
    update,
    sub,
    unsub
  };
})();
