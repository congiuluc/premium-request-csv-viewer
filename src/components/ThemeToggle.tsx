import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-colors duration-300
                 bg-slate-200 dark:bg-indigo-950 border border-slate-300 dark:border-indigo-800
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-0.5 flex items-center justify-center w-6 h-6 rounded-full
                    transition-all duration-300 shadow-sm
                    ${theme === 'dark'
                      ? 'translate-x-7 bg-indigo-500'
                      : 'translate-x-0.5 bg-white'
                    }`}
      >
        {theme === 'dark'
          ? <Moon className="w-3.5 h-3.5 text-white" />
          : <Sun className="w-3.5 h-3.5 text-amber-500" />
        }
      </span>
    </button>
  );
}
