"use client"

import { Menu } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

const DropdownMenu = Menu.Root

const DropdownMenuTrigger = Menu.Trigger

function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "end",
  ...props
}: Menu.Popup.Props & Pick<Menu.Positioner.Props, "sideOffset" | "align" | "alignOffset" | "side">) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={sideOffset} align={align} className="z-50 outline-none">
        <Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "min-w-40 origin-[var(--transform-origin)] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuItem({ className, ...props }: Menu.Item.Props) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none data-highlighted:bg-muted data-highlighted:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
