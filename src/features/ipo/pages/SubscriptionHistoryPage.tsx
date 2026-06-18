import { Header } from "@/components/common/Header";
import { SubscriptionHistory } from "../components/SubscriptionHistory";

export function SubscriptionHistoryPage() {
  return (
    <div className="flex flex-col h-dvh bg-[#F6F6F9]">
      <Header
        showBack
        title="청약 내역"
        showNotification={false}
        showMypage={false}
      />
      <SubscriptionHistory />
    </div>
  );
}
