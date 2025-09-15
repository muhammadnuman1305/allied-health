"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";
import { login$ } from "../../lib/api/auth/_request";
import { useToast } from "@/hooks/use-toast";
import { LoginPayload } from "@/lib/api/auth/_model";
import { getUser, redirectBasedOnRole } from "@/lib/auth-utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      const payload: LoginPayload = {
        username,
        password,
        isAdmin: true,
      };

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
            role: response.data.role,
            isAdmin: response.data.isAdmin,
          })
        );

        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.firstName}!`,
          variant: "default",
          duration: 1500,
        });

        router.push("/admin/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive",
          duration: 1500,
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-background p-4">
      <Card className="w-full max-w-md shadow-lg border-red-200">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-red-900">
            Admin Access
          </CardTitle>
          <CardDescription className="text-center text-red-700">
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-red-900">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="adminuser"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-red-200 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-red-900">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-red-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-red-200 focus:border-red-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Sign in as Admin</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-red-700">
            Need user access?{" "}
            <Link
              href="/login"
              className="text-red-600 hover:underline font-medium"
            >
              User Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

