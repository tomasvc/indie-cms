import { startTransition, useActionState } from "react";
import { errorsFor, type ActionState } from "@/lib/forms/action-state";

type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Runs a server action from a native form via `onSubmit` rather than the `action` prop,
 * so React doesn't reset the inputs when the server returns validation errors.
 */
export function useFormAction(action: FormAction, options: { onSuccess?: () => void } = {}) {
    const [state, dispatch, isPending] = useActionState<ActionState, FormData>(
        async (prev, formData) => {
            const result = await action(prev, formData);
            if (result.ok) options.onSuccess?.();
            return result;
        },
        {}
    );

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => dispatch(formData));
    }

    return {
        state,
        isPending,
        onSubmit,
        errors: (name: string) => errorsFor(state.fieldErrors, name),
    };
}
