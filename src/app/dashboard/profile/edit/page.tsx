"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Upload, Save, X, Camera, ArrowLeft } from "lucide-react";
import { useToast } from "../../../../hooks/use-toast";
import { ToastProvider } from "../../../../components/ui/toast";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { useRouter } from "next/navigation";
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
  bannerURL: string;
  id: string;
}

const ProfileEdit = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    username: "",
    email: "",
    profileURL: "",
    bannerURL: "",
    id: "",
  });
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [newProfileURL, setNewProfileURL] = useState("");
  const [newBannerURL, setNewBannerURL] = useState("");
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
            bannerURL: data.user.bannerURL,
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
          bannerURL: profile.bannerURL,
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

  const handleImageUpload = async (type: 'profile' | 'banner') => {
    const url = type === 'profile' ? newProfileURL : newBannerURL;
    if (!url.trim()) {
      toast({
        title: "Validation Error",
        description: `Please enter a valid image URL`,
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register/${profile.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: profile.username,
          [type === 'profile' ? 'profileURL' : 'bannerURL']: url.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update image');
      }

      setProfile((prev) => ({
        ...prev,
        [type === 'profile' ? 'profileURL' : 'bannerURL']: url.trim(),
      }));
      
      if (type === 'profile') {
        setShowProfileModal(false);
        setNewProfileURL("");
      } else {
        setShowBannerModal(false);
        setNewBannerURL("");
      }

      toast({
        title: "Success",
        description: `Your ${type} picture has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: `Failed to update ${type} picture. Please try again.`,
        variant: "destructive",
      });
    }
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
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/dashboard/profile')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>

          {/* Banner Section */}
          <Card className="relative mb-6 dark:bg-[#161514] overflow-hidden">
            <div className="relative h-64 sm:h-80 w-full bg-gradient-to-r from-emerald-500 to-emerald-600">
              {profile.bannerURL ? (
                <Image
                  src={profile.bannerURL}
                  alt="Profile banner"
                  fill
                  className="object-cover w-full"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectPosition: 'center center' }}
                />
              ) : (
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              )}
              <Button
                variant="secondary"
                className="absolute bottom-4 right-4 flex gap-2 z-10"
                onClick={() => setShowBannerModal(true)}
              >
                <Camera className="w-4 h-4" />
                Change Banner
              </Button>
            </div>
          </Card>

          {/* Profile Image */}
          <Card className="relative dark:bg-[#161514] mb-6">
            <CardHeader className="text-center">
              <div className="relative">
                <motion.div
                  className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-background -mt-20 shadow-xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={profile.profileURL || "https://i.postimg.cc/2yj6dtrv/image.jpg"}
                      alt={`${profile.username}'s profile picture`}
                      fill
                      className="object-cover rounded-full"
                      priority
                    />
                  </div>
                </motion.div>
                <Button
                  variant="outline"
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background hover:bg-accent"
                  onClick={() => setShowProfileModal(true)}
                >
                  <Camera className="w-4 h-4" />
                  Change Photo
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Form */}
          <Card className="dark:bg-[#161514]">
            <CardContent className="space-y-4 pt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-2"
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
                  className="bg-background"
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
                  className="bg-muted"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="pt-4"
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

        {/* Profile Image Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="sm:max-w-md dark:bg-[#161514]">
            <DialogHeader>
              <DialogTitle>Change Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="profileImageUrl">Enter Image URL</Label>
              <Input
                id="profileImageUrl"
                type="text"
                placeholder="Paste profile image URL here..."
                value={newProfileURL}
                onChange={(e) => setNewProfileURL(e.target.value)}
              />
            </div>
            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => handleImageUpload('profile')}>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Banner Image Modal */}
        <Dialog open={showBannerModal} onOpenChange={setShowBannerModal}>
          <DialogContent className="sm:max-w-md dark:bg-[#161514]">
            <DialogHeader>
              <DialogTitle>Change Banner Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="bannerImageUrl">Enter Image URL</Label>
              <Input
                id="bannerImageUrl"
                type="text"
                placeholder="Paste banner image URL here..."
                value={newBannerURL}
                onChange={(e) => setNewBannerURL(e.target.value)}
              />
            </div>
            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowBannerModal(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => handleImageUpload('banner')}>
                <Upload className="w-4 h-4 mr-2" />
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
