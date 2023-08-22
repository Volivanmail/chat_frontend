import EnterPop from './EnterPop.js';
import chatWin from './chatWin.js';

export default async function MainFoo() {
  return new Promise((res, rej) => {
    const pop = new EnterPop('Выберите псевдоним');
    const { popup, submit, userName } = pop.create();

    const ws = new WebSocket('ws://friday-chat.onrender.com/');

    ws.onopen = (() => {
      console.log('---checking for initial data---');
      ws.send(JSON.stringify({ type: 'initialData', data: '' }));
    });

    ws.onmessage = ((event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'initialData') {
        const allUsers = msg.data;
        submit.addEventListener('click', (e) => {
          e.preventDefault();
          const currentUser = userName.value;
          localStorage.setItem('currentUser', currentUser);
          if (!allUsers.includes(currentUser)
              && currentUser.length > 1
              && currentUser.length <= 10
              && ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'userEnter', data: currentUser }));
            popup.remove();
            res(() => chatWin());
          } else {
            rej(Error('Что-то пошло не так, попробуйте еще раз.'));
          }
        });
      }
    });

    ws.onclose = (() => {
      console.log('loading data...');
    });
  }).then((result) => { result(); }, (err) => {
    alert(err);
    window.location.reload();
  });
}
