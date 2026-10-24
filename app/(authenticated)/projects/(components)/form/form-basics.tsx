import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
import { 
    type ProjectForm,
    PROJECT_COLORS
} from "."

export const FormBasics = ({ form, setForm }: { form: ProjectForm, setForm: React.Dispatch<React.SetStateAction<ProjectForm>> }) => {

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel>PROJECT TITLE</FieldLabel>
                    <Input
                        name="title"
                        value={form.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Branding Website"
                    />
                </Field>
                <Field>
                    <FieldLabel>DESCRIPTION</FieldLabel>
                    <FieldDescription>
                        A short summary visible on project cards and reports.
                    </FieldDescription>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((prev: ProjectForm) => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g. Animation-rich branding pages for a client"
                        className="min-h-[80px]"
                    />
                </Field>
                <Field>
                    <FieldLabel>CATEGORY</FieldLabel>
                    <Input
                        name="category"
                        value={form.category}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g. Web Design"
                    />
                </Field>
                <Field>
                    <FieldLabel>PROJECT COLOR</FieldLabel>
                    <div className="flex flex-wrap items-center gap-2">
                        {PROJECT_COLORS.map((c: string) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setForm((prev: ProjectForm) => ({ ...prev, color: c as string }))}
                                className={cn(
                                    "size-8 rounded-full border-2 transition-all",
                                    form.color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: c }}
                                aria-label={`Color ${c}`}
                            />
                        ))}
                        <Input
                            name="color"
                            value={form.color}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, color: e.target.value }))}
                            className="ml-2 w-24 font-mono text-xs"
                        />
                        <span className="size-6 rounded border border-border shrink-0" style={{ backgroundColor: form.color }} />
                    </div>
                </Field>
                <Field>
                    <FieldLabel>TAGS</FieldLabel>
                    <FieldDescription>Separate tags with commas</FieldDescription>
                    <Input
                        value={form.tags}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, tags: e.target.value }))}
                        placeholder="Animation, Branding, Web Design"
                    />
                    {form.tags && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {form.tags
                                .split(",")
                                .map((t) => t.trim())
                                .filter((x) => x !== "")
                                .map((t) => (
                                    <span
                                        key={t}
                                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs"
                                    >
                                        {t}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((prev: ProjectForm) => ({ ...prev, tags: form.tags.split(",").filter((x) => x !== t).join(", ") }))
                                            }
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <XIcon className="size-3" />
                                        </button>
                                    </span>
                                ))}
                        </div>
                    )}
                </Field>
            </FieldGroup>
        </div>
    )
}