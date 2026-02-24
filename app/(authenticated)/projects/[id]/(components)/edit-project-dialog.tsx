"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Client, Project, ProjectStatus } from "@/types";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export const EditProjectDialog = ({ project, clients, editProject }: { project: Project, clients: Client[], editProject: (formData: FormData) => Promise<void> }) => {
    const [title, setTitle] = useState(project.title || "");
    const [description, setDescription] = useState(project.description || "");
    const [status, setStatus] = useState<ProjectStatus>(project.status || "proposal");
    const [value, setValue] = useState(project.value || 0);
    const [progress, setProgress] = useState(project.progress || "");
    const [startDate, setStartDate] = useState(project.start_date || "");
    const [dueDate, setDueDate] = useState(project.due_date || "");
    const [completedDate, setCompletedDate] = useState(project.completed_date || "");
    const [client, setClient] = useState(project.client_id || "");

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg" variant="secondary" >
                    <PencilIcon className="size-3 mb-0.5" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>Edit the project details.</DialogDescription>
                </DialogHeader>
                <form action={editProject}>
                    <FieldGroup>
                        <Field className="hidden">
                            <FieldLabel htmlFor="id">ID</FieldLabel>
                            <Input id="id" name="id" value={project.id} type="hidden" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Enter the project title" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter the project description" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="client">Client</FieldLabel>
                            <Input type="hidden" name="client_id" value={client} />
                            <Select name="client" value={client} onValueChange={(value: string) => setClient(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the project client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client: Client) => (
                                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="status">Status</FieldLabel>
                                <Select name="status" value={status} onValueChange={(value: ProjectStatus) => setStatus(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the project status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="proposal">Proposal</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="value">Value</FieldLabel>
                                <Input id="value" name="value" value={value} onChange={(e) => setValue(Number(e.target.value))} type="number" placeholder="Enter the project value" />
                            </Field>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="progress">Progress</FieldLabel>
                            <Input id="progress" name="progress" value={progress} onChange={(e) => setProgress(Number(e.target.value))} type="number" placeholder="Enter the project progress" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                            <Input id="start_date" name="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" placeholder="Enter the project start date" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                            <Input id="due_date" name="due_date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" placeholder="Enter the project due date" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="completed_date">Completed Date</FieldLabel>
                            <Input id="completed_date" name="completed_date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} type="date" placeholder="Enter the project completed date" />
                        </Field>
                    </FieldGroup>
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button size="lg" variant="outline" >
                                <XIcon className="size-3 mb-0.5" />
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" size="lg" variant="default" >
                            <CheckIcon className="size-3 mb-0.5" />
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};