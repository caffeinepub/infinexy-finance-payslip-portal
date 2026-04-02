import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface RegisterPageProps {
  onBack: () => void;
}

export function RegisterPage({ onBack }: RegisterPageProps) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Connecting to server...");
      return;
    }
    setLoading(true);
    try {
      await actor.registerEmployee(username, name, password);
      toast.success("Account created successfully! Please login.");
      onBack();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0f1a35 0%, #1a2744 50%, #0f2350 100%)",
      }}
    >
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3">
          <img
            src="/assets/screenshot_2026-03-13_121927-019d42cf-27da-73a9-8a59-1cd2655ffbf8.png"
            alt="Infinexy Solutions"
            className="h-20 w-56 object-contain"
          />
          <div>
            <h1 className="text-xl font-cabinet font-bold text-white tracking-wider">
              INFINEXY SOLUTIONS
            </h1>
            <p className="text-xs text-blue-200">Payroll Management Portal</p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md mx-4 shadow-2xl border-0">
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">Create Employee Account</h2>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input
                id="reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                data-ocid="register.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-username">Username</Label>
              <Input
                id="reg-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="john.doe"
                required
                data-ocid="register.username.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
                data-ocid="register.password.input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              data-ocid="register.submit.button"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
