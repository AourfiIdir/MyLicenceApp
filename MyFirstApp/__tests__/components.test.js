import React from "react";
import { render, screen } from "@testing-library/react-native";
import { LoadingSpinner, ErrorDisplay, EmptyState } from "../components/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with default message", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("renders with custom message", () => {
    render(<LoadingSpinner message="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeTruthy();
  });
});

describe("ErrorDisplay", () => {
  it("renders error message", () => {
    render(<ErrorDisplay message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = jest.fn();
    render(<ErrorDisplay message="Error" onRetry={onRetry} />);
    const retryText = screen.getByText("Tap to retry");
    expect(retryText).toBeTruthy();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorDisplay message="Error" />);
    expect(screen.queryByText("Tap to retry")).toBeNull();
  });
});

describe("EmptyState", () => {
  it("renders default message", () => {
    render(<EmptyState />);
    expect(screen.getByText("No data available")).toBeTruthy();
  });

  it("renders custom message", () => {
    render(<EmptyState message="No cards found" />);
    expect(screen.getByText("No cards found")).toBeTruthy();
  });
});
