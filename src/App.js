import './App.css';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import logolabelimg from './лого_надпись.png';
import logoimgimg from './лого_корабль.png';
import { BrowserRouter as Router, Route, Routes, useNavigate,Link,useLocation } from 'react-router-dom';
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
import Auth from './Auth';
import { authorizedFetch } from './api';
import Regis from './Regis';
import SelectedMenu from './SelectedMenu';
import Singleplayer from './Singleplayer';
import MenuComponent from './MenuComponent';
import CreateRoom from './CreateRoom';
import Connect from './Connect';
import ProfSet from './ProfSet';
import Rules from './Rules';
import About from './About';
import System from './System';
import SingleplayerMatchScreen from './components/SingleplayerMatchScreen';
import MultiplayerMatchScreen from './MultiplayerMatchScreen';

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
                    <Route path="/singleplayer-match" element={<SingleplayerMatchScreen />} />
                    <Route path="/multiplayer-match" element={<MultiplayerMatchScreen />} />
                </Routes>
            </div>
        </Router>
    );
}

function FieldEdit() {
    const navigate = useNavigate();
    const { joinRoom, joinInfo, placeHostShips } = useMultiplayerWS();
    const [movinShip, setMS] = useState(-1);
    const [mos, setMos] = useState(null);
    const [autoError, setAutoError] = useState('');
    const [waitingJoin, setWaitingJoin] = useState(false);
    const [error, setError] = useState('');
    const [buttonActive, setButtonActive] = useState(false);
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
            let foractivebutt = 0;
            let globalred = false;
            for (let y = 0; y < 10; y++)
                for (let x = 0; x < 10; x++) {
                    let red = false;
                    if (field[y][x] !== -1) {
                        if (y + 1 < 10) {
                            if (x + 1 < 10) {
                                if (field[y + 1][x + 1] !== field[y][x] && field[y + 1][x + 1] !== -1)
                                    red = true;
                            }
                            if (x - 1 > -1) {
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
                        if (y - 1 > -1) {
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
                    else {
                        foractivebutt++;
                    }
                    
                    if (field[y][x] === 10 || red) {
                        redFlags[y * 10 + x] = { x, y, a: 0.5 };
                        globalred = true;
                    }
                    else
                        redFlags[y * 10 + x] = { x, y, a: 0 };
                }

            setMos(null)
            setMS(-1);
            setButtonActive(foractivebutt === 80 && !globalred);
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
    const location = useLocation();
    const mode = location.state?.mode;
    const timeoutRef = useRef(null);
    const waitingJoinRef = useRef(waitingJoin);

    useEffect(() => {
        waitingJoinRef.current = waitingJoin;
    }, [waitingJoin]);
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
        
        if (multiplayerCode && multiplayerRole === 'guest' && mode === 'multiplayer') {
            try {
                let userId = Number(localStorage.getItem('userId'));
                if (!userId) {
                    userId = Date.now() + Math.floor(Math.random()*1000);
                    localStorage.setItem('userId', userId);
                }
                joinRoom({ gameCode: multiplayerCode, ships: shipsData, userId });
                console.log('[FieldEdit] joinRoom вызван');
                setWaitingJoin(true);
                console.log(waitingJoinRef);
                timeoutRef.current = setTimeout(() => {
                    console.log('5cсек прошло', waitingJoinRef, joinInfo)
                    if (waitingJoinRef) {
                        setError('Истекло время ожидания ответа (возможно, игра не создана)');
                    }
                }, 5000);
            } catch (e) {
                setError('Ошибка подключения к игре: ' + e.message);
            }
            return;
        }
        if (multiplayerCode && multiplayerRole === 'host' && mode === 'multiplayer') {
            try {
                let userId = Number(localStorage.getItem('userId'));
                if (!userId) {
                    userId = Date.now() + Math.floor(Math.random()*1000);
                    localStorage.setItem('userId', userId);
                }
                placeHostShips({ gameCode: multiplayerCode, ships: shipsData, userId });
                setWaitingJoin(true); // Ожидание второго игрока

            } catch (e) {
                setError('Ошибка размещения кораблей: ' + e.message);
            }
            return;
        }
        // --- СИНГЛПЛЕЕР ---
        // Очищаем мультиплеерные ключи, чтобы не было конфликтов
        localStorage.removeItem('multiplayer_gameCode');
        localStorage.removeItem('multiplayer_role');
        localStorage.removeItem('multiplayer_gameId');
        // --- СИНГЛПЛЕЕР ---
        const difficultyLevel = localStorage.getItem('singleplayer_difficulty') || 'MEDIUM';
        console.log('[FieldEdit] Создание одиночной игры, токен:', localStorage.getItem('token'));
        try {
            const response = await authorizedFetch('http://193.233.103.183:8080/game/singleplayer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ships: shipsData,
                    difficultyLevel
                })
            });
            if (response.status === 403) {
                console.log('[FieldEdit] Получен 403 при создании игры, токен недействителен');
                localStorage.removeItem('token');
                navigate('/');
                setError('Сессия истекла. Пожалуйста, войдите снова.');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                console.log('[FieldEdit] Игра создана:', data);

                // ДОБАВЛЕНО: Запуск игры после создания
                try {
                    const startResponse = await authorizedFetch(`http://193.233.103.183:8080/game/start/${data.id}`, {
                        method: 'POST'
                    });

                    if (startResponse.ok) {
                        console.log('[FieldEdit] Игра успешно запущена');
                        localStorage.setItem('singleplayer_gameId', data.id);
                        navigate('/singleplayer-match');
                    } else {
                        const startErrorData = await startResponse.json().catch(() => ({}));
                        setError(startErrorData.message || 'Ошибка запуска игры: ' + startResponse.status);
                    }
                } catch (startError) {
                     console.error('[FieldEdit] Ошибка при запуске игры:', startError);
                     setError('Ошибка соединения с сервером при запуске игры');
                }

            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || 'Ошибка создания игры: ' + response.status);
            }
        } catch (e) {
            console.error('[FieldEdit] Ошибка при создании игры:', e);
            setError('Ошибка соединения с сервером');
        }
    }
    // ДОБАВЛЕНО: useEffect для перехода на матч после joinInfo
    useEffect(() => {
        if (waitingJoin && joinInfo) {
            console.log('[FieldEdit] joinInfo получен:', joinInfo);
            setWaitingJoin(false);
            // Сохраняем идентификатор игры для мультиплеерного матча
            if (joinInfo.gameCode) {
                localStorage.setItem('multiplayer_gameId', joinInfo.gameCode);
            } else if (joinInfo.id) {
                localStorage.setItem('multiplayer_gameId', joinInfo.id);
            }
            navigate('/multiplayer-match');
        }
    }, [waitingJoin, joinInfo, navigate]);
    // --- ДОБАВЛЕНО: автоматическая расстановка ---
    async function handleAutoPlace(strategy) {
        setAutoError('');
        try {
            const response = await authorizedFetch(`http://193.233.103.183:8080/game/generate-ships/${strategy}`);
            if (response.ok) {
                const data = await response.json();
                // data - массив кораблей [{size, x, y, horizontal}]
                if (Array.isArray(data)) {
                    for (let i = 0; i < ships.length; i++) {
                        if (data[9 - i]) {
                            ships[i].rqx = ships[i].tx = ships[i].px = data[9 - i].x;
                            ships[i].rqy = ships[i].ty = ships[i].py = data[9 - i].y;
                            ships[i].len = data[9 - i].size;
                            ships[i].rot = data[9 - i].horizontal ? 0 : 1;
                        }
                    }
                }
                setButtonActive(true);
            } else {
                setAutoError('Ошибка генерации: ' + response.status);
            }
        } catch (e) {
            setAutoError('Ошибка соединения с сервером');
        }
    }
    // В рендере добавить экран ожидания для host
    const multiplayerRole = localStorage.getItem('multiplayer_role');
    // Показываем сообщение ожидания внизу, не заменяя содержимое страницы
    const waitingGuestMessage = (waitingJoin && multiplayerRole === 'host') ? (
        <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '3vh',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '2vh 4vh',
            borderRadius: '2vh',
            fontSize: '2.5vh',
            zIndex: 10,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
            <div style={{fontWeight: 'bold', fontSize: '3vh'}}>Ожидание второго игрока...</div>
            <div>Передайте код комнаты другу и дождитесь его подключения.</div>
        </div>
    ) : null;
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
                <button onClick={handleClick} className="partbutton" disabled={!buttonActive}>Играть</button>
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
                
            </div>
            {error && <div style={{ color: 'red', position: 'absolute', left: '85vh', top: '80vh' }}>{error}</div>}
            {waitingGuestMessage}
        </header>
    );
}

export default App;