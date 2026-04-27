// ============================================================
// 🃏 VARIABLES GLOBALES
// ============================================================

// cartes retournées pendant le tour en cours
let firstCard = null;
let secondCard = null;

// verrou pour empêcher de cliquer pendant la vérification
let lock = false;

// score et nombre de mouvements
let score = 0;
let bouge = 0;

// indique si une partie est en cours (pour la navigation)
let gameStarted = false;

// modes spéciaux activés par les boutons de pouvoir
let revealMode = false;
let permutationMode = false;

// nombre d'utilisations restantes pour chaque pouvoir
let revealUses = 1;
let permutationUses = 1;

// première carte sélectionnée en mode permutation
let permFirstCard = null;

// carte révélée temporairement par AkuAku
let revealedCard = null;
let revealTimeout = null;

// éléments du DOM qu'on va manipuler souvent
const cards = document.querySelectorAll(".card");
const scores = document.querySelector(".score");
const bouges = document.querySelector(".bouge");
const revealBtn = document.getElementById("revealBtn");
const permBtn = document.getElementById("changeBtn");


// ============================================================
// 🖼️ LISTE DES IMAGES DISPONIBLES
// ============================================================

// toutes les images possibles, les doublons sont gérés dans startGame()
let images = [
    "CardImages/pear.png",
    "CardImages/apple.png",
    "CardImages/orange.png",
    "CardImages/grapes.png",
    "CardImages/blueberry.png",
    "CardImages/grape.png",
    "CardImages/bananas.png",
    "CardImages/blueberry.png",
    "CardImages/grape.png",
    "CardImages/apple.png",
    "CardImages/pear.png",
    "CardImages/strawberry.png",
    "CardImages/watermelon.png",
    "CardImages/passion-fruit.png",
    "CardImages/strawberry.png",
    "CardImages/watermelon.png",
    "CardImages/passion-fruit.png",
    "CardImages/orange.png",
    "CardImages/bananas.png",
    "CardImages/grapes.png"
];


// ============================================================
// 🎮 DÉMARRAGE DE LA PARTIE
// ============================================================

function startGame(cols, rows) {

    // on cache le menu et on affiche la zone de jeu
    document.getElementById("menu").style.display = "none";
    document.getElementById("home").style.display = "block";

    const container = document.querySelector(".container");
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    // grille plus large pour le mode difficile (5 colonnes)
    if (cols === 5) {
        container.style.maxWidth = "750px";
    }

    let total = cols * rows;

    // on supprime les doublons puis on mélange les images
    let uniqueImages = [...new Set(images)];
    uniqueImages.sort(() => Math.random() - 0.5);

    // on prend exactement total/2 images uniques et on les duplique
    let selected = uniqueImages.slice(0, total / 2);
    let gameImages = [...selected, ...selected];

    // mélange aléatoire avec l'algorithme Fisher-Yates
    for (let i = gameImages.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [gameImages[i], gameImages[j]] = [gameImages[j], gameImages[i]];
    }

    // on assigne chaque image à une carte et on cache toutes les images
    cards.forEach((card, index) => {
        let img = card.querySelector("img");

        if (index < total) {
            card.style.display = "block";
            img.src = gameImages[index];
            img.style.opacity = "0"; // cachée au départ
            card.classList.remove("disabled");
            card.style.backgroundColor = "";
        } else {
            // on cache les cartes en trop
            card.style.display = "none";
        }
    });

    // réinitialisation de l'état de jeu
    firstCard = null;
    secondCard = null;
    lock = false;
    score = 0;
    scores.textContent = "Score : 0";
    gameStarted = true;
}


// ============================================================
// 🖱️ GESTION DES CLICS SUR LES CARTES
// ============================================================

