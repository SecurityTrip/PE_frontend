import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import logoimgimg from './лого_корабль.png';
import logolabelimg from './лого_надпись.png';

export function Avatimbut({ y, x, img, onClick }) {
    return (
        <img alt="avatar_img" src={img} className="avatarimgbut" onClick={onClick} style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh', backgroundSize: 'cover' }} ></img>
    );
}

export function SelectedAva({ y, x }) {
    return (
        <div className="selectedAva" style={{ top: y + 'vh', left: 'calc(50% + ' + x + 'vh' }} ></div>
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
            const response = await fetch('http://193.233.103.183:8080/auth/register', {
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
                {error && <div style={{
                    color: 'red',
                    backgroundColor: 'white',
                    borderRadius: '2vh',
                    marginTop: '-15vh',
                    zIndex: '100',
                    position: 'absolute',
                    pointerEvents: 'none'
                }}>{error}</div>}
                {success && <div style={{
                    color: 'green',
                    backgroundColor: 'white',
                    borderRadius: '2vh',
                    marginTop: '-15vh',
                    zIndex: '100',
                    position: 'absolute',
                    pointerEvents: 'none'
                }}>{success}</div>}
                <div style={{ position: 'absolute', color: 'white', left: 'calc(50% + 4vh)', fontSize: '4vh' }}>Выберите аватар:</div>
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

export default Regis; 