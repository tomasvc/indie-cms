import { z } from "zod";
import { requiredText } from "./common";

const email = z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address"));

export const newPasswordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer");

const passwordsMatch = {
    check: (v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword,
    params: { error: "Passwords do not match", path: ["confirmPassword"] },
};

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
    .object({
        fullName: requiredText("Full name", 100),
        email,
        password: newPasswordSchema,
        confirmPassword: z.string(),
    })
    .refine(passwordsMatch.check, passwordsMatch.params);

export const forgotPasswordSchema = z.object({ email });

export const updatePasswordSchema = z.object({ password: newPasswordSchema });

export const changePasswordSchema = z
    .object({ password: newPasswordSchema, confirmPassword: z.string() })
    .refine(passwordsMatch.check, passwordsMatch.params);
