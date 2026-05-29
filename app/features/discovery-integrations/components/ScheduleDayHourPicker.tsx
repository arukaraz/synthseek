"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";

import {
  scheduleDayChip,
  scheduleHourChip,
  scheduleHourGrid,
  schedulePickerContent,
  schedulePickerSection,
  schedulePickerSectionLabel,
  schedulePickerTrigger,
} from "../styles";
import type { DayOfWeek, ScheduleDayHourPickerProps } from "../types";
import { DAY_OPTIONS, HOUR_OPTIONS } from "./constants";
import { describeSchedule, pad } from "./helpers";

export function ScheduleDayHourPicker({ value, onChange, disabled }: ScheduleDayHourPickerProps) {
  const [open, setOpen] = useState(false);

  const setDay = (dayOfWeek: DayOfWeek) => {
    onChange({ ...value, dayOfWeek });
  };

  const setHour = (hour: number) => {
    onChange({ ...value, hour });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={schedulePickerTrigger()} disabled={disabled}>
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{describeSchedule(value)}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={schedulePickerContent()}>
        <div className={schedulePickerSection()}>
          <span className={schedulePickerSectionLabel()}>Day</span>
          <div className="grid grid-cols-4 gap-1.5">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                className={scheduleDayChip({ selected: value.dayOfWeek === opt.value })}
                onClick={() => setDay(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={schedulePickerSection()}>
          <span className={schedulePickerSectionLabel()}>Hour</span>
          <div className={scheduleHourGrid()}>
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                className={scheduleHourChip({ selected: value.hour === h })}
                onClick={() => setHour(h)}
              >
                {pad(h)}:00
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
