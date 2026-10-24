import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProjectForm } from "./types"
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "./constants"
import { ProjectStatus } from "@/types"

export const FormStatusProgress = ({ form, setForm }: { form: ProjectForm, setForm: React.Dispatch<React.SetStateAction<ProjectForm>> }) => {
    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel>STATUS</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((opt: { value: ProjectStatus; label: string }) => (
                            <Button
                                key={opt.value}
                                type="button"
                                variant={form.status === opt.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setForm((prev: ProjectForm) => ({ ...prev, status: opt.value }))}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </Field>
                <Field>
                    <FieldLabel>PRIORITY</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        {PRIORITY_OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                type="button"
                                variant={form.priority === opt.value ? "default" : "outline"}
                                size="sm"
                                className={cn(form.priority === opt.value && opt.value === "medium" && "bg-orange-500 hover:bg-orange-600")}
                                onClick={() => setForm((prev: ProjectForm) => ({ ...prev, priority: opt.value }))}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </Field>
                <Field>
                    <FieldLabel>PROGRESS</FieldLabel>
                    <FieldDescription>Drag to set the current completion percentage.</FieldDescription>
                    <p className="text-muted-foreground text-xs font-medium mb-2">Completion percentage</p>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={form.progress}
                            onChange={(e) => setForm((prev: ProjectForm) => ({ ...prev, progress: Number(e.target.value) }))}
                            className="flex-1 h-2 rounded-full appearance-none bg-muted accent-primary"
                        />
                        <span className="text-primary font-medium text-sm w-10">{form.progress}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                </Field>
            </FieldGroup>
        </div>
    )
}