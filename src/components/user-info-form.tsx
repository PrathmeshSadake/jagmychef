// components/UserDetailsDialog.tsx
"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { userDetailsAtom, UserDetails } from "@/lib/atoms";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setUserDetails({
        name,
        email,
        phoneNumber,
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
                className='w-full'
              />
            </div>
            {errors.phoneNumber && (
              <p className='col-span-3 col-start-2 text-sm text-red-500'>
                {errors.phoneNumber}
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
