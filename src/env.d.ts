/// <reference types="astro/client" />
/// <reference path="./.astro/types.d.ts" />

type AuthUser = import("better-auth").User;

interface User extends AuthUser {
  profileCompleted: boolean;
}

declare namespace App {
  interface Locals {
    user: User | null;
    session: import("better-auth").Session | null;
  }
}
