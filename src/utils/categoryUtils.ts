export const getCategoryColor = (category?: string): string => {
  switch (category) {
    case 'nature': return '#10b981'; // Vert émeraude
    case 'museum': return '#8b5cf6'; // Violet
    case 'library': return '#3b82f6'; // Bleu
    case 'sport': return '#f59e0b'; // Ambre
    case 'culture': return '#ec4899'; // Rose
    default: return '#ff5757'; // Rouge corail GoodMaps
  }
};

export const getCategoryLabel = (category?: string): string => {
  switch (category) {
    case 'nature': return 'Parcs & Nature';
    case 'museum': return 'Musée & Art';
    case 'library': return 'Médiathèque';
    case 'sport': return 'Sport & Loisirs';
    case 'culture': return 'Culture & Spectacle';
    default: return 'Loisirs';
  }
};

