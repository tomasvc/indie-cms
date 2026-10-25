import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ActionState } from "./action-state";

/** Pushes errors returned by a server action into react-hook-form. Returns the first errored field. */
export function applyServerErrors<T extends FieldValues>(
    setError: UseFormSetError<T>,
    state: ActionState
): Path<T> | undefined {
    const entries = Object.entries(state.fieldErrors ?? {});
    for (const [name, messages] of entries) {
        setError(name as Path<T>, { type: "server", message: messages[0] });
    }
    if (state.error) {
        setError("root.server", { type: "server", message: state.error });
    }
    return entries[0]?.[0] as Path<T> | undefined;
}
