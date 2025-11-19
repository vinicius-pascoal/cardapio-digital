"use client";

import React, { createContext, useContext, useState } from "react";
import LoadingOverlay from "./LoadingOverlay";

type LoadingContextValue = {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = () => {
    setLoadingCount((prev) => prev + 1);
  };

  const hideLoading = () => {
    setLoadingCount((prev) => Math.max(0, prev - 1));
  };

  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    showLoading();
    try {
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  };

  const value: LoadingContextValue = {
    isLoading: loadingCount > 0,
    showLoading,
    hideLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loadingCount > 0 && <LoadingOverlay />}
    </LoadingContext.Provider>
  );
};
