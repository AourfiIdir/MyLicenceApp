import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

jest.mock("expo-secure-store", () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        googleWebClientId: "test-client-id",
        backendUrl: "http://localhost:3000",
      },
    },
  },
}));

function TestComponent() {
  const { userToken, isLoading, login, logout } = useAuth();
  return (
    <>
      <Text testID="loading">{isLoading ? "loading" : "loaded"}</Text>
      <Text testID="token">{userToken || "no-token"}</Text>
    </>
  );
}

describe("AuthProvider", () => {
  it("provides initial state with no token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").props.children).toBe("loaded");
    });
    expect(screen.getByTestId("token").props.children).toBe("no-token");
  });

  it("login sets the token", async () => {
    let authMethods;
    function AuthTest() {
      authMethods = useAuth();
      return (
        <Text testID="token">{authMethods.userToken || "no-token"}</Text>
      );
    }

    render(
      <AuthProvider>
        <AuthTest />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("token").props.children).toBe("no-token");
    });

    await authMethods.login("test-token", "test-refresh", { name: "Test" });

    await waitFor(() => {
      expect(screen.getByTestId("token").props.children).toBe("test-token");
    });
  });

  it("logout clears the token", async () => {
    let authMethods;
    function AuthTest() {
      authMethods = useAuth();
      return (
        <Text testID="token">{authMethods.userToken || "no-token"}</Text>
      );
    }

    render(
      <AuthProvider>
        <AuthTest />
      </AuthProvider>
    );

    await authMethods.login("test-token", "test-refresh", { name: "Test" });
    await waitFor(() => {
      expect(screen.getByTestId("token").props.children).toBe("test-token");
    });

    await authMethods.logout();
    await waitFor(() => {
      expect(screen.getByTestId("token").props.children).toBe("no-token");
    });
  });
});
