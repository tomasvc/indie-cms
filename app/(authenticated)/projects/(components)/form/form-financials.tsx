import { ProjectForm } from "./types"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { CURRENCIES } from "./constants"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMoney } from "@/lib/helpers/format"
import { useState } from "react"

export const FormFinancials = ({ form, setForm }: { form: ProjectForm, setForm: React.Dispatch<React.SetStateAction<ProjectForm>> }) => {
    const [matchDefaultCurrency, setMatchDefaultCurrency] = useState(false);
    const remaining = Math.max(0, form.budget - form.value);

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>CURRENCY</FieldLabel>
                        <Select name="currency" disabled={matchDefaultCurrency} value={matchDefaultCurrency ? "GBP" : form.currency} onValueChange={(value) => setForm((prev: ProjectForm) => ({ ...prev, currency: value }))}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel>Match default currency</FieldLabel>
                        <Checkbox name="match_default_currency" checked={matchDefaultCurrency} onCheckedChange={(checked) => setMatchDefaultCurrency(checked === "indeterminate" ? false : checked)} />
                    </Field>
                    <Field>
                        <FieldLabel>PROFIT MARGIN</FieldLabel>
                        <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                            <Input
                                name="profit_margin"
                                type="number"
                                min={0}
                                max={100}
                                value={form.profitMargin}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, profitMargin: Number(e.target.value) }))}
                                className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                            />
                            <span className="text-muted-foreground text-sm">%</span>
                        </div>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel>PROJECT VALUE</FieldLabel>
                        <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                            <span className="text-muted-foreground pl-2.5 text-sm">{form.currency}</span>
                            <Input
                                name="value"
                                type="number"
                                min={0}
                                value={form.value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, value: Number(e.target.value) }))}
                                className="border-0 rounded-none flex-1 h-8 py-[7px]"
                            />
                        </div>
                    </Field>
                    <Field>
                        <FieldLabel>BUDGET</FieldLabel>
                        <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                            <span className="text-muted-foreground pl-2.5 text-sm">{form.currency}</span>
                            <Input
                                name="budget"
                                type="number"
                                min={0}
                                value={form.budget}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev: ProjectForm) => ({ ...prev, budget: Number(e.target.value) }))}
                                className="border-0 rounded-none flex-1 h-8 py-[7px]"
                            />
                        </div>
                    </Field>
                </div>
                <div className="flex gap-6 pt-2">
                    <span className="text-primary text-sm font-medium">
                        Remaining: {formatMoney(remaining, form.currency)}
                    </span>
                    <span className="text-primary text-sm font-medium">Margin: {form.profitMargin}%</span>
                </div>
            </FieldGroup>
        </div>
    )
}