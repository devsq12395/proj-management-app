import { useState, useContext, useEffect, useReducer } from "react";
import { addToCollection, searchCollectionForDoc, setDocData } from '../../scripts/storage-handler.js';
import { useNavigate, useParams } from 'react-router-dom';
import UserContext from "../../context/UserContext";

import CheckTask from "./CheckTask.jsx";

import '../../index.css';
import styles from "./TaskList.module.css";

import InputShared from "../shared/InputShared.jsx";
import { taskReducer } from "../../reducers/taskReducer.js";

const taskListToShowInit = [];
const taskFilters = ['All', 'Assigned to Me'];

const TaskList = () => {
    const [taskListToShow, dispatch] = useReducer (taskReducer, taskListToShowInit);
    const { projID } = useParams();
    const navigate = useNavigate();

    const { sharedData, setSharedData } = useContext (UserContext);
    const [ taskInfoData, setTaskInfoData ] = useState ({
        taskList: [],
        assigneeList: [],
        isReady: false,
        showType: 'All'
    });
    const [ addTaskShow, setAddTaskShow ] = useState (false);
    const [ checkTaskState, setCheckTask ] = useState ({
        isShow: false,
        taskData: null
    });
    const [ error, setError ] = useState ('');
    const [, forceUpdate] = useState (0);

    useEffect (()=>{
        getData ();
    }, [projID]);

    const getData = async () => {
        try {
            let projData = await searchCollectionForDoc (`projects`, 'id', projID);

            setTaskInfoData ({
                ...taskInfoData,
                taskList: [...projData[0].tasks],
                isReady: true
            });

            dispatch ({type: "FILTER", payload: {
                type: taskInfoData.showType,
                list: projData[0].tasks,
                myEmail: sharedData.email
            }});
        } catch (error) {
            alert (error.message);
            setError (error.message);
        }
    }

    const showAddTask = async (isShow) => {
        let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org);
        let memEmails = orgData[0].members.map ((memData) => memData.email);

        let usersData = await Promise.all (memEmails.map (async (memEmail) => {
            let getDoc = await searchCollectionForDoc (`users`, 'email', memEmail);
            return getDoc[0];
        }));

        setTaskInfoData ({
            ...taskInfoData,
            assigneeList: usersData
        });

        setAddTaskShow (isShow);
    }

    const showCheckTask = (isShow, taskData) => {
        setCheckTask ({...checkTaskState, isShow, taskData});
    }

    const changeData = (key, value) => {
        let oldData = {...taskInfoData};
        oldData [key] = value;
        setTaskInfoData (oldData);
    }

    const changeShowFilter = async (filterType) => {
        try {
            let projData = await searchCollectionForDoc (`projects`, 'id', projID);

            changeData("showType", filterType);
            dispatch ({type: "FILTER", payload: {
                type: filterType,
                list: projData[0].tasks,
                myEmail: sharedData.email
            }});
        } catch (error) {
            alert (error.message);
        }
    }

    return <div className={styles.taskListWindow}>
        <h1>Progress Tracker</h1>

        <div className={styles.taskListWindowBtns}>
            <button onClick={()=>showAddTask (true)}>Add Task</button>
            <button onClick={getData}>Refresh</button>
            <InputShared 
                type="dropdown"
                label="Show:"
                value={taskInfoData.showType}
                onChange={(e)=>changeShowFilter(e.target.value)}
                options={taskFilters.map ((opt) => {
                    return {value: opt, label: opt}
                })}
            />
        </div>

        <div className={styles.taskList}>
            {(taskInfoData.isReady) ? <>
                {taskListToShow.map ((task, index) => <Task 
                    key={index} 
                    taskData={task} 
                    showCheckTask={showCheckTask}
                />)}
            </> : <>
                <h3>Loading...</h3>
            </>}
        </div>

        {(addTaskShow) && <AddTask 
            showAddTask={showAddTask} 
            getData={getData} 
            assigneeList={taskInfoData.assigneeList} 
        />}
        {(checkTaskState.isShow) && <CheckTask 
            taskData={checkTaskState.taskData}
            showCheckTask={showCheckTask}
            refreshMainList={getData}
        />}
    </div>
}

const Task = ({ taskData, showCheckTask }) => {
    return <div className={styles.taskListEntry}>
        <div className={styles.taskListEntryTextElems}>
            <div className={styles.taskListEntryLeftElems}>
                <h2>{taskData.name}</h2>
                <h3>{taskData.desc}</h3>
            </div>
            <div className={styles.taskListEntryRightElems}>
                <h4>Assignee: {taskData.assignee}</h4>
                <h4>Start Date: {taskData.startDate}</h4>
                <h4>End Date: {taskData.endDate}</h4>
                <h4>Status: {taskData.status}</h4>
            </div>
        </div>
        <div className={styles.taskListEntryBtns}>
            <button onClick={()=>showCheckTask(true, taskData)}>Check/Edit Task</button>
        </div>
    </div>
}

const AddTask = ({ showAddTask, getData, assigneeList }) => {
    const { projID } = useParams();
    const { sharedData, setSharedData } = useContext (UserContext);
    const [ addProjData, setAddProjData ] = useState ({
        name: '',
        desc: '',
        assignee: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const changeData = (key, value) => { 
        let oldData = {...addProjData};
        oldData [key] = value;
        setAddProjData (oldData);
    }

    const addTask = async () => {
        try {
            if (Object.keys (addProjData).some (key => addProjData[key] === '')){
                alert ('Invalid input. Please check your inputs.');
                return;
            }

            let projDoc = await searchCollectionForDoc (`projects`, 'id', projID);
            console.log (addProjData);
            let newTask = {...addProjData};
            
            projDoc[0].tasks.push (newTask);

            await setDocData (`projects`, 'id', projID, projDoc[0]);

            alert (`New task is added!`);
            showAddTask (false);
            getData ();
        } catch (error) {
            alert (`Error on adding task: ${error.message}`);
        }
    }

    return <div className={styles.addTask}>
        <div className={styles.addTaskPopup}>
            <h2>Add Task</h2>

            <div className={styles.addTaskForm}>
                <h3>Task Name:</h3>
                <input type="text" value={addProjData.name} onChange={(e) => changeData ('name', e.target.value)} />

                <h3>Task Description:</h3>
                <input type="text" value={addProjData.summary} onChange={(e) => changeData ('desc', e.target.value)} />

                <InputShared type="dropdown" label="Assignee:" value={addProjData.assignee} 
                    onChange={(e) => changeData ('assignee', e.target.value)}
                    options={[{value: '', label: ''}, ...assigneeList.map ((assignee) => {
                        return {value: assignee.email, label: `${assignee.name} (${assignee.email})`}
                    })]}
                />

                <InputShared type="dropdown" label="Status:" value={addProjData.status} 
                    onChange={(e) => changeData ('status', e.target.value)}
                    options={[
                        {value: '', label: ''}, 
                        {value: "Ongoing", label: "Ongoing"},
                        {value: "Paused", label: "Paused"},
                        {value: "Completed", label: "Completed"},
                    ]}
                />

                <h3>Start Date:</h3>
                <input type="date" value={addProjData.startDate} onChange={(e) => changeData ('startDate', e.target.value)} />

                <h3>End Date:</h3>
                <input type="date" value={addProjData.endDate} onChange={(e) => changeData ('endDate', e.target.value)} />
            </div>

            <div className={styles.addTaskFormButtons}>
                <button onClick={addTask}>Add Task</button>
                <button onClick={()=>showAddTask (false)}>Cancel</button>
            </div>
        </div>
    </div>

}

export default TaskList;
