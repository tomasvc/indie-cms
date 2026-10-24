import { ProjectForm } from "./types"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

export const FormTime = ({ form, setForm }: { form: ProjectForm, setForm: React.Dispatch<React.SetStateAction<ProjectForm>> }) => {
    const [timeBurnPct, setTimeBurnPct] = useState(0);
    
    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>ESTIMATED HOURS</FieldLabel>
                        <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                            <Input
                                name="estimated_hours"
                                type="number"
                                min={0}
                                value={form.estimatedHours}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, estimatedHours: Number(e.target.value) }))}
                                className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                            />
                            <span className="text-muted-foreground text-sm">h</span>
                        </div>
                    </Field>
                    <Field>
                        <FieldLabel>ACTUAL HOURS</FieldLabel>
                        <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                            <Input
                                name="actual_hours"
                                type="number"
                                min={0}
                                value={form.actualHours}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, actualHours: Number(e.target.value) }))}
                                className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                            />
                            <span className="text-muted-foreground text-sm">h</span>
                        </div>
                    </Field>
                </div>
                <Field>
                    <FieldLabel>Time burn</FieldLabel>
                    <div className="flex items-center gap-3">
                        <Progress value={timeBurnPct} className="flex-1 h-2" />
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                            {form.actualHours}h / {form.estimatedHours}h ({Math.round(timeBurnPct)}%)
                        </span>
                    </div>
                </Field>
            </FieldGroup>
        </div>
    )
}