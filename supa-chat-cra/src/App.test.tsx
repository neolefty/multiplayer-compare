import React from "react"
import { render, screen } from "@testing-library/react"
import App from "./App"

test("renders Supabase Auth link", () => {
    render(<App />)
    const linkElement = screen.getByText(/supabase auth/i)
    expect(linkElement).toBeInTheDocument()
})
