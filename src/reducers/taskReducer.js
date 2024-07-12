export const taskReducer = (state, action) => {
    let list = action.payload.list;

    switch (action.type){
        case "FILTER":
            switch (action.payload.type) {
                case "All":
                    return [...list];
                case "Assigned to Me":
                    return list.filter ((task) => task.assignee === action.payload.myEmail);
            }
            break;
    }
}