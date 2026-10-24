import { ProjectForm } from "./types"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Typography } from "@/components/ui/typography"
import { Client } from "@/types"

export const FormClient = ({ form, setForm, clients }: { form: ProjectForm, setForm: React.Dispatch<React.SetStateAction<ProjectForm>>, clients: Client[] }) => {
    const linkedClient = clients.find((c) => c.id === form.clientId);
    
    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel>CLIENT ID</FieldLabel>
                    <FieldDescription>The internal ID of the linked client record.</FieldDescription>
                    <Input readOnly value={form.clientId || "—"} className="bg-muted/50" />
                </Field>
                <Field>
                    <FieldLabel>Client</FieldLabel>
                    <Select value={form.clientId} onValueChange={(value) => setForm((prev: ProjectForm) => ({ ...prev, clientId: value }))}>
                        <SelectTrigger className="w-full">
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
                </Field>
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