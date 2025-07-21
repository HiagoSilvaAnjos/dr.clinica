import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import SingOutButton from "./components/SignOutButton";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // Preciso pegar as clinicas do usuário
  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });

  if (clinics.length === 0) {
    redirect("/clinic-form");
  }

  return (
    <div>
      <h1>DashboardPage</h1>
      <h2>{session?.user.name}</h2>
      <h2>{session?.user.email}</h2>
      {session.user.image && (
        <Image
          src={session.user.image}
          width={60}
          height={60}
          className="rounded-full"
          alt="test"
        />
      )}
      <SingOutButton />
    </div>
  );
};

export default DashboardPage;
