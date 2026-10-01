"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({ data: null, status: "loading" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not auth");
        return res.json();
      })
      .then((json) => {
        if (json.authenticated && json.user) {
          setData({ user: json.user });
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, []);

  return <AuthContext.Provider value={{ data, status }}>{children}</AuthContext.Provider>;
}

export function useSession() {
  return useContext(AuthContext);
}

export async function signOut({ callbackUrl = "/" } = {}) {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = callbackUrl;
}