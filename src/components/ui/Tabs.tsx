import * as React from "react"
import { cn } from "../../lib/utils"
import { motion } from "motion/react"

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | null>(null)

export const Tabs: React.FC<{ defaultValue?: string, value?: string, onValueChange?: (val: string) => void, children: React.ReactNode, className?: string }> = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = React.useState(value || defaultValue || "")
  
  const selectedValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) setInternalValue(newValue);
    if (onValueChange) onValueChange(newValue);
  }

  return (
    <TabsContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export const TabsList: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => {
  return (
    <div className={cn("inline-flex h-12 items-center justify-center rounded-xl bg-slate-900/80 border border-white/5 p-1 text-slate-400 shadow-inner", className)}>
      {children}
    </div>
  )
}

export const TabsTrigger: React.FC<{ value: string, className?: string, children: React.ReactNode }> = ({ value, className, children }) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within a Tabs component")
  
  const isSelected = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "text-white" : "hover:text-slate-200",
        className
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-slate-800 rounded-lg border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export const TabsContent: React.FC<{ value: string, className?: string, children: React.ReactNode }> = ({ value, className, children }) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within a Tabs component")
  
  if (context.value !== value) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={cn("mt-4 focus-visible:outline-none", className)}
    >
      {children}
    </motion.div>
  )
}
