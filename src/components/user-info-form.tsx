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
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserFormDialog } from "@/hooks/user-user-form-hook";

export function UserDetailsDialog() {
  const userFormDialog = useUserFormDialog();
  const [userDetails, setUserDetails] = useAtom(userDetailsAtom);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<Partial<UserDetails>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<UserDetails> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setUserDetails({
        name,
        email,
        phoneNumber,
        date: date ? date : Date.now(),
      });

      userFormDialog.onClose();
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setShowCalendar(false);
  };

  return (
    <Dialog
      open={!userDetails || userFormDialog.isOpen}
      onOpenChange={!userDetails ? () => {} : userFormDialog.onClose}
    >
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
                countries={["US"]}
                defaultCountry='US'
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || "")}
                className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
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
              <Button
                type='button'
                variant='outline'
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </div>
            {errors.date && (
              <p className='col-span-3 col-start-2 text-sm text-red-500'>
                {errors.date}
              </p>
            )}
          </div>

          {/* Inline Calendar - Shows only when showCalendar is true */}
          {showCalendar && (
            <div className='grid grid-cols-4 items-center gap-4'>
              <div className='col-span-3 col-start-2'>
                <div className='border rounded-md p-3 bg-background'>
                  <Calendar
                    mode='single'
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    className='w-full'
                  />
                  <div className='mt-2 flex justify-end'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setShowCalendar(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
