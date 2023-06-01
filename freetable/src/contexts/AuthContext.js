import React, { useContext, useState, useEffect } from 'react'
import { auth , firestore } from '../firebase'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}


export function AuthProvider( {children}) {
    const [currentUser, setCurrentUser] = useState()

    async function signup(name, email, password, role) {
        const cred = await auth.createUserWithEmailAndPassword(email, password)
        return await firestore.collection("users").doc(cred.user.uid).set({
            id: cred.user.uid,
            name: name,
            email: cred.user.email,
            role: role,
            banned: "no"
        })
      }

    async function login(email, password) {
        const res = await auth.signInWithEmailAndPassword(email, password);
        const uid = res.user.uid;
        const userDoc = await firestore.collection('users').doc(uid).get();
        return { ...res.user, role: userDoc.data().role , banned: userDoc.data().banned };
    }

    function signout() {
        return auth.signOut();
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
        signup,
        signout
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}