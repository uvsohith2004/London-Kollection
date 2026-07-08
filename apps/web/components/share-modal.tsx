import { motion, AnimatePresence } from "framer-motion";
import { Copy, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect} from "react";

// Platform icons
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m22 2-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const sharePlatforms = [
  { name: "Copy Link", icon: <Copy size={18} />, color: "bg-zinc-800" },
  { name: "WhatsApp", icon: <MessageCircle size={18} />, color: "bg-green-600" },
  { name: "Facebook", icon: <FacebookIcon />, color: "bg-blue-600" },
  { name: "Twitter", icon: <TwitterIcon />, color: "bg-blue-400" },
  { name: "Telegram", icon: <TelegramIcon />, color: "bg-blue-500" },
  { name: "Instagram", icon: <InstagramIcon />, color: "bg-pink-600" },
];

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  url: string;
}

export function ShareModal({ isOpen, onClose, productName, url }: ShareModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleShare = (platform: string) => {
    switch (platform) {
      case "Copy Link":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        break;
      case "WhatsApp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this product from Tesserart: ${productName} - ${url}`)}`);
        break;
      case "Twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this product from Tesserart: ${productName}`)}&url=${encodeURIComponent(url)}`);
        break;
      case "Telegram":
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out this product from Tesserart: ${productName}`)}`);
        break;
      case "Instagram":
        toast.info("Save the image and share it on Instagram with the copied link");
        navigator.clipboard.writeText(url);
        break;
      case "Facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 cursor-pointer"
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ y: "100%", scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border/50 shadow-2xl rounded-t-3xl sm:rounded-2xl w-full max-w-md pointer-events-auto p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-serif tracking-tight">Share</h2>
                  <p className="text-sm text-muted-foreground">Share this piece with others</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 py-4">
                {sharePlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    className="flex flex-col items-center gap-3 group"
                    onClick={() => handleShare(platform.name)}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:-translate-y-1 group-hover:shadow-xl",
                        platform.color
                      )}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-xs font-medium tracking-wide">{platform.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
