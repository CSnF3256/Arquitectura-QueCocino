const {useEffect, useState} = React;

const STORAGE_KEY = 'quecocino_user_avatars';

export const avatarOptions = {
  hat: ['👩‍🍳', '👨‍🍳', '🧑‍🍳', '🍳', '🥗'],
  face: ['😊', '😋', '🤩', '🙂', '😌'],
  tool: ['🥄', '🍳', '🔪', '🥢', '🍋'],
  color: ['sage', 'terra', 'corn', 'mint', 'berry']
};

export const defaultAvatar = {hat: '👩‍🍳', face: '😊', tool: '🥄', color: 'sage'};

export function useLocalAvatars() {
  const [avatars, setAvatars] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(avatars));
  }, [avatars]);

  function avatarFor(user) {
    if (!user?.id) return defaultAvatar;
    return avatars[user.id] || defaultAvatar;
  }

  function setAvatar(userId, avatar) {
    setAvatars((current) => ({...current, [userId]: avatar}));
  }

  return {avatarFor, setAvatar};
}
