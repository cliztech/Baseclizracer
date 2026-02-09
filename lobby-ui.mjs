import { Dom } from './dom.mjs';

export function renderRoomList(rooms) {
  const list = Dom.get('room_list');
  const input = Dom.get('input_room');
  if (!list) return; // Guard in case DOM isn't ready

  const currentRoom = input ? input.value : null;

  list.innerHTML = '';

  if (rooms.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = 'No signals detected...';
    li.classList.add('empty-state');
    list.appendChild(li);
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${room.id}</span><span class="count">${room.count}</span>`;
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute(
      'aria-label',
      `Join room ${room.id}, ${room.count} players`
    );

    if (currentRoom === room.id) {
      li.classList.add('selected');
      li.setAttribute('aria-current', 'true');
    }

    const selectRoom = () => {
      if (input) input.value = room.id;

      // Update visual selection
      Array.from(list.children).forEach((child) => {
        child.classList.remove('selected');
        child.removeAttribute('aria-current');
      });
      li.classList.add('selected');
      li.setAttribute('aria-current', 'true');
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
