import React from "react";
import Header from "../../organisms/Header/index";
import Body from "../../organisms/Body/index";
import styles from "./styles.css";

class Home extends React.Component {
	render() {
		return (
			<div className="home-wrapper-div">
				<Header />
				<Body />
			</div>
		);
	}
}
export default Home;
