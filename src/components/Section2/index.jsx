import React from "react";
import { Icon } from "semantic-ui-react";
import Velocity from "velocity-animate";
import "./section2styles.css";

class Section2 extends React.Component {
	scroll(event) {
		Velocity(document.getElementById(event), "scroll", {
			duration: 1000,
			easing: "easeInBack"
		});
	}
	render() {
		return (
			<section className="section2-wrapper" id="section2">
				<Icon
					id="icon"
					onClick={this.scroll.bind(this, 'skills-wrapper')}
					className="section2-arrow-icon"
					name="arrow down"
				/>
				<Skills />
				<Icon
					id="icon"
					onClick={this.scroll.bind(this, 'skills-wrapper')}
					className="section2-arrow-icon arrow3"
					name="arrow down"
				/>
			</section>
		);
	}
}

const skills = [
	{
		name: "Production Scale Web Development",
		desc: "As a React.js programmer, I'm able to craft"
	},
	{
		name: "eCommerce",
		desc: "I can do this for eCommerce..."
	},
	{
		name: "Production Scale Web Development",
		desc: "As a React.js programmer, I'm able to craft"
	},
	{
		name: "Production Scale Web Development",
		desc: "As a React.js programmer, I'm able to craft"
	},
	{
		name: "Production Scale Web Development",
		desc: "As a React.js programmer, I'm able to craft"
	},
	{
		name: "Production Scale Web Development",
		desc: "As a React.js programmer, I'm able to craft"
	},
	{
		name: "Production Scale Web Development",
		desc: "As a React.js programmer, I'm able to craft"
	},
	{
		name: "Production Scale Web Development",
		desc: "As a React.js programmer, I'm able to craft"
	}
];

const Skills = () =>
	<section className="skills-wrapper" id="skills-wrapper">
		<div className="allskills-wrapper-div">
			<div className="skills-wrapper-div1">
				<div className="skills-div skill-div">
					<h1>
						{skills[0].name}
					</h1>
					<p>
						{skills[0].desc}
					</p>
				</div>

				<div className="skills-div2 skill-div">
					<h1>
						{skills[1].name}
					</h1>
					<p>
						{skills[2].desc}
					</p>
				</div>
			</div>

			<div className="skills-div3 skill-div">
				<h1>
					{skills[3].name}
				</h1>
				<p>
					{skills[3].desc}
				</p>
			</div>

			<div className="skills-wrapper-div2">
				<div className="skills-wrapper-div3">
					<div className="skills-div4 skill-div">
						<h1>
							{skills[4].name}
						</h1>
						<p>
							{skills[4].desc}
						</p>
					</div>

					<div className="skills-div5 skill-div">
						<h1>
							{skills[5].name}
						</h1>
						<p>
							{skills[5].desc}
						</p>
					</div>
				</div>
				<div className="skills-div6 skill-div">
					<h1>
						{skills[6].name}
					</h1>
					<p>
						{skills[6].desc}
					</p>
				</div>
			</div>
		</div>
		<Icon
			id="icon"
			className="section2-arrow-icon arrow2"
			name="arrow up"
		/>
	</section>;

export default Section2;
