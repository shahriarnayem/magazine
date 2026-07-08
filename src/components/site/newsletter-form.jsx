"use client";
import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    function handleSubmit(e) {
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
        // Simulate subscription (no backend needed per spec)
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Subscribed",
                description: "You're on the list. Welcome to Bangladeshist.",
            });
            setEmail("");
        }, 600);
    }
    return (<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <Input type="email" inputMode="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 bg-background/40" aria-label="Email address"/>
      </div>
      <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {loading ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<CheckCircle2 className="h-4 w-4"/>)}
        Subscribe
      </Button>
    </form>);
}
