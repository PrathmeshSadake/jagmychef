import { atom, useAtom } from "jotai";

// Create an atom for dialog state
const isUserFormOpenAtom = atom(false);

export function useUserFormDialog() {
  const [isOpen, setIsOpen] = useAtom(isUserFormOpenAtom);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return {
    isOpen,
    onOpen,
    onClose,
  };
}
