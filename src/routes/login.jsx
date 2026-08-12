import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/store/auth-context";

// dummyjson ships a fixed set of users; this one is in their docs.
const DEMO = { username: "emilys", password: "emilyspass" };

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(DEMO);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.firstName}`);
      navigate(location.state?.from ?? "/", { replace: true });
    } catch {
      // The mutation already tracks the error; nothing to do here.
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-20">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Authenticates against the dummyjson API. The demo account is
          pre-filled.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            autoComplete="username"
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />
          <FieldDescription>
            Any dummyjson user works — try <code>emilys</code> /{" "}
            <code>emilyspass</code>.
          </FieldDescription>
        </Field>

        {loginError && (
          <Alert variant="destructive">
            <AlertDescription>{loginError.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
