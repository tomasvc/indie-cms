import { Controller, useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/helpers/format"
import { useState } from "react"
import { CURRENCIES } from "./constants"
import type { ProjectFormValues } from "./types"

const finite = (n: number) => (Number.isFinite(n) ? n : 0);

export const FormFinancials = ({ businessCurrency }: { businessCurrency: string }) => {
    const { register, setValue, control, formState: { errors } } = useFormContext<ProjectFormValues>();
    const [currency, value, budget, billingType] = useWatch({ control, name: ["currency", "value", "budget", "billingType"] });
    const [matchDefaultCurrency, setMatchDefaultCurrency] = useState(false);
    // Overview's "margin" is (fee − time-cost) ÷ fee, so this is the margin left if the whole budget is used
    const marginAtBudget = finite(value) > 0 && finite(budget) > 0
        ? Math.round(((finite(value) - finite(budget)) / finite(value)) * 100)
        : null;

    return (
        <div className="max-w-2xl space-y-6">
            <FieldGroup>
                <BillingTypeField />
                {billingType === "hourly" && (
                    <Field data-invalid={!!errors.hourlyRate} className="max-w-xs">
                        <FieldLabel htmlFor="project-hourly-rate">Hourly rate</FieldLabel>
                        <FieldDescription>Time you log on this project starts at this rate.</FieldDescription>
                        <MoneyInput id="project-hourly-rate" currency={currency} invalid={!!errors.hourlyRate} {...register("hourlyRate", { valueAsNumber: true })} />
                        <FieldError errors={[errors.hourlyRate]} />
                    </Field>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        control={control}
                        name="currency"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="project-currency">Currency</FieldLabel>
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
                    <div className="flex items-center gap-2 self-end pb-2">
                        <Checkbox
                            id="match-default-currency"
                            checked={matchDefaultCurrency}
                            onCheckedChange={(checked) => {
                                const isChecked = checked === true;
                                setMatchDefaultCurrency(isChecked);
                                if (isChecked) setValue("currency", businessCurrency, { shouldDirty: true, shouldValidate: true });
                            }}
                        />
                        <label htmlFor="match-default-currency" className="text-sm">
                            Use my default currency ({businessCurrency})
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field data-invalid={!!errors.value}>
                        <FieldLabel htmlFor="project-value">{billingType === "hourly" ? "Estimated total" : "Fee"}</FieldLabel>
                        <FieldDescription>
                            {billingType === "hourly" ? "Optional. What you expect to bill in total." : "What you'll charge the client in total."}
                        </FieldDescription>
                        <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                            <span className="text-muted-foreground pl-2.5 text-sm">{currency}</span>
                            <Input
                                id="project-value"
                                type="number"
                                min={0}
                                step="any"
                                {...register("value", { valueAsNumber: true })}
                                aria-invalid={!!errors.value}
                                className="border-0 rounded-none flex-1 h-9 py-2"
                            />
                        </div>
                        <FieldError errors={[errors.value]} />
                    </Field>
                    <Field data-invalid={!!errors.budget}>
                        <FieldLabel htmlFor="project-budget">Time budget</FieldLabel>
                        <FieldDescription>Optional. The most your logged time (hours × rate) should cost.</FieldDescription>
                        <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                            <span className="text-muted-foreground pl-2.5 text-sm">{currency}</span>
                            <Input
                                id="project-budget"
                                type="number"
                                min={0}
                                step="any"
                                {...register("budget", { valueAsNumber: true })}
                                aria-invalid={!!errors.budget}
                                className="border-0 rounded-none flex-1 h-9 py-2"
                            />
                        </div>
                        <FieldError errors={[errors.budget]} />
                    </Field>
                </div>
                {marginAtBudget !== null && (
                    <p className="text-sm text-muted-foreground pt-2">
                        If you use the whole time budget, you keep{" "}
                        <span className={marginAtBudget < 0 ? "font-medium text-destructive" : "font-medium text-foreground"}>
                            {marginAtBudget}%
                        </span>{" "}
                        of the fee ({formatMoney(finite(value) - finite(budget), currency)}).
                    </p>
                )}
            </FieldGroup>
        </div>
    )
}

const BillingTypeField = () => {
    const { control } = useFormContext<ProjectFormValues>();
    return (
        <Controller
            control={control}
            name="billingType"
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>How you bill this project</FieldLabel>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Billing type">
                        {([["fixed", "Fixed fee"], ["hourly", "Hourly"]] as const).map(([value, label]) => (
                            <Button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={field.value === value}
                                variant={field.value === value ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(value)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                    <FieldError errors={[fieldState.error]} />
                </Field>
            )}
        />
    );
};

const MoneyInput = ({ currency, invalid, ...props }: { currency: string; invalid: boolean } & React.ComponentProps<typeof Input>) => (
    <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
        <span className="text-muted-foreground pl-2.5 text-sm">{currency}</span>
        <Input type="number" min={0} step="any" aria-invalid={invalid} className="border-0 rounded-none flex-1 h-9 py-2" {...props} />
    </div>
);
