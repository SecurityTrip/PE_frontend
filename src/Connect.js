import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayerWS } from './useMultiplayerWS';
import MenuComponent from './MenuComponent'; // assuming MenuComponent is now in its own file

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
            // Note: Navigation to /fieldedit happens in FieldEdit's useEffect for guest role
        }
    }, [joinInfo]); // Removed navigate dependency as navigation happens in FieldEdit

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
        
        // Переходим на страницу расстановки кораблей (или ожидания в случае гостя)
        navigate('/fieldedit', { state: { mode: 'multiplayer' } }); // Navigate to fieldedit where the joinRoom call for guest is handled
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

export default Connect; 