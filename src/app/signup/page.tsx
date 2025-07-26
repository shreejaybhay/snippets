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

const Signup = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    // Trim and validate username (no special characters except spaces)
    const trimmedUsername = username.trim();
    if (!trimmedUsername || trimmedUsername.length < 3) {
      toast({
        title: "Invalid username",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Validate password (at least 6 characters)
    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const trimmedUsername = username.trim();

      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        body: JSON.stringify({ 
          username: trimmedUsername, 
          email: email.trim(), 
          password 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Registration failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      router.push("/login?registered=true");
      toast({
        title: "Success",
        description: "Registration successful! Please login.",
      });
    } catch (_) { // Changed 'error' to '_' since we're not using it
      toast({
        title: "Error",
        description: "Failed to register. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setShowPasswordHint(newPassword.length > 0 && newPassword.length < 6);
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
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join us and start your journey
              </p>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="h-11 transition-all duration-200 bg-background/50 focus:bg-background"
                />
              </div>
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
                  placeholder="●●●●●●●●"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="h-11 transition-all duration-200 bg-background/50 focus:bg-background"
                />
                {showPasswordHint && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-11 mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
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

export default Signup;