cards.forEach(card => {
    card.addEventListener("click", () => {

        // on bloque les clics pendant la vérification ou si on reclique la même carte
        if (lock) return;
        if (card === firstCard) return;

        let img = card.querySelector("img");

        // --- MODE AKUAKU : révèle brièvement une carte sans consommer le tour ---
        if (revealMode) {
            img.style.opacity = "1";
            revealedCard = card;

            // la carte se cache après 800ms
            revealTimeout = setTimeout(() => {
                img.style.opacity = "0";
                revealedCard = null;
            }, 800);

            revealMode = false;
            return;
        }

       
// --- MODE PERMUTATION : échange les images de 2 cartes ---
if (permutationMode) {

    // on ajoute l'image alter.png au centre de la carte sélectionnée
    let overlay = document.createElement("img");
    overlay.src = "CardImages/alter.png";
    overlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        pointer-events: none;
        z-index: 10;
    `;
    // la carte a besoin d'un position relative pour que l'overlay soit centré
    card.style.position = "relative";
    card.appendChild(overlay);

    // première carte sélectionnée : on attend la deuxième
    if (!permFirstCard) {
        permFirstCard = card;
        return;
    }

    // on bloque les clics pendant l'animation
    lock = true;

    // étape 1 : les deux cartes s'agrandissent
    permFirstCard.style.transform = "scale(1.3)";
    card.style.transform = "scale(1.3)";

    setTimeout(() => {

        // étape 2 : les deux cartes tremblent
        permFirstCard.classList.add("shake");
        card.classList.add("shake");

        setTimeout(() => {

            // étape 3 : on échange les images après la secousse
            let img1 = permFirstCard.querySelector("img");
            let img2 = card.querySelector("img");

            let temp = img1.src;
            img1.src = img2.src;
            img2.src = temp;

            // les deux cartes restent cachées après l'échange
            img1.style.opacity = "0";
            img2.style.opacity = "0";

            // on supprime les overlays alter.png des deux cartes
            permFirstCard.querySelectorAll("img[src='CardImages/alter.png']")
                .forEach(o => o.remove());
            card.querySelectorAll("img[src='CardImages/alter.png']")
                .forEach(o => o.remove());

            // étape 4 : on remet les cartes à leur taille normale
            permFirstCard.classList.remove("shake");
            card.classList.remove("shake");
            permFirstCard.style.transform = "scale(1)";
            card.style.transform = "scale(1)";

            // on réinitialise le mode permutation
            permutationMode = false;
            permFirstCard = null;
            lock = false;

        }, 500); // durée de la secousse

    }, 150); // petit délai pour voir l'agrandissement avant la secousse

    return;
}

        // --- JEU NORMAL : retournement et vérification ---
        img.style.opacity = "1";
        card.style.transform = "scale(1.2)";

        // première carte du tour
        if (!firstCard) {
            firstCard = card;
            return;
        }

        // deuxième carte : on lance la vérification
        secondCard = card;
        lock = true;
        ajoutebouge();
        checkMatch();
    });
});


// ============================================================
// 🔍 VÉRIFICATION DE LA PAIRE
// ============================================================

function checkMatch() {
    let img1 = firstCard.querySelector("img").src;
    let img2 = secondCard.querySelector("img").src;

    if (img1 === img2) {

        // paire trouvée : on met à jour le score et on colore les cartes en vert
        setTimeout(() => {
            score = (score === 0) ? 1 : score * 2;
            scores.textContent = "Score : " + score;

            firstCard.style.backgroundColor = "green";
            secondCard.style.backgroundColor = "green";

            // on désactive les cartes trouvées
            firstCard.classList.add("disabled");
            secondCard.classList.add("disabled");

            firstCard.style.transform = "scale(1)";
            secondCard.style.transform = "scale(1)";

            // on remplace l'image par une image de victoire
            firstCard.querySelector("img").src = "CardImages/image.png";
            secondCard.querySelector("img").src = "CardImages/image.png";

            reset();
        }, 500);

    } else {

        // pas de paire : on cache les cartes après un court délai
        setTimeout(() => {
            firstCard.querySelector("img").style.opacity = "0";
            secondCard.querySelector("img").style.opacity = "0";

            firstCard.style.transform = "scale(1)";
            secondCard.style.transform = "scale(1)";

            reset();
        }, 800);
    }
}


// ============================================================
// 🔄 RÉINITIALISATION DU TOUR
// ============================================================

function reset() {
    firstCard = null;
    secondCard = null;
    lock = false;
}


// ============================================================
// 📊 COMPTEUR DE MOUVEMENTS
// ============================================================

function ajoutebouge() {
    bouge++;
    bouges.textContent = "Bouges : " + bouge;
}


// ============================================================
// 🔘 BOUTONS DES POUVOIRS SPÉCIAUX
// ============================================================

// bouton AkuAku : révèle une carte temporairement
revealBtn.addEventListener("click", () => {
    if (revealUses <= 0) return;   // pouvoir déjà utilisé
    if (firstCard !== null) return; // interdit en plein tour

    revealMode = true;
    revealBtn.classList.add("used"); // grise le bouton visuellement
    revealUses--;
});

// bouton permutation : échange deux cartes
permBtn.addEventListener("click", () => {
    if (permutationUses <= 0) return;   // pouvoir déjà utilisé
    if (firstCard !== null) return;      // interdit en plein tour

    permutationMode = true;
    permFirstCard = null;
    permBtn.classList.add("used"); // grise le bouton visuellement
    permutationUses--;
});


// ============================================================
// 📄 NAVIGATION ENTRE LES PAGES
// ============================================================

function pages(page) {

    // on cache toutes les sections
    document.getElementById("home").style.display = "none";
    document.getElementById("contact").style.display = "none";
    document.getElementById("guide").style.display = "none";
    document.getElementById("histoire").style.display = "none";
    document.getElementById("menu").style.display = "none";

    // si on clique sur Accueil : on affiche le jeu ou le menu selon l'état
    if (page === "home") {
        if (gameStarted) {
            document.getElementById("home").style.display = "block";
        } else {
            document.getElementById("menu").style.display = "flex";
        }
        return;
    }

    // sinon on affiche la section correspondante
    document.getElementById(page).style.display = "block";
}