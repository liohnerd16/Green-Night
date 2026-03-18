import { 
  MessageCircle, 
  Instagram, 
  Twitter, 
  Facebook,
  Linkedin,
  Github,
  Mail,
  ExternalLink
} from "lucide-react";
import { useT } from "../i18n/LanguageContext";
import { translations } from "../i18n/translations";

export function SocialLinks() {
  const t = useT();

  const socialLinks = [
    {
      name: "Discord",
      icon: <MessageCircle className="h-5 w-5" />,
      url: "https://discord.gg/yourserver",
      color: "hover:text-[#5865F2]",
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      url: "https://instagram.com/yourusername",
      color: "hover:text-[#E4405F]",
    },
    {
      name: "X (Twitter)",
      icon: <Twitter className="h-5 w-5" />,
      url: "https://x.com/yourusername",
      color: "hover:text-[#1DA1F2]",
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: "https://facebook.com/yourpage",
      color: "hover:text-[#1877F2]",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      url: "https://linkedin.com/in/yourprofile",
      color: "hover:text-[#0A66C2]",
    },
    {
      name: "GitHub",
      icon: <Github className="h-5 w-5" />,
      url: "https://github.com/yourusername",
      color: "hover:text-gray-900 dark:hover:text-white",
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      url: "mailto:your.email@example.com",
      color: "hover:text-red-600",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
        {t(translations.social.title)}
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all ${link.color} hover:scale-105`}
            title={link.name}
          >
            {link.icon}
            <span className="text-sm font-medium">{link.name}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
        {t(translations.social.subtitle)}
      </p>
    </div>
  );
}