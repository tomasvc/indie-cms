import { Controller, useFormContext, useWatch } from "react-hook-form"
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "./constants"
import type { ProjectFormValues } from "./types"

export const FormStatusProgress = () => {
    const { register, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const progress = useWatch({ control, name: "progress" });

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <Controller
                    control={control}
                    name="status"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>STATUS</FieldLabel>
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Status">
                                {STATUS_OPTIONS.map((opt) => (
                                    <Button
                                        key={opt.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={field.value === opt.value}
                                        variant={field.value === opt.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => field.onChange(opt.value)}
                                    >
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="priority"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>PRIORITY</FieldLabel>
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Priority">
                                {PRIORITY_OPTIONS.map((opt) => (
                                    <Button
                                        key={opt.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={field.value === opt.value}
                                        variant={field.value === opt.value ? "default" : "outline"}
                                        size="sm"
                                        className={cn(field.value === opt.value && opt.value === "medium" && "bg-orange-500 hover:bg-orange-600")}
                                        onClick={() => field.onChange(opt.value)}
                                    >
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />
                <Field data-invalid={!!errors.progress}>
                    <FieldLabel htmlFor="project-progress">PROGRESS</FieldLabel>
                    <FieldDescription>Drag to set the current completion percentage.</FieldDescription>
                    <p className="text-muted-foreground text-xs font-medium mb-2">Completion percentage</p>
                    <div className="flex items-center gap-3">
                        <input
                            id="project-progress"
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            {...register("progress", { valueAsNumber: true })}
                            className="flex-1 h-2 rounded-full appearance-none bg-muted accent-primary"
                        />
                        <span className="text-primary font-medium text-sm w-10">{progress}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                    <FieldError errors={[errors.progress]} />
                </Field>
            </FieldGroup>
        </div>
    )
}
