"use client";

import { useState } from "react";
import { ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeEntryForm } from "../../projects/[id]/(components)/time-entry-form";

type LoggableProject = { id: string; title: string; currency: string | null; hourly_rate: number | null };

/** Log time from the dashboard without opening the project first. */
export function LogTimeButton({ projects, profileRate }: { projects: LoggableProject[]; profileRate: number }) {
    const [open, setOpen] = useState(false);
    const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
    const project = projects.find((p) => p.id === projectId);
    const rate = Number(project?.hourly_rate) > 0 ? Number(project?.hourly_rate) : profileRate;

    if (projects.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ClockIcon aria-hidden />
                    Log time
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Field className="mb-2">
                    <FieldLabel htmlFor="log-time-project">Project</FieldLabel>
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger id="log-time-project" className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>
                {project && (
                    <TimeEntryForm
                        key={project.id}
                        projectId={project.id}
                        tasks={[]}
                        currency={project.currency || "USD"}
                        defaultHourlyRate={rate}
                        onDone={() => setOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
