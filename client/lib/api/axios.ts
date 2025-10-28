"use client"; // since we'll touch localStorage and navigation

import axios from "axios";
// If you're on app router, we'll use window.location instead.

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// 🔹 Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token dynamically for each request
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
          }
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any auth tokens
      localStorage.clear();

      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login"; // safest in App Router
        // OR for Pages Router:
        // Router.push("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
