import { useState, useEffect } from "react";
import { addToCollection, searchCollectionForDoc, setDocData } from '../../scripts/storage-handler.js';
import { useParams } from 'react-router-dom';
import styles from "./CheckTask.module.css";
import InputShared from "../shared/InputShared";

const CheckTask = ({ taskData, showCheckTask, refreshMainList }) => {
    const { projID } = useParams();
    const [ checkTaskData, setCheckTaskData ] = useState ({
        endDate: '',
        status: ''
    });

    useEffect (()=>{
        setCheckTaskData ({
            ...checkTaskData,
            endDate: taskData.endDate,
            status: taskData.status
        })
    },[]);

    const update = async () => {
        try {
            if (Object.keys (checkTaskData).some (key => checkTaskData[key] === '')){
                alert ('Invalid input. Please check your inputs.');
                return;
            }

            let projDoc = await searchCollectionForDoc (`projects`, 'id', projID);

            let taskDoc = projDoc[0].tasks.find ((task) => task.name === taskData.name);
            let taskIndex = projDoc[0].tasks.indexOf (taskDoc);
            if (taskDoc) {
                taskDoc.endDate = checkTaskData.endDate;
                taskDoc.status = checkTaskData.status;

                projDoc[0].tasks [taskIndex] = taskDoc;

                await setDocData (`projects`, 'id', projID, projDoc[0]);

                alert ("Task details are updated.");
                refreshMainList ();
                showCheckTask (false);
            } else {
                alert (`ERROR: Task ${taskData.name} not found!`);
            }
        } catch (error) {
            alert (error.message);
        }
    }

    const changeData = (key, value) => {
        let oldData = {...checkTaskData};
        oldData [key] = value;
        setCheckTaskData (oldData);
    }

    return <div className={styles.checkTask}>
        <div className={styles.checkTaskPopup}>
            <h2>{taskData.name}</h2>
            <h3>{taskData.desc}</h3>

            <h3>Assignee: {taskData.assignee}</h3>
            <h3>Start Date: {taskData.startDate}</h3>
            
            <InputShared 
                type="date"
                label="End Date: "
                value={checkTaskData.endDate}
                onChange={(e)=>changeData("endDate", e.target.value)}
            />
            <InputShared 
                type="dropdown"
                label="Status: "
                value={checkTaskData.status}
                onChange={(e)=>changeData("status", e.target.value)}
                options={[
                    {value: '', label: ''}, 
                    {value: "Ongoing", label: "Ongoing"},
                    {value: "Paused", label: "Paused"},
                    {value: "Completed", label: "Completed"},
                ]}
            />

            <button onClick={update}>Update</button>
            <button onClick={()=>showCheckTask(false)}>Back</button>
        </div>
    </div>
}

export default CheckTask;