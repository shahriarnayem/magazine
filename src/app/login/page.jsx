"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    // Already logged in? redirect home.
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/auth/me`, { cache: "no-store" });
                if (res.ok) {
                    const data = (await res.json());
                    if (data?.user?.id) {
                        router.replace("/");
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
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
        if (!ok) {
            toast({
                title: "Invalid email",
                description: "Please enter a valid email address.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    name: name.trim() || undefined,
                    googleId: `demo-${email.trim().toLowerCase()}`,
                    image: "",
                }),
            });
            if (!res.ok) {
                const err = (await res.json().catch(() => ({})));
                throw new Error(err.error || "Login failed");
            }
            toast({ title: "Welcome", description: "You're now signed in." });
            router.push("/");
            router.refresh();
        }
        catch (err) {
            toast({
                title: "Login failed",
                description: err instanceof Error ? err.message : "Unknown error.",
                variant: "destructive",
            });
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
            <h1 className="text-2xl font-bold tracking-tight">Reader Login</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to bookmark and comment on stories.
            </p>
          </div>

          <Button type="button" disabled={loading || checking} onClick={handleSubmit} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-4">
            {loading ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>)}
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"/>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-card px-2 text-muted-foreground">
                or try a demo reader
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/40"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="reader@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/40"/>
            </div>
            <Button type="submit" disabled={loading || checking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Mail className="h-4 w-4"/>)}
              Continue with email
            </Button>
          </form>
        </div>

        <div className="mt-6 flex items-center text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5"/>
            Demo: any email works
          </span>
        </div>
      </div>
    </div>);
}
