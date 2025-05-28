import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerWS } from './useMultiplayerWS';
import './FieldEdit.css';
import './components/SingleplayerMatchScreen.css';
import { renderBoard as singleRenderBoard } from './components/SingleplayerMatchScreen';
import p1 from './ps/p1.png';
import p2 from './ps/p2.png';
import p3 from './ps/p3.png';
import p4 from './ps/p4.png';
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
import winimg from './ps/win.png';
import loseimg from './ps/lose.png';
import MusicPlayer from './MusicPlayer';
import SoundEffectPlayer from "./SoundEffectPlayer";
import hitSound from './sound/hit.mp3';
import missSound from './sound/miss.mp3';
import ToggleSwitch from './ToggleSwitch';
const MultiplayerMatchScreen = () => {


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
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [moveError, setMoveError] = useState('');
    const [moveResult, setMoveResult] = useState(null);
    const gameId = localStorage.getItem('multiplayer_gameId');
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
    const {
        connected,
        moveInfo,
        gameState: wsGameState,
        error: wsError,
        sendMove,
        requestState
    } = useMultiplayerWS();


    // Сброс состояния и запуск загрузки только при смене gameId (новая игра)
    useEffect(() => {
        if (!gameId) {
            setError('Идентификатор игры не найден.');
            setLoading(false);
            return;
        }
        // setLoading(true); // Не сбрасываем loading/game если gameId не меняется
        // setGame(null);
    }, [gameId]);


    // Запрашиваем состояние только когда появилось соединение и есть gameId, но не сбрасываем loading/game
    useEffect(() => {
        if (connected && gameId) {
            requestState(gameId);
        }
    }, [connected, gameId, requestState]);


    // Слушаем обновления результата хода через WebSocket
    useEffect(() => {
        if (moveInfo) {
            setMoveResult(moveInfo);
            if (moveInfo && flagBRef.current) {
                if (moveInfo.lastMoveHit)
                    hitSoundRef.current?.play();
                else
                    missSoundRef.current?.play();
            } 
            // Не делаем requestState(gameId) — wsGameState должен обновиться через WebSocket
        }
    }, [moveInfo]);


    useEffect(() => {
        // Всегда убираем loading, если есть wsGameState (даже если он не меняется по ссылке)
        if (wsGameState && wsGameState.playerBoard && wsGameState.computerBoard && wsGameState.gameState && wsGameState.gameCode) {
            setGame(wsGameState);
            setLoading(false);
            setError('');
            // moveResult сбрасываем только если статус игры изменился (например, после хода)
            // setMoveResult(null); // Оставляем результат выстрела до следующего хода
        } else if (wsGameState) {
            setError('Получено неполное состояние игры');
            setLoading(false);
        } else if (connected && !wsGameState) {
            setError('Не удалось загрузить состояние игры. Попробуйте обновить страницу.');
            setLoading(false);
        }
    }, [wsGameState, connected]);


    useEffect(() => {
        if (wsError) {
            setMoveError(wsError);
        }
    }, [wsError]);


    // Выход из игры (мультиплеер)
    function handleExit() {
        localStorage.removeItem('multiplayer_gameId');
        navigate('/singleplayer'); // Навигация обратно на выбор комнаты
    }

    // Обработка клика по клетке поля противника (используем wsGameState для актуальности)
    function handleCellClick(x, y) {
        if (flagA) {
            handlePlay();
        }
        setMoveError('');
        setMoveResult(null);
        if (!wsGameState) {
            setMoveError('Игра не загружена');
            return;
        }
        if (wsGameState.gameState !== 'IN_PROGRESS') {
            setMoveError('Игра не активна');
            return;
        }
        if (!connected) {
            setMoveError('Нет соединения с сервером');
            return;
        }
        if (!wsGameState.playerTurn) {
            setMoveError('Сейчас не ваш ход');
            return;
        }
        // Для мультиплеера ОБЯЗАТЕЛЬНО нужен userId в payload!
        let userId = Number(localStorage.getItem('userId'));
        if (!userId) {
            userId = Date.now() + Math.floor(Math.random() * 1000);
            localStorage.setItem('userId', userId);
        }
        sendMove({ gameCode: gameId, x, y, userId });
    }

    const renderCell = (x, y, value, isPlayerBoard) => {
        let cellClass = 'cell';
        let cellContent = '';

        if (isPlayerBoard) {
            // Для доски игрока
            if (value === 1) {
                cellClass += ' ship';
            } else if (value === 2) {
                cellClass += ' miss';
                cellContent = '•';
            } else if (value === 3) {
                cellClass += ' hit';
                cellContent = '×';
            }
        } else {
            // Для доски противника
            if (value === 2) {
                cellClass += ' miss';
                // Проверяем, является ли эта клетка соседней для потопленного корабля
                if (isAdjacentToSunkShip(x, y)) {
                    cellClass += ' adjacent';
                }
                cellContent = '•';
            } else if (value === 3) {
                cellClass += ' hit';
                cellContent = '×';
            }
        }

        return (
            <div
                key={`${x}-${y}`}
                className={cellClass}
                onClick={() => !isPlayerBoard && handleCellClick(x, y)}
            >
                {cellContent}
            </div>
        );
    };

    // Функция для проверки, является ли клетка соседней для потопленного корабля
    const isAdjacentToSunkShip = (x, y) => {
        if (!game || !game.computerBoard || !game.computerBoard.ships) return false;

        const board = game.computerBoard.board;
        const ships = game.computerBoard.ships;

        // Проверяем все корабли
        for (const ship of ships) {
            if (ship.sunk) {
                // Проверяем все клетки корабля
                for (const pos of ship.positions) {
                    const shipX = pos[0];
                    const shipY = pos[1];

                    // Проверяем соседние клетки
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = shipX + dx;
                            const ny = shipY + dy;

                            // Если это текущая клетка и она помечена как промах
                            if (nx === x && ny === y && board[ny][nx] === 2) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    if (loading && !game) {
        return (
            <header className="App-header">
                <div className="bckgr"></div>
                <div className="fieldEditBigTab" style={{ textAlign: 'center', paddingTop: '20vh' }}>
                    <div style={{ color: 'white', fontSize: '3vh' }}>Загрузка игры...</div>
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

    const avatarIdPro = parseInt( wsGameState.opponentAvatarId , 10);

    // Безопасная подстановка изображения
    const avatarSrc = avatars[avatarId];

    const avatarSrcPro = avatars[avatarIdPro];

    return (
        <header className="App-header">
            <div className="bckgr"></div>
            <MusicPlayer audioRef={audioRef} />
            <SoundEffectPlayer ref={hitSoundRef} src={hitSound} />
            <SoundEffectPlayer ref={missSoundRef} src={missSound} />
            {/*<div className="fieldEditBigTab" style={{*/}
            {/*    display: 'flex',*/}
            {/*    flexDirection: 'column',*/}
            {/*    alignItems: 'center',*/}
            {/*    justifyContent: 'center',*/}
            {/*    gap: '3vh'*/}
            {/*}}>*/}
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
                color: 'black'
            }}> {localStorage.getItem('username') + (wsGameState.playerTurn?' (ходит)':'')}</div>
            <img src={avatarSrcPro} alt='аватар' style={{
                position: 'absolute',
                top: '1.5vh',
                left: 'calc(50% + 92vh)',
                height: '7vh',
                borderRadius: '2.5vh',
                transform: 'translate(-50%, 0)'
            }}></img>
            <div style={{
                position: 'absolute',
                display: 'block',
                top: '1.5vh',
                left: '50%',
                textAlign: 'right',
                color: 'black',
                width: '85vh'
            }}>{(!wsGameState.playerTurn ? '(ходит) ' : '')+wsGameState.opponentUsername}</div>





            <button onClick={handleExit} className="fieldButt" style={{
                position: 'absolute',
                top: '95vh',
                left: 'calc(50% - 90vh)',
                width: '10vh',
                height: '5vh',
                transform: 'translate(-50%, -50%)',
                zIndex: '1101',
                backgroundColor: 'red'
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


                {wsGameState && wsGameState.playerBoard && singleRenderBoard(
                    wsGameState.playerBoard.board,
                    false,
                    undefined,
                    wsGameState.playerBoard.ships // ships для своего поля
                    , missSoundRef, hitSoundRef
                )}


                {wsGameState && wsGameState.computerBoard && singleRenderBoard(
                    wsGameState.computerBoard.board,
                    true,
                    wsGameState.playerTurn ? handleCellClick : undefined,
                    wsGameState.computerBoard.ships // ships для противника (должен быть пустой массив)
                    , missSoundRef, hitSoundRef
                )}
                {/*{!wsGameState?.playerTurn && (*/}
                {/*    <div style={{*/}
                {/*        position: 'absolute',*/}
                {/*        top: 0, left: 0, right: 0, bottom: 0,*/}
                {/*        background: 'rgba(0,0,0,0.15)',*/}
                {/*        borderRadius: '10px',*/}
                {/*        zIndex: 2*/}
                {/*    }} />*/}
                {/*)}*/}

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


                {/*<div style={{*/}
                {/*    display: 'flex',*/}
                {/*    justifyContent: 'center',*/}
                {/*    alignItems: 'flex-start',*/}
                {/*    gap: '5vh'*/}
                {/*}}>*/}
                {/*    <div>*/}
                {/*        <div style={{*/}
                {/*            color: 'white',*/}
                {/*            marginBottom: '1.5vh',*/}
                {/*            fontSize: '2.5vh',*/}
                {/*            textAlign: 'center'*/}
                {/*        }}>Ваше поле</div>*/}
                {/*        {wsGameState && wsGameState.playerBoard && singleRenderBoard(*/}
                {/*            wsGameState.playerBoard.board,*/}
                {/*            false,*/}
                {/*            undefined,*/}
                {/*            wsGameState.playerBoard.ships // ships для своего поля*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <div style={{*/}
                {/*            color: 'white',*/}
                {/*            marginBottom: '1.5vh',*/}
                {/*            fontSize: '2.5vh',*/}
                {/*            textAlign: 'center'*/}
                {/*        }}>*/}
                {/*            Поле противника*/}
                {/*            {wsGameState && (*/}
                {/*                <span style={{*/}
                {/*                    marginLeft: '1vh',*/}
                {/*                    color: wsGameState.playerTurn ? '#4caf50' : '#ff9800',*/}
                {/*                    fontWeight: 'bold',*/}
                {/*                    fontSize: '2vh'*/}
                {/*                }}>*/}
                {/*                    {wsGameState.playerTurn ? 'Ваш ход!' : 'Ждите противника'}*/}
                {/*                </span>*/}
                {/*            )}*/}
                {/*        </div>*/}
                {/*        <div*/}
                {/*            style={{*/}
                {/*                border: wsGameState?.playerTurn ? '3px solid #4caf50' : '3px solid #ff9800',*/}
                {/*                borderRadius: '10px',*/}
                {/*                opacity: wsGameState?.playerTurn ? 1 : 0.6,*/}
                {/*                pointerEvents: wsGameState?.playerTurn ? 'auto' : 'none',*/}
                {/*                transition: 'border 0.2s, opacity 0.2s',*/}
                {/*                position: 'relative'*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            {wsGameState && wsGameState.computerBoard && singleRenderBoard(*/}
                {/*                wsGameState.computerBoard.board,*/}
                {/*                true,*/}
                {/*                wsGameState.playerTurn ? handleCellClick : undefined,*/}
                {/*                wsGameState.computerBoard.ships // ships для противника (должен быть пустой массив)*/}
                {/*            )}*/}
                {/*            {!wsGameState?.playerTurn && (*/}
                {/*                <div style={{*/}
                {/*                    position: 'absolute',*/}
                {/*                    top: 0, left: 0, right: 0, bottom: 0,*/}
                {/*                    background: 'rgba(0,0,0,0.15)',*/}
                {/*                    borderRadius: '10px',*/}
                {/*                    zIndex: 2*/}
                {/*                }} />*/}
                {/*            )}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}












                <div style={{
                    position: 'absolute',
                    color: 'white',
                    fontSize: '2vh',
                    textAlign: 'center',
                    marginTop: '2vh',
                    zIndex: '1000'
                }}>
                    {/*<div style={{*/}
                    {/*    //position: 'absolute',*/}
                    {/*    marginBottom: '1vh',*/}
                    {/*    //zIndex: '1000'*/}
                    {/*}}>*/}
                    {/*    Статус: {wsGameState && wsGameState.gameState === 'IN_PROGRESS' ? 'Игра идет' : (wsGameState && wsGameState.gameState === 'PLAYER_WINS' ? 'Вы выиграли!' : (wsGameState && wsGameState.gameState === 'OPPONENT_WINS' ? 'Противник выиграл' : 'Завершена'))}*/}
                    {/*    {wsGameState && wsGameState.gameState === 'IN_PROGRESS' && (*/}
                    {/*        <span style={{ marginLeft: '2vh' }}>*/}
                    {/*            Ход: {wsGameState.playerTurn ? 'Ваш' : 'Противника'}*/}
                    {/*        </span>*/}
                    {/*    )}*/}
                    {/*</div>*/}
                    {/*{moveResult && (*/}
                    {/*    <div style={{*/}
                    {/*        //position: 'absolute',*/}
                    {/*        //zIndex: '1000',*/}
                    {/*        color: moveResult.lastMoveHit ? '#4caf50' : '#ff9800',*/}
                    {/*        marginTop: '1vh',*/}
                    {/*        fontSize: '2.2vh'*/}
                    {/*    }}>*/}
                    {/*        {moveResult.lastMoveGameOver && wsGameState.playerTurn && ' Победа!'}*/}
                    {/*        {moveResult.lastMoveGameOver && !wsGameState.playerTurn && ' Поражение!'}*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    {moveError && (
                        <div style={{
                            //position: 'absolute',
                            //zIndex: '1000',
                            color: '#f44336',
                            marginTop: '1vh',
                            fontSize: '2vh'
                        }}>
                            {moveError}
                        </div>
                    )}
                    {error && gameId && (
                        <div style={{
                            //position: 'absolute',
                            //zIndex: '1000',
                            color: '#f44336',
                            marginTop: '1vh',
                            fontSize: '2vh'
                        }}>
                            {error}
                        </div>
                    )}
                </div>
            </div>
            {moveResult && moveResult.lastMoveGameOver && <div style={{ position: 'absolute', zIndex: '1100', width: '100%', height: '100%', backgroundColor: 'rgb(0,0,0,0.5)' }}>
                {wsGameState.playerTurn && <div>
                    <img src={winimg} alt='победа' style={{ height: '30vh',marginTop:'30vh' }}></img><br/>
                    Победа!
                </div>}{!wsGameState.playerTurn && <div>
                    <img src={loseimg} alt='поражение' style={{ height: '30vh', marginTop: '30vh' }}></img><br />
                    Поражение! В следующий раз повезет!
                </div>}
            </div>}



            {settings && <div style={{ position: 'absolute', zIndex: '1100', width: '100%', height: '100%', backgroundColor: 'rgb(0,0,0,0.5)' }}>
                <div style={{ position: 'absolute', zIndex: '1100', width: '30vh', height: '20vh', top: '40vh', left: 'calc(50% - 15vh)', backgroundColor: 'rgb(0,0,0,0.7)', fontSize: '4vh' }}>
                    <button onClick={() => setSettings(false)} style={{ position: 'absolute', right: '1vh', top: '1vh', backgroundColor: 'red', width: '4vh', height: '3vh', fontSize: '2vh' }}>x</button>
                    {/*<input*/}
                    {/*    type="checkbox"*/}
                    {/*    checked={flagA}*/}
                    {/*    onChange={handleCheckboxA}*/}
                    {/*    style={{ position: 'absolute', width: '3vh', height: '3vh', right: '2vh', top: '6vh' }}*/}
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



            {/*</div>*/}
        </header>
    );
};

export default MultiplayerMatchScreen;