"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, { message: "Nome obrigatório" }),
    email: z.email({ message: "E-mail inválido" }),
    password: z
      .string()
      .trim()
      .min(8, { message: "Senha Inválida!" })
      .refine((val) => /[a-z]/.test(val), {
        message: "Senha Inválida!",
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: "Senha Inválida!",
      })
      .refine((val) => /\d/.test(val), {
        message: "Senha Inválida!",
      })
      .refine((val) => /[\W_]/.test(val), {
        message: "Senha Inválida!",
      }),
    confirmPassword: z.string().min(8, { message: "Confirme sua senha" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const SignUpForm = () => {
  const [passwordValue, setPasswordValue] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
          toast.success("Conta criada com sucesso!");
        },
        onError: () => {
          toast.error("Error ao tentar criar sua conta!");
        },
      },
    );
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>Crie uma conta para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>email</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu e-mail " {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Digite sua senha "
                        {...field}
                        value={passwordValue}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordValue(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <ul className="mt-2 space-y-1 text-xs">
                    <li
                      className={
                        passwordValue === ""
                          ? "text-black"
                          : /[a-z]/.test(passwordValue)
                            ? "text-green-600"
                            : "text-red-600"
                      }
                    >
                      • Pelo menos uma letra minúscula
                    </li>
                    <li
                      className={
                        passwordValue === ""
                          ? "text-black"
                          : /[A-Z]/.test(passwordValue)
                            ? "text-green-600"
                            : "text-red-600"
                      }
                    >
                      • Pelo menos uma letra maiúscula
                    </li>
                    <li
                      className={
                        passwordValue === ""
                          ? "text-black"
                          : /\d/.test(passwordValue)
                            ? "text-green-600"
                            : "text-red-600"
                      }
                    >
                      • Pelo menos um número
                    </li>
                    <li
                      className={
                        passwordValue === ""
                          ? "text-black"
                          : /[\W_]/.test(passwordValue)
                            ? "text-green-600"
                            : "text-red-600"
                      }
                    >
                      • Pelo menos um caractere especial (ex: #, $, &, ...)
                    </li>
                    <li
                      className={
                        passwordValue === ""
                          ? "text-black"
                          : passwordValue.length >= 8
                            ? "text-green-600"
                            : "text-red-600"
                      }
                    >
                      • Pelo menos 8 caracteres
                    </li>
                  </ul>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comfirme sua senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua senha novamente "
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="w-full cursor-pointer"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Criar conta"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;
