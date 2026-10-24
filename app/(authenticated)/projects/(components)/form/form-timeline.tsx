import { ProjectForm } from "./types"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/helpers/format"
import { differenceInDays, parseISO } from "date-fns"
import { useState } from "react"

export const FormTimeline = ({ form, setForm }: { form: ProjectForm, setForm: React.Dispatch<React.SetStateAction<ProjectForm>> }) => {
    const startDt = form.startDate ? parseISO(form.startDate) : null;
    const dueDt = form.dueDate ? parseISO(form.dueDate) : null;
    const daysRemaining = startDt && dueDt ? differenceInDays(dueDt, startDt) : 0;
    
    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>START DATE</FieldLabel>
                        <Input
                            name="start_date"
                            type="date"
                            value={form.startDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, startDate: e.target.value }))}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>DUE DATE</FieldLabel>
                        <Input
                            name="due_date"
                            type="date"
                            value={form.dueDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, dueDate: e.target.value }))}
                        />
                    </Field>
                </div>
                <Field>
                    <FieldLabel>COMPLETED DATE</FieldLabel>
                    <FieldDescription>Leave blank if the project is still in progress.</FieldDescription>
                    <Input
                        name="completed_date"
                        type="date"
                        value={form.completedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, completedDate: e.target.value }))}
                        placeholder="dd/mm/yyyy"
                    />
                </Field>
                <Field>
                    <FieldLabel>TIMELINE PREVIEW</FieldLabel>
                    <div className="rounded-md border border-border p-4">
                        {startDt && dueDt && (
                            <>
                                <div className="relative h-8 flex items-center">
                                    <div className="flex-1 h-1.5 rounded-full bg-muted" />
                                    <span className="absolute left-0 text-[10px] text-muted-foreground" style={{ left: 0 }}>
                                        {formatDate(form.startDate, "MMM d")}
                                    </span>
                                    <span className="absolute right-0 text-[10px] text-muted-foreground" style={{ right: 0 }}>
                                        {formatDate(form.dueDate, "MMM d")}
                                    </span>
                                    <span
                                        className="absolute size-2.5 rounded-full bg-primary border-2 border-background"
                                        style={{ left: "50%", transform: "translateX(-50%)" }}
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