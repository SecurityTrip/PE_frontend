import './App.css';
import React, { useState } from 'react';
import logolabelimg from './лого_надпись.png';
import logoimgimg from './лого_корабль.png';
import { BrowserRouter as Router, Route, Routes, useNavigate,Link } from 'react-router-dom';
import avaimg0 from './avas/avaimg0.gif';
import avaimg1 from './avas/avaimg1.gif';
import avaimg2 from './avas/avaimg2.gif';
import avaimg3 from './avas/avaimg3.gif';
import avaimg4 from './avas/avaimg4.gif';
import avaimg5 from './avas/avaimg5.gif';
import avaimg6 from './avas/avaimg6.gif';
import avaimg7 from './avas/avaimg7.gif';
import avaimg8 from './avas/avaimg8.gif';
import avaimg9 from './avas/avaimg9.gif';
function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="/regis" element={<Regis />} />
                    <Route path="/singleplayer" element={<Singleplayer />} />
                </Routes>
            </div>
        </Router>
    );
}

function Auth() {
    const navigate = useNavigate();
    function handleClick() {
        navigate('/singleplayer'); // Навигация на другую страницу
    }

    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <img className="logolabel" src={logolabelimg} alt="Logo" />
            <img className="logoimg" src={logoimgimg} alt="Logo" />
            <div className="logintab">Авторизация</div>
            <div className="logintabdark">
                <input type="text" placeholder="Логин" className="loginputlog" />
                <input type="text" placeholder="Пароль" className="loginputpass" />
                <button onClick={handleClick} className="logbutton">Войти</button>
            </div>
            <Link to="/regis" className="linkToReg">Зарегистрироваться</Link>
        </header>
    );
}
function Regis() {
    const navigate = useNavigate();
    const [selavx, setSelavx] = useState(-3.5);
    const [selavy, setSelavy] = useState(5.5);
    function handleClick() {
        navigate('/singleplayer'); // Навигация на другую страницу
    }
    
    return (

        <header>
            <div className="bckgr"></div>
            <img className="logolabel" src={logolabelimg} alt="Logo" />
            <img className="logoimg" src={logoimgimg} alt="Logo" />
            <div className="regtab">Регистрация</div>
            <div className="regtabdark">
                <input type="text" placeholder="Логин" className="reginputlog" />
                <input type="text" placeholder="Пароль" className="reginputpass" />
                <input type="text" placeholder="Повторите пароль" className="reginputpasspass" />
                <button onClick={handleClick} className="regbutton">Зарегистрироваться</button>
                <div className="avatarLabel">Выберите аватар:</div>
                <SelectedAva x={selavx} y={selavy}></SelectedAva>
                <Avatimbut y='7' x='-2' img={avaimg0} onClick={() => { setSelavx(-3.5); setSelavy(5.5); }} />
                <Avatimbut y='7' x='8' img={avaimg1} onClick={() => { setSelavx(6.5); setSelavy(5.5); }} />
                <Avatimbut y='7' x='18' img={avaimg2} onClick={() => { setSelavx(16.5); setSelavy(5.5); }} />
                <Avatimbut y='7' x='28' img={avaimg3} onClick={() => { setSelavx(26.5); setSelavy(5.5); }} />
                <Avatimbut y='7' x='38' img={avaimg4} onClick={() => { setSelavx(36.5); setSelavy(5.5); }} />
                <Avatimbut y='17' x='-2' img={avaimg5} onClick={() => { setSelavx(-3.5); setSelavy(15.5); }} />
                <Avatimbut y='17' x='8' img={avaimg6} onClick={() => { setSelavx(6.5); setSelavy(15.5); }} />
                <Avatimbut y='17' x='18' img={avaimg7} onClick={() => { setSelavx(16.5); setSelavy(15.5); }} />
                <Avatimbut y='17' x='28' img={avaimg8} onClick={() => { setSelavx(26.5); setSelavy(15.5); }} />
                <Avatimbut y='17' x='38' img={avaimg9} onClick={() => { setSelavx(36.5); setSelavy(15.5); }} />
            </div>
            <Link to="/" className="linkToLogin">У меня уже есть аккаунт, войти</Link>
            
        </header>
    );
}
function Avatimbut({ y, x, img,onClick }) {
    return (
        <button className="avatarimgbut" onClick={ onClick} style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh', backgroundImage: 'url(' + img + ')', backgroundSize: 'cover'  } }></button>
    );
}
function SelectedAva({y,x }) {
    return (
        <div className="selectedAva" style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh' }} ></div>
    );
}

function Singleplayer() {
    const navigate = useNavigate();
    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <img className="logolabel" src={logolabelimg} alt="Logo" />
            <img className="logoimg" src={logoimgimg} alt="Logo" />
            <div className="logintabdark">еще не готово((
            </div>
        </header>
    );
}

export default App;