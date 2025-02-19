"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Upload, Save, X } from "lucide-react";
import { useToast } from "../../../../hooks/use-toast";
import { ToastProvider } from "../../../../components/ui/toast";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";

interface Profile {
  username: string;
  email: string;
  profileURL: string;
  id: string;
}

const ProfileEdit = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    username: "",
    email: "",
    profileURL: "",
    id: "",
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProfileURL, setNewProfileURL] = useState("");
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.success && data.user) {
          setProfile({
            username: data.user.username,
            email: data.user.email,
            profileURL: data.user.profileURL,
            id: data.user._id,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast, BASE_URL]);

  const handleSave = async () => {
    if (!profile.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register/${profile.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: profile.username.trim(),
          profileURL: profile.profileURL,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update profile: ${res.statusText}`);
      }

      toast({
        title: "Success",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = () => {
    if (!newProfileURL.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    setProfile((prev) => ({ ...prev, profileURL: newProfileURL.trim() }));
    setShowModal(false);
    setNewProfileURL("");
    toast({
      title: "Success",
      description: "Your profile picture has been changed successfully.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Image */}
          <Card className="relative dark:bg-[#161514]">
            <CardHeader className="text-center">
              <motion.div
                className="w-24 h-24 mx-auto rounded-full overflow-hidden border border-gray-300 dark:border-zinc-700"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src={
                    profile.profileURL ||
                    "https://i.postimg.cc/2yj6dtrv/image.jpg"
                  }
                  alt={`${profile.username}'s profile picture`}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  priority
                />
              </motion.div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button
                variant="outline"
                className="flex gap-2"
                onClick={() => setShowModal(true)}
              >
                <Upload className="w-5 h-5" />
                Change Photo
              </Button>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="dark:bg-[#161514]">
            <CardContent className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-2 mt-4"
              >
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter your username"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  aria-label="Email (cannot be changed)"
                />
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Button
                  className="w-full flex gap-2"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Upload Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="p-6 dark:bg-[#161514]">
            <DialogHeader>
              <DialogTitle>Change Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="imageUrl">Enter Image URL</Label>
              <Input
                id="imageUrl"
                type="text"
                placeholder="Paste image URL here..."
                value={newProfileURL}
                onChange={(e) => setNewProfileURL(e.target.value)}
              />
            </div>
            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
                Cancel
              </Button>
              <Button onClick={handleImageUpload}>
                <Upload className="w-5 h-5" />
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ToastProvider>
  );
};

export default ProfileEdit;
