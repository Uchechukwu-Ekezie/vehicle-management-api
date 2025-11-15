import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/navigation/sidebar";
import { getUserFromToken } from "@/lib/auth";

export default async function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = getUserFromToken(token);

  if (!user || user.role !== "Mechanic") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Sidebar role="Mechanic" username={user.username as string} />
      <div className="lg:ml-64 p-8">{children}</div>
    </div>
  );
}
