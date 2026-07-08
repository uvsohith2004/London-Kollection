"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Package, MessageCircle, ArrowLeft } from "lucide-react";
import { HelpChatbot } from "./help-chatbot";
import { useTranslations } from "next-intl";

type ViewState = "menu" | "order-help" | "general-help";

export function HelpCenterClient() {
  const [view, setView] = useState<ViewState>("menu");
  const t = useTranslations("HelpCenter");

  return (
    <div className="flex h-full w-full flex-col md:flex-row md:items-start md:justify-center md:gap-8 md:p-12">
      {/* Mobile Wrapper with strict overflow hidden for native feel */}
      <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-background md:h-[750px] md:max-w-lg md:rounded-[2rem] md:border md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:md:shadow-none md:ring-1 md:ring-border/50">
        
        {/* Header (Shared, but updates based on view) */}
        <div className="absolute top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            {view !== "menu" && (
              <button
                onClick={() => setView("menu")}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted active:scale-95 transition-transform ltr:ml-0 rtl:mr-0 rtl:rotate-180"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-xl font-serif tracking-tight font-medium">
              {view === "menu" ? t('title') : view === "order-help" ? t('orderSupport') : t('generalHelp')}
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative h-full w-full pt-16">
          <AnimatePresence initial={false} mode="wait">
            {view === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="flex h-full flex-col gap-4 p-4"
              >
                <div className="mb-4">
                  <h2 className="text-3xl font-serif tracking-tight">{t('howCanWeHelp')}</h2>
                  <p className="text-muted-foreground mt-2">
                    {t('howCanWeHelpDesc')}
                  </p>
                </div>

                {/* Mobile-Native Style Cards */}
                <button
                  onClick={() => setView("order-help")}
                  className="group relative flex w-full items-center gap-4 rounded-2xl bg-secondary/50 p-5 text-left transition-all hover:bg-secondary active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex-1 ltr:ml-0 rtl:mr-0 text-left rtl:text-right">
                    <h3 className="font-semibold text-foreground">{t('helpWithAnOrder')}</h3>
                    <p className="text-sm text-muted-foreground">{t('helpWithAnOrderDesc')}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
                </button>

                <button
                  onClick={() => setView("general-help")}
                  className="group relative flex w-full items-center gap-4 rounded-2xl bg-secondary/50 p-5 text-left transition-all hover:bg-secondary active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 ltr:ml-0 rtl:mr-0 text-left rtl:text-right">
                    <h3 className="font-semibold text-foreground">{t('generalQuery')}</h3>
                    <p className="text-sm text-muted-foreground">{t('generalQueryDesc')}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
                </button>
              </motion.div>
            )}

            {view === "order-help" && (
              <motion.div
                key="order-help"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="h-full w-full"
              >
                <HelpChatbot mode="order" onComplete={() => setView("menu")} />
              </motion.div>
            )}

            {view === "general-help" && (
              <motion.div
                key="general-help"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="h-full w-full"
              >
                <HelpChatbot mode="general" onComplete={() => setView("menu")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
