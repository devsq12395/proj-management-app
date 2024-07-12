import styles from "./Orgs.module.css";

import OrgsForm from "../components/OrgsForm";

const Orgs = () => {
    return <div className={styles.orgs}>
        <OrgsForm />
    </div>
}

export default Orgs;