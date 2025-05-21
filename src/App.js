import './App.css';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import logolabelimg from './лого_надпись.png';
import logoimgimg from './лого_корабль.png';
import { BrowserRouter as Router, Route, Routes, useNavigate,Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
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
import { useMultiplayerWS } from './useMultiplayerWS';
import SockJS from 'sockjs-client';


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
                    <Route path="/match" element={<MatchScreen />} />
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
    const playClick = () => {
        // Сохраняем выбранную сложность в localStorage
        let diff = 'EASY';
        if (selected === 1) diff = 'MEDIUM';
        if (selected === 2) diff = 'HARD';
        localStorage.setItem('singleplayer_difficulty', diff);
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
    const { createRoom, roomCode, connected, error: wsError } = useMultiplayerWS();
    const [created, setCreated] = useState(false);
    const [error, setError] = useState('');
    const [ships, setShips] = useState([
        { size: 4, x: 0, y: 0, horizontal: true },
        { size: 3, x: 2, y: 2, horizontal: true },
        { size: 3, x: 4, y: 4, horizontal: true },
        { size: 2, x: 6, y: 6, horizontal: true },
        { size: 2, x: 8, y: 8, horizontal: true },
        { size: 2, x: 1, y: 1, horizontal: true },
        { size: 1, x: 3, y: 3, horizontal: true },
        { size: 1, x: 5, y: 5, horizontal: true },
        { size: 1, x: 7, y: 7, horizontal: true },
        { size: 1, x: 9, y: 9, horizontal: true },
    ]);

    // Обработка ошибок WebSocket
    useEffect(() => {
        if (wsError) {
            setError(wsError);
        }
    }, [wsError]);

    // Обработка получения кода комнаты
    useEffect(() => {
        if (roomCode && roomCode.gameCode) {
            console.log('[CreateRoom] Получен код комнаты:', roomCode);
            setCreated(true);
        }
    }, [roomCode]);

    const handleCreate = async () => {
        setError('');
        if (!connected) {
            setError('Нет соединения с сервером');
            return;
        }
        try {
            // Создаем комнату через WebSocket
            createRoom({ ships });
        } catch (e) {
            setError('Ошибка создания комнаты: ' + e.message);
        }
    };

    const handleCopy = () => {
        if (roomCode && roomCode.gameCode) {
            navigator.clipboard.writeText(roomCode.gameCode)
                .then(() => {
                    localStorage.setItem('multiplayer_gameCode', roomCode.gameCode);
                    localStorage.setItem('multiplayer_role', 'host');
                    navigate('/fieldedit');
                })
                .catch(err => {
                    setError('Ошибка копирования кода: ' + err.message);
                });
        }
    };

    return (
        <MenuComponent selctdMenu='1'>
            <div style={{ 
                position: 'absolute', 
                top: '20vh', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '100%',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{ marginBottom: '2vh' }}>Создание игры</h2>
                {!created ? (
                    <>
                        <div style={{ marginBottom: '2vh' }}>
                            Нажмите кнопку для создания новой игры
                        </div>
                        <button 
                            onClick={handleCreate} 
                            className="copybutt"
                            style={{ marginTop: '2vh' }}
                        >
                            Создать игру
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '2vh' }}>
                            Код вашей игры:
                        </div>
                        <div style={{ 
                            fontSize: '3vh',
                            letterSpacing: '0.5vh',
                            marginBottom: '2vh',
                            fontFamily: 'monospace'
                        }}>
                            {roomCode.gameCode}
                        </div>
                        <button 
                            onClick={handleCopy} 
                            className="copybutt"
                            style={{ marginTop: '2vh' }}
                        >
                            Начать игру
                        </button>
                    </>
                )}
                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginTop: '2vh',
                        fontSize: '1.8vh'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </MenuComponent>
    );
}
function Connect() {
    const navigate = useNavigate();
    const [gameCode, setGameCode] = useState('');
    const [error, setError] = useState('');
    const { joinRoom, joinInfo, connected, error: wsError } = useMultiplayerWS();

    // Обработка ошибок WebSocket
    useEffect(() => {
        if (wsError) {
            setError(wsError);
        }
    }, [wsError]);

    // Обработка успешного подключения
    useEffect(() => {
        if (joinInfo) {
            console.log('[Connect] Успешное подключение:', joinInfo);
            navigate('/fieldedit');
        }
    }, [joinInfo, navigate]);

    const handleJoin = () => {
        setError('');
        if (!connected) {
            setError('Нет соединения с сервером');
            return;
        }
        if (!gameCode) {
            setError('Введите код комнаты');
            return;
        }
        if (gameCode.length !== 6) {
            setError('Код комнаты должен состоять из 6 символов');
            return;
        }
        
        // Сохраняем код игры и роль в localStorage
        localStorage.setItem('multiplayer_gameCode', gameCode);
        localStorage.setItem('multiplayer_role', 'guest');
        
        // Переходим на страницу расстановки кораблей
        navigate('/fieldedit');
    };

    return (
        <MenuComponent selctdMenu='2'>
            <div style={{ 
                position: 'absolute', 
                top: '20vh', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '100%',
                textAlign: 'center',
                color: 'white'
            }}>
                <h2 style={{ marginBottom: '2vh' }}>Подключение к игре</h2>
                <div style={{ marginBottom: '2vh' }}>
                    Введите код комнаты:
                </div>
                <input 
                    type="text" 
                    className="sgencodefield" 
                    value={gameCode} 
                    onChange={e => setGameCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="XXXXXX"
                    style={{ 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5vh',
                        fontSize: '2vh',
                        textAlign: 'center'
                    }}
                />
                <button 
                    onClick={handleJoin} 
                    className="copybutt"
                    style={{ marginTop: '2vh' }}
                >
                    Войти
                </button>
                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginTop: '2vh',
                        fontSize: '1.8vh'
                    }}>
                        {error}
                    </div>
                )}
            </div>
        </MenuComponent>
    );
}
function ProfSet() {
    const [selavx, setSelavx] = useState(-3.5);
    const [selavy, setSelavy] = useState(5.5);
    const [login, setLogin] = useState('');
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [repeatPass, setRepeatPass] = useState('');
    const [avaId, setAvaId] = useState(Number(localStorage.getItem('avatarId')) || 0);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    function selectAva(i) {
        setAvaId(i);
        switch (i) {
            case 0: setSelavx(-3.5); setSelavy(5.5); break;
            case 1: setSelavx(6.5); setSelavy(5.5); break;
            case 2: setSelavx(16.5); setSelavy(5.5); break;
            case 3: setSelavx(26.5); setSelavy(5.5); break;
            case 4: setSelavx(36.5); setSelavy(5.5); break;
            case 5: setSelavx(-3.5); setSelavy(15.5); break;
            case 6: setSelavx(6.5); setSelavy(15.5); break;
            case 7: setSelavx(16.5); setSelavy(15.5); break;
            case 8: setSelavx(26.5); setSelavy(15.5); break;
            case 9: setSelavx(36.5); setSelavy(15.5); break;
            default: break;
        }
    }

    async function saveClick() {
        setMsg(''); setErr('');
        if (newPass && newPass !== repeatPass) {
            setErr('Пароли не совпадают');
            return;
        }
        // Формируем только изменённые поля
        const req = {};
        if (login) req.username = login;
        if (newPass) req.password = newPass;
        if (avaId !== Number(localStorage.getItem('avatarId'))) req.avatarId = avaId;
        if (Object.keys(req).length === 0) {
            setErr('Нет изменений для сохранения');
            return;
        }
        try {
            const response = await authorizedFetch('http://localhost:8080/user/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req)
            });
            if (response.ok) {
                setMsg('Профиль успешно обновлён');
                if (req.username) localStorage.setItem('username', req.username);
                if (req.avatarId !== undefined) localStorage.setItem('avatarId', req.avatarId);
            } else if (response.status === 400) {
                setErr('Некорректные данные');
            } else if (response.status === 401) {
                setErr('Не авторизован');
            } else {
                setErr('Ошибка: ' + response.status);
            }
        } catch (e) {
            setErr('Ошибка соединения с сервером');
        }
    }
    return (
        <MenuComponent selctdMenu='3'>
            <div style={{ position: 'absolute', top: '10vh', left: '15vh', fontSize: '6vh' }}>Аватар:</div>
            <SelectedAva x={selavx} y={selavy}></SelectedAva>
            <Avatimbut y='7' x='-2' img={avaimg0} onClick={() => { selectAva(0) }} />
            <Avatimbut y='7' x='8' img={avaimg1} onClick={() => { selectAva(1) }} />
            <Avatimbut y='7' x='18' img={avaimg2} onClick={() => { selectAva(2) }} />
            <Avatimbut y='7' x='28' img={avaimg3} onClick={() => { selectAva(3) }} />
            <Avatimbut y='7' x='38' img={avaimg4} onClick={() => { selectAva(4) }} />
            <Avatimbut y='17' x='-2' img={avaimg5} onClick={() => { selectAva(5) }} />
            <Avatimbut y='17' x='8' img={avaimg6} onClick={() => { selectAva(6) }} />
            <Avatimbut y='17' x='18' img={avaimg7} onClick={() => { selectAva(7) }} />
            <Avatimbut y='17' x='28' img={avaimg8} onClick={() => { selectAva(8) }} />
            <Avatimbut y='17' x='38' img={avaimg9} onClick={() => { selectAva(9) }} />
            <input style={{top: '33vh'}} type="text" placeholder="Новый логин" className="profSetInputs" value={login} onChange={e=>setLogin(e.target.value)} />
            <input style={{ top: '40vh' }} type="password" placeholder="Старый пароль (не требуется)" className="profSetInputs" value={oldPass} onChange={e=>setOldPass(e.target.value)} />
            <input style={{ top: '47vh' }} type="password" placeholder="Новый пароль" className="profSetInputs" value={newPass} onChange={e=>setNewPass(e.target.value)} />
            <input style={{ top: '54vh' }} type="password" placeholder="Повторите пароль" className="profSetInputs" value={repeatPass} onChange={e=>setRepeatPass(e.target.value)} />
            <button onClick={saveClick} className="savebutt">Сохранить изменения</button>
            {msg && <div style={{color:'green',marginTop:'2vh'}}>{msg}</div>}
            {err && <div style={{color:'red',marginTop:'2vh'}}>{err}</div>}
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
                <label onClick={() => { localStorage.clear(); navigate('/'); }} style={{ color: 'red', cursor: 'pointer' }}>Выйти</label><br />
            </div>
            <SelectedMenu y={selctdMenu}></SelectedMenu>
            <div className="menuBigTab">{children}</div>
        </header>
    );
}
function FieldEdit() {
    const navigate = useNavigate();
    const { joinRoom, joinInfo } = useMultiplayerWS();
    const [movinShip, setMS] = useState(-1);
    const [mos, setMos] = useState(null);
    const [autoError, setAutoError] = useState('');
    const [waitingJoin, setWaitingJoin] = useState(false);
    const [error, setError] = useState('');
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
    async function handleClick() {
        setError('');
        const ships = shipsRef.current;
        const shipsData = ships.map(ship => ({
            size: ship.len,
            x: Math.round(ship.rqx),
            y: Math.round(ship.rqy),
            horizontal: ship.rot === 0
        }));
        const multiplayerCode = localStorage.getItem('multiplayer_gameCode');
        const multiplayerRole = localStorage.getItem('multiplayer_role');
        console.log('[FieldEdit] handleClick', { multiplayerCode, multiplayerRole, shipsData });
        
        if (multiplayerCode && multiplayerRole === 'guest') {
            try {
                joinRoom({ gameCode: multiplayerCode, ships: shipsData });
                console.log('[FieldEdit] joinRoom вызван');
                setWaitingJoin(true);
            } catch (e) {
                setError('Ошибка подключения к игре: ' + e.message);
            }
            return;
        }
        
        // --- СИНГЛПЛЕЕР ---
        const difficultyLevel = localStorage.getItem('singleplayer_difficulty') || 'MEDIUM';
        try {
            const response = await authorizedFetch('http://localhost:8080/game/singleplayer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ships: shipsData,
                    difficultyLevel
                })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('singleplayer_gameId', data.id);
                navigate('/match');
            } else {
                setError('Ошибка создания игры: ' + response.status);
            }
        } catch (e) {
            setError('Ошибка соединения с сервером');
        }
    }
    // ДОБАВЛЕНО: useEffect для перехода на матч после joinInfo
    useEffect(() => {
        if (waitingJoin && joinInfo) {
            console.log('[FieldEdit] joinInfo получен:', joinInfo);
            setWaitingJoin(false);
            navigate('/match');
        }
    }, [waitingJoin, joinInfo, navigate]);
    // --- ДОБАВЛЕНО: автоматическая расстановка ---
    async function handleAutoPlace(strategy) {
        setAutoError('');
        try {
            const response = await authorizedFetch(`http://localhost:8080/game/generate-ships/${strategy}`);
            if (response.ok) {
                const data = await response.json();
                // data - массив кораблей [{size, x, y, horizontal}]
                if (Array.isArray(data)) {
                    for (let i = 0; i < ships.length; i++) {
                        if (data[i]) {
                            ships[i].rqx = ships[i].tx = ships[i].px = data[i].x;
                            ships[i].rqy = ships[i].ty = ships[i].py = data[i].y;
                            ships[i].len = data[i].size;
                            ships[i].rot = data[i].horizontal ? 0 : 1;
                        }
                    }
                }
            } else {
                setAutoError('Ошибка генерации: ' + response.status);
            }
        } catch (e) {
            setAutoError('Ошибка соединения с сервером');
        }
    }
    // --- ДОБАВЛЕНО: автоматическая игра ---
    async function handleAutoGame() {
        setAutoError('');
        const difficultyLevel = localStorage.getItem('singleplayer_difficulty') || 'MEDIUM';
        try {
            const response = await authorizedFetch('http://localhost:8080/game/singleplayer/auto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficultyLevel })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('singleplayer_gameId', data.id);
                navigate('/match');
            } else {
                setAutoError('Ошибка создания авто-игры: ' + response.status);
            }
        } catch (e) {
            setAutoError('Ошибка соединения с сервером');
        }
    }
    useEffect(() => {
        console.log('[FieldEdit] Монтирование компонента. multiplayer_gameCode:', localStorage.getItem('multiplayer_gameCode'), 'multiplayer_role:', localStorage.getItem('multiplayer_role'));
    }, []);
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
                )}
                <label style={{ position: 'absolute', left: '85vh', top: '46vh' }}>Расставить автоматически:</label>
                <button className='fieldButt' style={{ top: '54vh' }} onClick={() => handleAutoPlace('RANDOM')}>Случайно</button>
                <button className='fieldButt' style={{ top: '61vh' }} onClick={() => handleAutoPlace('SHORE')}>Береговой метод</button>
                <button className='fieldButt' style={{ top: '68vh' }} onClick={() => handleAutoPlace('ASYMMETRIC')}>Ассиметричный метод</button>
                <button className='fieldButt' style={{ top: '75vh', background: '#4caf50', color: 'white' }} onClick={handleAutoGame}>Играть автоматически</button>
                {autoError && <div style={{ color: 'red', position: 'absolute', left: '85vh', top: '80vh' }}>{autoError}</div>}
                {waitingJoin && <div style={{ color: 'white', position: 'absolute', left: '85vh', top: '80vh' }}>Подключение к игре...</div>}
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
            {error && <div style={{ color: 'red', position: 'absolute', left: '85vh', top: '80vh' }}>{error}</div>}
        </header>
    );
}
function MatchScreen() {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [moveError, setMoveError] = useState('');
    const [moveResult, setMoveResult] = useState(null);
    const gameId = localStorage.getItem('singleplayer_gameId');
    const multiplayerCode = localStorage.getItem('multiplayer_gameCode');
    const multiplayerRole = localStorage.getItem('multiplayer_role');
    const { gameState: wsGameState, moveInfo, sendMove, requestState, error: wsError } = useMultiplayerWS();
    const [mpGame, setMpGame] = useState(null);
    const [mpLoading, setMpLoading] = useState(true);
    const [mpMoveError, setMpMoveError] = useState('');
    const [mpMoveResult, setMpMoveResult] = useState(null);

    // Обработка ошибок WebSocket
    useEffect(() => {
        if (wsError) {
            setError(wsError);
        }
    }, [wsError]);

    // Запрос состояния игры для host
    useEffect(() => {
        if (multiplayerCode && multiplayerRole === 'host' && !mpGame) {
            try {
                requestState({ gameCode: multiplayerCode });
            } catch (error) {
                console.error('Ошибка при запросе состояния игры:', error);
                setError('Ошибка соединения с сервером');
            }
        }
    }, [multiplayerCode, multiplayerRole, mpGame, requestState]);

    // Запрос состояния игры для guest
    useEffect(() => {
        if (multiplayerCode && multiplayerRole === 'guest' && !mpGame) {
            try {
                requestState({ gameCode: multiplayerCode });
            } catch (error) {
                console.error('Ошибка при запросе состояния игры:', error);
                setError('Ошибка соединения с сервером');
            }
        }
    }, [multiplayerCode, multiplayerRole, mpGame, requestState]);

    // Обновление состояния игры при получении данных от WebSocket
    useEffect(() => {
        if (wsGameState) {
            setMpGame(wsGameState);
            setMpLoading(false);
            setError('');
        }
    }, [wsGameState]);

    // Обработка ходов
    useEffect(() => {
        if (moveInfo) {
            setMpMoveResult(moveInfo);
            if (moveInfo.gameState) {
                setMpGame(moveInfo.gameState);
            }
            setMpMoveError('');
        }
    }, [moveInfo]);

    // Ход игрока (multiplayer)
    function handleMpCellClick(x, y) {
        setMpMoveError('');
        setMpMoveResult(null);
        
        if (!mpGame) {
            setMpMoveError('Игра не загружена');
            return;
        }
        
        if (mpGame.gameState !== 'IN_PROGRESS') {
            setMpMoveError('Игра не активна');
            return;
        }
        
        if (!mpGame.playerTurn) {
            setMpMoveError('Не ваш ход');
            return;
        }

        try {
            sendMove({
                gameCode: multiplayerCode,
                x: x,
                y: y
            });
        } catch (e) {
            setMpMoveError('Ошибка отправки хода: ' + e.message);
        }
    }

    // Выход из игры
    function handleExit() {
        localStorage.removeItem('multiplayer_gameCode');
        localStorage.removeItem('multiplayer_role');
        navigate('/');
    }

    // Рендер доски
    function renderBoard(board, isEnemy, onCellClick) {
        if (!board) return null;
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,3vh)', gridTemplateRows: 'repeat(10,3vh)', gap: '0.2vh', margin: '1vh' }}>
                {board.map((row, y) => row.map((cell, x) => {
                    let bg = '#1e90ff';
                    if (cell > 0 && !isEnemy) bg = '#444'; // корабль игрока
                    if (cell === 2) bg = '#eee'; // промах
                    if (cell === 3) bg = '#e53935'; // попадание
                    return (
                        <div 
                            key={x+','+y} 
                            onClick={isEnemy && onCellClick ? () => onCellClick(x,y) : undefined} 
                            style={{ 
                                width: '3vh', 
                                height: '3vh', 
                                background: bg, 
                                border: '1px solid #222', 
                                cursor: isEnemy && onCellClick ? 'pointer' : 'default' 
                            }}
                        />
                    );
                }))}
            </div>
        );
    }

    // Мультиплеер UI
    if (multiplayerCode) {
        if (mpLoading) {
            return (
                <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>
                    Загрузка игры...
                </div>
            );
        }

        if (!mpGame) {
            return (
                <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>
                    Ошибка загрузки игры
                    <button onClick={handleExit} style={{ marginTop: '2vh' }}>Выйти</button>
                </div>
            );
        }

        return (
            <div style={{ padding: '2vh' }}>
                <div style={{ color: 'white', marginBottom: '2vh' }}>
                    Код игры: {multiplayerCode}
                    <button onClick={handleExit} style={{ marginLeft: '2vh' }}>Выйти</button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div>
                        <div style={{ color: 'white', marginBottom: '1vh' }}>Ваше поле</div>
                        {mpGame.playerBoard && renderBoard(mpGame.playerBoard.board, false)}
                    </div>
                    <div>
                        <div style={{ color: 'white', marginBottom: '1vh' }}>Поле противника</div>
                        {mpGame.computerBoard && renderBoard(mpGame.computerBoard.board, true, (x,y) => {
                            if (mpGame.gameState === 'IN_PROGRESS' && mpGame.playerTurn) {
                                handleMpCellClick(x,y);
                            }
                        })}
                    </div>
                </div>

                <div style={{ color: 'white', marginTop: '2vh' }}>
                    Статус: {mpGame.gameState === 'IN_PROGRESS' ? 'Игра идет' : 'Ожидание'}
                    {mpGame.gameState === 'IN_PROGRESS' && (
                        <span style={{ marginLeft: '2vh' }}>
                            Ход: {mpGame.playerTurn ? 'Ваш' : 'Соперника'}
                        </span>
                    )}
                </div>

                {mpMoveResult && (
                    <div style={{ 
                        color: mpMoveResult.hit ? 'green' : 'orange', 
                        marginTop: '1vh' 
                    }}>
                        {mpMoveResult.hit ? 'Попадание!' : 'Промах!'}
                        {mpMoveResult.sunk && ' Корабль потоплен!'}
                        {mpMoveResult.gameOver && ' Игра окончена!'}
                    </div>
                )}

                {mpMoveError && (
                    <div style={{ color: 'red', marginTop: '1vh' }}>
                        {mpMoveError}
                    </div>
                )}

                {error && (
                    <div style={{ color: 'red', marginTop: '1vh' }}>
                        {error}
                    </div>
                )}
            </div>
        );
    }

    // ... rest of the singleplayer code ...
}

async function authorizedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = options.headers ? { ...options.headers } : {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

export default App;