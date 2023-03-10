import React from "react";
import { render } from "@testing-library/react";
import Button from "../../src/components/Button.jsx";

describe("Button", () => {
  test("renders the Button component", () => {
    render(<Button label="Hello world!" />);
  });
});
