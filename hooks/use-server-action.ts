import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

/**
 * Runs a server action as a React Query mutation, so cached queries are refreshed once it settles.
 * Errors (including Next's redirect signal) are rethrown unchanged.
 */
export function useServerAction<Args extends unknown[], Result>(action: (...args: Args) => Promise<Result>) {
    const { mutateAsync, isPending } = useMutation({ mutationFn: (args: Args) => action(...args) });
    const run = useCallback((...args: Args) => mutateAsync(args), [mutateAsync]);
    return [run, isPending] as const;
}
