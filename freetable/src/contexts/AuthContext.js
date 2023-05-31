import React, { useContext, useState, useEffect } from 'react'
import { auth , firestore } from '../firebase'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}


export function AuthProvider( {children}) {
    const [currentUser, setCurrentUser] = useState()

    function signup(email, password, role) {
        return auth.createUserWithEmailAndPassword(email, password).then((cred) => {
          return firestore.collection("users").doc(cred.user.uid).set({
            email: cred.user.email,
            role: role 
          });
        });
      }

    async function login(email, password) {
        const res = await auth.signInWithEmailAndPassword(email, password);
        const uid = res.user.uid;
        const userDoc = await firestore.collection('users').doc(uid).get();
        return { ...res.user, role: userDoc.data().role };
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
        })

        return unsubscribe
    }, [])
    

    const value = {
        currentUser,
        login,
        signup
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}