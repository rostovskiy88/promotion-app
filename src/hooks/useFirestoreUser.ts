import { useEffect, useState, useCallback } from "react";
import { getUserById } from "../services/userService";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { FirestoreUser } from "../types/user";

export function useFirestoreUser() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);

  const refreshUser = useCallback(async () => {
    if (authUser?.uid) {
      try {
        const userData = await getUserById(authUser.uid);
        setFirestoreUser(userData as FirestoreUser | null);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  }, [authUser?.uid]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return {
    ...firestoreUser,
    refresh: refreshUser
  };
} 