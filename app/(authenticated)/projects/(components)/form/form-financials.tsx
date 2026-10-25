import { Controller, useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMoney } from "@/lib/helpers/format"
import { useState } from "react"
import { CURRENCIES } from "./constants"
import type { ProjectFormValues } from "./types"

const DEFAULT_CURRENCY = "GBP";
const finite = (n: number) => (Number.isFinite(n) ? n : 0);

export const FormFinancials = () => {
    const { register, setValue, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const [currency, value, budget, profitMargin] = useWatch({ control, name: ["currency", "value", "budget", "profitMargin"] });
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
                                if (isChecked) setValue("currency", DEFAULT_CURRENCY, { shouldDirty: true, shouldValidate: true });
                            }}
                        />
                    </Field>
                    <Field data-invalid={!!errors.profitMargin}>
                        <FieldLabel htmlFor="project-profit-margin">PROFIT MARGIN</FieldLabel>
                        <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                            <Input
                                id="project-profit-margin"
                                type="number"
                                min={0}
                                max={100}
                                {...register("profitMargin", { valueAsNumber: true })}
                                aria-invalid={!!errors.profitMargin}
                                className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                            />
                            <span className="text-muted-foreground text-sm">%</span>
                        </div>
                        <FieldError errors={[errors.profitMargin]} />
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
                        Remaining: {formatMoney(remaining, currency)}
                    </span>
                    <span className="text-primary text-sm font-medium">Margin: {finite(profitMargin)}%</span>
                </div>
            </FieldGroup>
        </div>
    )
}
