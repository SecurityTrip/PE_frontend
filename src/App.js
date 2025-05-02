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
                    <Route path="/createroom" element={<CreateRoom />} />
                    <Route path="/connect" element={<Connect />} />
                    <Route path="/profset" element={<ProfSet />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/system" element={<System />} />
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
                <div style={{position: 'absolute',color: 'white',left: 'calc(50% + 4vh)',fontSize:'4vh'} }>Выберите аватар:</div>
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
        <img alt="avatar_img" className="avatarimgbut" onClick={ onClick} style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh', backgroundImage: 'url(' + img + ')', backgroundSize: 'cover'  } }></img>
    );
}
function SelectedAva({y,x }) {
    return (
        <div className="selectedAva" style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh' }} ></div>
    );
}
function SelectedMenu({ y }) {
    return (
        <div className="selectedMenu" style={{ top: 'calc(' + y + '*7vh + 29.5vh)' }} ></div>
    );
}
function Singleplayer() {
    const [selected, setSelected] = useState(0);  // 0 = легкий, 1 = средний, 2 = сложный
    const navigate = useNavigate();
    const handleClick = (index) => {
        setSelected(index);
    };
    const playClick = (index) => {
        navigate('/fieldedit');
    };

    return (
        <MenuComponent selctdMenu='0'>
            <div style={{
                position:'absolute',
                top: '20vh',
                left: '0vh',
                width: '50vh',
                height: '0vh',
                transform: 'translate(-50 %, -50 %)'
            }}>
                Сложность ИИ:
            </div>
            <div style={{
                position: 'absolute',
                top: '30vh',
                left: '10vh',
                width: '80vh',
                height: '7vh',
                transform: 'translate(-50 %, -50 %)',
                backgroundColor: 'rgb(255,255,255,0.5)',
                borderRadius: '5vh',
                flexDirection: 'row',
                whiteSpace: 'pre'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: selected * 33.33 + '%',
                    width: '33.33%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '5vh',
                    transition: 'left 0.3s ease',
                    zIndex: -1
                }} />
                <div style={{ zIndex: 100 }}>
                <label  onClick={() => handleClick(0)}>Легкий           </label>
                <label  onClick={() => handleClick(1)} >Средний       </label>
                    <label  onClick={() => handleClick(2)}>Сложный</label>
                </div>
                
                
            </div>
            <button onClick={playClick} className="singleplaybutt">Играть</button>
        </MenuComponent>
    );
}
function CreateRoom() {
    const navigate = useNavigate();
    const copyClick = (index) => {
        navigate('/fieldedit');
    };
    return (

        <MenuComponent selctdMenu='1'>
            <div style={{
                position: 'absolute',
                top: '20vh',
                left: '0vh',
                width: '100vh',
                height: '0vh',
                transform: 'translate(-50 %, -50 %)'
            }}>
                Сгенерированный код:
            </div>
            <input type="text" value="fcbqn8r73y9of87ew" className="sgencodefield" />
            <button onClick={copyClick} className="copybutt">Скопировать</button>
        </MenuComponent>
    );
}
function Connect() {
    const navigate = useNavigate();
    const copyClick = (index) => {
        navigate('/fieldedit');
    };
    return (
        <MenuComponent selctdMenu='2'>
            <div style={{
                position: 'absolute',
                top: '20vh',
                left: '0vh',
                width: '100vh',
                height: '0vh',
                transform: 'translate(-50 %, -50 %)'
            }}>
                Введите код комнаты:
            </div>
            <input type="text" className="sgencodefield" />
            <button onClick={copyClick} className="copybutt">Войти</button>
        </MenuComponent>
    );
}
function ProfSet() {
    const [selavx, setSelavx] = useState(-3.5);
    const [selavy, setSelavy] = useState(5.5);
    function saveClick() {

    }
    return (
        <MenuComponent selctdMenu='3'>
            <div style={{ position: 'absolute', top: '10vh', left: '15vh', fontSize: '6vh' }}>Аватар:</div>
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
            <input style={{top: '33vh'}} type="text" placeholder="Новый логин" className="profSetInputs" />
            <input style={{ top: '40vh' }} type="text" placeholder="Старый пароль" className="profSetInputs" />
            <input style={{ top: '47vh' }} type="text" placeholder="Новый пароль" className="profSetInputs" />
            <input style={{ top: '54vh' }} type="text" placeholder="Повторите пароль" className="profSetInputs" />
            <button onClick={saveClick} className="savebutt">Сохранить изменения</button>
        </MenuComponent>        
    );
}
function Rules() {
    
    return (
        <MenuComponent selctdMenu='4'>
            <div className='rulesScroll'>
                fkj;ajksdj vkajsh dkjg;kajs;kvjh a;kjs hd;lkfgjha;kjvhwrijhgfkuah dfkj ha;ksd h;fa shd;vkhaoi w hgoihaoiv h[oaej v[oj a[osd jfo iasoif j[oais jdvoia j[soidjg[oia usoidjf[oiasj d[ofi[vo iasj[ofijgo[ ia sjd[ofij aosi djgvaslkdh f;as hd;lfkh ;lk;fa shd;k jfh;oais dovhas;jdh fkljh aslkjdhfklj hjhaskj dhkjhab sjkfh jkhasdjhf jahshdjkvhaklsdhflkjhasdk jfkasjlfkjashdkljfhaslkjd hfkjsad flsad fkaslkjf l;asjd;lkfaskf lask fljfakjshdkfjjalksjflkj aslkdlk alsk flasjdl kfjasljaslk jalsk lkas jlkajs lkjsl kafj alksdj
            </div>
        </MenuComponent>
    );
}
function About() {
    return (
        <MenuComponent selctdMenu='5'>
            <div style={{ textAlign: 'left', position: 'absolute',width:'90vh', top: '50%', left: '50%', transform:'translate(-50%, -50%)' } }>
                Фронтенд: Паршин Никита<br />
                Бекенд: Лысов Илья<br />
                Документация: Лебедев Евгений
            </div>
        </MenuComponent>
    );
}
function System() {
    return (
        <MenuComponent selctdMenu='6'>
            <div style={{ textAlign:'left', position: 'absolute', width: '90vh', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                Тип ЭВМ: IBM PC совместимый<br />
                Монитор: с разрешающей способностью не ниже 800x600<br />
                Манипулятор: мышь
            </div>
        </MenuComponent>
    );
}
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
        navigate('/system'); // Навигация на другую страницу
    }
    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <img className="logolabel" src={logolabelimg} alt="Logo" />
            <img className="logoimg" src={logoimgimg} alt="Logo" />
            <div className="menuTab">
                <label onClick={Single}>Одиночная игра</label><br />
                <label onClick={CrRoom}>Создать комнату</label><br />
                <label onClick={Conn}>Подключиться</label><br />
                <label onClick={ProfSt}>Настроить профиль</label><br />
                <label onClick={Ruls}>Правила игры</label ><br />
                <label onClick={AbAuth}>Об авторах</label ><br />
                <label onClick={Syst}>О системе</label ><br />
            </div>
            <SelectedMenu y={selctdMenu}></SelectedMenu>
            <div className="menuBigTab">{children}</div>
        </header>
    );
}

export default App;