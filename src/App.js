import './App.css';
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import p1 from './ps/p1.png';
import p2 from './ps/p2.png';
import p3 from './ps/p3.png';
import p4 from './ps/p4.png';
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
                    <Route path="/fieldedit" element={<FieldEdit />} />
                </Routes>
            </div>
        </Router>
    );
}
function Auth() {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    async function handleClick() {
        setError('');
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: login,
                    password: pass
                })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('avatarId', data.avatarId);
                localStorage.setItem('refreshToken', data.refreshToken);
                navigate('/singleplayer');
            } else {
                setError('Неверный логин или пароль');
            }
        } catch (e) {
            setError('Ошибка соединения с сервером');
        }
    }

    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <img className="logo" src={logoimgimg} alt="Logo" />
            <img className="logo" src={logolabelimg} alt="Logo" />
            <div className="logintab">Авторизация</div>
            <div className="logintabdark">
                <input onChange={(e) => setLogin(e.target.value)} value={login} type="text" placeholder="Логин" className="loginput" style={{ top: '11.5vh' }} />
                <input onChange={(e) => setPass(e.target.value)} value={pass} type="password" placeholder="Пароль" className="loginput" />
                <button onClick={handleClick} className="logbutton">Войти</button>
                {error && <div style={{ color: 'red', marginTop: '2vh' }}>{error}</div>}
            </div>
            <Link to="/regis" className="linkToReg">Зарегистрироваться</Link>
        </header>
    );
}
function Regis() {
    const navigate = useNavigate();
    const [selavx, setSelavx] = useState(-3.5);
    const [selavy, setSelavy] = useState(5.5);
    const [iSeld, setISeld] = useState(0);

    const [login, setLogin] = useState('');
    const [pass, setPass] = useState('');
    const [passpass, setPassPass] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleClick() {
        setError('');
        setSuccess('');
        if (!login || !pass || !passpass) {
            setError('Заполните все поля');
            return;
        }
        if (pass !== passpass) {
            setError('Пароли не совпадают');
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: login,
                    password: pass,
                    avatarId: iSeld
                })
            });
            if (response.ok) {
                const data = await response.json();
                setSuccess(data.message || 'Регистрация успешна!');
                setTimeout(() => navigate('/'), 1500);
            } else {
                const data = await response.json();
                setError(data.message || 'Ошибка регистрации');
            }
        } catch (e) {
            setError('Ошибка соединения с сервером');
        }
    }
    function avaSelect(i) {
        setISeld(i);
        switch (i) {
            case 0: { setSelavx(-3.5); setSelavy(5.5); break; }
            case 1: { setSelavx(6.5); setSelavy(5.5); break; }
            case 2: { setSelavx(16.5); setSelavy(5.5); break; }
            case 3: { setSelavx(26.5); setSelavy(5.5); break; }
            case 4: { setSelavx(36.5); setSelavy(5.5); break; }
            case 5: { setSelavx(-3.5); setSelavy(15.5); break; }
            case 6: { setSelavx(6.5); setSelavy(15.5); break; }
            case 7: { setSelavx(16.5); setSelavy(15.5); break; }
            case 8: { setSelavx(26.5); setSelavy(15.5); break; }
            case 9: { setSelavx(36.5); setSelavy(15.5); break; }
            default: { alert('ничего себе'); }
        }
    }
    
    return (
        <header>
            <div className="bckgr"></div>
            <img className="logo" src={logoimgimg} alt="Logo" />
            <img className="logo" src={logolabelimg} alt="Logo" />
            <div className="regtab">Регистрация</div>
            <div className="regtabdark">
                <input onChange={(e) => setLogin(e.target.value)} value={login} type="text" placeholder="Логин" className="reginput" />
                <input onChange={(e) => setPass(e.target.value)} value={pass} type="password" placeholder="Пароль" className="reginput" style={{ top: '11.5vh' }} />
                <input onChange={(e) => setPassPass(e.target.value)} value={passpass} type="password" placeholder="Повторите пароль" className="reginput" style={{ top: '18vh' }} />
                <button onClick={handleClick} className="regbutton">Зарегистрироваться</button>
                {error && <div style={{ color: 'red', marginTop: '2vh' }}>{error}</div>}
                {success && <div style={{ color: 'green', marginTop: '2vh' }}>{success}</div>}
                <div style={{position: 'absolute',color: 'white',left: 'calc(50% + 4vh)',fontSize:'4vh'} }>Выберите аватар:</div>
                <SelectedAva x={selavx} y={selavy}></SelectedAva>
                <Avatimbut y='7' x='-2' img={avaimg0} onClick={() => { avaSelect(0) }} />
                <Avatimbut y='7' x='8' img={avaimg1} onClick={() => { avaSelect(1) }} />
                <Avatimbut y='7' x='18' img={avaimg2} onClick={() => { avaSelect(2) }} />
                <Avatimbut y='7' x='28' img={avaimg3} onClick={() => { avaSelect(3) }} />
                <Avatimbut y='7' x='38' img={avaimg4} onClick={() => { avaSelect(4) }} />
                <Avatimbut y='17' x='-2' img={avaimg5} onClick={() => { avaSelect(5) }} />
                <Avatimbut y='17' x='8' img={avaimg6} onClick={() => { avaSelect(6) }} />
                <Avatimbut y='17' x='18' img={avaimg7} onClick={() => { avaSelect(7) }} />
                <Avatimbut y='17' x='28' img={avaimg8} onClick={() => { avaSelect(8) }} />
                <Avatimbut y='17' x='38' img={avaimg9} onClick={() => { avaSelect(9) }} />
            </div>
            <Link to="/" className="linkToLogin">У меня уже есть аккаунт, войти</Link>
            
        </header>
    );
}
function Avatimbut({ y, x, img,onClick }) {
    return (
        <img alt="avatar_img" src={img } className="avatarimgbut" onClick={ onClick} style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh', backgroundSize: 'cover'  } }></img>
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
            <img className="logo" src={logoimgimg} alt="Logo" />
            <img className="logo" src={logolabelimg} alt="Logo" />
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
function FieldEdit() {
    const navigate = useNavigate();
    const [movinShip, setMS] = useState(-1);
    function handleClick() {
        navigate('/match');
    }
    const [mos, setMos] = useState(null);

    const grid = useMemo(() => {
        let trt = []
        let id = 0;
        for (let y = 0; y < 10; y++)
            for (let x = 0; x < 10; x++) {
                trt.push({ id, x, y });
                id++;
            }
                
        return trt;
    })
    const redFlagsRef = useRef(Array(100).fill({x:0,y:0,a:0}));
    const redFlags = redFlagsRef.current;
    function MouseDown(e,i) {
        setMos([e.clientX, e.clientY]);
        const ships = shipsRef.current;
        ships[i].px = ships[i].rqx;
        ships[i].py = ships[i].rqy;
        setMS(i);
    }
    function MouseMove(e) {
        //console.log()
        if (movinShip > -1) {
            const ships = shipsRef.current;
            ships[movinShip].rqx = ships[movinShip].px + (e.clientX - mos[0]) / (window.innerHeight*0.077);
            ships[movinShip].rqy = ships[movinShip].py + (e.clientY - mos[1]) / (window.innerHeight*0.077);
            //console.log((e.clientX - mos[0]) / (window.innerHeight * 0.077));
            //console.log(ships[movinShip].rqy,movinShip);
        }
    }
    function MouseUp(e) {
        if (movinShip > -1) {
            const ships = shipsRef.current;
            const field = fieldRef.current;
            ships[movinShip].rqx = Math.round(ships[movinShip].px + (e.clientX - mos[0]) / (window.innerHeight * 0.077));
            ships[movinShip].rqy = Math.round(ships[movinShip].py + (e.clientY - mos[1]) / (window.innerHeight * 0.077));
            
            //ships[movinShip].rqx = qbob//gridtoscr(qbob);
            //ships[movinShip].rqy = bbob//gridtoscr(bbob);
            for (let y = 0; y < 10; y++)
                for (let x = 0; x < 10; x++) {
                    //console.log(x, y, field[y][x]);
                    field[y][x] = -1;
                }
            if (mos[0] === e.clientX && mos[1] === e.clientY) {
                
                
                let qx = Math.round(((e.clientX - window.innerWidth/2) / (window.innerHeight) + 0.6355) / 0.077);
                let qy = Math.round(((e.clientY) / (window.innerHeight) - 0.154) / 0.077);
                //if (elemBelow && elemBelow.dataset && elemBelow.dataset.cellx !== undefined) {
                //console.log(((e.clientX - window.innerWidth / 2) / (window.innerHeight) + 0.6355) / 0.077,qx);
                //}
                
                if (ships[movinShip].rot === 0) {
                    console.log(qx);
                    ships[movinShip].rot = 1;
                    ships[movinShip].px = qx;
                    ships[movinShip].py = ships[movinShip].rqy + (ships[movinShip].rqx - qx);
                    ships[movinShip].tx = qx;
                    ships[movinShip].ty = ships[movinShip].rqy + (ships[movinShip].rqx - qx);
                    //console.log(ships[movinShip].rqy + (ships[movinShip].rqx - qx), ships[movinShip].ty);
                    ships[movinShip].rqy = ships[movinShip].ty;
                    ships[movinShip].rqx = qx;
                    //console.log(ships[movinShip].rqy);
                    
                }
                else {
                    ships[movinShip].rot = 0;
                    ships[movinShip].px = ships[movinShip].rqx - (ships[movinShip].rqy+ships[movinShip].len-1 - qy);;
                    ships[movinShip].py = qy
                    ships[movinShip].tx = ships[movinShip].rqx - (ships[movinShip].rqy + ships[movinShip].len - 1 - qy);
                    ships[movinShip].ty = qy;
                    ships[movinShip].rqx = ships[movinShip].tx;
                    ships[movinShip].rqy = ships[movinShip].ty;
                }
                    
            }
            for (let i = 0; i < 10; i++) {
                let qbob = ships[i].rqx//scrtogrid(ships[movinShip].rqx);
                let bbob = ships[i].rqy//scrtogrid(ships[movinShip].rqy);
                //переделать под проверку поля всего
                if (bbob >= 0 && bbob < 10 && qbob >= 0 && qbob < 10) {
                    if (field[bbob][qbob]===-1)
                        field[bbob][qbob] = i;
                    else
                        field[bbob][qbob] = 10;
                }
                if (ships[i].rot === 0) {
                    if (bbob >= 0 && bbob < 10 && qbob + 1 >= 0 && qbob + 1 < 10 && ships[i].len>1) {
                        if (field[bbob][qbob+1] === -1)
                            field[bbob][qbob + 1] = i;
                        else
                            field[bbob][qbob+1] = 10;
                    }
                    if (bbob >= 0 && bbob < 10 && qbob + 2 >= 0 && qbob + 2 < 10 && ships[i].len > 2) {
                        if (field[bbob][qbob+2] === -1)
                            field[bbob][qbob + 2] = i;
                        else
                            field[bbob][qbob+2] = 10;
                    }
                    if (bbob >= 0 && bbob < 10 && qbob + 3 >= 0 && qbob + 3 < 10 && ships[i].len > 3) {
                        if (field[bbob][qbob+3] === -1)
                            field[bbob][qbob + 3] = i;
                        else
                            field[bbob][qbob+3] = 10;
                    }
                }
                else {
                    if (bbob + 1 >= 0 && bbob + 1 < 10 && qbob >= 0 && qbob < 10 && ships[i].len > 1) {
                        if (field[bbob+1][qbob] === -1)
                            field[bbob + 1][qbob] = i;
                        else
                            field[bbob+1][qbob] = 10;
                    }
                    if (bbob + 2 >= 0 && bbob + 2 < 10 && qbob >= 0 && qbob < 10 && ships[i].len > 2) {
                        if (field[bbob+2][qbob] === -1)
                            field[bbob + 2][qbob] = i;
                        else
                            field[bbob+2][qbob] = 10;
                    }
                    if (bbob + 3 >= 0 && bbob + 3 < 10 && qbob >= 0 && qbob < 10 && ships[i].len > 3) {
                        if (field[bbob+3][qbob] === -1)
                            field[bbob + 3][qbob] = i;
                        else
                            field[bbob+3][qbob] = 10;
                    }
                }
            }
            const redFlags = redFlagsRef.current;
            
            //console.log(redFlags);
            for (let y = 0; y < 10; y++)
                for (let x = 0; x < 10; x++) {
                    let red = false;
                    if (field[y][x] !== -1) {
                        if (y + 1 < 10) {
                            if (x + 1 < 10) {
                                if (field[y + 1][x + 1] !== field[y][x] && field[y + 1][x + 1] !==-1)
                                    red = true;
                            }
                            if (x - 1 >-1) {
                                if (field[y + 1][x - 1] !== field[y][x] && field[y + 1][x - 1] !== -1)
                                    red = true;
                            }
                            if (field[y + 1][x] !== field[y][x] && field[y + 1][x] !== -1)
                                red = true;
                        }
                        if (x + 1 < 10) {
                            if (field[y][x + 1] !== field[y][x] && field[y][x + 1] !== -1)
                                red = true;
                        }
                        if (x - 1 > -1) {
                            if (field[y][x - 1] !== field[y][x] && field[y][x - 1] !== -1)
                                red = true;
                        }
                        if (y - 1 >-1) {
                            if (x + 1 < 10) {
                                if (field[y - 1][x + 1] !== field[y][x] && field[y - 1][x + 1] !== -1)
                                    red = true;
                            }
                            if (x - 1 > -1) {
                                if (field[y - 1][x - 1] !== field[y][x] && field[y - 1][x - 1] !== -1)
                                    red = true;
                            }
                            if (field[y - 1][x] !== field[y][x] && field[y - 1][x] !== -1)
                                red = true;
                        }
                    }
                    
                    if (field[y][x] === 10 || red)
                        redFlags[y*10+x]={ x, y, a: 0.5 };
                    else
                        redFlags[y * 10 + x] = { x, y, a: 0 };
                }

            setMos(null)
            setMS(-1);
        }
    }
    const lastFrameTime = useRef(0);
    const requestRef = useRef();
    const [tick, setTick] = useState(0);
    const render = (time) => {
        // Вызывается каждый кадр (60 Гц ≈ каждые 16.6 мс)
        const deltaTime = time - lastFrameTime.current;
        //console.log(time - lastFrameTime.current);
        lastFrameTime.current = time;
        for (let i = 0; i < ships.length; i++) {

            const ships = shipsRef.current;
            ships[i].tx += (ships[i].rqx - ships[i].tx) * deltaTime/100;
            ships[i].ty += (ships[i].rqy - ships[i].ty) * deltaTime / 100;
            
        }
        setTick(t => t + 1); // заставляем React перерисоваться
        // Перезапустить цикл
        requestRef.current = requestAnimationFrame(render);
    };
    useEffect(() => {
        requestRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
    function scrtogrid(pos) {
        return Math.round(pos / 1 - 1.5);
    }
    function gridtoscr(pos) {
        return (pos + 1.5) * 1;
    }
    const shipsRef = useRef([
        {
            px: 13,
            py: 3,
            rqx: 13,
            rqy: 3,
            tx: 13,
            ty: 3,
            len: 1,
            rot: 0
        },
        {
            px: 12,
            py: 3,
            rqx: 12,
            rqy: 3,
            tx: 12,
            ty: 3,
            len: 1,
            rot: 0
        },
        {
            px: 11,
            py: 3,
            rqx: 11,
            rqy: 3,
            tx: 11,
            ty: 3,
            len: 1,
            rot: 0
        },
        {
            px: 10,
            py: 3,
            rqx: 10,
            rqy: 3,
            tx: 10,
            ty: 3,
            len: 1,
            rot: 0
        },
        {
            px: 14,
            py: 2,
            rqx: 14,
            rqy: 2,
            tx: 14,
            ty: 2,
            len: 2,
            rot: 0
        },
        {
            px: 12,
            py: 2,
            rqx: 12,
            rqy: 2,
            tx: 12,
            ty: 2,
            len: 2,
            rot: 0
        },
        {
            px: 10,
            py: 2,
            rqx: 10,
            rqy: 2,
            tx: 10,
            ty: 2,
            len: 2,
            rot: 0
        },
        {
            px: 13,
            py: 1,
            rqx: 13,
            rqy: 1,
            tx: 13,
            ty: 1,
            len: 3,
            rot: 0
        },
        {
            px: 10,
            py: 1,
            rqx: 10,
            rqy: 1,
            tx: 10,
            ty: 1,
            len: 3,
            rot: 0
        },
        {
            px: 10,
            py: 0,
            rqx: 10,
            rqy: 0,
            tx: 10,
            ty: 0,
            len: 4,
            rot: 0
        },
    ])
    const ships = shipsRef.current;
    const fieldRef = useRef(Array(10).fill(null).map(() => Array(10).fill(-1)));
    function TapRotHandle(x,y) {
        //console.log(x, y);
    }
    return (
        <header className="App-header" onMouseUp={(e) => MouseUp(e)} onMouseMove={(e) => MouseMove(e)}>
            <div className="bckgr"></div>
            <div className="fieldEditBigTab">
                {grid.map(el =>
                    <div key={el.id}
                        data-cellx={el.x}
                        data-celly={el.y}

                        style={{

                        position: 'absolute',
                        left: el.x * 7.7 + 3 + 'vh',
                        top: el.y * 7.7 + 3 + 'vh',
                        width: '7vh',
                        height: '7vh',
                        backgroundColor: 'rgb(0,0,0,0.5)',
                        borderRadius: '1vh'
                    }} onMouseUp={(x,y)=>TapRotHandle(el.x,el.y) }></div>
                )
                }
                <label style={
                    {
                        position: 'absolute',
                        left: '85vh',
                        top: '46vh',
                    }
                }>Расставить автоматически:</label>
                <button className='fieldButt' style={{ top: '54vh' }}>Случайно</button>
                <button className='fieldButt' style={{ top: '61vh' }}>Береговой метод</button>
                <button className='fieldButt' style={{ top: '68vh' }}>Ассиметричный метод</button>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 9)} src={p4} style={{ height: '5.3vh', position: 'absolute', transform: ships[9].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[9].tx * 7.7 + 'vh', top: 3.8 + ships[9].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 8)} src={p3} style={{ height: '5.3vh', position: 'absolute', transform: ships[8].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[8].tx * 7.7 + 'vh', top: 3.8 + ships[8].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 7)} src={p3} style={{ height: '5.3vh', position: 'absolute', transform: ships[7].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[7].tx * 7.7 + 'vh', top: 3.8 + ships[7].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 6)} src={p2} style={{ height: '5.3vh', position: 'absolute', transform: ships[6].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[6].tx * 7.7 + 'vh', top: 3.8 + ships[6].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 5)} src={p2} style={{ height: '5.3vh', position: 'absolute', transform: ships[5].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[5].tx * 7.7 + 'vh', top: 3.8 + ships[5].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 4)} src={p2} style={{ height: '5.3vh', position: 'absolute', transform: ships[4].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[4].tx * 7.7 + 'vh', top: 3.8 + ships[4].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 3)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: ships[3].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[3].tx * 7.7 + 'vh', top: 3.8 + ships[3].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 2)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: ships[2].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[2].tx * 7.7 + 'vh', top: 3.8 + ships[2].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 1)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: ships[1].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[1].tx * 7.7 + 'vh', top: 3.8 + ships[1].ty * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' onMouseDown={(e) => MouseDown(e, 0)} src={p1} style={{ height: '5.3vh', position: 'absolute', transform: ships[0].rot ? 'rotate(90deg) translate(0, -100%)' : 'rotate(0deg)', transformOrigin: 'top left', left: 3.8 + ships[0].tx * 7.7 + 'vh', top: 3.8 + ships[0].ty * 7.7 + 'vh' }}></img>
                {redFlags.map(el =>
                    <div
                        key={el.id }
                        style={{

                            position: 'absolute',
                            left: el.x * 7.7 + 3 + 'vh',
                            top: el.y * 7.7 + 3 + 'vh',
                            width: '7vh',
                            height: '7vh',
                            backgroundColor: 'rgb(255,0,0,' + el.a + ')',
                            pointerEvents:'none',
                            
                        }} ></div>
                )
                }
                <button onClick={handleClick} className="partbutton">Играть
                </button>
            </div>

        </header>
    );
}

export default App;