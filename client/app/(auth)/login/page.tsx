"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login$ } from "@/lib/api/auth/_request";
import { useToast } from "@/hooks/use-toast";
import { LoginPayload } from "@/lib/api/auth/_model";
import { getUser, redirectBasedOnRole } from "@/lib/auth-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"assistant" | "professional">(
    "assistant"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace(redirectBasedOnRole());
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const role = activeTab === "professional" ? 2 : 1;
      const payload: LoginPayload = { username, password, role };
      const response = await login$(payload);

      if (response && response.data.accessToken) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            accessToken: response.data.accessToken,
            departmentId: response.data.departmentId,
            role: response.data.role,
          })
        );
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.firstName}!`,
          variant: "default",
          duration: 1500,
        });
        router.push(role === 2 ? "/ahp/dashboard" : "/aha/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
          duration: 1500,
        });
      }
    } catch (error: any) {
      let errorMsg = "An unexpected error occurred.";
      if (error?.response?.data) {
        errorMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message ||
              JSON.stringify(error.response.data);
      } else if (error?.message) {
        errorMsg = error.message;
      }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isProfessional = activeTab === "professional";

  const theme = isProfessional
    ? {
        iconBg: "bg-accent",
        iconColor: "text-primary",
        forgotLink: "text-link hover:text-link-active hover:underline",
        button: "bg-primary hover:bg-primary-active text-primary-foreground",
        activeTab: "bg-primary text-primary-foreground",
      }
    : {
        iconBg: "bg-accent",
        iconColor: "text-primary",
        forgotLink: "text-link hover:text-link-active hover:underline",
        button: "bg-primary hover:bg-primary-active text-primary-foreground",
        activeTab: "bg-primary text-primary-foreground",
      };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-background p-4 relative ${isProfessional ? "theme-purple" : ""}`}>
      {/* Theme toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-5">
        {/* Tab switcher */}
        <div className="flex bg-muted rounded-lg p-1.5 gap-1.5 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("assistant")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "assistant"
                ? theme.activeTab
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            Assistant
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("professional")}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "professional"
                ? theme.activeTab
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            Professional
          </button>
        </div>

        {/* Login card */}
        <div className="bg-card rounded-lg border border-border px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className={`inline-flex p-3 rounded-lg ${theme.iconBg}`}>
                <LogIn className={`h-6 w-6 ${theme.iconColor}`} />
              </div>
              <h1 className="text-2xl font-normal text-foreground">Welcome Back</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              {isProfessional
                ? "Sign in to your professional account to continue"
                : "Sign in to your assistant account to continue"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="yourusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 bg-background border-input rounded-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link
                  href="/forgot-password"
                  className={`text-sm ${theme.forgotLink}`}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-background border-input rounded-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full h-12 rounded-lg text-base font-medium ${theme.button}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Log In</span>
                </div>
              )}
            </Button>
          </form>
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>Secure Login</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-info" />
            <span>Data Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
