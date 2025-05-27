import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logolabelimg from './лого_надпись.png';
import logoimgimg from './лого_корабль.png';

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
                console.log('[Auth] Получен ответ от сервера:', data);
                localStorage.setItem('token', data.token);
                console.log('[Auth] Токен сохранен:', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('avatarId', data.avatarId);
                localStorage.setItem('refreshToken', data.refreshToken);
                navigate('/singleplayer');
            } else {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || 'Неверный логин или пароль');
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
                <input onChange={(e) => setLogin(e.target.value)} value={login} type="text" placeholder="Логин" className="loginput"  />
                <input onChange={(e) => setPass(e.target.value)} value={pass} type="password" placeholder="Пароль" className="loginput" style={{ top: '11.5vh' }} />
                <button onClick={handleClick} className="logbutton">Войти</button>
                {error && <div style={{ color: 'red', marginTop: '-15vh', zIndex: '100', position: 'absolute', pointerEvents: 'none' }}>{error}</div>}
            </div>
            <Link to="/regis" className="linkToReg">Зарегистрироваться</Link>
        </header>
    );
}

export default Auth; 