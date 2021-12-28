import { writable } from "svelte/store";
import type { User } from "@prisma/client";

const user = writable<User | null>(null);

export default user;
