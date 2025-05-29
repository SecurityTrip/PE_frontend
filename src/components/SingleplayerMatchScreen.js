import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './SingleplayerMatchScreen.css';
import promah from '../ps/promah.png';
import popal from '../ps/popal.png';
import p1 from '../ps/p1.png';
import p2 from '../ps/p2.png';
import p3 from '../ps/p3.png';
import p4 from '../ps/p4.png';
import avaimg0 from '../avas/avaimg0.gif';
import avaimg1 from '../avas/avaimg1.gif';
import avaimg2 from '../avas/avaimg2.gif';
import avaimg3 from '../avas/avaimg3.gif';
import avaimg4 from '../avas/avaimg4.gif';
import avaimg5 from '../avas/avaimg5.gif';
import avaimg6 from '../avas/avaimg6.gif';
import avaimg7 from '../avas/avaimg7.gif';
import avaimg8 from '../avas/avaimg8.gif';
import avaimg9 from '../avas/avaimg9.gif';
import botava from '../avas/botava.jpg';
import winimg from '../ps/win.png';
import loseimg from '../ps/lose.png';
import MusicPlayer from '../MusicPlayer';
import SoundEffectPlayer from "../SoundEffectPlayer";
import hitSound from '../sound/hit.mp3';
import missSound from '../sound/miss.mp3';
import ToggleSwitch from '../ToggleSwitch';

