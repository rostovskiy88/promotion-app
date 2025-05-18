import { useEffect, useState } from "react";
import { getUserById } from "../services/userService";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export function useFirestoreUser() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [firestoreUser, setFirestoreUser] = useState<any>(null);

  useEffect(() => {
    if (authUser?.uid) {
      getUserById(authUser.uid).then(setFirestoreUser);
    }
  }, [authUser?.uid]);

  return firestoreUser;
} 