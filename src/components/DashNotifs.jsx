import { useState, useContext, useEffect } from "react";
import { addToCollection, searchCollectionForDoc, setDocData } from '../scripts/storage-handler.js';
import UserContext from "../context/UserContext";
import styles from "./DashNotifs.module.css";

const DashNotifs = () => {
    const { sharedData, setSharedData } = useContext (UserContext);
    const [ notifsData, setNotifsData ] = useState ({
        notifsList: [],
        membersRequest: []
    });

    useEffect (()=>{
        refreshList ();
    },[]);

    const refreshList = async () => {
        try {
            let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org),
                memRequests = [], names = [];
            
            memRequests = await Promise.all(orgData[0].memberRequests.map (async (memReq) => {
                let getDoc = await searchCollectionForDoc (`users`, 'email', memReq);

                return {
                    name: getDoc[0].name,
                    email: memReq
                };
            }));
            
            setNotifsData ({...notifsData, membersRequest: memRequests});
        }catch (error){
            alert (error.message);

            setNotifsData ({...notifsData, membersRequest: []});
        }
    }

    return <div className={styles.notifsSection}>
        <h1>Notifications</h1>
        <div className={styles.notifsWindow}>
            {notifsData.membersRequest.map ((req, index) => <Notif 
            key={index} 
            notifType="mem-request" 
            email={req.email} 
            name={req.name} 
            refreshList={refreshList}
        />)}
        </div>
    </div>
}

const Notif = ({ notifType, email, name, refreshList }) => {
    const { sharedData, setSharedData } = useContext (UserContext);

    const memRequest_btnAccept = async () => {
        try {
            let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org),
                reqIndex = orgData[0].memberRequests.indexOf (email);

            orgData[0].memberRequests.splice (reqIndex, 1);
            orgData[0].members.push (email);

            await setDocData (`orgs`, 'name', sharedData.org, orgData[0]);

            alert ('Member request accepted!');
            refreshList ();
        } catch (error) {
            alert (error.message);
        }
    }

    return <div className={styles.notif}>
        {(notifType === "mem-request") && <>
            <h4>{name} is requesting to become a member of your organization {sharedData.org}.</h4>
            <button onClick={memRequest_btnAccept}>Accept</button>
        </>}
    </div>
}

export default DashNotifs;