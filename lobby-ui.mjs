import { Dom } from './dom.mjs';

export function renderRoomList(rooms) {
  const list = Dom.get('room_list');
  if (!list) return; // Guard in case DOM isn't ready
  list.innerHTML = '';
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${room.id}</span><span class="count">${room.count}</span>`;
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Join room ${room.id}, ${room.count} players`);

    const selectRoom = () => {
      const input = Dom.get('input_room');
      if (input) input.value = room.id;
    };

    li.onclick = selectRoom;
    li.onkeydown = (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        selectRoom();
      }
    };
    list.appendChild(li);
  });
}
