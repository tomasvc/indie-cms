import { z } from "zod";
import { id, optionalDate, optionalText, optionalUrl, requiredText } from "./common";

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

/** Editing a client also covers the contact details shown on their page and invoices. */
export const clientUpdateSchema = clientFormSchema.extend({
    id: id("Client"),
    phone: optionalText("Phone", 40),
    website: optionalUrl("Website"),
    address: optionalText("Address", 500),
    country: optionalText("Country", 80),
    vat_number: optionalText("VAT number", 40),
    last_contact: optionalDate("Last contact"),
});
