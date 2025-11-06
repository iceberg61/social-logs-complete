import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { AuthProvider } from './contexts/AuthContext'; // ✅ Add this

export const metadata = {
  title: "Social Market",
  description: "Buy verified social media accounts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden mt-16">
        <AuthProvider> {/* ✅ Wrap everything */}
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}