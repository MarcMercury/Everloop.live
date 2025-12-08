import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-gold/30 bg-gold/15 text-gold shadow-sm",
        secondary:
          "border-teal-light/30 bg-teal-light/10 text-parchment-muted",
        destructive:
          "border-red-500/30 bg-red-500/15 text-red-400 shadow-sm",
        outline: "text-parchment border-gold/20",
        // Entity type variants - more vibrant with glow
        character:
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10",
        location:
          "border-sky-500/40 bg-sky-500/15 text-sky-400 shadow-sm shadow-sky-500/10",
        artifact:
          "border-gold/50 bg-gold/20 text-gold shadow-sm shadow-gold/15",
        event:
          "border-violet-500/40 bg-violet-500/15 text-violet-400 shadow-sm shadow-violet-500/10",
        faction:
          "border-rose-500/40 bg-rose-500/15 text-rose-400 shadow-sm shadow-rose-500/10",
        concept:
          "border-cyan-500/40 bg-cyan-500/15 text-cyan-400 shadow-sm shadow-cyan-500/10",
        creature:
          "border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/10",
        // Status variants
        canonical:
          "border-gold/60 bg-gold/25 text-gold shadow-md shadow-gold/20",
        draft:
          "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
        proposed:
          "border-sky-500/30 bg-sky-500/10 text-sky-400",
        deprecated:
          "border-red-500/30 bg-red-500/10 text-red-400",
        contested:
          "border-amber-500/40 bg-amber-500/15 text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
