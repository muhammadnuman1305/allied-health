"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ArrowLeft, Save, User, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getById$,
  create$,
  update$,
  getSpecialtyOptions$,
} from "@/lib/api/admin/users/_request";
import { UserFormData, User as UserType } from "@/lib/api/admin/users/_model";
import { SpecialtyOption } from "@/lib/api/admin/specialties/_model";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Form validation schema - updated to match backend model
const createUserFormSchema = (isNewUser: boolean) =>
  z.object({
    id: z.string().nullable().optional(),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be less than 30 characters")
      .nullable(),
    email: z.string().email("Please enter a valid email address"),
    password: isNewUser
      ? z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(100, "Password must be less than 100 characters")
      : z
          .string()
          .max(100, "Password must be less than 100 characters")
          .optional()
          .or(z.literal(""))
          .nullable(),
    role: z.number({
      required_error: "Please select a role",
    }),
    isAdmin: z.boolean().default(false),
    selectedSpecialties: z.array(z.string()).optional().default([]),
  });

type FormData = z.infer<ReturnType<typeof createUserFormSchema>>;

// Role mapping for display
const roleMap = {
  1: "Allied Assistant",
  2: "Allied Professional",
} as const;

const reverseRoleMap = {
  "Allied Assistant": 1,
  "Allied Professional": 2,
} as const;

export default function UserFormContent({ userId }: { userId: string }) {
  const router = useRouter();
  const isNewUser = userId === "0";

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(!isNewUser);
  const [user, setUser] = useState<UserType | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false);
  const [specialtyPopoverOpen, setSpecialtyPopoverOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createUserFormSchema(isNewUser)),
    defaultValues: {
      id: isNewUser ? null : userId,
      firstName: "",
      lastName: "",
      username: isNewUser ? "" : null,
      email: "",
      password: isNewUser ? "" : null,
      role: 2, // Default to Allied Professional
      isAdmin: false,
      selectedSpecialties: [],
    },
  });

  const watchedRole = watch("role");
  const watchedIsAdmin = watch("isAdmin");
  const watchedSelectedSpecialties = watch("selectedSpecialties") || [];

  // Load specialties when role is Allied Assistant
  useEffect(() => {
    const loadSpecialties = async () => {
      if (watchedRole === 1) {
        try {
          setIsLoadingSpecialties(true);
          const response = await getSpecialtyOptions$();
          setSpecialties(response.data);
        } catch (error) {
          console.error("Error loading specialties:", error);
          toast({
            title: "Error",
            description: "Failed to load specialties. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingSpecialties(false);
        }
      }
    };

    loadSpecialties();
  }, [watchedRole]);

  // Load user data for editing
  useEffect(() => {
    const loadUser = async () => {
      if (!isNewUser) {
        try {
          setIsLoadingUser(true);
          const response = await getById$(userId);
          const userData = response.data;
          setUser(userData);

          // Populate form with user data
          setValue("id", userData.id);
          setValue("firstName", userData.firstName);
          setValue("lastName", userData.lastName);
          setValue("username", userData.username);
          setValue("email", userData.email);
          setValue("role", userData.role);
          setValue("isAdmin", userData.isAdmin);
          setValue("password", null); // Don't populate password for security
          // Always populate selectedSpecialties from backend response
          setValue("selectedSpecialties", userData.selectedSpecialties || []);

          // Load specialties if user is Allied Assistant
          if (userData.role === 1) {
            try {
              const specialtiesResponse = await getSpecialtyOptions$();
              setSpecialties(specialtiesResponse.data);
            } catch (error) {
              console.error("Error loading specialties:", error);
            }
          }
        } catch (error) {
          console.error("Error loading user:", error);
          toast({
            title: "Error",
            description: "Failed to load user data. Please try again.",
            variant: "destructive",
          });
          router.push("/admin/users");
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    loadUser();
  }, [userId, isNewUser, setValue, router]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Prepare payload according to backend AddUpdateUserDTO
      const payload: UserFormData = {
        id: isNewUser ? null : data.id || userId,
        firstName: data.firstName,
        lastName: data.lastName,
        username: isNewUser ? data.username : null, // Don't send username for updates
        email: data.email,
        password: data.password || null,
        role: data.role,
        isAdmin: data.isAdmin,
        selectedSpecialties:
          data.role === 1 ? data.selectedSpecialties || [] : [],
      };

      if (isNewUser) {
        await create$(payload);
        toast({
          title: "Success",
          description: "User created successfully.",
        });
      } else {
        await update$(payload);
        toast({
          title: "Success",
          description: "User updated successfully.",
        });
      }

      // Navigate back to users list
      router.push("/admin/users");
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save user. Please try again.",
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isNewUser ? "Add New User" : "Edit User"}
          </h1>
          <p className="text-muted-foreground">
            {isNewUser
              ? "Create a new user account for the allied health system"
              : "Update user information and settings"}
          </p>
        </div>
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

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Enter username"
                  disabled={!isNewUser}
                  className={!isNewUser ? "bg-muted" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
                {!isNewUser && (
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed for existing users
                  </p>
                )}
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

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password * {!isNewUser && "(leave blank to keep current)"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={
                    isNewUser
                      ? "Enter password"
                      : "Enter new password (optional)"
                  }
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={roleMap[watchedRole as keyof typeof roleMap] || ""}
                  onValueChange={(value) => {
                    const roleValue =
                      reverseRoleMap[value as keyof typeof reverseRoleMap];
                    setValue("role", roleValue);
                    // Clear specialties if role changes from Allied Assistant
                    if (roleValue !== 1) {
                      setValue("selectedSpecialties", []);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Allied Professional">
                      Allied Professional
                    </SelectItem>
                    <SelectItem value="Allied Assistant">
                      Allied Assistant
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Specialties Multi-Select (only shown for Allied Assistant) */}
              {watchedRole === 1 && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Popover
                    open={specialtyPopoverOpen}
                    onOpenChange={setSpecialtyPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={specialtyPopoverOpen}
                        className="w-full justify-between"
                      >
                        {watchedSelectedSpecialties.length > 0
                          ? `${watchedSelectedSpecialties.length} specialty selected`
                          : "Select specialties..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search specialties..." />
                        <CommandList>
                          <CommandEmpty>
                            {isLoadingSpecialties
                              ? "Loading specialties..."
                              : "No specialties found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {specialties.map((specialty) => (
                              <CommandItem
                                key={specialty.id}
                                value={specialty.name}
                                onSelect={() => {
                                  const currentIds = watchedSelectedSpecialties;
                                  const isSelected = currentIds.includes(
                                    specialty.id
                                  );
                                  const newIds = isSelected
                                    ? currentIds.filter(
                                        (id) => id !== specialty.id
                                      )
                                    : [...currentIds, specialty.id];
                                  setValue("selectedSpecialties", newIds);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    watchedSelectedSpecialties.includes(
                                      specialty.id
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {specialty.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {watchedSelectedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedSelectedSpecialties.map((specialtyId) => {
                        const specialty = specialties.find(
                          (s) => s.id === specialtyId
                        );
                        return specialty ? (
                          <div
                            key={specialtyId}
                            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                          >
                            {specialty.name}
                            <button
                              type="button"
                              onClick={() => {
                                setValue(
                                  "selectedSpecialties",
                                  watchedSelectedSpecialties.filter(
                                    (id) => id !== specialtyId
                                  )
                                );
                              }}
                              className="ml-1 hover:opacity-70"
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  {errors.selectedSpecialties && (
                    <p className="text-sm text-destructive">
                      {errors.selectedSpecialties.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isNewUser ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isNewUser ? "Create User" : "Update User"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/users")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
