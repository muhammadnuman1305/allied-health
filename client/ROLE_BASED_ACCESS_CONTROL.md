# Role-Based Access Control Implementation

This document outlines the comprehensive role-based access control (RBAC) system implemented to maintain proper separation between admin and user access in the Next.js application.

## Overview

The implementation provides multiple layers of protection:

1. **Layout-level guards** - Primary protection at the layout level
2. **Utility functions** - Centralized authentication and role checking
3. **Custom hooks** - React hooks for auth management
4. **Component guards** - Additional protection for specific components
5. **Improved login flows** - Consistent authentication handling

## Files Created/Modified

### New Files

- `lib/auth-utils.ts` - Core authentication utilities
- `hooks/use-auth.ts` - Custom React hook for authentication
- `components/auth/role-guard.tsx` - Component-level role guard
- `ROLE_BASED_ACCESS_CONTROL.md` - This documentation

### Modified Files

- `app/(user)/layout.tsx` - Added user authentication guards
- `app/admin/layout.tsx` - Added admin authentication guards
- `app/(auth)/login/page.tsx` - Improved authentication flow
- `app/admin-login/page.tsx` - Improved authentication flow

## Core Features

### 1. Authentication Utilities (`lib/auth-utils.ts`)

Provides centralized functions for:

- `getUser()` - Safely retrieve user data from localStorage
- `isAuthenticated()` - Check if user is authenticated
- `isAdmin()` - Check if user has admin role
- `isUser()` - Check if user has regular user role
- `clearAuth()` - Clear authentication data
- `redirectBasedOnRole()` - Get appropriate redirect path based on role

### 2. Layout-Level Protection

**User Layout (`app/(user)/layout.tsx`)**:

- Checks authentication on mount
- Redirects unauthenticated users to `/login`
- Redirects admin users to `/admin/dashboard`
- Shows loading spinner during authentication check

**Admin Layout (`app/admin/layout.tsx`)**:

- Checks authentication on mount
- Redirects unauthenticated users to `/admin-login`
- Redirects non-admin users to `/dashboard`
- Shows loading spinner during authentication check

### 3. Custom Authentication Hook (`hooks/use-auth.ts`)

Provides:

- Current user data
- Loading state
- Authentication status
- Role checking functions
- Logout functionality
- `requireAuth()` method for programmatic access control

### 4. Component-Level Role Guard (`components/auth/role-guard.tsx`)

Higher-order component that can wrap any component to:

- Require specific roles (`admin` or `user`)
- Redirect unauthorized users
- Show loading state during checks
- Provide custom fallback paths

## Usage Examples

### Using the Custom Hook

```tsx
import { useAuth } from "@/hooks/use-auth";

export default function SomePage() {
  const { user, isAdmin, isLoading, logout, requireAuth } = useAuth();

  useEffect(() => {
    // Require admin access for this page
    if (!requireAuth("admin")) return;
  }, [requireAuth]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>
      {isAdmin && <AdminOnlyComponent />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using the Role Guard Component

```tsx
import { RoleGuard } from "@/components/auth/role-guard";

export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboard />
    </RoleGuard>
  );
}
```

### Using Utility Functions

```tsx
import { isAdmin, isAuthenticated, clearAuth } from "@/lib/auth-utils";

// Check authentication status
if (!isAuthenticated()) {
  // Handle unauthenticated state
}

// Check admin role
if (isAdmin()) {
  // Show admin features
}

// Clear authentication
const handleLogout = () => {
  clearAuth();
  router.push("/login");
};
```

## Security Features

### 1. Multiple Protection Layers

- **Layout-level**: Primary protection at route group level
- **Component-level**: Additional protection for sensitive components
- **Utility-level**: Consistent role checking across the app

### 2. Automatic Redirects

- Unauthenticated users → appropriate login page
- Wrong role users → appropriate dashboard
- Already authenticated users → skip login pages

### 3. Safe localStorage Handling

- Graceful error handling for corrupted data
- Server-side rendering compatibility
- Validation of required fields

### 4. Loading States

- Prevents flash of unauthorized content
- Smooth user experience during auth checks
- Consistent loading indicators

## Route Protection Summary

### Admin Routes (`/admin/*`)

- **Protected by**: Admin layout guard
- **Requires**: Authentication + admin role
- **Redirects**:
  - Unauthenticated → `/admin-login`
  - Non-admin → `/dashboard`

### User Routes (`/dashboard`, `/patients`, etc.)

- **Protected by**: User layout guard
- **Requires**: Authentication + user role
- **Redirects**:
  - Unauthenticated → `/login`
  - Admin → `/admin/dashboard`

### Public Routes (`/login`, `/admin-login`)

- **Protected by**: Login page guards
- **Behavior**: Skip if already authenticated
- **Redirects**: Authenticated users → appropriate dashboard

## Best Practices Implemented

1. **Separation of Concerns**: Auth logic separated into utilities
2. **DRY Principle**: Reusable functions and components
3. **Consistent UX**: Uniform loading states and redirects
4. **Error Handling**: Graceful handling of corrupted data
5. **Type Safety**: TypeScript interfaces for user data
6. **Performance**: Efficient checks without unnecessary re-renders

## Migration Notes

The existing authentication flow remains unchanged:

- Login still stores user data in localStorage
- User data structure is preserved
- Existing components continue to work

The new system adds protection layers without breaking existing functionality.

## Testing Recommendations

1. **Authentication Flow**:

   - Test login/logout cycles
   - Verify token persistence
   - Check role-based redirects

2. **Route Protection**:

   - Access admin routes as user
   - Access user routes as admin
   - Test unauthenticated access

3. **Edge Cases**:

   - Corrupted localStorage data
   - Missing authentication fields
   - Network failures during auth checks

4. **User Experience**:
   - Loading states display correctly
   - Smooth redirects without flashing
   - Consistent behavior across pages
