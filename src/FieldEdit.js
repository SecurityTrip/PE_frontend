import { useMultiplayerWS } from './useMultiplayerWS';

function FieldEdit(props) {
    // ... остальные хуки и переменные ...
    const { joinRoom, placeHostShips } = useMultiplayerWS();
    // ...
    async function handleClick() {
    setError('');
    const ships = shipsRef.current;
    const shipsData = ships.map(ship => ({
        size: ship.len,
        x: Math.round(ship.rqx),
        y: Math.round(ship.rqy),
        horizontal: ship.rot === 0
    }));
    // Сохраняем актуальную расстановку в localStorage для CreateRoom
    localStorage.setItem('multiplayer_ships', JSON.stringify(shipsData));
    const multiplayerCode = localStorage.getItem('multiplayer_gameCode');
    const multiplayerRole = localStorage.getItem('multiplayer_role');
    console.log('[FieldEdit] handleClick', { multiplayerCode, multiplayerRole, shipsData });
    
    if (multiplayerCode) {
        if (multiplayerRole === 'guest') {
            try {
                joinRoom({ gameCode: multiplayerCode, ships: shipsData, userId: Number(localStorage.getItem('userId')) });
                console.log('[FieldEdit] joinRoom вызван');
                setWaitingJoin(true);
            } catch (e) {
                setError('Ошибка подключения к игре: ' + e.message);
            }
        } else if (multiplayerRole === 'host') {
            try {
                placeHostShips({ gameCode: multiplayerCode, ships: shipsData, userId: Number(localStorage.getItem('userId')) });
                setWaitingJoin(true); // Ожидание второго игрока
            } catch (e) {
                setError('Ошибка размещения кораблей: ' + e.message);
            }
        }
        return;
    }
    
    // --- СИНГЛПЛЕЕР ---
    // Очищаем мультиплеерные ключи, чтобы не было конфликтов
    localStorage.removeItem('multiplayer_gameCode');
    localStorage.removeItem('multiplayer_role');
    localStorage.removeItem('multiplayer_gameId');

    const difficultyLevel = localStorage.getItem('singleplayer_difficulty') || 'MEDIUM';
    try {
        // Отправляем запрос на создание singleplayer игры
        const response = await authorizedFetch('http://localhost:8080/game/singleplayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ships: shipsData,
                difficulty: difficultyLevel
            })
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('singleplayer_gameId', data.id);
            navigate('/singleplayer-match');
        } else {
            const errorData = await response.json();
            setError(errorData.message || 'Ошибка создания одиночной игры: ' + response.status);
        }
    } catch (e) {
        setError('Ошибка соединения с сервером');
    }
}}