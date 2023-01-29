import { useContext } from "react";
import MembersContext from "@/context/MembersProvider";

export default function useMembersProvider() {
  const context = useContext(MembersContext)

  if (!context) {
    throw new Error('useMembersProvider must be used within a MembersProvider')
  }
  return context
}
