import { Controller, useFormContext, useWatch } from "react-hook-form"
import { FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Typography } from "@/components/ui/typography"
import { Client } from "@/types"
import type { ProjectFormValues } from "./types"

export const FormClient = ({ clients }: { clients: Client[] }) => {
    const { control } = useFormContext<ProjectFormValues>();
    const clientId = useWatch({ control, name: "clientId" });
    const linkedClient = clients.find((c) => c.id === clientId);

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="project-client-id">CLIENT ID</FieldLabel>
                    <FieldDescription>The internal ID of the linked client record.</FieldDescription>
                    <Input id="project-client-id" readOnly value={clientId || "—"} className="bg-muted/50" />
                </Field>
                <Controller
                    control={control}
                    name="clientId"
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="project-client">Client</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="project-client" className="w-full" aria-invalid={fieldState.invalid}>
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.company || c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError errors={[fieldState.error]} />
                        </Field>
                    )}
                />
                {linkedClient && (
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            <Avatar size="lg">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {(linkedClient.company || linkedClient.name).charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <Typography variant="body" className="font-semibold">
                                    {linkedClient.company || linkedClient.name}
                                </Typography>
                                {linkedClient.email && (
                                    <Typography variant="bodySmall" className="text-muted-foreground">
                                        {linkedClient.email}
                                    </Typography>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </FieldGroup>
        </div>
    )
}
