"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Design system typography variants.
 * Freelance OS type scale: Geist (sans) for everything, Geist Mono for reference numbers only.
 * Body text is 14px; nothing a user needs to read is smaller than 12px.
 */
const typographyVariants = cva("", {
  variants: {
    variant: {
      // ── Headings ──
      pageTitle:
        "font-sans text-[26px] font-semibold leading-[1.2] tracking-[-0.4px] text-foreground",
      subtitle:
        "font-sans text-[15px] font-normal text-muted-foreground mt-1",

      // ── Numbers ──
      kpiValue:
        "font-sans text-[26px] font-semibold leading-[1.15] tracking-[-0.3px] text-foreground tabular-nums",
      metricValue:
        "font-sans text-[20px] font-semibold text-foreground tabular-nums",

      // ── Card / section (sentence case: uppercase micro-labels are slow to read) ──
      cardTitle:
        "font-sans text-[15px] font-semibold text-card-foreground",
      cardSectionTitle:
        "font-sans text-[14px] font-semibold text-card-foreground",
      clientName:
        "font-sans text-[15px] font-semibold text-foreground",

      // ── Body ──
      body:
        "font-sans text-[14px] font-normal leading-relaxed text-foreground",
      bodyLarge:
        "font-sans text-[15px] font-normal leading-relaxed text-foreground",
      bodySmall:
        "font-sans text-[13px] font-normal leading-relaxed text-foreground",

      // ── UI labels ──
      button:
        "font-sans text-[14px] font-medium text-foreground",
      label:
        "font-sans text-[13px] font-medium text-foreground",
      labelSmall:
        "font-sans text-[12px] font-medium text-foreground",
      labelUppercase:
        "font-sans text-[13px] font-medium text-muted-foreground",
      badge:
        "font-sans text-[12px] font-medium",
      badgeSmall:
        "font-sans text-[12px] font-medium text-muted-foreground",

      // ── Metadata / dates (sans: mono digits read slowly in running text) ──
      metadata:
        "font-sans text-[13px] font-normal text-muted-foreground tabular-nums",
      metadataMedium:
        "font-sans text-[13px] font-medium text-muted-foreground tabular-nums",
      metadataStrong:
        "font-sans text-[13px] font-medium text-foreground tabular-nums",

      // ── Reference numbers (invoice codes) ──
      code:
        "font-mono text-[13px] font-normal text-foreground",
      codeMuted:
        "font-mono text-[12px] font-normal text-muted-foreground",

      // ── KPI label ──
      overline:
        "font-sans text-[13px] font-medium text-muted-foreground",
      kpiLabel:
        "font-sans text-[13px] font-medium text-muted-foreground",
      kpiSub:
        "font-sans text-[13px] font-normal text-muted-foreground mt-0.5",

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
