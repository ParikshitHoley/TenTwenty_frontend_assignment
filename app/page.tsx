import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to login by default
  // The middleware or layout will handle authentication
  redirect('/login');
}
