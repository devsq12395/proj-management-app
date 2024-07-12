import { useState, useContext, useEffect } from "react";
import UserContext from "../context/UserContext";

import '../index.css';
import styles from "../routes/Dashboard.module.css";

import DashTabs from "../components/DashTabs.jsx";
import DashProjects from "../components/DashProjects.jsx";
import DashMembers from "../components/DashMembers.jsx";
import DashNotifs from "../components/DashNotifs.jsx";



const Dashboard = () => {
    const { sharedData, setSharedData } = useContext (UserContext);
    const [ dashData, setDashData ] = useState ({
        openTab: '',
        marginLeft: 0
    });

    const changeDashWindow = (input) => {
        let oldDashData = {...dashData, openTab: input};
        setDashData (oldDashData);
    }

    return <div className={styles.dashboard}>
        <div className={styles.dashHeader}>
            <h1>Welcome, {sharedData.name}</h1>
            <h3>Org: {sharedData.org}</h3>
        </div>

        <DashTabs changeDashWindow={changeDashWindow}/>

        <div className={styles.dashWindows}>
            {(dashData.openTab === 'Projects') && <DashProjects />}
            {(dashData.openTab === 'Members') && <DashMembers />}
            {(dashData.openTab === 'Notifications') && <DashNotifs />}

        </div>
    </div>
}

export default Dashboard;