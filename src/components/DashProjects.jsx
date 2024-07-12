import { useState, useContext, useEffect } from "react";
import { addToCollection, searchCollectionForDoc, setDocData } from '../scripts/storage-handler.js';
import { useNavigate } from 'react-router-dom';
import UserContext from "../context/UserContext";

import '../index.css';
import styles from "./DashProjects.module.css";

import InputShared from "./shared/InputShared.jsx";

const DashProjects = () => {
    const navigate = useNavigate();

    const { sharedData, setSharedData } = useContext (UserContext);
    const [ projsData, setProjsData ] = useState ({
        projsList: []
    });
    const [ addProjectShow, setAddProjectShow ] = useState (false);
    const [, forceUpdate] = useState(0);

    useEffect (()=>{
        refreshList ();
    },[]);

    const refreshList = async () => {
        try {
            let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org),
                projs = [];
            
            projs = await Promise.all(orgData[0].projects.map (async (proj) => {
                let getDoc = await searchCollectionForDoc (`projects`, 'id', proj);

                return getDoc[0];
            }));

            const oldState = {...projsData, projsList: projs};
            setProjsData (oldState);
        }catch (error){
            alert (error.message);

            const oldState = {...projsData, projsList: []};
            setProjsData (oldState);
        }
    }

    const showAddProject = (isShow) => {
        setAddProjectShow (isShow);
    }
    
    return <div className={styles.projectsSection}>
        <h1>Projects</h1>
        <button onClick={()=>showAddProject(true)}>Add Project</button>
        <div className={styles.projectsWindow}>
            {projsData.projsList.map ((proj, index) => <Proj key={index} projData={proj} />)}
        </div>

        {(addProjectShow) && <AddProject 
            showAddProject={showAddProject}
            refreshList={refreshList}
        />}
    </div>
}

const Proj = ({ projData }) => {
    const navigate = useNavigate();
    const { sharedData, setSharedData } = useContext (UserContext);

    const btnInfo = () => {
        navigate (`/proj-info/${projData.id}`);
    }

    return <div className={styles.project}>
        <div className={styles.projElemsLeft}>
            <h2>{projData.name}</h2>
            <h4>{projData.summary}
                <br />Deadline: {projData.deadline}
                <br />Status: {projData.status}
            </h4>
        </div>

        <div className={styles.projElemsBtns}>
            <button onClick={btnInfo}>Info</button>
        </div>
    </div>
}

const AddProject = ({ showAddProject, refreshList }) => {
    const { sharedData, setSharedData } = useContext (UserContext);
    const [ addProjData, setAddProjData ] = useState ({
        name: '',
        summary: '',
        deadline: '',
        role: ''
    });

    const changeData = (key, value) => {
        let oldData = {...addProjData};
        oldData [key] = value;
        setAddProjData (oldData);
    }

    const addProject = async () => {
        try {
            let orgData = await searchCollectionForDoc (`orgs`, 'name', sharedData.org);
            let newProj = {
                name: addProjData.name,
                summary: addProjData.summary,
                deadline: addProjData.deadline,
                progress: 0,
                status: 'Ongoing',
                tasks: [],
                members: [{
                    name: sharedData.name,
                    email: sharedData.email,
                    role: addProjData.role,
                    isAdmin: true,
                }]
            };

            let addedProjID = await addToCollection (`projects`, newProj);
            orgData[0].projects.push (addedProjID);

            await setDocData (`orgs`, 'name', sharedData.org, orgData[0]);

            alert (`New project is added!`);

            setAddProjData ({
                name: '',
                summary: '',
                deadline: ''
            });

            showAddProject (false);
            refreshList ();
        } catch (error) {
            alert (`Error on adding project: ${error.message}`);
        }
    }

    return <div className={styles.addProj}>
        <div className={styles.addProjPopup}>
            <h2>Add Project</h2>

            <div className={styles.addProjForm}>
                <InputShared type="text" label="Project Name:" value={addProjData.name} onChange={(e) => changeData ('name', e.target.value)} />
                <InputShared type="text" label="Summary:" value={addProjData.summary} onChange={(e) => changeData ('summary', e.target.value)} />
                <InputShared type="text" label="Your role:" value={addProjData.role} onChange={(e) => changeData ('role', e.target.value)} />
                <InputShared type="date" label="Deadline:" value={addProjData.deadline} onChange={(e) => changeData ('deadline', e.target.value)} />
            </div>

            <div className={styles.addProjFormButtons}>
                <button onClick={addProject}>Add Project</button>
                <button onClick={()=>showAddProject(false)}>Cancel</button>
            </div>
        </div>
    </div>

}

export default DashProjects;