import { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

import { usePersistentState } from "@/hooks/use-persistent-state";
import { api } from "@/lib/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = usePersistentState("auth-user", null);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => setUser(data),
  });

  const logout = useCallback(() => setUser(null), [setUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: loginMutation.mutateAsync,
      isLoggingIn: loginMutation.isPending,
      loginError: loginMutation.error,
      logout,
    }),
    [user, loginMutation.mutateAsync, loginMutation.isPending, loginMutation.error, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
