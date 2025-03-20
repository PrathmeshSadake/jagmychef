import React, { useState } from "react";
import { atom, useAtom } from "jotai";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// Create jotai atoms for state management
const userNameAtom = atom("");
const userEmailAtom = atom("");
const userPhoneAtom = atom("");
const isFormCompletedAtom = atom(false);
const showDialogAtom = atom(false);

// Custom hook to check if user details are present and control dialog visibility
export const useUserDetails = () => {
  const [userName] = useAtom(userNameAtom);
  const [userEmail] = useAtom(userEmailAtom);
  const [userPhone] = useAtom(userPhoneAtom);
  const [isFormCompleted] = useAtom(isFormCompletedAtom);
  const [, setShowDialog] = useAtom(showDialogAtom);

  // Check if all required details are present
  const areDetailsComplete = () => {
    return (
      userName.trim() !== "" &&
      userEmail.trim() !== "" &&
      userPhone.trim() !== ""
    );
  };

  // Function to open dialog if details are incomplete
  const checkAndOpenDialogIfNeeded = () => {
    const detailsComplete = areDetailsComplete();
    if (!detailsComplete) {
      setShowDialog(true);
    }
    return detailsComplete;
  };

  return {
    userName,
    userEmail,
    userPhone,
    isFormCompleted,
    areDetailsComplete,
    checkAndOpenDialogIfNeeded,
    openDialog: () => setShowDialog(true),
  };
};

const UserInfoForm = () => {
  // Get atoms
  const [userName, setUserName] = useAtom(userNameAtom);
  const [userEmail, setUserEmail] = useAtom(userEmailAtom);
  const [userPhone, setUserPhone] = useAtom(userPhoneAtom);
  const [isFormCompleted, setIsFormCompleted] = useAtom(isFormCompletedAtom);
  const [showDialog, setShowDialog] = useAtom(showDialogAtom);

  // Form validation
  const isFormValid = () => {
    return (
      userName.trim() !== "" &&
      userEmail.trim() !== "" &&
      userPhone.trim() !== ""
    );
  };

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (isFormValid()) {
      setIsFormCompleted(true);
      console.log("Form Data:", { userName, userEmail, userPhone });
    } else {
      setShowDialog(true);
    }
  };

  // Handle dialog save
  const handleDialogSave = () => {
    if (isFormValid()) {
      setIsFormCompleted(true);
      setShowDialog(false);
      console.log("Form Data (from dialog):", {
        userName,
        userEmail,
        userPhone,
      });
    } else {
      // Keep dialog open if fields are still missing
      alert("Please fill all required fields");
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <Card className='shadow-md'>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please provide your contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Full Name</Label>
              <Input
                id='name'
                placeholder='John Doe'
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                type='email'
                placeholder='john@example.com'
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <div className='flex rounded-md overflow-hidden border border-input'>
                <div className='bg-muted px-3 py-2 flex items-center'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                </div>
                <Input
                  id='phone'
                  className='border-0 focus-visible:ring-0'
                  placeholder='+1 (555) 123-4567'
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className='w-full'>
            Submit Information
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog for incomplete form */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Complete Your Information</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {userName === "" && (
              <div className='space-y-2'>
                <Label htmlFor='dialog-name'>Your Name</Label>
                <Input
                  id='dialog-name'
                  placeholder='Enter your full name'
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            )}

            {userEmail === "" && (
              <div className='space-y-2'>
                <Label htmlFor='dialog-email'>Email Address</Label>
                <Input
                  id='dialog-email'
                  type='email'
                  placeholder='Enter your email'
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
            )}

            {userPhone === "" && (
              <div className='space-y-2'>
                <Label htmlFor='dialog-phone'>Phone Number</Label>
                <div className='flex rounded-md overflow-hidden border border-input'>
                  <div className='bg-muted px-3 py-2 flex items-center'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <Input
                    id='dialog-phone'
                    className='border-0 focus-visible:ring-0'
                    placeholder='+1 (555) 123-4567'
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDialogSave} type='button'>
              Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success message when form is completed */}
      {isFormCompleted && (
        <div className='mt-4 p-4 bg-green-50 text-green-700 rounded-md'>
          Information saved successfully!
        </div>
      )}
    </div>
  );
};

export default UserInfoForm;

// import { useUserDetails } from './path-to-user-info-form';

// const AnotherComponent = () => {
//   const { checkAndOpenDialogIfNeeded, userName, userEmail, userPhone } = useUserDetails();

//   const handleAction = () => {
//     // This will check if details are complete and open dialog if needed
//     const detailsComplete = checkAndOpenDialogIfNeeded();

//     if (detailsComplete) {
//       // Proceed with your action that requires user details
//       console.log("User details are complete, proceeding with action");
//       // Use userName, userEmail, userPhone as needed
//     } else {
//       console.log("Dialog opened for user to complete details");
//     }
//   };

//   return (
//     <div>
//       <h2>Another Component</h2>
//       <Button onClick={handleAction}>Perform Action</Button>
//     </div>
//   );
// };
