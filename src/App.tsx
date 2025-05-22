// src/App.tsx
import React from "react";
import { AppProvider } from "./context";
import { TodoApp } from "./TodoApp.tsx";
import "./App.css";

// Main App component that wraps everything with context
function App() {
  return (
    <AppProvider>
      <TodoApp />
    </AppProvider>
  );
}

export default App;
