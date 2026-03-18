import { Link } from "react-router";
import { ArrowLeft, Globe2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Changelog } from "../components/Changelog";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageToggle } from "../components/LanguageToggle";
import { SocialLinks } from "../components/SocialLinks";
import { PageTransition } from "../components/PageTransition";
import { useT } from "../i18n/LanguageContext";
import { translations as tr } from "../i18n/translations";

export function ChangelogPage() {
  const t = useT();

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t(tr.changelog.backToHome)}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/websites">
                <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
                  <Globe2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t(tr.changelog.backToWebsites)}</span>
                </Button>
              </Link>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
          <Changelog />
        </main>

        <footer className="mt-auto py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <SocialLinks />
            <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t(tr.common.copyright)}</p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}