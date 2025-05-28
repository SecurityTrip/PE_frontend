import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuComponent from './MenuComponent';
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
import { SelectedAva, Avatimbut } from './Regis'; // Импортируем оба компонента
import { authorizedFetch } from './api'; // Import authorizedFetch

function ProfSet() {
    const [selavx, setSelavx] = useState(-3.5);
    const [selavy, setSelavy] = useState(5.5);
    const [login, setLogin] = useState('');
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [repeatPass, setRepeatPass] = useState('');
    const [avaId, setAvaId] = useState(Number(localStorage.getItem('avatarId')) || 0);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    function selectAva(i) {
        setAvaId(i);
        switch (i) {
            case 0: setSelavx(-3.5); setSelavy(5.5); break;
            case 1: setSelavx(6.5); setSelavy(5.5); break;
            case 2: setSelavx(16.5); setSelavy(5.5); break;
            case 3: setSelavx(26.5); setSelavy(5.5); break;
            case 4: setSelavx(36.5); setSelavy(5.5); break;
            case 5: setSelavx(-3.5); setSelavy(15.5); break;
            case 6: setSelavx(6.5); setSelavy(15.5); break;
            case 7: setSelavx(16.5); setSelavy(15.5); break;
            case 8: setSelavx(26.5); setSelavy(15.5); break;
            case 9: setSelavx(36.5); setSelavy(15.5); break;
            default: break;
        }
    }

    async function saveClick() {
        setMsg(''); setErr('');
        if (newPass && newPass !== repeatPass) {
            setErr('Пароли не совпадают');
            return;
        }
        // Формируем только изменённые поля
        const req = {};
        if (login) req.username = login;
        if (newPass) req.password = newPass;
        if (avaId !== Number(localStorage.getItem('avatarId'))) req.avatarId = avaId;
        if (Object.keys(req).length === 0) {
            setErr('Нет изменений для сохранения');
            return;
        }
        try {
            const response = await authorizedFetch('http://localhost:8080/user/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req)
            });
            if (response.ok) {
                setMsg('Профиль успешно обновлён');
                if (req.username) localStorage.setItem('username', req.username);
                if (req.avatarId !== undefined) localStorage.setItem('avatarId', req.avatarId);
            } else if (response.status === 400) {
                setErr('Некорректные данные');
            } else if (response.status === 401) {
                setErr('Не авторизован');
            } else {
                setErr('Ошибка: ' + response.status);
            }
        } catch (e) {
            setErr('Ошибка соединения с сервером');
        }
    }
    return (
        <MenuComponent selctdMenu='3'>
            <div style={{ position: 'absolute', top: '10vh', left: '15vh', fontSize: '6vh' }}>Аватар:</div>
            <SelectedAva x={selavx} y={selavy}></SelectedAva>
            <Avatimbut y='7' x='-2' img={avaimg0} onClick={() => { selectAva(0) }} />
            <Avatimbut y='7' x='8' img={avaimg1} onClick={() => { selectAva(1) }} />
            <Avatimbut y='7' x='18' img={avaimg2} onClick={() => { selectAva(2) }} />
            <Avatimbut y='7' x='28' img={avaimg3} onClick={() => { selectAva(3) }} />
            <Avatimbut y='7' x='38' img={avaimg4} onClick={() => { selectAva(4) }} />
            <Avatimbut y='17' x='-2' img={avaimg5} onClick={() => { selectAva(5) }} />
            <Avatimbut y='17' x='8' img={avaimg6} onClick={() => { selectAva(6) }} />
            <Avatimbut y='17' x='18' img={avaimg7} onClick={() => { selectAva(7) }} />
            <Avatimbut y='17' x='28' img={avaimg8} onClick={() => { selectAva(8) }} />
            <Avatimbut y='17' x='38' img={avaimg9} onClick={() => { selectAva(9) }} />
            <input style={{top: '33vh'}} type="text" placeholder="Новый логин" className="profSetInputs" value={login} onChange={e=>setLogin(e.target.value)} />
            <input style={{ top: '40vh' }} type="password" placeholder="Старый пароль" className="profSetInputs" value={oldPass} onChange={e=>setOldPass(e.target.value)} />
            <input style={{ top: '47vh' }} type="password" placeholder="Новый пароль" className="profSetInputs" value={newPass} onChange={e=>setNewPass(e.target.value)} />
            <input style={{ top: '54vh' }} type="password" placeholder="Повторите пароль" className="profSetInputs" value={repeatPass} onChange={e=>setRepeatPass(e.target.value)} />
            <button onClick={saveClick} className="savebutt">Сохранить изменения</button>
            {msg && <div style={{color:'green',marginTop:'2vh'}}>{msg}</div>}
            {err && <div style={{color:'red',marginTop:'2vh'}}>{err}</div>}
        </MenuComponent>        
    );
}

export default ProfSet; 