import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext";
import ProjInfoDetails from "../components/proj-info/ProjInfoDetails";

import '../index.css';
import styles from "./ProjInfo.module.css";

const ProjInfo = () => {
    const { projID } = useParams();
    const { sharedData, setSharedData } = useContext (UserContext);

    useEffect (()=>{
        
    }, []);

    return <div className={styles.projInfo}>
        <ProjInfoDetails projId={projID}/>
    </div>
}

export default ProjInfo;