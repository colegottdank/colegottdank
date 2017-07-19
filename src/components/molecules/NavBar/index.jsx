import React from "react";
import { NavLink } from "react-router-dom";
import "./styles.css";

/*
* @return div which wraps list of NavLinks
*/
const NavBar = () =>
    <div className="navbar__wrapper">
        <nav className="navbar__nav">
            <NavRoutes />
        </nav>
    </div>;

/*
* @return list of NavLinks
*/
const NavRoutes = () => {
    // Object containing routes (can modify here)
    const navRoutes = [
        {
            route: "Home",
            id: "1"
        },
        { route: "About", id: "2" },
        { route: "Portfolio", id: "3" },
        { route: "Contact", id: "4" }
    ];

    return (
        <ul className="navroutes__wrapper__ul">
            {navRoutes.map(navRoute =>
                <li className="navroutes__li">
                    <NavLink
                        key={navRoute.id}
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