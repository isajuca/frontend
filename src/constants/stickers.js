// src/constants/stickers.js

export const PRESET_STICKERS = [
  // COMUM
  {
    id: '1',
    nome: 'Acenando',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Acenando.png'),
  },
  {
    id: '2',
    nome: 'Escrevendo',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Escrevendo.png'),
  },
  {
    id: '3',
    nome: 'Estudando',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Estudando.png'),
  },
  {
    id: '4',
    nome: 'Joinha',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Joinha.png'),
  },
  {
    id: '5',
    nome: 'Lendo',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Lendo.png'),
  },

  // RARO
  {
    id: '6',
    nome: 'Concentrado',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Concentrado.png'),
  },
  {
    id: '7',
    nome: 'Ideia',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Ideia.png'),
  },
  {
    id: '8',
    nome: 'Meta',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Meta.png'),
  },
  {
    id: '9',
    nome: 'Óculos',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Oculos.png'),
  },
  {
    id: '10',
    nome: 'Pensando',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Pensando.png'),
  },

  // ÉPICO
  {
    id: '11',
    nome: 'Cientista',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Cientista.png'),
  },
  {
    id: '12',
    nome: 'Foguete',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Foguete.png'),
  },
  {
    id: '13',
    nome: 'Power Up',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/PoweUp.png'),
  },
  {
    id: '14',
    nome: 'Saturno',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Saturno.png'),
  },
  {
    id: '15',
    nome: 'Troféu',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Trofeu.png'),
  },

  // LENDÁRIO
  {
    id: '16',
    nome: 'Astronauta',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Astronauta.png'),
  },
  {
    id: '17',
    nome: 'Coroa',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Coroa.png'),
  },
  {
    id: '18',
    nome: 'Galáxia',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Galaxia.png'),
  },
  {
    id: '19',
    nome: 'Máximo',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Maximo.png'),
  },
  {
    id: '20',
    nome: 'Supremo',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Supremo.png'),
  },
];

export const getStickerSource = (stickerOrUrl) => {
  if (!stickerOrUrl) return null;

  // Se já for um require local ou objeto com uri
  if (typeof stickerOrUrl === 'number' || (typeof stickerOrUrl === 'object' && stickerOrUrl.uri)) {
    return stickerOrUrl;
  }

  const str = String(stickerOrUrl).toLowerCase();

  const match = PRESET_STICKERS.find(
    (s) =>
      s.id.toLowerCase() === str ||
      s.nome.toLowerCase() === str ||
      str.includes(s.nome.toLowerCase()) ||
      str.includes(s.id.toLowerCase())
  );

  if (match) return match.source;

  if (typeof stickerOrUrl === 'string' && (stickerOrUrl.startsWith('http') || stickerOrUrl.startsWith('data:'))) {
    return { uri: stickerOrUrl };
  }

  return PRESET_STICKERS[0].source;
};
