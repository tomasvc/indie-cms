import { useFormContext, useWatch } from "react-hook-form"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Typography } from "@/components/ui/typography"
import type { ProjectFormValues } from "./types"

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

export const FormTime = ({ loggedHours = 0 }: { loggedHours?: number }) => {
    const { register, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const estimated = finite(useWatch({ control, name: "estimatedHours" }));
    const logged = finite(loggedHours);
    const timeBurnPct = estimated > 0 ? Math.min(100, (logged / estimated) * 100) : 0;

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field data-invalid={!!errors.estimatedHours}>
                        <FieldLabel htmlFor="project-estimated-hours">Estimated hours</FieldLabel>
                        <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                            <Input
                                id="project-estimated-hours"
                                type="number"
                                min={0}
                                step="any"
                                {...register("estimatedHours", { valueAsNumber: true })}
                                aria-invalid={!!errors.estimatedHours}
                                className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                            />
                            <span className="text-muted-foreground text-sm">h</span>
                        </div>
                        <FieldError errors={[errors.estimatedHours]} />
                    </Field>
                    <Field>
                        <FieldLabel>Logged hours</FieldLabel>
                        <Typography variant="body" as="p" className="py-[7px]">{logged}h</Typography>
                        <Typography variant="bodySmall" color="muted" as="p">
                            Counted from time entries. Saving this form does not change them.
                        </Typography>
                    </Field>
                </div>
                <Field>
                    <FieldLabel>Time burn</FieldLabel>
                    <div className="flex items-center gap-3">
                        <Progress value={timeBurnPct} className="flex-1 h-2" />
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {logged}h / {estimated}h ({Math.round(timeBurnPct)}%)
                        </span>
                    </div>
                </Field>
            </FieldGroup>
        </div>
    )
}
