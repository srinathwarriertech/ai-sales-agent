import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/my-courses(.*)',
  '/api/chat(.*)',
  '/api/enrollments(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Only run middleware on protected routes
    '/my-courses(.*)',
    '/api/chat(.*)',
    '/api/enrollments(.*)',
  ],
};

