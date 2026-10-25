import { Controller, useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMoney } from "@/lib/helpers/format"
import { useState } from "react"
import { CURRENCIES } from "./constants"
import type { ProjectFormValues } from "./types"

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

export const FormFinancials = ({ businessCurrency }: { businessCurrency: string }) => {
    const { register, setValue, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const [currency, value, budget] = useWatch({ control, name: ["currency", "value", "budget"] });
    const [matchDefaultCurrency, setMatchDefaultCurrency] = useState(false);
    const remaining = Math.max(0, finite(budget) - finite(value));

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        control={control}
                        name="currency"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="project-currency">CURRENCY</FieldLabel>
                                <Select disabled={matchDefaultCurrency} value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="project-currency" className="w-full" aria-invalid={fieldState.invalid}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />
                    <Field>
                        <FieldLabel htmlFor="match-default-currency">Match default currency</FieldLabel>
                        <Checkbox
                            id="match-default-currency"
                            checked={matchDefaultCurrency}
                            onCheckedChange={(checked) => {
                                const isChecked = checked === true;
                                setMatchDefaultCurrency(isChecked);
                                if (isChecked) setValue("currency", businessCurrency, { shouldDirty: true, shouldValidate: true });
                            }}
                        />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field data-invalid={!!errors.value}>
                        <FieldLabel htmlFor="project-value">PROJECT VALUE</FieldLabel>
                        <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                            <span className="text-muted-foreground pl-2.5 text-sm">{currency}</span>
                            <Input
                                id="project-value"
                                type="number"
                                min={0}
                                step="any"
                                {...register("value", { valueAsNumber: true })}
                                aria-invalid={!!errors.value}
                                className="border-0 rounded-none flex-1 h-8 py-[7px]"
                            />
                        </div>
                        <FieldError errors={[errors.value]} />
                    </Field>
                    <Field data-invalid={!!errors.budget}>
                        <FieldLabel htmlFor="project-budget">BUDGET</FieldLabel>
                        <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                            <span className="text-muted-foreground pl-2.5 text-sm">{currency}</span>
                            <Input
                                id="project-budget"
                                type="number"
                                min={0}
                                step="any"
                                {...register("budget", { valueAsNumber: true })}
                                aria-invalid={!!errors.budget}
                                className="border-0 rounded-none flex-1 h-8 py-[7px]"
                            />
                        </div>
                        <FieldError errors={[errors.budget]} />
                    </Field>
                </div>
                <div className="flex gap-6 pt-2">
                    <span className="text-primary text-sm font-medium">
                        Budget after fee: {formatMoney(remaining, currency)}
                    </span>
                </div>
            </FieldGroup>
        </div>
    )
}
