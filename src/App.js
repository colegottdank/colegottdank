import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import NavBar from "./components/NavBar/index";
import Section1 from "./components/Section1/index";
import Section2 from "./components/Section2/index";
import "./styles/app.css";

class App extends React.Component {
	render() {
		return (
			<BrowserRouter>
				<section className="app-wrapper">
					<NavBar />
					<section className="section-wrapper">
						<Section1 />
						<Section2 />
					</section>
				</section>
			</BrowserRouter>
		);
	}
}

export default App;
