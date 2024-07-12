import { useState, useContext, useEffect } from "react";
import { addToCollection, searchCollectionForDoc, setDocData } from '../scripts/storage-handler.js';
import { useNavigate } from 'react-router-dom';
import UserContext from "../context/UserContext";

import InputShared from "./shared/InputShared.jsx";

import '../index.css';
import styles from "./DashMembers.module.css";

const DashMembers = () => {
    const navigate = useNavigate();

    const { sharedData, setSharedData } = useContext (UserContext);
    const [ inviteMemShow, setInviteMemShow ] = useState (false);
    const [ memsData, setMemsData ] = useState ({
        memsList: [],
        memReqList: [],
        isAdmin: false
    });
    const [, forceUpdate] = useState(0);

    useEffect (()=>{
        refreshList ();
    },[]);

    const refreshList = async () => {
        try {
            let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org),
                mems = [], memReqs = [];
            
            mems = await Promise.all(orgData[0].members.map (async (mem) => {
                let getDoc = await searchCollectionForDoc (`users`, 'email', mem.email);

                return getDoc[0];
            }));

            memReqs = await Promise.all(orgData[0].memberRequests.map (async (memReq) => {
                let getDoc = await searchCollectionForDoc (`users`, 'email', memReq);

                return {
                    name: getDoc[0].name,
                    email: memReq
                };
            }));
            
            let _isAdmin = false;
            orgData[0].members.forEach ((mem) => {
                
                if (mem.email === sharedData.email) {
                    _isAdmin = (mem.role === 'admin');
                }
            });
            setMemsData ({...memsData, memsList: mems, memReqList: memReqs, isAdmin: _isAdmin});
        }catch (error){
            alert (error.message);

            setMemsData ({...memsData, memsList: [], memReqList: []});
        }
    }

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

    const showInviteNewMember = (isShow) => {
        setInviteMemShow (isShow);
    }
    
    return <div className={styles.memsSection}>
        <h3>Members</h3>
        <button onClick={()=>showInviteNewMember(true)}>Add a new member</button>
        <div className={styles.memsWindow}>
            {memsData.memsList.map ((memData, index) => <Member key={index} memData={memData} />)}
        </div>

        {(memsData.isAdmin) && <>
            <h3>Member Requests</h3>
            <div className={styles.memsWindow}>
                {memsData.memReqList.map ((memData, index) => <MemberReq key={index} memData={memData} refreshList={refreshList} />)}
            </div>
        </>}

        {(inviteMemShow) && <InviteMemPopup showInviteNewMember={showInviteNewMember} refreshList={refreshList}/>}
    </div>
}

const InviteMemPopup = ({ showInviteNewMember, refreshList }) => {
    const { sharedData, setSharedData } = useContext (UserContext);
    const [ memDetails, setMemDetails] = useState ({
        eMail: ''
    });

    const changeData = (key, value) => {
        let oldData = {...memDetails};
        oldData [key] = value;
        setMemDetails (oldData);
    }

    const btnInvite = async () => {
        try {
            let usersDoc = await searchCollectionForDoc (`users`, 'email', memDetails.eMail);
            if (usersDoc.length <= 0) {
                alert ("Error: This user does not exist");
                showInviteNewMember (false);
                return;
            }
            let orgs = [...usersDoc[0].orgs];
            orgs.push (sharedData.org);
            usersDoc[0].orgs = orgs;

            await setDocData (`users`, 'email', memDetails.eMail, usersDoc[0]);

            let orgDoc = await searchCollectionForDoc (`orgs`, 'name', sharedData.org);
            orgDoc[0].members.push ({
                email: memDetails.eMail,
                role: "member"
            });
            await setDocData (`orgs`, 'name', sharedData.org, orgDoc[0]);

            alert ("User added!");
            refreshList ();

        }catch (error) {
            alert (error.message);
        }
        showInviteNewMember (false);
    }

    const btnCancel = () => {
        showInviteNewMember (false);
    }

    return <div className={styles.inviteMem}>
        <div className={styles.inviteMemPopup}>
            <div className={styles.inviteMemForm}>
                <InputShared 
                    type="text" 
                    label="User to add's Email:"
                    value={memDetails.eMail}
                    onChange={(e)=>changeData("eMail", e.target.value)}
                />
            </div>

            <div className={styles.inviteMemFormButtons}>
                <button onClick={btnInvite}>Add</button>
                <button onClick={btnCancel}>Cancel</button>
            </div>
        </div>
    </div>
}

const Member = ({ memData }) => {
    const navigate = useNavigate();
    const { sharedData, setSharedData } = useContext (UserContext);

    return <div className={styles.member}>
        <h2>{memData.name}</h2>
        <h3>{memData.email}</h3>
    </div>
}

const MemberReq = ({ memData, refreshList }) => {
    const navigate = useNavigate();
    const { sharedData, setSharedData } = useContext (UserContext);

    const btnAccept = async () => {
        try {
            console.log (sharedData.org);
            let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org),
                reqIndex = orgData[0].memberRequests.indexOf (memData.email);

            orgData[0].memberRequests.splice (reqIndex, 1);
            orgData[0].members.push ({
                email: memData.email,
                role: "member"
            });

            await setDocData (`orgs`, 'name', sharedData.org, orgData[0]);

            alert ('Member request accepted!');
            refreshList ();
        } catch (error) {
            alert (error.message);
        }
    }

    const btnDecline = async () => {
        try {
            console.log (sharedData.org);
            let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org),
                reqIndex = orgData[0].memberRequests.indexOf (memData.email);

            orgData[0].memberRequests.splice (reqIndex, 1);

            await setDocData (`orgs`, 'name', sharedData.org, orgData[0]);

            alert ('Member request declined!');
            refreshList ();
        } catch (error) {
            alert (error.message);
        }
    }

    return <div className={styles.memberReq}>
        <h2>{memData.name}</h2>
        <h3>{memData.email}</h3>

        <button onClick={btnAccept}>Accept</button>
        <button onClick={btnDecline}>Decline</button>
    </div>
}


export default DashMembers;