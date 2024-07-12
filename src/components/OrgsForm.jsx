import { useState, useContext, useEffect } from "react";
import { addToCollection, searchCollectionForDoc, setDocData } from '../scripts/storage-handler.js';
import { useNavigate } from 'react-router-dom';
import UserContext from "../context/UserContext";
import '../index.css';
import styles from "../routes/Orgs.module.css";

import InputShared from "./shared/InputShared.jsx";

const OrgsForm = () => {
    const navigate = useNavigate();
    const { sharedData, setSharedData } = useContext (UserContext);

    const [orgData, setOrgData] = useState ({
        nameToJoin: '',
        nameToCreate: '',
        orgsList: [],
        isReady: false
    });
    const [error, setError] = useState(null);

    useEffect (()=>{
        refreshList ();
    },[]);

    const refreshList = async () => {
        try {
            console.log (sharedData.email);
            let usersDoc = await searchCollectionForDoc (`users`, 'email', sharedData.email);
            setOrgData ({...orgData, orgsList: [...usersDoc[0].orgs], isReady: true});
        } catch (error) {
            alert (error.message);
        }
    }
    
    const changeOrgData = (key, value) => {
        let oldData = {...orgData};
        oldData [key] = value;
        setOrgData (oldData);
    }

    const setTheError = (newError) => {
        setError (newError);
        alert (newError);
    }

    const submit = async (mode) => {
        let checkDocData, docDataFromDB, userDoc;

        switch (mode) {
            case "create":
                try {
                    checkDocData = await searchCollectionForDoc (`orgs`, 'name', orgData.nameToCreate);
                    if (checkDocData.length >= 1) {
                        setTheError (`Error on creating new organization: This organization already exists in the database.`);
                        return;
                    }

                    await addToCollection (`orgs`, {
                        name: orgData.nameToCreate,
                        projects: [],
                        members: [{
                            email: sharedData.email,
                            role: "admin"
                        }],
                        memberRequests: []
                    });

                    setSharedData ({...sharedData, 
                        org: orgData.nameToCreate
                    });

                    userDoc = await searchCollectionForDoc (`users`, 'email', sharedData.email);
                    userDoc[0].orgs.push (orgData.nameToCreate);
                    await setDocData (`users`, 'email', sharedData.email, userDoc[0]);

                    alert (`New organization created!`);
                    navigate ("/dashboard");
                } catch (error) {
                    setError (error.message);
                    alert (`Error on creating new organization: ${error.message}`);
                }
                break;

            case "login":
                try {
                    if (orgData.nameToJoin === '') {
                        alert (`Error on login: The organization does not exist in the database.`);
                        return;
                    }

                    checkDocData = await searchCollectionForDoc (`orgs`, 'name', orgData.nameToJoin);
                    if (checkDocData.length < 1) {
                        alert (`Error on login: The organization does not exist in the database.`);
                        return;
                    }

                    docDataFromDB = checkDocData [0];
                    let isFound = false;
                    docDataFromDB.members.forEach ((mem) => {
                        if (mem.email === sharedData.email) {
                            isFound = true;
                        }
                    });
                    if (!isFound) {
                        alert (`Error on login: You are not a member of the organization.`);
                        return;
                    }

                    console.log (orgData.nameToJoin);
                    setSharedData ({...sharedData, 
                        org: orgData.nameToJoin
                    });

                    alert (`Log-in success!`);
                    navigate ("/dashboard");
                } catch (error) {
                    setError (error.message);
                    alert (`Error on login: ${error.message}`);
                }
                break;

            case "join-request":
                try {
                    checkDocData = await searchCollectionForDoc (`orgs`, 'name', orgData.nameToCreate);
                    if (checkDocData.length < 1) {
                        alert (`Error on join request: The organization does not exist in the database.`);
                        return;
                    }

                    await setDocData (`orgs`, `name`, orgData.nameToCreate,
                        {memberRequests: [sharedData.email]}
                    );

                    alert (`Join request submitted!`);
                } catch (error) {
                    setError (error.message);
                    alert (`Error on join request: ${error.message}`);
                }
                break;
        }
    }

    return <div className={styles.orgsForm}>
        {(!orgData.isReady) ? <>
            <h3>Loading...</h3>
        </> : <>
            <div className={styles.orgsFormInputs}>
                <InputShared 
                    type="dropdown"
                    label="Organizations Joined:"
                    value={orgData.nameToJoin}
                    onChange={(e) => changeOrgData ('nameToJoin', e.target.value)}
                    options={['', ...orgData.orgsList.map ((org)=>{
                        return {value: org, label: org}
                    })]}
                />
            </div>
            <div className={styles.orgsFormButtons}>
                <button onClick={() => submit ("login")}>Log In on Existing Org</button>
                <button onClick={refreshList}>Refresh List</button>
            </div>
            
            <div className={styles.orgsFormInputs}>
                <h3>Create a new Organization:</h3>
                <input type="text" value={orgData.nameToCreate} onChange={(e) => {changeOrgData ('nameToCreate', e.target.value)}} />
            </div>
            <div className={styles.orgsFormButtons}>
                <button onClick={() => submit ("create")}>Create the Org</button>
                <button onClick={() => submit ("join-request")}>Request to Join</button>
            </div>
        </>}

        {error && <p>{error}</p>}
    </div>
}

export default OrgsForm;