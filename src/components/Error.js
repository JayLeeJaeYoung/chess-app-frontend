import styles from "./Error.module.css";
import Button from "./Button";

const Error = (props) => {
  return (
    <div className={`${styles.error} ${styles[props.styles]}`}>
      <h4>{props.message}</h4>
      <Button small danger onClick={props.onClick}>
        Close Error Message
      </Button>
    </div>
  );
};

export default Error;
