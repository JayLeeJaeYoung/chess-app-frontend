import styles from "./RadioInput.module.css";

const RadioInput = (props) => {
  // isTouched is defined by whether or not "submit" has been clicked
  // only show error message when "submit" was once tried and radio input not specified
  // values must be integers
  const { values, labels, name, isTouched, value, onInput, errorText, prompt } =
    props;

  const indices = [...Array(values.length).keys()];
  const uuid = require("uuid");
  const ids = [];
  for (let i = 0; i < values.length; i++) {
    ids.push(uuid.v1());
  }

  // console.log(`idTouched: ${isTouched}`);

  const invalid =
    value === "" && isTouched ? styles["form-control--invalid"] : "";

  return (
    <ul className={`${styles["form-control"]} ${invalid}`}>
      <div>{prompt}</div>
      <div className={`${styles["radio-control"]}`}>
        {indices.map((i) => (
          <li
            key={i}
            className={
              Number(value) === values[i] ? `${styles["selected"]}` : ""
            }>
            <input
              type="radio"
              id={ids[i]}
              value={values[i]}
              name={name}
              onChange={onInput}
              checked={value === values[i]}
            />
            <label htmlFor={ids[i]} name={props.name}>
              {labels[i]}
            </label>
          </li>
        ))}
      </div>
      {value === "" && isTouched && <p>{errorText}</p>}
    </ul>
  );
};

export default RadioInput;
