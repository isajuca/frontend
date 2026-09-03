// src/constants/stickers.js

export const PRESET_STICKERS = [
  // COMUM
  {
    id: 'comum_acenando',
    nome: 'Acenando',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Acenando.png'),
  },
  {
    id: 'comum_escrevendo',
    nome: 'Escrevendo',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Escrevendo.png'),
  },
  {
    id: 'comum_estudando',
    nome: 'Estudando',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Estudando.png'),
  },
  {
    id: 'comum_joinha',
    nome: 'Joinha',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Joinha.png'),
  },
  {
    id: 'comum_lendo',
    nome: 'Lendo',
    raridade: 'comum',
    source: require('../../assets/Stikers/Comum/Lendo.png'),
  },

  // RARO
  {
    id: 'raro_concentrado',
    nome: 'Concentrado',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Concentrado.png'),
  },
  {
    id: 'raro_ideia',
    nome: 'Ideia',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Ideia.png'),
  },
  {
    id: 'raro_meta',
    nome: 'Meta',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Meta.png'),
  },
  {
    id: 'raro_oculos',
    nome: 'Óculos',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Oculos.png'),
  },
  {
    id: 'raro_pensando',
    nome: 'Pensando',
    raridade: 'raro',
    source: require('../../assets/Stikers/Raro/Pensando.png'),
  },

  // ÉPICO
  {
    id: 'epico_cientista',
    nome: 'Cientista',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Cientista.png'),
  },
  {
    id: 'epico_foguete',
    nome: 'Foguete',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Foguete.png'),
  },
  {
    id: 'epico_powerup',
    nome: 'Power Up',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/PoweUp.png'),
  },
  {
    id: 'epico_saturno',
    nome: 'Saturno',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Saturno.png'),
  },
  {
    id: 'epico_trofeu',
    nome: 'Troféu',
    raridade: 'epico',
    source: require('../../assets/Stikers/Epico/Trofeu.png'),
  },

  // LENDÁRIO
  {
    id: 'lendario_astronauta',
    nome: 'Astronauta',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Astronauta.png'),
  },
  {
    id: 'lendario_coroa',
    nome: 'Coroa',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Coroa.png'),
  },
  {
    id: 'lendario_galaxia',
    nome: 'Galáxia',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Galaxia.png'),
  },
  {
    id: 'lendario_maximo',
    nome: 'Máximo',
    raridade: 'lendario',
    source: require('../../assets/Stikers/Lendario/Maximo.png'),
  },
  {
    id: 'lendario_supremo',
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
