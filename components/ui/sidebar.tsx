const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md px-2.5 py-2 text-sm transition-[color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        // no background on hover, only text color
        default: 'hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-accent))] text-sidebar-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-9 text-sm',
      },
      isActive: {
        true: 'text-foreground',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
