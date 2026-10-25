import { z } from "zod";
import { CURRENCY_CODES, LANGUAGE_VALUES, TIMEZONE_VALUES } from "@/lib/constants/profile";
import { amount, formCheckbox, optionalText, optionalUrl, requiredText } from "./common";

const optionalChoice = (values: readonly string[], message: string) =>
    z.string().refine((value) => value === "" || values.includes(value), message);

export const timezoneSchema = optionalChoice(TIMEZONE_VALUES, "Choose a timezone from the list");

export const profileSchema = z.object({
    full_name: requiredText("Full name", 100),
    username: z
        .string()
        .trim()
        .max(60, "Username must be 60 characters or fewer")
        .regex(/^\S*$/, "Username can't contain spaces"),
    company_name: optionalText("Company name", 120),
    bio: optionalText("Bio", 500),
    address: optionalText("Address", 300),
    avatar_url: optionalUrl("Avatar URL"),
    hourly_rate: amount("Hourly rate").max(100_000, "Hourly rate looks too high"),
    currency: z.enum(CURRENCY_CODES, { error: "Choose a currency" }),
    tax_id: optionalText("Tax ID", 40),
    timezone: timezoneSchema,
    language: optionalChoice(LANGUAGE_VALUES, "Choose a language from the list"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const notificationPreferencesSchema = z.object({
    email_notifications: formCheckbox,
    invoice_reminders: formCheckbox,
});

export const onboardingSchema = z.object({
    company_name: optionalText("Company name", 120),
    timezone: timezoneSchema,
    currency: z.enum(CURRENCY_CODES, { error: "Choose a currency" }),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
