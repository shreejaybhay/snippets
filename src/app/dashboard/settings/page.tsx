"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  KeyRound,
  Monitor,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
  _id: string;
  username: string;
  email: string;
  profileURL?: string;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [accountSettings, setAccountSettings] = useState({
    username: "",
    email: "",
    profileURL: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    deletePassword: "", // Add this new field
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    fontSize: "medium",
    compactMode: false,
    lineNumbers: true,
    autoSave: true,
    notifications: true,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
        setAccountSettings((prev) => ({
          ...prev,
          username: data.user.username,
          email: data.user.email,
          profileURL: data.user.profileURL || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  const handleAccountUpdate = async () => {
    if (!userData?._id) {
      toast({
        title: "Error",
        description: "User data not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (accountSettings.newPassword) {
        if (accountSettings.newPassword !== accountSettings.confirmPassword) {
          toast({
            title: "Error",
            description: "New passwords don't match",
            variant: "destructive",
          });
          return;
        }
        if (!accountSettings.currentPassword) {
          toast({
            title: "Error",
            description: "Current password is required",
            variant: "destructive",
          });
          return;
        }
      }

      const response = await fetch(
        `${BASE_URL}/api/auth/register/${userData._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: accountSettings.username,
            oldPassword: accountSettings.currentPassword,
            newPassword: accountSettings.newPassword,
            profileURL: accountSettings.profileURL,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Account settings updated successfully",
        });
        setAccountSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update account settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (
    key: keyof typeof preferences,
    value: any
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(
      "userPreferences",
      JSON.stringify({
        ...preferences,
        [key]: value,
      })
    );
    toast({
      title: "Success",
      description: "Preferences updated successfully",
    });
  };

  const handleDeleteAccount = async () => {
    if (!userData?._id) return;

    if (!accountSettings.deletePassword) {
      toast({
        title: "Error",
        description: "Please enter your password to delete your account",
        variant: "destructive",
      });
      return;
    }

    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userData?._id) {
      toast({
        title: "Error",
        description: "User data not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/register/${userData._id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: accountSettings.deletePassword,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // First, call the logout endpoint
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted",
        });

        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();

        router.refresh();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!mounted) return null;

  return (
    <motion.div
      className="p-6 max-w-[1200px] mx-auto relative z-0"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div
        className="flex items-center gap-2 mb-6"
        variants={fadeIn}
        transition={{ delay: 0.1 }}
      >
        <Settings className="w-6 h-6 text-[#22C55E]" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </motion.div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {/* Profile Settings */}
          <Card className="dark:bg-[#1C1917]/40 border dark:border-green-100/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#22C55E]" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={accountSettings.username}
                  onChange={(e) =>
                    setAccountSettings((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="dark:bg-[#1C1917]/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountSettings.email}
                  disabled
                  className="dark:bg-[#1C1917]/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileURL">Profile Picture URL</Label>
                <Input
                  id="profileURL"
                  value={accountSettings.profileURL}
                  onChange={(e) =>
                    setAccountSettings((prev) => ({
                      ...prev,
                      profileURL: e.target.value,
                    }))
                  }
                  className="dark:bg-[#1C1917]/40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="dark:bg-[#1C1917]/40 border dark:border-green-100/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#22C55E]" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={accountSettings.currentPassword}
                  onChange={(e) =>
                    setAccountSettings((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="dark:bg-[#1C1917]/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={accountSettings.newPassword}
                  onChange={(e) =>
                    setAccountSettings((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="dark:bg-[#1C1917]/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={accountSettings.confirmPassword}
                  onChange={(e) =>
                    setAccountSettings((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="dark:bg-[#1C1917]/40"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-[#1C1917]/40 border dark:border-green-100/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deletePassword">
                  Enter Password to Confirm
                </Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={accountSettings.deletePassword}
                  onChange={(e) =>
                    setAccountSettings((prev) => ({
                      ...prev,
                      deletePassword: e.target.value,
                    }))
                  }
                  className="dark:bg-[#1C1917]/40"
                />
              </div>
              <Button
                onClick={handleDeleteAccount}
                disabled={loading || !accountSettings.deletePassword}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleAccountUpdate}
              disabled={loading}
              className="px-8"
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="dark:bg-[#1C1917]/40 border dark:border-green-100/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#22C55E]" />
                Appearance
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value);
                    handlePreferenceChange("theme", value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-[#1C1917] border dark:border-green-100/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Account
            </AlertDialogTitle>
            <div className="space-y-4">
              <AlertDialogDescription asChild>
                <div className="text-base text-muted-foreground">
                  This action will permanently delete your account and all
                  associated data. This cannot be undone.
                </div>
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel
              className="dark:bg-[#1C1917]/40"
              disabled={loading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white gap-2"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Deleting...
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default SettingsPage;
