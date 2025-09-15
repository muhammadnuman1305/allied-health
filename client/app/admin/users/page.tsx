"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import {
  Users,
  UserCheck,
  UserCog,
  Settings,
  Edit,
  Key,
  Trash2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Plus,
} from "lucide-react";
import {
  getAll$,
  toggleHide$,
  getSummary$,
} from "@/lib/api/admin/users/_request";
import { User, UserSummary } from "@/lib/api/admin/users/_model";

// Role mapping from backend numbers to display strings
const roleMap: Record<number, string> = {
  0: "User",
  1: "Allied Professional",
  2: "Allied Assistant",
  3: "Admin",
};

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "username" | "email" | "role" | null;

interface FilterState {
  name: string;
  username: string;
  email: string;
  role: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

interface PendingFilterInputs {
  name: string;
  username: string;
  email: string;
}

// Define the transformed user type for frontend use
interface TransformedUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  roleNumber: number;
  isAdmin: boolean;
  isHidden: boolean;
  joinedDate: string;
}

// Helper function to transform backend data to frontend format
const transformUserData = (backendUser: User): TransformedUser => ({
  id: backendUser.id,
  name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
  firstName: backendUser.firstName,
  lastName: backendUser.lastName,
  username: backendUser.username,
  email: backendUser.email,
  role: roleMap[backendUser.role],
  roleNumber: backendUser.role,
  isAdmin: backendUser.isAdmin,
  isHidden: backendUser.hidden,
  joinedDate: new Date().toISOString().split("T")[0], // You might want to add a createdDate field to backend
});

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<TransformedUser[]>([]);
  const [summary, setSummary] = useState<UserSummary>({
    totalUsers: 0,
    totalProfessionals: 0,
    totalAssistants: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    isHidden: boolean;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
    isHidden: false,
  });
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    username: "",
    email: "",
    role: "all",
    sortField: null,
    sortDirection: null,
  });

  // Pending filter values for input fields (applied on blur/focus out)
  const [pendingFilterInputs, setPendingFilterInputs] =
    useState<PendingFilterInputs>({
      name: "",
      username: "",
      email: "",
    });

  // Fetch users and summary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both users and summary data in parallel
        const [usersResponse, summaryResponse] = await Promise.all([
          getAll$(),
          getSummary$(),
        ]);

        const transformedUsers = usersResponse.data.map(transformUserData);
        setUsers(transformedUsers);
        setSummary(summaryResponse.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and sorting
  const filteredAndSortedUsers = users
    .filter((user) => {
      return (
        user.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        user.username.toLowerCase().includes(filters.username.toLowerCase()) &&
        user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
        (filters.role === "all" || user.role === filters.role)
      );
    })
    .sort((a, b) => {
      if (!filters.sortField || !filters.sortDirection) return 0;

      const aValue =
        filters.sortField === "name"
          ? a.name.toLowerCase()
          : a[filters.sortField as keyof TransformedUser]
              .toString()
              .toLowerCase();
      const bValue =
        filters.sortField === "name"
          ? b.name.toLowerCase()
          : b[filters.sortField as keyof TransformedUser]
              .toString()
              .toLowerCase();

      if (filters.sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  // Pagination calculations
  const totalFilteredUsers = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  // Statistics are now fetched from API via summary state

  // Handle filter application on focus out
  const applyPendingFilters = () => {
    setFilters((prev) => ({
      ...prev,
      name: pendingFilterInputs.name,
      username: pendingFilterInputs.username,
      email: pendingFilterInputs.email,
    }));
    resetToFirstPage();
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    setFilters((prev) => {
      if (prev.sortField === field) {
        // Toggle sort direction
        const newDirection = prev.sortDirection === "asc" ? "desc" : "asc";
        return { ...prev, sortDirection: newDirection };
      } else {
        // Set new field with ascending order
        return { ...prev, sortField: field, sortDirection: "asc" };
      }
    });
    resetToFirstPage();
  };

  // Clear all filters and reset pagination
  const clearAllFilters = () => {
    setFilters({
      name: "",
      username: "",
      email: "",
      role: "all",
      sortField: null,
      sortDirection: null,
    });
    setPendingFilterInputs({
      name: "",
      username: "",
      email: "",
    });
    resetToFirstPage();
  };

  // Handle user actions
  const handleUserAction = (action: string, userId: string) => {
    switch (action) {
      case "edit":
        router.push(`/admin/users/${userId}`);
        break;
      case "reset-password":
        console.log(`Reset password for user ${userId}`);
        // Here you would call API to reset password
        break;
      case "delete":
      case "restore":
        const user = users.find((u) => u.id === userId);
        if (user) {
          setDeleteDialog({
            isOpen: true,
            userId: userId,
            userName: user.name,
            isHidden: user.isHidden,
          });
        }
        break;
    }
  };

  // Handle confirmed delete/restore action
  const handleConfirmedAction = async () => {
    const { userId, isHidden } = deleteDialog;

    try {
      await toggleHide$(userId);

      // Update local state to reflect the change
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isHidden: !isHidden } : user
        )
      );
    } catch (err) {
      setError("Failed to update user status. Please try again.");
      console.error("Error toggling user visibility:", err);
    }

    setDeleteDialog({
      isOpen: false,
      userId: "",
      userName: "",
      isHidden: false,
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Allied Professional":
        return "default";
      case "Allied Assistant":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage allied health users</p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage allied health users</p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage allied health users</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Allied Professionals
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalProfessionals}
            </div>
            <p className="text-xs text-muted-foreground">
              Licensed professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Allied Assistants
            </CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAssistants}</div>
            <p className="text-xs text-muted-foreground">Support staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrators
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAdmins}</div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users Table</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {(filters.name ||
                filters.username ||
                filters.email ||
                filters.role !== "all" ||
                filters.sortField) && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={() => router.push("/admin/users/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <div className="flex items-center justify-between">
                    <span>Name</span>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Filter className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="p-2">
                            <Input
                              placeholder="Search names..."
                              value={pendingFilterInputs.name}
                              onChange={(e) =>
                                setPendingFilterInputs((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              onBlur={applyPendingFilters}
                              className="h-8"
                            />
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSort("name")}>
                            {filters.sortField === "name" &&
                            filters.sortDirection === "asc" ? (
                              <ArrowUp className="mr-2 h-4 w-4" />
                            ) : filters.sortField === "name" &&
                              filters.sortDirection === "desc" ? (
                              <ArrowDown className="mr-2 h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="mr-2 h-4 w-4" />
                            )}
                            Sort{" "}
                            {filters.sortField === "name" &&
                            filters.sortDirection === "asc"
                              ? "Z-A"
                              : "A-Z"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center justify-between">
                    <span>Username</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Filter className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                          <Input
                            placeholder="Search usernames..."
                            value={pendingFilterInputs.username}
                            onChange={(e) =>
                              setPendingFilterInputs((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            onBlur={applyPendingFilters}
                            className="h-8"
                          />
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleSort("username")}
                        >
                          {filters.sortField === "username" &&
                          filters.sortDirection === "asc" ? (
                            <ArrowUp className="mr-2 h-4 w-4" />
                          ) : filters.sortField === "username" &&
                            filters.sortDirection === "desc" ? (
                            <ArrowDown className="mr-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                          )}
                          Sort{" "}
                          {filters.sortField === "username" &&
                          filters.sortDirection === "asc"
                            ? "Z-A"
                            : "A-Z"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
                <TableHead className="w-[250px]">
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Filter className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                          <Input
                            placeholder="Search emails..."
                            value={pendingFilterInputs.email}
                            onChange={(e) =>
                              setPendingFilterInputs((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            onBlur={applyPendingFilters}
                            className="h-8"
                          />
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSort("email")}>
                          {filters.sortField === "email" &&
                          filters.sortDirection === "asc" ? (
                            <ArrowUp className="mr-2 h-4 w-4" />
                          ) : filters.sortField === "email" &&
                            filters.sortDirection === "desc" ? (
                            <ArrowDown className="mr-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                          )}
                          Sort{" "}
                          {filters.sortField === "email" &&
                          filters.sortDirection === "asc"
                            ? "Z-A"
                            : "A-Z"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">
                  <div className="flex items-center justify-between">
                    <span>Role</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Filter className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                          <Select
                            value={filters.role}
                            onValueChange={(value) => {
                              setFilters((prev) => ({ ...prev, role: value }));
                              resetToFirstPage();
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="All roles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All roles</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Allied Professional">
                                Allied Professional
                              </SelectItem>
                              <SelectItem value="Allied Assistant">
                                Allied Assistant
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSort("role")}>
                          {filters.sortField === "role" &&
                          filters.sortDirection === "asc" ? (
                            <ArrowUp className="mr-2 h-4 w-4" />
                          ) : filters.sortField === "role" &&
                            filters.sortDirection === "desc" ? (
                            <ArrowDown className="mr-2 h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                          )}
                          Sort{" "}
                          {filters.sortField === "role" &&
                          filters.sortDirection === "asc"
                            ? "Z-A"
                            : "A-Z"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className={user.isHidden ? "opacity-50 bg-muted/30" : ""}
                >
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUserAction("edit", user.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction("reset-password", user.id)
                          }
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction(
                              user.isHidden ? "restore" : "delete",
                              user.id
                            )
                          }
                          className={
                            user.isHidden
                              ? "text-green-600"
                              : "text-destructive"
                          }
                        >
                          {user.isHidden ? (
                            <>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore User
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination and User Count */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, totalFilteredUsers)} of {totalFilteredUsers}{" "}
              users
              {totalFilteredUsers !== users.length && (
                <span> (filtered from {users.length} total)</span>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => {
                      // Show first page, last page, current page, and pages around current page
                      const showPage =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1);

                      const showEllipsis =
                        (pageNumber === currentPage - 2 && currentPage > 3) ||
                        (pageNumber === currentPage + 2 &&
                          currentPage < totalPages - 2);

                      if (showEllipsis) {
                        return (
                          <PaginationItem key={`ellipsis-${pageNumber}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNumber);
                            }}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({
              isOpen: false,
              userId: "",
              userName: "",
              isHidden: false,
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.isHidden ? "Restore User" : "Delete User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isHidden
                ? `Are you sure you want to restore "${deleteDialog.userName}"? This will make the user active again and they will be able to access the system.`
                : `Are you sure you want to delete "${deleteDialog.userName}"? This will deactivate the user account and they will no longer be able to access the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={
                deleteDialog.isHidden
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {deleteDialog.isHidden ? "Restore User" : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
