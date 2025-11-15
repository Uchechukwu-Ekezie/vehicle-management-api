import { Sidebar } from "@/components/navigation/sidebar";

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Sidebar role="Mechanic" />
      <div className="lg:ml-64 p-8">{children}</div>
    </div>
  );
}
