import { useFormContext, useWatch } from "react-hook-form"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { ProjectFormValues } from "./types"

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

export const FormTime = () => {
    const { register, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const [estimated, actual] = useWatch({ control, name: ["estimatedHours", "actualHours"] }).map(finite);
    const timeBurnPct = estimated > 0 ? Math.min(100, (actual / estimated) * 100) : 0;

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field data-invalid={!!errors.estimatedHours}>
                        <FieldLabel htmlFor="project-estimated-hours">ESTIMATED HOURS</FieldLabel>
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
                    <Field data-invalid={!!errors.actualHours}>
                        <FieldLabel htmlFor="project-actual-hours">ACTUAL HOURS</FieldLabel>
                        <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                            <Input
                                id="project-actual-hours"
                                type="number"
                                min={0}
                                step="any"
                                {...register("actualHours", { valueAsNumber: true })}
                                aria-invalid={!!errors.actualHours}
                                className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                            />
                            <span className="text-muted-foreground text-sm">h</span>
                        </div>
                        <FieldError errors={[errors.actualHours]} />
                    </Field>
                </div>
                <Field>
                    <FieldLabel>Time burn</FieldLabel>
                    <div className="flex items-center gap-3">
                        <Progress value={timeBurnPct} className="flex-1 h-2" />
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {actual}h / {estimated}h ({Math.round(timeBurnPct)}%)
                        </span>
                    </div>
                </Field>
            </FieldGroup>
        </div>
    )
}
