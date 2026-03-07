import { useState } from "react";
import { useRouter } from "next/navigation";

export function useActionWithRefresh() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const run = async <T>(fn: () => Promise<T>): Promise<T> => {
        setIsSubmitting(true);
        try {
            const result = await fn();
            router.refresh();
            return result;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(String(error));
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return { run, isSubmitting }
}