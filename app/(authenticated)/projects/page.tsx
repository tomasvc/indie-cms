import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { ProjectsView } from "./(components)/projects-view";
import { ProjectsPageFallback } from "./(components)/projects-fallback";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { handleCreateProject } from "@/lib/actions/projects";

async function Projects() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('projects').select('*').eq('user_id', user.user?.id);

    if (error) throw error;
    const projects = data ?? [];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage your projects.
                    </p>
                </div>
                <div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="lg" variant="default" >
                                <PlusIcon className="size-3 mb-0.5" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={handleCreateProject}>
                                <DialogHeader>
                                    <DialogTitle>New Project</DialogTitle>
                                    <DialogDescription>Create a new project to get started.</DialogDescription>
                                </DialogHeader>
                                <FieldGroup className="my-4">
                                    <Field>
                                        <FieldLabel htmlFor="title">Title</FieldLabel>
                                        <Input id="title" name="title" placeholder="Enter the project title" />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="description">Description</FieldLabel>
                                        <Textarea id="description" name="description" placeholder="Enter the project description" />
                                    </Field>
                                    {/* <Field>
                                        <FieldLabel htmlFor="client">Client</FieldLabel>
                                        <Select value="1">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Client 1</SelectItem>
                                                <SelectItem value="2">Client 2</SelectItem>
                                                <SelectItem value="3">Client 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field> */}
                                    <Field>
                                        <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                                        <Input type="date" id="start_date" name="start_date" placeholder="Enter the project start date" />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                                        <Input type="date" id="due_date" name="due_date" placeholder="Enter the project due date" />
                                    </Field>
                                </FieldGroup>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button size="lg" variant="outline" >
                                            <XIcon className="size-3 mb-0.5" />
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" size="lg" variant="default" >
                                        <PlusIcon className="size-3 mb-0.5" />
                                        Create Project
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <ProjectsView projects={projects} />
        </div>
    )
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<ProjectsPageFallback />}>
            <Projects />
        </Suspense>
    );
}