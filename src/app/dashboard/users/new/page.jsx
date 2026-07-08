"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
export default function NewUserPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("WRITER");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const submit = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast({
                title: "Validation",
                description: "Name, email and password are required.",
                variant: "destructive",
            });
            return;
        }
        if (password.length < 8) {
            toast({
                title: "Validation",
                description: "Password must be at least 8 characters.",
                variant: "destructive",
            });
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    role,
                    bio: bio.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to create user");
            toast({ title: "Created", description: "New user added." });
            router.push("/dashboard/users");
            router.refresh();
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setSaving(false);
        }
    };
    return (<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link href="/dashboard/users">
            <ArrowLeft className="size-5"/>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">New user</h1>
          <p className="text-sm text-muted-foreground">
            Create a new staff account.
          </p>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Account details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-name">Name</Label>
            <Input id="n-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="bg-background"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-email">Email</Label>
            <Input id="n-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="bg-background"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-pw">Password</Label>
            <Input id="n-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="bg-background"/>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin — full access</SelectItem>
                <SelectItem value="WRITER">Writer — articles only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-bio">Bio</Label>
            <Textarea id="n-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Short bio (optional)" className="bg-background"/>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/users">Cancel</Link>
            </Button>
            <Button onClick={submit} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <Loader2 className="size-4 animate-spin"/> : null}
              Create user
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
}
