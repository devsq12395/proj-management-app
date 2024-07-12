import { useState, useEffect } from "react";
import styles from "./DashTabs.module.css";

const DashTabs = ({ changeDashWindow }) => {
    const [tabData, setTabData] = useState ({
        selTab: ''
    });

    const tabs = ['Projects', 'Members'];

    useEffect (() => {
        changeTab ('Home');
    }, []);

    const changeTab = (tab) => {
        let newTabData = {...tabData, selTab: tab};
        setTabData (newTabData);
        changeDashWindow (tab);
    }

    return <div className={styles.tabs}>
        {tabs.map ((tab) => <button 
            key={`tab-${tab}`} 
            onClick={()=>changeTab(tab)} 
            className={(tabData.selTab === tab) ? 
                `${styles.tabSelected} ${styles.tab}` : 
                `${styles.tabUnselected} ${styles.tab}`}
            >{tab}</button>)}
    </div>
}

export default DashTabs;