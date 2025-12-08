import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-gold to-gold-600 text-charcoal shadow-md shadow-gold/20 hover:from-gold-400 hover:to-gold-500 hover:shadow-lg hover:shadow-gold/30",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-gold/25 text-gold bg-transparent hover:bg-gold/10 hover:border-gold/50",
        secondary:
          "bg-teal-rich text-parchment border border-gold/10 shadow-sm hover:bg-teal-light/30 hover:border-gold/20",
        ghost: "text-parchment-muted hover:bg-teal-light/20 hover:text-parchment",
        link: "text-gold underline-offset-4 hover:underline",
        canon:
          "bg-gradient-to-b from-gold to-gold-600 text-charcoal shadow-lg shadow-gold/30 canon-glow hover:from-gold-400 hover:to-gold-500",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        xl: "h-12 rounded-md px-10 text-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
