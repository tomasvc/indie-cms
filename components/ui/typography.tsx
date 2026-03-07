"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Design system typography variants.
 * Maps to Freelance OS type scale: Outfit (sans), Fraunces (serif), JetBrains Mono (mono).
 */
const typographyVariants = cva("", {
  variants: {
    variant: {
      // ── Headings (serif) ──
      pageTitle:
        "font-serif text-[28px] font-bold leading-[1.2] tracking-[-0.3px] text-foreground",
      subtitle:
        "font-sans text-[14px] font-medium text-muted-foreground mt-1",

      // ── Display / numbers (serif) ──
      kpiValue:
        "font-sans text-[22px] font-semibold leading-[1.1] text-foreground",
      metricValue:
        "font-sans text-[18px] font-semibold text-foreground",

      // ── Card / section ──
      cardTitle:
        "font-sans text-[11px] font-semibold uppercase tracking-[0.9px] text-card-foreground",
      cardSectionTitle:
        "font-sans text-[12px] font-medium text-card-foreground",
      clientName:
        "font-sans text-[14px] font-semibold text-foreground",

      // ── Body (sans) ──
      body:
        "font-sans text-[13px] font-normal leading-relaxed text-foreground",
      bodyLarge:
        "font-sans text-[14px] font-normal leading-relaxed text-foreground",
      bodySmall:
        "font-sans text-[12px] font-normal leading-relaxed text-foreground",

      // ── UI labels ──
      button:
        "font-sans text-[13px] font-medium text-foreground",
      label:
        "font-sans text-[12px] font-medium text-foreground",
      labelSmall:
        "font-sans text-[11px] font-medium text-foreground",
      labelUppercase:
        "font-sans text-[11px] font-medium uppercase tracking-[0.8px] text-muted-foreground",
      badge:
        "font-sans text-[12px] font-medium tracking-[0.2px]",
      badgeSmall:
        "font-sans text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground",

      // ── Metadata / dates (mono) ──
      metadata:
        "font-mono text-[11px] font-normal text-muted-foreground",
      metadataMedium:
        "font-mono text-[12px] font-medium text-muted-foreground",
      metadataStrong:
        "font-mono text-[12px] font-medium text-foreground",

      // ── Inline / code ──
      code:
        "font-mono text-[12px] font-normal text-foreground",
      codeMuted:
        "font-mono text-[11px] font-normal text-muted-foreground",

      // ── Overline / KPI label ──
      overline:
        "font-sans text-[11px] font-medium uppercase tracking-[0.8px] text-muted-foreground",
      kpiLabel:
        "font-sans text-[11px] font-medium uppercase tracking-[0.8px] text-muted-foreground",
      kpiSub:
        "font-mono text-[11px] font-normal text-muted-foreground mt-0.5",

      // ── Muted text (no size lock, for composition) ──
      muted:
        "text-muted-foreground",
    },
    /** Optional color override without changing variant semantics */
    color: {
      default: "",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      success: "text-primary",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
})

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>

const defaultElementMap: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> = {
  pageTitle: "h1",
  subtitle: "p",
  kpiValue: "p",
  metricValue: "span",
  cardTitle: "h3",
  cardSectionTitle: "h3",
  clientName: "span",
  body: "p",
  bodyLarge: "p",
  bodySmall: "p",
  button: "span",
  label: "span",
  labelSmall: "span",
  labelUppercase: "span",
  badge: "span",
  badgeSmall: "span",
  metadata: "span",
  metadataMedium: "span",
  metadataStrong: "span",
  code: "code",
  codeMuted: "code",
  overline: "span",
  kpiLabel: "span",
  kpiSub: "span",
  muted: "span",
}

export type TypographyProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants> & {
    /** Override the rendered element. Defaults per variant (e.g. pageTitle → h1, body → p). */
    as?: React.ElementType
  }

function Typography({
  className,
  variant = "body",
  color = "default",
  as,
  ...props
}: TypographyProps) {
  const Comp = (as ?? defaultElementMap[variant ?? "body"]) as React.ElementType

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({ variant, color }), className)}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
