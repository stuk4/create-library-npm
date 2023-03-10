import React from "react";
import "./button.css";
import { ButtonProps } from "./interfaces";

const Button = (props: ButtonProps) => {
  return <button> {props.label}</button>;
};

export default Button;
