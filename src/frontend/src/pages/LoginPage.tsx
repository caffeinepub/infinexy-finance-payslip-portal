import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";

interface LoginPageProps {
  onNavigateRegister: () => void;
}

function getStoredAdminCredentials(): { username: string; password: string } {
  try {
    const raw = localStorage.getItem("admin_credentials");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.username && parsed.password) return parsed;
    }
  } catch {
    // ignore
  }
  return { username: "admin", password: "" };
}

export function LoginPage({ onNavigateRegister }: LoginPageProps) {
  const { actor } = useActor();
  const { setUser } = useAuth();
  const storedCreds = getStoredAdminCredentials();
  const [adminUsername, setAdminUsername] = useState(storedCreds.username);
  const [adminPassword, setAdminPassword] = useState("");
  const [empUsername, setEmpUsername] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Connecting to server...");
      return;
    }
    setLoading(true);
    try {
      await (actor as any).loginAdmin(adminUsername, adminPassword);
      localStorage.setItem(
        "admin_credentials",
        JSON.stringify({ username: adminUsername, password: adminPassword }),
      );
      setUser({
        isAdmin: true,
        username: adminUsername,
        displayName: "Administrator",
      });
      toast.success("Welcome, Administrator!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Connecting to server...");
      return;
    }
    setLoading(true);
    try {
      await actor.loginEmployee(empUsername, empPassword);
      setUser({
        isAdmin: false,
        username: empUsername,
        displayName: empUsername,
      });
      toast.success("Welcome back!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
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
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <img
            src="/assets/uploads/WhatsApp-Image-2026-02-27-at-11.18.04-AM-1.jpeg"
            alt="Infinexy Finance"
            className="h-10 w-32 object-contain rounded-lg bg-white p-1"
          />
          <div>
            <h1 className="text-2xl font-cabinet font-bold text-white tracking-wider">
              INFINEXY FINANCE
            </h1>
            <p className="text-xs text-blue-200 mt-0.5">
              Payroll Management Portal
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md mx-4 shadow-2xl border-0 animate-fade-in">
        <CardHeader className="pb-2 pt-6">
          <h2 className="text-center text-lg font-semibold text-foreground">
            Sign In to Your Account
          </h2>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Tabs defaultValue="employee">
            <TabsList className="w-full mb-6">
              <TabsTrigger
                value="admin"
                className="flex-1 gap-2"
                data-ocid="login.admin.tab"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </TabsTrigger>
              <TabsTrigger
                value="employee"
                className="flex-1 gap-2"
                data-ocid="login.employee.tab"
              >
                <User className="h-4 w-4" />
                Employee
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-username">Admin Username</Label>
                  <Input
                    id="admin-username"
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Enter admin username"
                    required
                    data-ocid="login.username.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    data-ocid="login.password.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  data-ocid="login.submit.button"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Signing in..." : "Sign In as Admin"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="employee">
              <form onSubmit={handleEmployeeLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="emp-username">Username</Label>
                  <Input
                    id="emp-username"
                    value={empUsername}
                    onChange={(e) => setEmpUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    data-ocid="login.username.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emp-password">Password</Label>
                  <Input
                    id="emp-password"
                    type="password"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    data-ocid="login.password.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  data-ocid="login.submit.button"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onNavigateRegister}
                    className="text-primary font-medium hover:underline"
                    data-ocid="login.register.link"
                  >
                    Register here
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-blue-300 text-center">
        &copy; {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
