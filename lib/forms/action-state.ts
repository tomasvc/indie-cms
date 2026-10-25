import type { z } from "zod";

export type FieldErrors = Record<string, string[]>;

export type ActionState = {
    ok?: boolean;
    error?: string;
    fieldErrors?: FieldErrors;
};

export const PG_ERROR = {
    FOREIGN_KEY_VIOLATION: "23503",
    UNIQUE_VIOLATION: "23505",
    CHECK_VIOLATION: "23514",
} as const;

export function toFieldErrors(error: z.ZodError): FieldErrors {
    const fieldErrors: FieldErrors = {};
    for (const issue of error.issues) {
        const key = issue.path.join(".");
        if (!key) continue;
        (fieldErrors[key] ??= []).push(issue.message);
    }
    return fieldErrors;
}

export function validationError(error: z.ZodError): ActionState {
    const rootIssue = error.issues.find((issue) => issue.path.length === 0);
    return {
        error: rootIssue?.message ?? "Please fix the highlighted fields.",
        fieldErrors: toFieldErrors(error),
    };
}

export function databaseError(
    error: { code?: string; message?: string },
    fallback = "Something went wrong. Please try again."
): ActionState {
    console.error(error);
    if (error.code === PG_ERROR.CHECK_VIOLATION) {
        return { error: "One of the values isn't allowed. Please check the form and try again." };
    }
    if (error.code === PG_ERROR.UNIQUE_VIOLATION) {
        return { error: "A record with these details already exists." };
    }
    return { error: fallback };
}

/** Shapes server field errors for the `errors` prop of `FieldError`. */
export function errorsFor(fieldErrors: FieldErrors | undefined, name: string) {
    return fieldErrors?.[name]?.map((message) => ({ message }));
}
