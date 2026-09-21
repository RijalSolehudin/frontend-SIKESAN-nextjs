"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

interface SelectContextValue {
  labels: Map<string, React.ReactNode>
  registerLabel: (val: string, label: React.ReactNode) => void
  unregisterLabel: (val: string) => void
  currentValue?: any
}

const SelectContext = React.createContext<SelectContextValue>({
  labels: new Map(),
  registerLabel: () => {},
  unregisterLabel: () => {},
})

function extractItems(
  children: React.ReactNode,
  target: { set: (key: string, val: React.ReactNode) => void }
) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as any
    if (props && props.value !== undefined && props.children !== undefined) {
      target.set(String(props.value), props.children)
    }
    if (props && props.children) {
      extractItems(props.children, target)
    }
  })
}

function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SelectPrimitive.Root.Props<any, any>) {
  const [labels, setLabels] = React.useState<Map<string, React.ReactNode>>(() => {
    const map = new Map<string, React.ReactNode>()
    extractItems(children, map)
    return map
  })

  const registerLabel = React.useCallback((val: string, label: React.ReactNode) => {
    setLabels((prev) => {
      if (prev.get(val) === label) return prev
      const next = new Map(prev)
      next.set(val, label)
      return next
    })
  }, [])

  const unregisterLabel = React.useCallback((val: string) => {
    setLabels((prev) => {
      if (!prev.has(val)) return prev
      const next = new Map(prev)
      next.delete(val)
      return next
    })
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabels((prev) => {
      const next = new Map(prev)
      let changed = false
      extractItems(children, {
        set(key: string, val: React.ReactNode) {
          if (next.get(key) !== val) {
            next.set(key, val)
            changed = true
          }
        },
      })
      return changed ? next : prev
    })
  }, [children])

  const items = React.useMemo(() => {
    return Array.from(labels.entries()).map(([v, l]) => ({
      value: v,
      label: typeof l === "string" ? l : undefined,
    }))
  }, [labels])

  const normalizedValue = value !== undefined && value !== null ? String(value) : value
  const normalizedDefaultValue = defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : defaultValue

  return (
    <SelectContext.Provider
      value={{
        labels,
        registerLabel,
        unregisterLabel,
        currentValue: normalizedValue,
      }}
    >
      <SelectPrimitive.Root
        data-slot="select"
        value={normalizedValue}
        defaultValue={normalizedDefaultValue}
        onValueChange={onValueChange}
        items={items}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  )
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  className,
  placeholder,
  children,
  ...props
}: SelectPrimitive.Value.Props) {
  const { labels } = React.useContext(SelectContext)

  const resolveLabel = React.useCallback(
    (val: any) => {
      if (val === undefined || val === null || val === "") {
        return placeholder
      }
      const stringKey = String(val)
      if (labels.has(stringKey)) {
        return labels.get(stringKey)
      }
      return val
    },
    [labels, placeholder]
  )

  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left text-sm text-slate-800", className)}
      placeholder={placeholder}
      {...props}
    >
      {typeof children === "function" ? children : children ?? resolveLabel}
    </SelectPrimitive.Value>
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-2xs transition-all duration-150 outline-none select-none hover:border-slate-300 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-placeholder:text-slate-400 data-[size=default]:h-9 data-[size=sm]:h-8 data-[size=lg]:h-11",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-4 text-slate-400 transition-transform duration-200" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-40 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200/90 bg-white/95 p-1 text-slate-800 shadow-xl backdrop-blur-md ring-1 ring-black/5 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  value,
  ...props
}: SelectPrimitive.Item.Props) {
  const { registerLabel, unregisterLabel } = React.useContext(SelectContext)

  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      registerLabel(String(value), children)
      return () => unregisterLabel(String(value))
    }
  }, [value, children, registerLabel, unregisterLabel])

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value !== undefined && value !== null ? String(value) : value}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-8 pl-2.5 text-sm text-slate-700 outline-hidden select-none hover:bg-emerald-50 hover:text-emerald-900 focus:bg-emerald-50 focus:text-emerald-900 data-selected:bg-emerald-100/70 data-selected:text-emerald-900 data-selected:font-medium transition-colors data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-emerald-600" />
        }
      >
        <CheckIcon className="pointer-events-none size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-slate-100", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-white py-1 text-slate-400 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-white py-1 text-slate-400 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
