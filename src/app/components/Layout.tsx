import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { LanguageProvider } from "../i18n/LanguageContext";

export function Layout() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
        <Toaster position="top-right" richColors />
        <Outlet />
      </div>
    </LanguageProvider>
  );
}