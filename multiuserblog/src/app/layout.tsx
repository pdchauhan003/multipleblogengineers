import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import NavbarWrapp from "@/components/NavbarWrapp";
import Provider from "@/components/provider/reactProvider";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // const {user}=useAuth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Provider>
            <NavbarWrapp/>
            {children}
          </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
