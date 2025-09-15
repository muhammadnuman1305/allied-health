interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  role: string;
  isAdmin: boolean;
}

export function getUser(): UserData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Validate required fields
    if (!user.accessToken || typeof user.isAdmin !== 'boolean') {
      return null;
    }
    
    return user;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.isAdmin === true;
}

export function isUser(): boolean {
  const user = getUser();
  return user?.isAdmin === false;
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

export function redirectBasedOnRole(): string {
  const user = getUser();
  if (!user) return '/login';
  
  return user.isAdmin ? '/admin/dashboard' : '/dashboard';
}
