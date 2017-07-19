import React from "react";
import styles from "./styles.css";
import SkillsRight from "../../atoms/SkillsList/SkillsRight/index";
import SkillsLeft from "../../atoms/SkillsList/SkillsLeft/index";
import img from "../../../images/cartoon_selfie.png";

const Section1 = () =>
	<div className="section1-wrapper-div">
		<SkillsLeft className="section1-skillsleft" />
		<img
			className="section1-cartoonselfie"
			alt="cartoon_selfie"
			src={img}
		/>
		<SkillsRight className="section1-skillsright" />
	</div>;

export default Section1;
