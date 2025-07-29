import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import SingOutButton from "./components/SignOutButton";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
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
