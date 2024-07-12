import { useContext, useState } from "react";
import UserContext from "./UserContext";

const UserContextProvider = ({ children }) => {
    const [sharedData, setSharedData] = useState ({
        email: '',
        name: '',

        org: '',
        projId: ''
    });

    return (
        <UserContext.Provider value={{sharedData, setSharedData}} >
            { children }
        </UserContext.Provider>
    )
}

export default UserContextProvider;