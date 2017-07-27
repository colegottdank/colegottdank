import React from "react";
import { NavLink } from "react-router-dom";
import "./navbarstyles.css";
import logo from "../../images/logo/logo_transparent.png";
import logo2 from "../../images/logo/logo2.png";
import "./interactions";
import $ from "jquery";

/*
* @return div which wraps list of NavLinks
*/
const NavBar = () =>
    <header>
        <nav className="navbar__nav">
            <NavRoutes />
        </nav>
    </header>;

/*
* @return list of NavLinks
*/
const NavRoutes = () => {
    // Map through navRoutes and create NavLinks
    // Object containing routes (can modify here)
    const navRoutes = [
        { route: "home" },
        { route: "about" },
        { route: "portfolio" },
        { route: "contact" }
    ];

    return (
        <ul className="navroutes__wrapper__ul">
            <l1 className="navroutes__li logo-li">
                <img
                    className="navbar-logo"
                    alt="Cole Gottdank - Logo"
                    src={logo}
                />
            </l1>
            {navRoutes.map(navRoute =>
                <li className="navroutes__li">
                    <NavLink
                        key={navRoute.route}
                        className="navroutes--navlink"
                        activeClassName="navroutes--navlink--active"
                        to={`/${navRoute.route}`}
                    >
                        {navRoute.route}
                    </NavLink>
                </li>
            )}
        </ul>
    );
};

export default NavBar;
