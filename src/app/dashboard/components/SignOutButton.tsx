"use client";

import { redirect } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const SingOutButton = () => {
  return (
    <Button
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              redirect("/authentication");
            },
            onError: () => {
              toast.error("erro ao tentar sair da conta!");
            },
          },
        })
      }
      className="w-40 cursor-pointer"
      variant={"destructive"}
    >
      Sair
    </Button>
  );
};

export default SingOutButton;
