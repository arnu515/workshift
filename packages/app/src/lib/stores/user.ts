import { writable } from "svelte/store";

export interface User {
  id: string;
  v?: number;
  email: string;
  provider: string;
  providerId: string;
  username: string;
  organisation_ids: string[];
}

export const user = writable<User | null>(null);
