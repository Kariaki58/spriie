"use client"

import * as React from "react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CSS_COLOR_NAMES } from "@/utils/css-color-names"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [color, setColor] = React.useState(value)
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setColor(value)
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      setColor(newValue)
    } else if (CSS_COLOR_NAMES.includes(newValue.toLowerCase())) {
      setColor(newValue)
    }
  }

  const handleApply = () => {
    if (/^#[0-9A-F]{6}$/i.test(inputValue) || CSS_COLOR_NAMES.includes(inputValue.toLowerCase())) {
      onChange(inputValue)
      setColor(inputValue)
    } else {
      setInputValue(color)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[60px] h-[34px] p-1 rounded-md border-2 border-input"
          >
            <div
              className="w-full h-full rounded-sm"
              style={{ backgroundColor: color }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <HexColorPicker color={color} onChange={(newColor) => {
            setColor(newColor)
            setInputValue(newColor)
          }} />
          <div className="mt-2 flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              className="w-24"
              placeholder="Color name or hex"
            />
            <Button
              size="sm"
              onClick={handleApply}
              className="shrink-0"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}