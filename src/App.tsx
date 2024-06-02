import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ThreeDWorld from "./Components/HelloWorldComponent/HelloWorldComponent";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ThreeDWorld />
    </>
  );
}

export default App;
