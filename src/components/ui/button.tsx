import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 hover:shadow-md hover:shadow-emerald-900/10",
        secondary:
          "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/80 hover:border-emerald-300",
        outline:
          "border border-slate-200 bg-white/90 text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300",
        ghost:
          "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
        destructive:
          "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm hover:from-rose-700 hover:to-red-700 hover:shadow-md hover:shadow-red-900/10",
        destructiveOutline:
          "border border-red-200 bg-red-50/60 text-red-600 hover:bg-red-100 hover:border-red-300",
        link:
          "text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700 p-0 h-auto active:scale-100",
      },
      size: {
        default: "h-9 px-4 py-2 gap-2 text-sm",
        sm: "h-8 px-3 text-xs font-medium rounded-md gap-1.5",
        lg: "h-11 px-6 text-base font-semibold rounded-xl gap-2.5",
        icon: "size-9 rounded-lg p-0",
        "icon-sm": "size-7 rounded-md p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
