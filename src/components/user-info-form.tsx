// components/UserDetailsDialog.tsx
"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { userDetailsAtom, UserDetails } from "@/lib/atoms";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function UserDetailsDialog({
  isOpen,
  onClose,
  onSave,
}: UserDetailsDialogProps) {
  const [userDetails, setUserDetails] = useAtom(userDetailsAtom);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [errors, setErrors] = useState<Partial<UserDetails & { time: string }>>(
    {}
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = ["00", "15", "30", "45"];

  const validateForm = (): boolean => {
    const newErrors: Partial<UserDetails & { time: string }> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!date) {
      newErrors.date = "Date is required";
    }

    if (!time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setUserDetails({
        name,
        email,
        phoneNumber,
        date: date ? format(date, "yyyy-MM-dd") : "",
        time,
      });
      onSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Your Details</DialogTitle>
          <DialogDescription>
            Please provide your details to continue.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='col-span-3'
            />
            {errors.name && (
              <p className='col-span-3 col-start-2 text-sm text-red-500'>
                {errors.name}
              </p>
            )}
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='email' className='text-right'>
              Email
            </Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='col-span-3'
            />
            {errors.email && (
              <p className='col-span-3 col-start-2 text-sm text-red-500'>
                {errors.email}
              </p>
            )}
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='phone' className='text-right'>
              Phone
            </Label>
            <div className='col-span-3'>
              <PhoneInput
                international
                defaultCountry='US'
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                className={
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                }
              />
            </div>
            {errors.phoneNumber && (
              <p className='col-span-3 col-start-2 text-sm text-red-500'>
                {errors.phoneNumber}
              </p>
            )}
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='date' className='text-right'>
              Date
            </Label>
            <div className='col-span-3'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.date && (
              <p className='col-span-3 col-start-2 text-sm text-red-500'>
                {errors.date}
              </p>
            )}
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='time' className='text-right'>
              Time
            </Label>
            <div className='col-span-3'>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a time'>
                    <div className='flex items-center'>
                      {time ? (
                        <>
                          <Clock className='mr-2 h-4 w-4' />
                          {time}
                        </>
                      ) : (
                        "Select a time"
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) =>
                    minutes.map((minute) => {
                      const formattedHour = hour.toString().padStart(2, "0");
                      const timeString = `${formattedHour}:${minute}`;
                      return (
                        <SelectItem key={timeString} value={timeString}>
                          {timeString}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            {errors.time && (
              <p className='col-span-3 col-start-2 text-sm text-red-500'>
                {errors.time}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
