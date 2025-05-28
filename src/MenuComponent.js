import React from 'react';
import { useNavigate } from 'react-router-dom';
import SelectedMenu from './SelectedMenu';
import logolabelimg from './лого_надпись.png';
import logoimgimg from './лого_корабль.png';

function MenuComponent({ selctdMenu, children }) {
    const navigate = useNavigate();
    function Single() {
        navigate('/singleplayer'); // Навигация на другую страницу
    }
    function CrRoom() {
        navigate('/createroom'); // Навигация на другую страницу
    }
    function Conn() {
        navigate('/connect'); // Навигация на другую страницу
    }
    function ProfSt() {
        navigate('/profset'); // Навигация на другую страницу
    }
    function Ruls() {
        navigate('/rules'); // Навигация на другую страницу
    }
    function AbAuth() {
        navigate('/about'); // Навигация на другую страницу
    }
    function Syst() {
        //navigate('/system'); 
        window.open('/system', '_blank');
    }
    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <img className="logo" src={logoimgimg} alt="Logo" />
            <img className="logo" src={logolabelimg} alt="Logo" />
            <div className="menuTab">
                <label onClick={Single}>Одиночная игра</label><br />
                <label onClick={CrRoom}>Создать комнату</label><br />
                <label onClick={Conn}>Подключиться</label><br />
                <label onClick={ProfSt}>Настроить профиль</label><br />
                <label onClick={Ruls}>Правила игры</label ><br />
                <label onClick={AbAuth}>Об авторах</label ><br />
                <label onClick={Syst} style={{position:'relative',color:'black',top:'4vh'} }>О системе</label ><br />
            </div>
            <label onClick={() => { localStorage.clear(); navigate('/'); }} className='exitButt' >Выйти</label><br />
            <SelectedMenu y={selctdMenu}></SelectedMenu>
            <div className="menuBigTab">{children}</div>
        </header>
    );
}

export default MenuComponent; 