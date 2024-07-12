import { useState, useContext, useEffect } from "react";
import { auth } from '../scripts/firebase.js'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { addToCollection, searchCollectionForDoc, setDocData } from '../scripts/storage-handler.js';
import { useNavigate } from 'react-router-dom';
import UserContext from "../context/UserContext";
import styles from "../routes/Login.module.css";

const LoginForm = () => {
    const navigate = useNavigate();
    const { sharedData, setSharedData } = useContext (UserContext);

    useEffect(() => {
        console.log("sharedData updated:", sharedData);
    }, [sharedData]);

    const [userData, setUserData] = useState ({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState(null);

    const changeUserData = (key, value) => {
        let oldData = {...userData};
        oldData [key] = value;
        setUserData (oldData);
    }

    const submit = async (mode) => {
        try {
            let userExistsCheck = await searchCollectionForDoc (`users`, `email`, userData.email);

            let userCredential;

            switch (mode) {
                case "login":
                    if (userExistsCheck.length < 1) {
                        alert (`ERROR: User does not exist.`);
                        return;
                    }
                    userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);

                    alert (`Login success!`);
                    break;
                case "signup":
                    if (userExistsCheck.length >= 1) {
                        alert (`ERROR: This email is already being used.`);
                        return;
                    }

                    userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                    await addToCollection (`users`, {
                        name: userData.name,
                        email: userData.email,
                        projects: [],
                        tasks: [],
                        orgs: [],
                        invites: []
                    });

                    alert (`Signup success!`);
                    break;
            }
            
            let docUser = await searchCollectionForDoc ('users', 'email', userCredential.user.email);

            console.log (userCredential.user.email);
            setSharedData ({...sharedData, 
                email: userCredential.user.email, 
                name: docUser[0].name
            });
            navigate ("/orgs");
        } catch (error) {
            setError (error.message);
            alert (`Login error: ${error.message}`);
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);

            setSharedData ({...sharedData, 
                email: userCredential.user.email, 
                name: userCredential.user.displayName
            });

            let userExistsCheck = await searchCollectionForDoc (`users`, `email`, userCredential.user.email);
            if (userExistsCheck.length < 1) {
                await addToCollection (`users`, {
                    name: userCredential.user.displayName,
                    email: userCredential.user.email,
                    projects: [],
                    tasks: [],
                    orgs: [],
                    invites: []
                });
            }

            console.log (userCredential.user);
            alert(`Google login success!`);
            navigate ("/orgs");
        } catch (error) {
            setError(error.message);
            alert(`Google login error: ${error.message}`);
        }
    }

    return <div className={styles.loginForm}>
        <div className={styles.loginFormInputs}>
            <h3>Name:</h3>
            <input type="text" value={userData.name} onChange={(e) => changeUserData ('name', e.target.value)} />

            <h3>Email:</h3>
            <input type="email" value={userData.email} onChange={(e) => changeUserData ('email', e.target.value)} />

            <h3>Password:</h3>
            <input type="password" value={userData.password} onChange={(e) => changeUserData ('password', e.target.value)} />
        </div>

        <div className={styles.loginFormButtons}>
            <button onClick={() => submit ("login")}>Log In</button>
            <button onClick={() => submit ("signup")}>Sign Up</button>
            <button onClick={handleGoogleLogin}>Google Login</button>
        </div>

        {error && <p>{error}</p>}
    </div>
}

export default LoginForm;