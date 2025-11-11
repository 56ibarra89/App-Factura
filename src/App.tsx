import { HashRouter } from "react-router-dom";
import AppRoutes from "./router/index.tsx";

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
