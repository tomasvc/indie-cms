import { z } from "zod";
import { id, optionalText, requiredText } from "./common";

export const CLIENT_STATUSES = ["lead", "active", "archived"] as const;

export const clientFormSchema = z.object({
    name: requiredText("Name", 120),
    company: optionalText("Company", 120),
    email: z
        .string()
        .trim()
        .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address"),
    status: z.enum(CLIENT_STATUSES, { error: "Choose a status" }),
});

export const clientUpdateSchema = clientFormSchema.extend({ id: id("Client") });
