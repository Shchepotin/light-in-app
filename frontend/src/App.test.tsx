import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders screen", () => {
  render(<App />);
  const element = screen.getByText(/електропостачання/i);
  expect(element).toBeInTheDocument();
});
