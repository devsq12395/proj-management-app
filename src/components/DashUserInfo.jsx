import { useState, useContext, useEffect } from "react";
import { saveData, loadData } from '../scripts/storage-handler.js';
import styles from "../routes/Dashboard.module.css";
import UserContext from "../context/UserContext";

const Dashboard = () => {
    const { sharedData, setSharedData } = useContext (UserContext);

    return <div className={styles.dashboardUserInfo}>
        <DashTabs />
    </div>
}

export default Dashboard;