/* eslint-disable react/prop-types */
import { VscLibrary } from "react-icons/vsc";
import { MdOutlineFavoriteBorder, MdPlaylistPlay, MdPersonOutline, MdAlbum, MdHistory } from "react-icons/md";
import { NavListContainerStyled, NavListStyled } from "./navList.styled";
import { SideNavHeaderStyled } from "../navbar.styled";

export default function NavList({ menuOpen = false, collapsed = false, currentView, setCurrentView }) {

    const libraryItems = [
        { icon: <MdPlaylistPlay />, text: 'Playlists' },
        { icon: <MdAlbum />, text: 'Albums' },
        { icon: <MdPersonOutline />, text: 'Artists' },
        { icon: <MdHistory />, text: 'Listen History' },
    ];

    const handleNavClick = (viewName) => {
        setCurrentView(viewName);
    };

    return (
        <>
            <NavListContainerStyled $menuOpen={menuOpen} $collapsed={collapsed}>
                {libraryItems.map((item, index) => (
                    <NavListStyled
                        key={index}
                        $collapsed={collapsed}
                        $isActive={currentView === item.text}
                        onClick={() => handleNavClick(item.text)}
                    >
                        <span className="react-icon">
                            {item.icon}
                        </span>
                        <p>{item.text}</p>
                    </NavListStyled>
                ))}
            </NavListContainerStyled>
        </>
    )
}