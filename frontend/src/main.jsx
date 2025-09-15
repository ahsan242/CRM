// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './App';
// import { basePath } from './context/constants';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter basename={basePath}>
//       <App />
//     </BrowserRouter>
//   </StrictMode>
// );
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // optional
import App from "./App";
import { basePath } from "./context/constants";

// Create one QueryClient for the whole app
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basePath}>
        <App />
      </BrowserRouter>

      {/* ✅ React Query Devtools (for debugging queries/mutations) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