// Вспомогательная функция для рендеринга доски
export function renderBoard(board, isEnemy, onCellClick, ships, missSoundRef,hitSoundRef) {
    

    if (!board) return null;

    console.log('[renderBoard] Данные для рендеринга:', {
        isEnemy,
        board,
        ships,
        boardType: isEnemy ? 'computer' : 'player'
    });

    // Helper to check if a cell is part of a ship
    const isShipCell = (cellX, cellY, ship) => {
        for (let i = 0; i < ship.size; i++) {
            const shipPartX = ship.horizontal ? ship.x + i : ship.x;
            const shipPartY = ship.horizontal ? ship.y : ship.y + i;
            if (shipPartX === cellX && shipPartY === cellY) {
                return true;
            }
        }
        return false;
    };

    // --- Исправление: вычисляем sunk для кораблей, если его нет ---
    let shipsWithSunk = ships;
    if (ships && ships.length > 0 && typeof ships[0].sunk === 'undefined') {
        shipsWithSunk = ships.map(ship => ({
            ...ship,
            sunk: Array.isArray(ship.hits) && ship.hits.length === ship.size && ship.hits.every(Boolean)
        }));
    }

    // Helper to check if a cell is adjacent to a sunk ship
    const isAdjacentToSunkShip = (cellX, cellY, shipsArg) => {
        const shipsLocal = shipsArg || shipsWithSunk;
        if (!shipsLocal) return false;
        for (const ship of shipsLocal) {
            if (ship.sunk) {
                // Проверяем все клетки корабля
                for (let i = 0; i < ship.size; i++) {
                    const shipPartX = ship.horizontal ? ship.x + i : ship.x;
                    const shipPartY = ship.horizontal ? ship.y : ship.y + i;
                    // Проверяем все соседние клетки
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = shipPartX + dx;
                            const ny = shipPartY + dy;
                            // Если это текущая клетка и она не является частью корабля
                            if (nx === cellX && ny === cellY && !isShipCell(cellX, cellY, ship)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    return (
        <>
            {board.map((row, y) => row.map((cell, x) => {
                let cellClass = 'board-cell';
                let content = null;
                const shipsToUse = shipsWithSunk;
                if (!isEnemy && shipsToUse) {
                    // Логика для поля игрока
                    for (const ship of shipsToUse) {
                        if (isShipCell(x, y, ship)) {
                            cellClass += ' player-ship-cell';
                            // Проверяем, подбита ли эта часть корабля
                            let hitIndex = -1;
                            for(let i = 0; i < ship.size; i++) {
                                const shipPartX = ship.horizontal ? ship.x + i : ship.x;
                                const shipPartY = ship.horizontal ? ship.y : ship.y + i;
                                if (shipPartX === x && shipPartY === y) {
                                    hitIndex = i;
                                    break;
                                }
                            }
                            if (hitIndex !== -1 && ship.hits && ship.hits[hitIndex]) {
                                content = popal;
                            }
                            break;
                        }
                    }
                }

                // Обработка попаданий и промахов для обоих полей
                if (cell === 2 || (isEnemy && isAdjacentToSunkShip(x, y, shipsToUse))) { // Промах или клетка рядом с потопленным кораблем
                    cellClass += ' miss';
                    content = promah;
                } else if (cell === 3) { // Попадание
                    cellClass += ' hit';
                    
                    content = popal;

                    // Если это поле противника и клетка является частью потопленного корабля
                    if (isEnemy && shipsToUse) {
                        for (const ship of shipsToUse) {
                            if (ship.sunk && isShipCell(x, y, ship)) {
                                cellClass += ' sunk-enemy-ship-cell';
                                break;
                            }
                        }
                    }
                }

                return (<>
                    <div
                        key={x+','+y}
                        onClick={isEnemy && onCellClick ? () => onCellClick(x,y) : undefined}
                        className={cellClass}
                        style={{
                            cursor: isEnemy && onCellClick ? 'pointer' : 'default',
                            position: 'absolute',
                            left: (x * 7.7 + 3 + (isEnemy ? 93 : 0)) + 'vh',
                            top: y * 7.7 + 3 + 'vh',
                            width: '7vh',
                            height: '7vh',
                            backgroundColor: 'rgb(0,0,0,0.5)',
                            borderRadius: '1vh'
                        }}
                    >
                        <img src={content} style={{ width: '6vh', zIndex: '1001' }} ></img>
                    </div>
                    {content === popal && isEnemy && <div style={{
                        position: 'absolute',
                        left: (x * 7.7 + 97) + 'vh',
                        top: y * 7.7 + 4 + 'vh',
                        width: '5vh',
                        height: '5vh',
                        backgroundColor: 'rgb(255,212,0)',
                        borderRadius: '10vh'
                    }}></div>}
                </>
                );
            }))}
        </>
    );
}

const SingleplayerMatchScreen = () => {


    const audioRef = useRef(null);

    const handlePlay = () => {
        audioRef.current?.play();
    };

    const handlePause = () => {
        audioRef.current?.pause();
    };

    const hitSoundRef = useRef();
    const missSoundRef = useRef();

    const [settings, setSettings] = useState(false);
    const navigate = useNavigate();
    const stompClient = useRef(null);
    const [gameId, setGameId] = useState(localStorage.getItem('singleplayer_gameId'));
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [moveResult, setMoveResult] = useState(null);
    const [moveError, setMoveError] = useState('');


    const [flagA, setFlagA] = useState(true);
    const [flagB, setFlagB] = useState(true);
    const flagBRef = useRef(flagB);

    // Синхронизируй ref с флагом каждый раз при изменении
    useEffect(() => {
        flagBRef.current = flagB;
    }, [flagB]);

    const handleCheckboxA = (e) => {
        setFlagA(e.target.checked);
        if (e.target.checked)
            handlePlay();
        else
            handlePause();
    };

    const handleCheckboxB = (e) => {
        setFlagB(e.target.checked);
    };


    useEffect(() => {
        if (!gameId) {
            navigate('/singleplayer');
            return;
        }

        // Инициализация WebSocket соединения
        const client = new Client({
            webSocketFactory: () => new SockJS('http://193.233.103.183:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                
                // Подписываемся на обновления состояния игры
                client.subscribe('/topic/singleplayer/state', (message) => {
                    const gameData = JSON.parse(message.body);
                    console.log('[SingleplayerMatchScreen] Получены данные игры:', gameData);
                    setGame(gameData);
                    setLoading(false);
                });

                // Подписываемся на ответы на ходы
                client.subscribe('/topic/singleplayer/move', (message) => {
                    const moveResponse = JSON.parse(message.body);
                    console.log('Move response:', moveResponse);
                    setMoveResult(moveResponse);
                    console.log(flagB);
                    if (moveResponse && flagBRef.current) {
                        if (moveResponse.hit)
                            hitSoundRef.current?.play();
                        else
                            missSoundRef.current?.play();
                    } 


                });

                // Запрашиваем начальное состояние игры
                client.publish({
                    destination: "/app/singleplayer.state",
                    body: gameId
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
            },
            onError: (error) => {
                console.error('WebSocket error:', error);
                setError('Ошибка соединения с сервером');
            }
        });

        stompClient.current = client;
        client.activate();

        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, [gameId, navigate]);

    const handleCellClick = (x, y) => {
        console.log(flagA,flagB);
        if (flagA) {
            handlePlay();
        }
            

        if (!stompClient.current || !stompClient.current.connected) {
            setError('Нет соединения с сервером');
            return;
        }

        if (!game) {
            setMoveError('Игра не загружена');
            return;
        }

        if (game.gameState !== 'IN_PROGRESS') {
            setMoveError('Игра не активна');
            return;
        }

        if (!game.playerTurn) {
            setMoveError('Сейчас ход компьютера');
            return;
        }

        setMoveError('');
        setMoveResult(null);

        const moveRequest = {
            gameId: parseInt(gameId),
            x: x,
            y: y
        };

        stompClient.current.publish({
            destination: "/app/singleplayer.move",
            body: JSON.stringify(moveRequest)
        });

        // Запрашиваем обновление состояния игры после хода
        console.log('[SingleplayerMatchScreen] Запрос обновления состояния игры после хода');
        stompClient.current.publish({
            destination: "/app/singleplayer.state",
            body: gameId
        });


    };

    // Выход из игры (одиночная)
    function handleExit() {
        localStorage.removeItem('singleplayer_gameId');
        navigate('/singleplayer'); // Навигация обратно на выбор сложности
    }

    if (loading) {
        return (
            <header className="App-header">
                <div className="bckgr"></div>
                <div className="fieldEditBigTab" style={{ textAlign: 'center', paddingTop: '20vh' }}>
                    <div style={{ color: 'white', fontSize: '3vh' }}>Загрузка одиночной игры...</div>
                </div>
            </header>
        );
    }

    if (error) {
        return (
            <header className="App-header">
                <div className="bckgr"></div>
                <div className="fieldEditBigTab" style={{ textAlign: 'center', paddingTop: '20vh' }}>
                    <div style={{ color: 'white', fontSize: '3vh', marginBottom: '2vh' }}>{error}</div>
                    <button onClick={handleExit} className="fieldButt">Выйти</button>
                </div>
            </header>
        );
    }
    const avatars = [
        avaimg0, avaimg1, avaimg2, avaimg3, avaimg4,
        avaimg5, avaimg6, avaimg7, avaimg8, avaimg9
    ];

    // Получаем индекс из localStorage
    const avatarId = parseInt(localStorage.getItem('avatarId'), 10);

    // Безопасная подстановка изображения
    const avatarSrc = avatars[avatarId]



    
   

    return (
        /*<div className="field-edit-container">*/
            
            <header className="App-header">
            <div className="bckgr"></div>
            <MusicPlayer audioRef={audioRef} />
            <SoundEffectPlayer ref={hitSoundRef} src={hitSound} />
            <SoundEffectPlayer ref={missSoundRef} src={missSound} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '10vh',
                    height: '90vh',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    borderRadius: '4vh',
                    boxShadow: '0px 10px 10px 0px rgb(0,0,0,0.3)',
                    zIndex: '100'
                }}></div>

            <img src={avatarSrc} alt='аватар' style={{
                position: 'absolute',
                top: '1.5vh',
                left: 'calc(50% - 92vh)',
                height: '7vh',
                borderRadius: '2.5vh',
                transform: 'translate(-50%, 0)'
            }}></img>
            <div style={{
                position: 'absolute',
                top: '1.5vh',
                left: 'calc(50% - 85vh)',
                textAlign: 'left',
                color:'black'
            }}> {localStorage.getItem('username')}</div>
            <img src={botava} alt='аватар' style={{
                position: 'absolute',
                top: '1.5vh',
                left: 'calc(50% + 92vh)',
                height: '7vh',
                borderRadius: '2.5vh',
                transform: 'translate(-50%, 0)'
            }}></img>
            <div style={{
                position: 'absolute',
                display:'block',
                top: '1.5vh',
                left: '50%',
                textAlign: 'right',
                color: 'black',
                width: '85vh'
            }}>Бот</div>
            <button onClick={handleExit} className="fieldButt" style={{
                position: 'absolute',
                top: '95vh',
                left: 'calc(50% - 90vh)',
                width: '10vh',
                height: '5vh',
                transform: 'translate(-50%, -50%)',
                zIndex: '1101',
                backgroundColor:'red'
            }}>Выйти</button>
            <button
                onClick={() => setSettings(prev => !prev)}  // переключает переменную
                className="fieldButt"
                style={{
                    position: 'absolute',
                    top: '95vh',
                    left: 'calc(50% + 90vh)',  // смещение вправо
                    width: '15vh',
                    height: '5vh',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '1101'
                }}
            >
                Настройки
            </button>
                
            <div className="matchBigTab">



                {game && game.playerBoard && renderBoard(game.playerBoard.board, false, null, game.playerBoard.ships,missSoundRef,hitSoundRef)}
                {game && game.computerBoard && renderBoard(game.computerBoard.board, true, handleCellClick, game.computerBoard.ships, missSoundRef, hitSoundRef)}
                <img draggable={false} alt='' src={p4} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[9].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[9].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[9].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p3} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[8].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[8].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[8].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p3} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[7].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[7].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[7].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p2} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[6].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[6].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[6].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p2} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[5].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[5].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[5].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p2} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[4].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[4].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[4].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p1} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[3].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[3].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[3].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p1} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[2].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[2].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[2].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p1} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[1].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[1].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[1].y * 7.7 + 'vh' }}></img>
                <img draggable={false} alt='' src={p1} style={{ height: '5.3vh', position: 'absolute', transform: game.playerBoard.ships[0].horizontal ? 'rotate(0deg)' : 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left', left: 3.8 + game.playerBoard.ships[0].x * 7.7 + 'vh', top: 3.8 + game.playerBoard.ships[0].y * 7.7 + 'vh' }}></img>

                <div style={{
                    position: 'absolute',
                    color: 'white',
                    fontSize: '2vh',
                    textAlign: 'center',
                    marginTop: '3vh',
                    zIndex: '1000'
                }}>
                    {/*<div style={{*/}
                    {/*    //position: 'absolute',*/}
                    {/*    marginBottom: '1vh',*/}
                    {/*    //zIndex: '1000'*/}
                    {/*}}>*/}
                    {/*    Статус: {game && game.gameState === 'IN_PROGRESS' ? 'Игра идет' : (game && game.gameState === 'PLAYER_WINS' ? 'Вы выиграли!' : (game && game.gameState === 'COMPUTER_WINS' ? 'ИИ выиграл' : 'Завершена'))}*/}
                    {/*    {game && game.gameState === 'IN_PROGRESS' && (*/}
                    {/*        <span style={{ marginLeft: '2vh' }}>*/}
                    {/*            Ход: {game.playerTurn ? 'Ваш' : 'ИИ'}*/}
                    {/*        </span>*/}
                    {/*    )}*/}
                    {/*</div>*/}

                    {/*{moveResult && (*/}
                    {/*    <div style={{*/}
                    {/*        //position: 'absolute',*/}
                    {/*        color: moveResult.hit ? '#4caf50' : '#ff9800',*/}
                    {/*        marginTop: '1vh',*/}
                    {/*        fontSize: '2.2vh',*/}
                    {/*        //zIndex: '1000'*/}
                    {/*    }}>*/}
                    {/*        {moveResult.hit ? 'Попадание!' : 'Промах!'}*/}
                    {/*        {moveResult.sunk && ' Корабль потоплен!'}*/}
                    {/*        {moveResult.gameOver && ' Игра окончена!'}*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {moveError && (
                        <div style={{
                            //position: 'absolute',
                            color: '#f44336',
                            marginTop: '1vh',
                            fontSize: '2vh',
                            //zIndex: '1000'
                        }}>
                            {moveError}
                        </div>
                    )}

                    {error && gameId && (
                        <div style={{
                            //position: 'absolute',
                            color: '#f44336',
                            marginTop: '1vh',
                            fontSize: '2vh',
                            //zIndex: '1000'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

            </div>



            {game && game.gameState !== 'IN_PROGRESS' && <div style={{ position: 'absolute', zIndex: '1100', width: '100%', height: '100%', backgroundColor: 'rgb(0,0,0,0.5)' }}>
                {game && game.gameState === 'PLAYER_WON' && <div>
                    <img src={winimg} alt='победа' style={{ height: '30vh', marginTop: '30vh' } }></img><br/>
                    Победа!
                </div>}{game && game.gameState !== 'PLAYER_WON' && <div>
                    <img src={loseimg} alt='поражение' style={{ height: '30vh', marginTop: '30vh' }}></img><br />
                    Поражение! В следующий раз повезет!
                </div>}
            </div>}



            {settings && <div style={{ position: 'absolute', zIndex: '1100', width: '100%', height: '100%', backgroundColor: 'rgb(0,0,0,0.5)' }}>
                <div style={{ position: 'absolute', zIndex: '1100', width: '30vh', height: '20vh', top: '40vh', left: 'calc(50% - 15vh)', backgroundColor: 'rgb(0,0,0,0.7)' , fontSize:'4vh'}}>
                    <button onClick={() => setSettings(false)} style={{position:'absolute',right:'1vh',top:'1vh', backgroundColor: 'red',width:'4vh',height:'3vh',fontSize:'2vh' }}>x</button>
                    {/*<input*/}
                    {/*    type="checkbox"*/}
                    {/*    checked={flagA}*/}
                    {/*    onChange={handleCheckboxA}*/}
                    {/*    style={{position:'absolute',width:'3vh',height:'3vh',right:'2vh',top:'6vh'} }*/}
                    {/*/>*/}
                    {/*<input*/}
                    {/*    type="checkbox"*/}
                    {/*    checked={flagB}*/}
                    {/*    onChange={handleCheckboxB}*/}
                    {/*    style={{ position: 'absolute', width: '3vh', height: '3vh', right: '2vh', top: '12vh' }}*/}
                    {/*/>*/}
                    <ToggleSwitch
                        checked={flagA}
                        onChange={handleCheckboxA}
                        style={{ right: '2vh', top: '6vh' }}
                    />
                    <ToggleSwitch
                        checked={flagB}
                        onChange={handleCheckboxB}
                        style={{ right: '2vh', top: '12vh' }}
                    />
                    <br />Музыка
                    <br />Звук
                </div>
                
            </div>}



                {/*<div style={{*/}
                {/*    display: 'flex',*/}
                {/*    justifyContent: 'center',*/}
                {/*    alignItems: 'flex-start',*/}
                {/*    gap: '5vh'*/}
                {/*}}>*/}
                {/*    <div className="match-board-container">*/}
                {/*        <div style={{*/}
                {/*            color: 'white',*/}
                {/*            marginBottom: '1.5vh',*/}
                {/*            fontSize: '2.5vh',*/}
                {/*            textAlign: 'center'*/}
                {/*        }}>Ваше поле</div>*/}
                {/*        {game && game.playerBoard && renderBoard(game.playerBoard.board, false, null, game.playerBoard.ships)}*/}
                {/*    </div>*/}
                {/*     <div className="match-board-container">*/}
                {/*        <div style={{*/}
                {/*            color: 'white',*/}
                {/*            marginBottom: '1.5vh',*/}
                {/*            fontSize: '2.5vh',*/}
                {/*            textAlign: 'center'*/}
                {/*        }}>Поле ИИ</div>*/}
                {/*        {game && game.computerBoard && renderBoard(game.computerBoard.board, true, handleCellClick, game.computerBoard.ships)}*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div style={{*/}
                {/*    color: 'white',*/}
                {/*    fontSize: '2vh',*/}
                {/*    textAlign: 'center',*/}
                {/*    marginTop: '3vh'*/}
                {/*}}>*/}
                {/*    <div style={{ marginBottom: '1vh' }}>*/}
                {/*        Статус: {game && game.gameState === 'IN_PROGRESS' ? 'Игра идет' : (game && game.gameState === 'PLAYER_WON' ? 'Вы выиграли!' : (game && game.gameState === 'COMPUTER_WON' ? 'ИИ выиграл' : 'Завершена'))}*/}
                {/*        {game && game.gameState === 'IN_PROGRESS' && (*/}
                {/*            <span style={{ marginLeft: '2vh' }}>*/}
                {/*                Ход: {game.playerTurn ? 'Ваш' : 'ИИ'}*/}
                {/*            </span>*/}
                {/*        )}*/}
                {/*    </div>*/}

                {/*     {moveResult && (*/}
                {/*        <div style={{*/}
                {/*            color: moveResult.hit ? '#4caf50' : '#ff9800',*/}
                {/*            marginTop: '1vh',*/}
                {/*            fontSize: '2.2vh'*/}
                {/*        }}>*/}
                {/*            {moveResult.hit ? 'Попадание!' : 'Промах!'}*/}
                {/*            {moveResult.sunk && ' Корабль потоплен!'}*/}
                {/*            {moveResult.gameOver && ' Игра окончена!'}*/}
                {/*        </div>*/}
                {/*    )}*/}

                {/*     {moveError && (*/}
                {/*        <div style={{*/}
                {/*            color: '#f44336',*/}
                {/*            marginTop: '1vh',*/}
                {/*            fontSize: '2vh'*/}
                {/*        }}>*/}
                {/*            {moveError}*/}
                {/*        </div>*/}
                {/*    )}*/}

                {/*     {error && gameId && (*/}
                {/*        <div style={{*/}
                {/*            color: '#f44336',*/}
                {/*            marginTop: '1vh',*/}
                {/*            fontSize: '2vh'*/}
                {/*        }}>*/}
                {/*            {error}*/}
                {/*        </div>*/}
                {/*    )}*/}
            {/*</div>*/}




            </header>
        /*</div>*/
    );
};

export default SingleplayerMatchScreen;