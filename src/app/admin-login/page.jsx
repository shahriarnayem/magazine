"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
export default function AdminLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/auth/me`, { cache: "no-store" });
                if (res.ok) {
                    const data = (await res.json());
                    if (data?.user?.id && (data.user.role === "ADMIN" || data.user.role === "WRITER")) {
                        router.replace("/dashboard");
                        return;
                    }
                }
            }
            catch {
                // ignore
            }
            finally {
                setChecking(false);
            }
        })();
    }, [router]);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            if (!res.ok) {
                const data = (await res.json().catch(() => ({})));
                throw new Error(data.error || "Invalid credentials");
            }
            toast({ title: "Welcome back", description: "Logged in." });
            router.push("/dashboard");
            router.refresh();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Login failed.");
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-baseline justify-center mb-8">
          <span className="text-primary text-2xl leading-none">•</span>
          <span className="ml-1 font-bold tracking-tight text-lg">
            BANGLADESHIST
          </span>
        </Link>

        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 border border-primary/30 mb-3">
              <Lock className="h-5 w-5 text-primary"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Editors and writers only.
            </p>
          </div>

          {error && (<div className="mb-4 flex items-start gap-2 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0"/>
              <span>{error}</span>
            </div>)}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="bg-background/40"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="bg-background/40"/>
            </div>
            <Button type="submit" disabled={loading || checking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Lock className="h-4 w-4"/>)}
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            <p className="uppercase tracking-widest text-[10px] text-foreground/60 mb-1">
              Seed credentials
            </p>
            <p>admin@example.com / 12345678</p>
            <p>writer@example.com / 12345678</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="text-foreground/70 hover:text-primary">
            ← Back to site
          </Link>
          <Link href="/login" className="text-foreground/70 hover:text-primary inline-flex items-center gap-1">
            Reader login <ArrowRight className="h-3 w-3"/>
          </Link>
        </div>
      </div>
    </div>);
}
