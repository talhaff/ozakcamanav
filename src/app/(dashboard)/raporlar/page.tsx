import ReportView from "@/components/ReportView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Öz Akça Manav | Finansal Raporlar",
  description: "İstediğiniz tarih aralığı için detaylı gelir, gider ve kâr analizi.",
};

export default function RaporlarPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <ReportView />
    </div>
  );
}
