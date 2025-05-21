// Вспомогательная функция для рендеринга доски
function renderBoard(board, isEnemy, onCellClick, ships) {
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

    return (
        <div className="board-grid">
            {board.map((row, y) => row.map((cell, x) => {
                let cellClass = 'board-cell';
                let content = null;
                
                if (!isEnemy && ships) {
                    // Логика для поля игрока
                    for (const ship of ships) {
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
                                content = '●';
                            } else if (hitIndex !== -1 && ship.hits && !ship.hits[hitIndex]) {
                                // Если клетка корабля, но не подбита, показываем серый квадрат (согласно прошлому запросу)
                                // Не добавляем контент, просто стилизуем через CSS класс player-ship-cell
                            }
                            break;
                        }
                    }
                }

                // Обработка попаданий и промахов для обоих полей
                if (cell === 2) { // Промах
                    content = 'X';
                } else if (cell === 3) { // Попадание
                    content = '●';
                }

                return (
                    <div
                        key={x+','+y}
                        onClick={isEnemy && onCellClick ? () => onCellClick(x,y) : undefined}
                        className={cellClass}
                        style={{
                            cursor: isEnemy && onCellClick ? 'pointer' : 'default'
                        }}
                    >
                        {content}
                    </div>
                );
            }))}
        </div>
    );
}

const SingleplayerMatchScreen = () => {
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [moveError, setMoveError] = useState('');
    const [moveResult, setMoveResult] = useState(null);
    const gameId = localStorage.getItem('singleplayer_gameId');
    const stompClient = useRef(null);

    useEffect(() => {
        if (!gameId) {
            navigate('/singleplayer');
            return;
        }

        // Инициализация WebSocket соединения
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                
                // Подписываемся на обновления состояния игры
                client.subscribe('/topic/singleplayer/state', (message) => {
                    console.log('[SingleplayerMatchScreen] Получено сообщение WebSocket:', message);
                    console.log('[SingleplayerMatchScreen] Тело сообщения:', message.body);
                    const gameData = JSON.parse(message.body);
                    console.log('[SingleplayerMatchScreen] Получены данные игры (после парсинга):', gameData);
                    if (!gameData || !gameData.playerBoard) {
                         console.error('[SingleplayerMatchScreen] Некорректные или отсутствующие данные игры или доски игрока', gameData);
                         setError('Ошибка: Не получены данные игры.');
                         setLoading(false);
                         return;
                    }
                    setGame(gameData);
                    setLoading(false);
                });

                // Подписываемся на ответы на ходы
                client.subscribe('/topic/singleplayer/move', (message) => {
                    const moveResponse = JSON.parse(message.body);
                    console.log('Move response:', moveResponse);
                    setMoveResult(moveResponse);
                });

                // Запрашиваем начальное состояние игры
                client.publish({
                    destination: '/app/singleplayer.state',
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
} 