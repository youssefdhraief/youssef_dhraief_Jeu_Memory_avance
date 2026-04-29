<h2>🃏 Jeu de Cartes Mémoire</h2>

<h4>Un jeu de mémoire interactif développé en JavaScript pur, avec plusieurs modes de jeu, des pouvoirs spéciaux, un système de score et un classement local.</h4>

<h2>🚀 Technologies utilisées</h2>

<h4>HTML5 — structure et sémantique de la page</h4>
<h4>CSS3 — design, animations, responsive design</h4>
<h4>JavaScript (ES6+) — logique du jeu, manipulation du DOM, gestion des événements</h4>
<h4>LocalStorage — sauvegarde du classement entre les sessions</h4>
<h4>Web Audio API — effets sonores</h4>
<h4>GitHub Pages — déploiement du projet en ligne</h4>


<h2>🎮 Fonctionnalités principales</h2>

<h4>3 modes de jeu : Solo, contre un Bot, et 1 vs 1 sur le même écran<br>
3 niveaux de difficulté : Facile (4x3), Moyen (4x4), Difficile (5x4)<br>
Bot avec mémoire : le bot retient les cartes qu'il a vues et tente de trouver des paires<br>
Pouvoirs spéciaux :<br>

👁️ AkuAku — révèle brièvement une carte sans perdre son tour<br>
🔄 Permutation — échange secrètement la position de deux cartes<br>


Système de score basé sur le nombre de paires trouvées, le temps et les mouvements<br>
Chronomètre en temps réel<br>
Classement local (top 15) sauvegardé avec prénom, score, mode et date<br>
Effets sonores : clic, victoire, défaite<br>
Interface responsive adaptée mobile et desktop<br></h4>


<h2>🔗 Lien GitHub Pages</h2>

<h4>https://youssefdhraief.github.io/youssef_dhraief_Jeu_Memory_avance/</h4>

<h2>💡 Nouveautés explorées</h2>

<h4>Manipulation avancée du DOM : création et suppression dynamique d'éléments (overlays d'animation, grille de cartes)<br>

Gestion du temps avec setInterval : implémentation d'un chronomètre précis avec démarrage, arrêt et remise à zéro<br>

LocalStorage : persistance des données entre les sessions sans base de données<br>

Logique d'IA simple : le bot utilise un tableau mémoire pour mémoriser les cartes retournées et rechercher des paires connues<br>

Animations CSS avancées : @keyframes, transitions, effets neon, hue-rotate pour les couleurs dynamiques<br>

Web Audio API : chargement et lecture de fichiers audio directement en JavaScript<br>

Navigation sans rechargement : système de pages simulées avec des <"div"> et la propriété CSS display, géré entièrement en JavaScript — nous avons également exploré l'alternative avec l'élément <"dialog"> avant d'opter pour cette approche plus flexible<br>

Responsive design avec media queries : adaptation de l'interface à toutes les tailles d'écran en utilisant @media, transform: scale() et des dimensions dynamiques selon les breakpoints<br>
</h4>

<h2>⚠️ Difficultés rencontrées</h2>

<h4>
Le chronomètre ne s'arrêtait pas correctement : l'intervalle continuait de tourner en arrière-plan même après la fin de la partie ou le retour au menu<br>

Comportement inattendu du bot après une permutation : nous avons réalisé que le bot gardait en mémoire les anciennes positions des cartes échangées<br>

Le calcul du gagnant était toujours "Égalité" : les scores étaient comparés avant d'être calculés, donc toujours à zéro au moment de la comparaison<br>

Positionnement du timer : le timer était placé en dehors de la barre d'infos, ce qui cassait la mise en page<br>

Les décorations latérales ne couvraient pas toute la hauteur : avec position: absolute, elles s'arrêtaient à mi-page sur les pages longues<br>

Adaptation aux petits écrans : sur mobile, les images des cartes devenaient trop grandes et les éléments de la grille sortaient de leur conteneur, rendant le jeu injouable sur téléphone<br>

Navigation entre les pages : le site devait afficher plusieurs sections distinctes (Accueil, Guide, Contact, Scores) sans recharger la page, ce qui n'était pas trivial à gérer avec un seul fichier HTML<br>
</h4>

<h2>✅ Solutions apportées</h2>
<h4>

Chronomètre : ajout de stopTimer() dans retournerAuMenu() et dans verifierVictoire() pour garantir l'arrêt dans tous les cas<br>

Mémoire du bot : comportement conservé intentionnellement — la permutation est un pouvoir joueur conçu pour tromper le bot, ce qui est cohérent avec le game design<br>

Calcul du gagnant : déplacement des lignes de calcul de score avant les comparaisons dans afficherEcranVictoire()<br>

Timer : déplacé à l'intérieur de la div.info dans le HTML pour s'intégrer correctement à la barre d'infos<br>

Décorations latérales : passage de position: absolute à position: fixed avec top: 0 et bottom: 0 pour couvrir toute la hauteur du viewport<br>

Responsive : utilisation de media queries CSS (@media) pour réduire la taille des cartes et de la grille selon la largeur de l'écran, en utilisant transform: scale() et des dimensions adaptées par breakpoint<br>

Navigation entre pages : au lieu d'utiliser plusieurs fichiers HTML ou l'élément <dialog> (envisagé au départ), toutes les sections sont des <div> dans un seul fichier HTML, toutes cachées par défaut avec display: none. Une fonction JavaScript naviguer() gère l'affichage en cachant toutes les sections puis en affichant uniquement celle demandée via la propriété display<br>

</h4>
<h2>📁 Structure du projet</h2>
<h4>/<br>
├── index.html<br>
├── style.css<br>
├── script.js<br>
├── audio/<br>
│   ├── gagner.mp3<br>
│   ├── perdu.mp3<br>
│   └── cliquer.mp3<br>
└── CardImages/<br>
    ├── apple.png<br>
    ├── pear.png<br>
    └── ...<br></h4>
