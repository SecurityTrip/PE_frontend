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
    
    if (multiplayerCode) {
        if (multiplayerRole === 'guest') {
            try {
                joinRoom({ gameCode: multiplayerCode, ships: shipsData });
                console.log('[FieldEdit] joinRoom вызван');
                setWaitingJoin(true);
            } catch (e) {
                setError('Ошибка подключения к игре: ' + e.message);
            }
        } else if (multiplayerRole === 'host') {
            try {
                // Отправляем данные о кораблях на сервер
                const response = await authorizedFetch('http://localhost:8080/game/multiplayer/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        gameCode: multiplayerCode,
                        ships: shipsData 
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('[FieldEdit] Мультиплеер создан:', data);
                    localStorage.setItem('multiplayer_gameId', data.id);
                    navigate('/multiplayer-match');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Ошибка создания мультиплеера: ' + response.status);
                }
            } catch (e) {
                console.error('[FieldEdit] Ошибка при создании мультиплеера:', e);
                setError('Ошибка соединения с сервером');
            }
        }
        return;
    }
    
    // --- СИНГЛПЛЕЕР ---
    const difficultyLevel = localStorage.getItem('singleplayer_difficulty') || 'MEDIUM';
} 