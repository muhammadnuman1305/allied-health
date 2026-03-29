"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getById$, update$ } from "@/lib/api/admin/users/_request";
import { UserFormData, User as UserType } from "@/lib/api/admin/users/_model";
import { toast } from "@/hooks/use-toast";

// Form validation schema
const userSettingsSchema = z.object({
  id: z.string(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .max(100, "Password must be less than 100 characters")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

type FormData = z.infer<typeof userSettingsSchema>;

// Role mapping for display
const roleMap = {
  1: "Allied Assistant",
  2: "Allied Professional",
} as const;

export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      password: null,
    },
  });

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (!authUser?.id) {
        setIsLoadingUser(false);
        return;
      }

      try {
        setIsLoadingUser(true);
        const response = await getById$(authUser.id);
        const userData = response.data;
        setUser(userData);

        // Populate form with user data
        setValue("id", userData.id);
        setValue("firstName", userData.firstName);
        setValue("lastName", userData.lastName);
        setValue("email", userData.email);
        setValue("password", null); // Don't populate password for security
      } catch (error) {
        console.error("Error loading user:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [authUser?.id, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Prepare payload - keep role and isAdmin unchanged
      const payload: UserFormData = {
        id: data.id,
        username: null, // Don't send username for updates
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password || null,
        role: user.role,
        isAdmin: user.isAdmin,
        selectedSpecialties: user.selectedSpecialties || [],
      };

      await update$(payload);
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching user data
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Username (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user?.username || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={
                    user
                      ? roleMap[user.role as keyof typeof roleMap] || "Unknown"
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password (leave blank to keep current)
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Enter new password (optional)"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
