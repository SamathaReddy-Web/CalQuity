import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import AppHeader from "@/components/AppHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen overflow-hidden transition-colors duration-300">
        <ThemeProvider>
          {/* Aligned Header */}
          <AppHeader />

          {/* Main App */}
          <main className="h-[calc(100vh-3.5rem)] overflow-hidden">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
