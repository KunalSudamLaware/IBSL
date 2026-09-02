// NextAuth v5 route handler — delegates to the canonical config in src/lib/auth.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

