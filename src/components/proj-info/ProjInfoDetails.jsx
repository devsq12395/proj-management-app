import { useState, useContext, useEffect } from "react";
import { addToCollection, searchCollectionForDoc, setDocData } from '../../scripts/storage-handler.js';
import { useNavigate } from 'react-router-dom';
import UserContext from "../../context/UserContext";

import TaskList from "./TaskList.jsx";

import '../../index.css';
import styles from "./ProjInfoDetails.module.css";

const ProjInfoDetails = ({ projId }) => {
    const navigate = useNavigate();

    const { sharedData, setSharedData } = useContext (UserContext);
    const [ projInfoData, setProjInfoData ] = useState ({
        isReady: false,
        projData: []
    });
    const [ error, setError ] = useState ('');

    useEffect (()=>{
        getData ();
    }, [projId]);

    const getData = async () => {
        try {
            let projData = await searchCollectionForDoc (`projects`, 'id', projId);

            setProjInfoData ({
                projData: projData[0],
                isReady: true
            });
        } catch (error) {
            alert (error.message);
            setError (error.message);
        }
    }

    const btnBack = () => {
        navigate ("/dashboard");
    }

    return <div className={styles.projInfo}>
        {(projInfoData.isReady) ? <>
            <div className={styles.projInfoSection}>
                <div className={styles.projInfoSectionLeft}>
                    <h1>{projInfoData.projData.name}</h1>
                    <h2>{projInfoData.projData.summary}</h2>
                    <h2>Deadline: {projInfoData.projData.deadline}</h2>
                    <h2>Status: {projInfoData.projData.status}</h2>
                </div>
                
                <div className={styles.projInfoSectionBtns}>
                    <button onClick={btnBack}>Back to Dashboard</button>
                </div>
            </div>

            <TaskList />
        </> : <>
            {(error.length > 1) ? <>
                <h3>Error: {error}</h3>
            </> : <>
                <h3>Loading...</h3>
            </>}
        </>}
        
    </div>
}

export default ProjInfoDetails;