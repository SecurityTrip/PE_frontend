import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerWS } from './useMultiplayerWS';
import MenuComponent from './MenuComponent'; // assuming MenuComponent is now in its own file

function CreateRoom() {
    const navigate = useNavigate();
    const { createRoom, roomCode, connected, error: wsError } = useMultiplayerWS();
    const [created, setCreated] = useState(false);
    const [error, setError] = useState('');
    // ships теперь берём только из localStorage, чтобы не было рассинхрона с FieldEdit

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
            // Генерируем или берём userId из localStorage
            let userId = Number(localStorage.getItem('userId'));
            if (!userId) {
                userId = Date.now() + Math.floor(Math.random()*1000);
                localStorage.setItem('userId', userId);
            }
            // Создаём комнату только с userId, без ships!
            createRoom({ userId });
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
                    navigate('/fieldedit'); // Consider navigating to a multiplayer field edit/wait screen
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

export default CreateRoom;