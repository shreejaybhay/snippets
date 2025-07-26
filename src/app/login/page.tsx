"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!loginRes.ok) {
        setErrorMessage("Invalid email or password");
        return;
      }

      router.push("/dashboard/snippets");
    } catch (err) {
      setErrorMessage("Something went wrong. Please try again.");
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/50" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-[length:400%_400%] animate-gradient"
          style={{
            backgroundImage: `linear-gradient(45deg, 
              hsl(var(--primary)/0.2) 0%, 
              hsl(var(--background)) 25%, 
              hsl(var(--secondary)/0.2) 50%,
              hsl(var(--background)) 75%,
              hsl(var(--primary)/0.2) 100%
            )`,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="backdrop-blur-md bg-card/80 shadow-xl border-border/50">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 transition-all duration-200 bg-background/50 focus:bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="●●●●●●●●"
                  className="h-11 transition-all duration-200 bg-background/50 focus:bg-background"
                />
              </div>
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
