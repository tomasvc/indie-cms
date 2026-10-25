import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const requiredText = (label: string, max = 200) =>
    z
        .string({ error: `${label} is required` })
        .trim()
        .min(1, { error: `${label} is required`, abort: true })
        .max(max, `${label} must be ${max} characters or fewer`);

export const optionalText = (label: string, max = 2000) =>
    z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

export const requiredDate = (label: string) =>
    z
        .string({ error: `${label} is required` })
        .min(1, { error: `${label} is required`, abort: true })
        .regex(ISO_DATE, `${label} must be a valid date`);

export const optionalDate = (label: string) =>
    z.string().refine((value) => value === "" || ISO_DATE.test(value), `${label} must be a valid date`);

export const id = (label = "Record") => z.guid({ error: `${label} is invalid` });

export const requiredId = (label: string) =>
    z.string({ error: `Select a ${label}` }).min(1, `Select a ${label}`).pipe(id(label));

export const optionalId = (label: string) =>
    z.string().refine((value) => value === "" || z.guid().safeParse(value).success, `${label} is invalid`);

export const optionalUrl = (label: string) =>
    z
        .string()
        .trim()
        .refine((value) => value === "" || z.url().safeParse(value).success, `${label} must be a valid URL`);

export const amount = (label: string) =>
    z.number({ error: `${label} must be a number` }).min(0, `${label} can't be negative`);

/** Coerces a FormData string into a number. An empty field becomes `emptyAs`, or is treated as missing. */
export const formNumber = <T extends z.ZodType<number>>(schema: T, emptyAs?: number) =>
    z.preprocess((value) => (value === "" || value == null ? emptyAs : Number(value)), schema);

/** Native and Radix checkboxes submit "on" when checked and nothing when unchecked. */
export const formCheckbox = z
    .enum(["on", "true", "false"])
    .optional()
    .transform((value) => value === "on" || value === "true");

export const toNullable = (value: string) => (value === "" ? null : value);

export const isOnOrAfter = (later: string, earlier: string) => !later || !earlier || later >= earlier;
