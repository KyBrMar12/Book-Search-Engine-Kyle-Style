import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import "./App.css";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

// Direct URL link for testing purposes
const API_URI = import.meta.env.VITE_GRAPHQL_URI || "https://book-search-engine-kyle-style-backend.onrender.com/graphql";

//const API_URI = "https://book-search-engine-kyle-style-backend.onrender.com/graphql";

// Dynamically set API URI for local and deployed environments
/*const API_URI = 
  import.meta.env.MODE === "development"
    ? "http://localhost:3001/graphql" // Local for development
    : "https://book-search-engine-kyle-style-backend.onrender.com/graphql"; // Deployed API for production
*/
// Define the GraphQL endpoint
const httpLink = createHttpLink({
  uri: API_URI,
});

// Middleware to attach token to headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token"); // Get token from local storage
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Create Apollo Client with auth middleware
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Attach auth middleware
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
