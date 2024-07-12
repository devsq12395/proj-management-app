

import styles from "./InputShared.css";

const InputShared = ({type, label, value, onChange, options}) => {

    const renderInput = () => {
        if (type === "dropdown" && options && options.length > 0) {
            return (
                <select value={value} onChange={onChange}>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        } else {
            return <input type={type} value={value} onChange={onChange} />;
        }
    };

    return <div className={styles.inputShared}>
        <h3>{label}</h3>
        {renderInput()}
    </div>
}

export default InputShared;