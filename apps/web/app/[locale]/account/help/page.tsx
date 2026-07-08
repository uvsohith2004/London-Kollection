import { HelpCenterClient } from "@/components/help/help-center-client";

export default function HelpPage() {
  return (
    <main className="h-[calc(100dvh-4rem)] md:h-screen md:min-h-0 bg-background flex flex-col">
      <HelpCenterClient />
    </main>
  );
}
