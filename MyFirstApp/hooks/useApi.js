import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BACKEND_API } from "../constants/constants";

export function useApi() {
  const { authFetch } = useAuth();

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const url = `${BACKEND_API}${endpoint}`;
    const res = await authFetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  }, [authFetch]);

  const get = useCallback((endpoint) => apiCall(endpoint), [apiCall]);
  const post = useCallback((endpoint, body) =>
    apiCall(endpoint, { method: "POST", body: JSON.stringify(body) }), [apiCall]);
  const put = useCallback((endpoint, body) =>
    apiCall(endpoint, { method: "PUT", body: JSON.stringify(body) }), [apiCall]);
  const del = useCallback((endpoint) =>
    apiCall(endpoint, { method: "DELETE" }), [apiCall]);

  return { get, post, put, del, apiCall };
}

export function useFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authFetch } = useAuth();

  const fetchData = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const url = endpoint.startsWith("http") ? endpoint : `${BACKEND_API}${endpoint}`;
      const res = await authFetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  return { fetchData, loading, error };
}
