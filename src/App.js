import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./components/pages/Home/index";
import "./styles/app.css";

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="app_wrapper">
          <Home />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
