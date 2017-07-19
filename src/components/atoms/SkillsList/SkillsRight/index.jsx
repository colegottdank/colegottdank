import React from "react";
import styles from "../styles.css";

const SkillsRight = () => {
	const skillsRight = [
		{ skill: "Shopify", rating: 9, key: "12", description: "" },
		{ skill: "eCommerce", rating: 10, key: "13", description: "" },
		{ skill: "Liquid", rating: 10, key: "14", description: "" },
		{ skill: "React.js", rating: 7, key: "15", description: "" },
		{ skill: "Webpack", rating: 7, key: "16", description: "" },
		{ skill: "Babel", rating: 7, key: "17", description: "" },
		{ skill: "BEM", rating: 10, key: "18", description: "" },
		{ skill: "Material.io", rating: 5, key: "19", description: "" },
		{ skill: "Android Development", rating: 8, key: "20", description: "" }
	];
	var toRender = [];

	for (let index in skillsRight) {
		toRender.push(skillsRight[index].skill);
	}

	return (
		<div className="skillslist-wrapper-div">
			{toRender.map(name => {
				return (
					<p className="skillslist-p" key={name}>
						{name}
					</p>
				);
			})}
		</div>
	);
};

export default SkillsRight;
