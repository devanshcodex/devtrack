import './globals.css';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'DevTrack – Developer Issue Tracker',
  description: 'Track projects, issues and bugs like a pro.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
