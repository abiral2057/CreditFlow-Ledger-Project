import { redirect } from 'next/navigation';

export default function RootPage() {
  // The root page now just redirects to the protected dashboard.
  // The middleware will handle authentication checks.
  redirect('/dashboard');
}
