import { Menu, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { useTranslation, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onSidebarToggle: () => void;
  title: string;
  subtitle?: string;
}

export function Topbar({ onSidebarToggle, title, subtitle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { t, currentLanguage, changeLanguage } = useTranslation();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="md:hidden"
            data-testid="sidebar-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground" data-testid="page-title">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground" data-testid="page-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLanguageChange('en')}
              className={cn(
                "px-3 py-1 text-sm rounded-md font-medium",
                currentLanguage === 'en' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="lang-en"
            >
              EN
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLanguageChange('vi')}
              className={cn(
                "px-3 py-1 text-sm rounded-md font-medium",
                currentLanguage === 'vi' 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="lang-vi"
            >
              VI
            </Button>
          </div>
          
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent"
            data-testid="theme-toggle"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-accent"
              data-testid="button-notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
