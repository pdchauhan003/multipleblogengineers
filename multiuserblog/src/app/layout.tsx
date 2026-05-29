import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import NavbarWrapp from "@/components/NavbarWrapp";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // const {user}=useAuth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <NavbarWrapp/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
