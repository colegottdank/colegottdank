import React from "react";
import styles from '../styles.css';

const SkillsLeft = () => {
	var skillsLeft = [
		{ skill: "HTML5", rating: 10, description: "" },
		{ skill: "CSS3", rating: 10, description: "" },
		{ skill: "SASS/SCSS", rating: 10, description: "" },
		{ skill: "JQuery", rating: 7, description: "" },
		{ skill: "JSON/AJAX", rating: 7, description: "" },
		{ skill: "Bootstrap", rating: 7, description: "" },
		{ skill: "Java", rating: 10, description: "" },
		{ skill: "C", rating: 8, description: "" },
		{ skill: "Python", rating: 5, description: "" },
		{ skill: "VBA", rating: 4, description: "" },
	];
	var toRender = [];

	for (let index in skillsLeft) {
		toRender.push(skillsLeft[index].skill);
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

export default SkillsLeft;
