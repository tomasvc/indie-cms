import { useFormContext, useWatch } from "react-hook-form"
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
import { PROJECT_COLORS } from "./constants"
import type { ProjectFormValues } from "./types"

const splitTags = (tags: string) => tags.split(",").map((t) => t.trim()).filter((t) => t !== "");

export const FormBasics = () => {
    const { register, setValue, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const [color, tags] = useWatch({ control, name: ["color", "tags"] });

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <Field data-invalid={!!errors.title}>
                    <FieldLabel htmlFor="project-title">PROJECT TITLE</FieldLabel>
                    <Input
                        id="project-title"
                        {...register("title")}
                        aria-invalid={!!errors.title}
                        placeholder="e.g. Branding Website"
                    />
                    <FieldError errors={[errors.title]} />
                </Field>
                <Field data-invalid={!!errors.description}>
                    <FieldLabel htmlFor="project-description">DESCRIPTION</FieldLabel>
                    <FieldDescription>
                        A short summary visible on project cards and reports.
                    </FieldDescription>
                    <Textarea
                        id="project-description"
                        {...register("description")}
                        aria-invalid={!!errors.description}
                        placeholder="e.g. Animation-rich branding pages for a client"
                        className="min-h-[80px]"
                    />
                    <FieldError errors={[errors.description]} />
                </Field>
                <Field data-invalid={!!errors.category}>
                    <FieldLabel htmlFor="project-category">CATEGORY</FieldLabel>
                    <Input
                        id="project-category"
                        {...register("category")}
                        aria-invalid={!!errors.category}
                        placeholder="e.g. Web Design"
                    />
                    <FieldError errors={[errors.category]} />
                </Field>
                <Field data-invalid={!!errors.color}>
                    <FieldLabel htmlFor="project-color">PROJECT COLOR</FieldLabel>
                    <div className="flex flex-wrap items-center gap-2">
                        {PROJECT_COLORS.map((c: string) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setValue("color", c, { shouldDirty: true, shouldValidate: true })}
                                className={cn(
                                    "size-8 rounded-full border-2 transition-all",
                                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: c }}
                                aria-label={`Color ${c}`}
                            />
                        ))}
                        <Input
                            id="project-color"
                            {...register("color")}
                            aria-invalid={!!errors.color}
                            className="ml-2 w-24 font-mono text-xs"
                        />
                        <span className="size-6 rounded border border-border shrink-0" style={{ backgroundColor: color }} />
                    </div>
                    <FieldError errors={[errors.color]} />
                </Field>
                <Field data-invalid={!!errors.tags}>
                    <FieldLabel htmlFor="project-tags">TAGS</FieldLabel>
                    <FieldDescription>Separate tags with commas</FieldDescription>
                    <Input
                        id="project-tags"
                        {...register("tags")}
                        aria-invalid={!!errors.tags}
                        placeholder="Animation, Branding, Web Design"
                    />
                    <FieldError errors={[errors.tags]} />
                    {tags && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {splitTags(tags).map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs"
                                >
                                    {t}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setValue("tags", splitTags(tags).filter((x) => x !== t).join(", "), { shouldDirty: true })
                                        }
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label={`Remove tag ${t}`}
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
