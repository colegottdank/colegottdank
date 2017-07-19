import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import NavBar from "./components/molecules/NavBar/index.jsx";
import "./styles/app.css";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="app_wrapper">
          <NavBar />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
