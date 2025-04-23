import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn(
      "py-3 px-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800",
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
      className
    )}>
      <div className="flex items-center justify-center space-x-1">
        <span>Made with</span>
        <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
        <span>| Designed and Handcrafted by Kishan</span>
      </div>
    </footer>
  );
};

export default Footer;