import React from "react";

import styles from "./Button.module.css";

const Button = (props) => {
  const inverse = props.inverse ? styles["button--inverse"] : "";
  const danger = props.danger ? styles["button--danger"] : "";
  const small = props.small ? styles["button--small"] : "";
  const big = props.big ? styles["button--big"] : "";

  return (
    <button
      className={`${styles.button}
      ${inverse} ${danger} ${small} ${big} ${styles[props.styles]}`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}>
      {props.children}
    </button>
  );
};

export default Button;
