// src/constants/avatars.js

export const PRESET_AVATARS = [
  {
    id: 'curioso',
    nome: 'Curioso',
    source: require('../../assets/Perfil/curioso.png'),
  },
  {
    id: 'determinado',
    nome: 'Determinado',
    source: require('../../assets/Perfil/determinado.png'),
  },
  {
    id: 'feliz',
    nome: 'Feliz',
    source: require('../../assets/Perfil/feliz.png'),
  },
  {
    id: 'focado',
    nome: 'Focado',
    source: require('../../assets/Perfil/focado.png'),
  },
  {
    id: 'orgulhoso',
    nome: 'Orgulhoso',
    source: require('../../assets/Perfil/orgulhoso.png'),
  },
  {
    id: 'sonhador',
    nome: 'Sonhador',
    source: require('../../assets/Perfil/sonhador.png'),
  },
  {
    id: 'surpreso',
    nome: 'Surpreso',
    source: require('../../assets/Perfil/surpreso.png'),
  },
  {
    id: 'triste',
    nome: 'Triste',
    source: require('../../assets/Perfil/triste.png'),
  },
];

export const getAvatarSource = (avatarIdOrUrl) => {
  if (!avatarIdOrUrl) return null;
  const match = PRESET_AVATARS.find(
    (a) => a.id === avatarIdOrUrl || a.nome.toLowerCase() === String(avatarIdOrUrl).toLowerCase()
  );
  if (match) return match.source;
  if (
    typeof avatarIdOrUrl === 'string' &&
    (avatarIdOrUrl.startsWith('http') || avatarIdOrUrl.startsWith('data:'))
  ) {
    return { uri: avatarIdOrUrl };
  }
  return null;
};
