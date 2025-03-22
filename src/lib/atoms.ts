// atoms.ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface UserDetails {
  name: string;
  email: string;
  phoneNumber: string;
}

// Using atomWithStorage to persist the state in localStorage
// The first parameter is the key used in localStorage
export const userDetailsAtom = atomWithStorage<UserDetails | null>(
  "userDetails",
  null
);
