"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Input } from "@workspace/ui/components/input"

interface DateTimePickerProps {
  value?: string
  onChange?: (val: string) => void
  className?: string
  placeholder?: string
}

export function DateTimePicker({ value, onChange, className, placeholder = "Pick a date and time" }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [time, setTime] = React.useState<string>(
    value ? format(new Date(value), "HH:mm") : ""
  )
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (value) {
      setDate(new Date(value))
      setTime(format(new Date(value), "HH:mm"))
    } else {
      setDate(undefined)
      setTime("")
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate && time) {
      const [hours = 0, minutes = 0] = time.split(":").map(Number)
      selectedDate.setHours(hours)
      selectedDate.setMinutes(minutes)
      onChange?.(selectedDate.toISOString())
    } else if (selectedDate) {
      // Default to end of day if no time is selected for a flash sale
      selectedDate.setHours(23, 59, 59)
      setTime("23:59")
      onChange?.(selectedDate.toISOString())
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    
    if (date && newTime) {
      const [hours = 0, minutes = 0] = newTime.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      setDate(newDate)
      onChange?.(newDate.toISOString())
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger  
          className={cn(
            "h-12 w-full justify-start text-left font-normal border-transparent bg-muted/40 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/20",
            !date && "text-muted-foreground",
            className,buttonVariants({ variant: "outline" })
          )}>
       
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") + (time ? ` at ${time}` : "") : placeholder}
       
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-xl rounded-2xl overflow-hidden border-border/40" align="start">
        <div className="bg-card">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            
          />
          <div className="p-4 border-t border-border/40 bg-muted/10">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase flex-1">Time</span>
              <Input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="h-8 w-[120px] rounded-lg border-border/40 bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
