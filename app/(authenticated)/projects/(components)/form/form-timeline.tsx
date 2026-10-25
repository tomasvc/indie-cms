import { useFormContext, useWatch } from "react-hook-form"
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/helpers/format"
import { differenceInDays, isValid, parseISO, startOfDay } from "date-fns"
import type { ProjectFormValues } from "./types"

const toDate = (value: string) => {
    const date = value ? parseISO(value) : null;
    return date && isValid(date) ? date : null;
};

export const FormTimeline = () => {
    const { register, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const [startDate, dueDate] = useWatch({ control, name: ["startDate", "dueDate"] });
    const startDt = toDate(startDate);
    const dueDt = toDate(dueDate);
    const today = startOfDay(new Date());
    const daysRemaining = dueDt ? Math.max(0, differenceInDays(dueDt, today)) : 0;
    const span = startDt && dueDt ? differenceInDays(dueDt, startDt) : 0;
    const todayPct = startDt && span > 0
        ? Math.min(100, Math.max(0, (differenceInDays(today, startDt) / span) * 100))
        : 0;

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field data-invalid={!!errors.startDate}>
                        <FieldLabel htmlFor="project-start-date">START DATE</FieldLabel>
                        <Input
                            id="project-start-date"
                            type="date"
                            {...register("startDate", { deps: ["dueDate", "completedDate"] })}
                            aria-invalid={!!errors.startDate}
                        />
                        <FieldError errors={[errors.startDate]} />
                    </Field>
                    <Field data-invalid={!!errors.dueDate}>
                        <FieldLabel htmlFor="project-due-date">DUE DATE</FieldLabel>
                        <Input
                            id="project-due-date"
                            type="date"
                            {...register("dueDate")}
                            aria-invalid={!!errors.dueDate}
                        />
                        <FieldError errors={[errors.dueDate]} />
                    </Field>
                </div>
                <Field data-invalid={!!errors.completedDate}>
                    <FieldLabel htmlFor="project-completed-date">COMPLETED DATE</FieldLabel>
                    <FieldDescription>Leave blank if the project is still in progress.</FieldDescription>
                    <Input
                        id="project-completed-date"
                        type="date"
                        {...register("completedDate")}
                        aria-invalid={!!errors.completedDate}
                    />
                    <FieldError errors={[errors.completedDate]} />
                </Field>
                <Field>
                    <FieldLabel>TIMELINE PREVIEW</FieldLabel>
                    <div className="rounded-md border border-border p-4">
                        {startDt && dueDt && (
                            <>
                                <div className="relative h-8 flex items-center">
                                    <div className="flex-1 h-1.5 rounded-full bg-muted" />
                                    <span className="absolute left-0 text-[10px] text-muted-foreground" style={{ left: 0 }}>
                                        {formatDate(startDate, "MMM d")}
                                    </span>
                                    <span className="absolute right-0 text-[10px] text-muted-foreground" style={{ right: 0 }}>
                                        {formatDate(dueDate, "MMM d")}
                                    </span>
                                    <span
                                        className="absolute size-2.5 rounded-full bg-primary border-2 border-background"
                                        style={{ left: `${todayPct}%`, transform: "translateX(-50%)" }}
                                        title="TODAY"
                                    />
                                </div>
                                <p className="text-muted-foreground text-xs mt-2">{daysRemaining} days remaining</p>
                            </>
                        )}
                    </div>
                </Field>
            </FieldGroup>
        </div>
    )
}
