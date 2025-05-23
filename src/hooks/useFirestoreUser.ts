import { useEffect, useState } from "react";
import { getUserById } from "../services/userService";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { FirestoreUser } from "../types/user";

export function useFirestoreUser() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);

  useEffect(() => {
    if (authUser?.uid) {
      getUserById(authUser.uid).then(data => setFirestoreUser(data as FirestoreUser | null));
    }
  }, [authUser?.uid]);

  return firestoreUser;
} 