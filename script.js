// --- variables globales ---

let premiereCarte = null, deuxiemeCarte = null;
let verrou = false;
let scoreJoueur1 = 0, scoreJoueur2 = 0, scoreDuBot = 0;
let pairesJoueur1 = 0, pairesJoueur2 = 0, pairesBot = 0;
let timer=0;
let timerIntervalle=null;
let mouvements = 0;
let partieCommencee = false, partieTerminee = false;
let modeJeu = null, difficulteActuelle = '';
let tourActuel = 'joueur1';
let modeReveal = false, modePermutation = false;
let utilisationsReveal = 1, utilisationsPermutation = 1;
let permPremiereCarte = null, carteRevelee = null, timeoutReveal = null;
let memoireBot = [];

// --- éléments du dom ---

const cartes              = document.querySelectorAll(".card");
const affichageScore1     = document.querySelector(".score");
const affichageScore2     = document.querySelector(".score-deux");
const affichageMouvements = document.querySelector(".bouge");
const affichageTour       = document.querySelector(".indicateur-tour");
const boutonReveal        = document.getElementById("revealBtn");
const boutonPermutation   = document.getElementById("changeBtn");
const conteneur           = document.querySelector(".container");
const affichageTimer      =document.querySelector(".timer");
// --- sons ---
const sonGagner  = new Audio('audio/gagner.mp3');
const sonPerdu   = new Audio('audio/perdu.mp3');
const sonCliquer = new Audio('audio/cliquer.mp3');
// --- images disponibles (10 uniques pour couvrir la grille 5x4) ---

const listeImages = [
    "CardImages/pear.png",        "CardImages/apple.png",
    "CardImages/orange.png",      "CardImages/grapes.png",
    "CardImages/blueberry.png",   "CardImages/grape.png",
    "CardImages/bananas.png",     "CardImages/strawberry.png",
    "CardImages/watermelon.png",  "CardImages/passion-fruit.png"
];

// --- démarrage ---
function demarrerPartie(cols, rows) {
    document.getElementById("menu").style.display = "none";
    document.getElementById("home").style.display = "block";

    conteneur.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    conteneur.style.maxWidth = (cols === 5) ? "750px" : "600px";

    // difficulté pour le leaderboard
    if      (cols === 4 && rows === 3) difficulteActuelle = "Facile";
    else if (cols === 4 && rows === 4) difficulteActuelle = "Moyen";
    else                               difficulteActuelle = "Difficile";

    let total = cols * rows;

    // préparer et mélanger les images
    let imagesDisponibles = [...listeImages].sort(() => Math.random() - 0.5);
    let imagesPartie = [...imagesDisponibles.slice(0, total / 2), ...imagesDisponibles.slice(0, total / 2)];
    for (let i = imagesPartie.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [imagesPartie[i], imagesPartie[j]] = [imagesPartie[j], imagesPartie[i]];
    }

    // assigner les images aux cartes
    cartes.forEach((carte, i) => {
        let img = carte.querySelector("img");
        if (i < total) {
            carte.style.display = "block";
            img.src = imagesPartie[i];
            img.style.opacity = "0";
            carte.classList.remove("disabled");
            carte.style.backgroundColor = "";
        } else {
            carte.style.display = "none";
        }
    });

    // reset complet
    premiereCarte = null; deuxiemeCarte = null; verrou = false;
    scoreJoueur1 = 0; scoreJoueur2 = 0; scoreDuBot = 0; timer = 0;
    pairesJoueur1 = 0; pairesJoueur2 = 0; pairesBot = 0;
    mouvements = 0; memoireBot = []; tourActuel = 'joueur1';
    partieCommencee = true; partieTerminee = false;
    modeReveal = false; modePermutation = false;
    utilisationsReveal = 1; utilisationsPermutation = 1;
    boutonReveal.classList.remove("used");
    boutonPermutation.classList.remove("used");
    affichageMouvements.textContent = "Mouvements : 0";
    stopTimer();
    startTimer();
    // affichage selon le mode
    if (modeJeu === 'solo') {
        affichageTimer.textContent    ="Timer : 00:00"
        affichageScore1.textContent   = "Score : 0";
        affichageScore2.style.display = "none";
        affichageTour.style.display   = "none";
        conteneur.className           = "container";
    } else if (modeJeu === 'bot') {
        affichageScore1.textContent   = "Toi : 0";
        affichageScore2.textContent   = "Bot : 0";
        affichageScore2.style.display = "block";
        affichageTour.style.display   = "block";
        changerCouleurTour();
    } else if (modeJeu === '1v1') {
        affichageScore1.textContent   = "J1 : 0";
        affichageScore2.textContent   = "J2 : 0";
        affichageScore2.style.display = "block";
        affichageTour.style.display   = "block";
        changerCouleurTour();
    }
}

// --- choix du mode et de la difficulté ---

function choisirMode(mode) {
    modeJeu = mode;
    document.getElementById("choixMode").style.display       = "none";
    document.getElementById("choixDifficulte").style.display = "flex";
    const libelles = {
        solo: "Mode Solo — choisis ta difficulté",
        bot:  "vs Bot — choisis ta difficulté",
        "1v1":"1 vs 1 — choisis ta difficulté"
    };
    document.getElementById("labelMode").textContent = libelles[mode];
}

function retourMenu() {
    document.getElementById("choixMode").style.display       = "flex";
    document.getElementById("choixDifficulte").style.display = "none";
    modeJeu = null;
}

// --- couleur du container selon le tour ---

function changerCouleurTour() {
    conteneur.classList.remove("tour-joueur1", "tour-joueur2");
    if (tourActuel === 'joueur1') {
        conteneur.classList.add("tour-joueur1");
        affichageTour.textContent = modeJeu === '1v1' ? "🟠 Tour : Joueur 1" : "🟠 Ton tour";
    } else {
        conteneur.classList.add("tour-joueur2");
        affichageTour.textContent = modeJeu === '1v1' ? "🟣 Tour : Joueur 2" : "🟣 Tour du Bot...";
    }
}
// chronomètre - démarrer
function startTimer() {
    timer = 0;
    if (timerIntervalle) {
        clearInterval(timerIntervalle);
    }
    timerIntervalle = setInterval(() => {
        timer++;
        updateDisplay();
    }, 1000);
}

// chronomètre - arrêter
function stopTimer() {
    if (timerIntervalle) {
        clearInterval(timerIntervalle);
        timerIntervalle = null;
    }
}
// mettre à jour l'affichage
function updateDisplay() {
    // mettre à jour le chronomètre
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    affichageTimer.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
// --- clics sur les cartes ---

cartes.forEach(carte => {
    carte.addEventListener("click", () => {
        if (verrou) return;
        if (modeJeu === 'bot' && tourActuel === 'bot') return;
        if (carte === premiereCarte) return;

        let img = carte.querySelector("img");

        // mode akuaku : révèle brièvement une carte
        if (modeReveal) {
            img.style.opacity = "1";
            carteRevelee = carte;
            timeoutReveal = setTimeout(() => {
                img.style.opacity = "0";
                carteRevelee = null;
            }, 800);
            modeReveal = false;
            return;
        }

        // mode permutation : échange deux cartes avec animation
        if (modePermutation) {
            let overlay = document.createElement("img");
            overlay.src = "CardImages/alter.png";
            overlay.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;pointer-events:none;z-index:10;`;
            carte.style.position = "relative";
            carte.appendChild(overlay);

            if (!permPremiereCarte) { permPremiereCarte = carte; return; }

            verrou = true;
            permPremiereCarte.style.transform = "scale(1.3)";
            carte.style.transform = "scale(1.3)";

            setTimeout(() => {
                permPremiereCarte.classList.add("shake");
                carte.classList.add("shake");

                setTimeout(() => {
                    let img1 = permPremiereCarte.querySelector("img");
                    let img2 = carte.querySelector("img");
                    [img1.src, img2.src] = [img2.src, img1.src];
                    img1.style.opacity = "0";
                    img2.style.opacity = "0";

                    permPremiereCarte.querySelectorAll("img[src='CardImages/alter.png']").forEach(o => o.remove());
                    carte.querySelectorAll("img[src='CardImages/alter.png']").forEach(o => o.remove());

                    permPremiereCarte.classList.remove("shake");
                    carte.classList.remove("shake");
                    permPremiereCarte.style.transform = "scale(1)";
                    carte.style.transform = "scale(1)";

                    modePermutation = false; permPremiereCarte = null; verrou = false;
                }, 500);
            }, 150);
            return;
        }

        // jeu normal
        img.style.opacity = "1";
        sonCliquer.play();
        carte.style.transform = "scale(1.2)";
        ajouterALaMemoire(carte);

        if (!premiereCarte) { premiereCarte = carte; return; }

        deuxiemeCarte = carte;
        verrou = true;
        ajouterMouvement();
        verifierPaire();
    });
});

// --- vérification de la paire ---

function verifierPaire() {
    let src1 = premiereCarte.querySelector("img").src;
    let src2 = deuxiemeCarte.querySelector("img").src;

    if (src1 === src2) {
        setTimeout(() => {
            let c1 = premiereCarte, c2 = deuxiemeCarte;

            // mettre à jour le bon score
        if (tourActuel === 'joueur1') {
            pairesJoueur1++;
            affichageScore1.textContent = (modeJeu === '1v1' ? "J1 : " : "Toi : ") + pairesJoueur1 + " paires";
        } else if (tourActuel === 'joueur2') {
            pairesJoueur2++;
            affichageScore2.textContent = "J2 : " + pairesJoueur2 + " paires";
        } else {
            pairesBot++;
            affichageScore2.textContent = "Bot : " + pairesBot + " paires";
        }

            // désactiver les cartes trouvées
            [c1, c2].forEach(c => {
                c.style.backgroundColor = "green";
                c.classList.add("disabled");
                c.style.transform = "scale(1)";
                c.querySelector("img").src = "CardImages/image.png";
            });

            memoireBot = memoireBot.filter(m => m.carte !== c1 && m.carte !== c2);
            reinitialiserTour();

            let fini = verifierVictoire();
            if (!fini && modeJeu === 'bot' && tourActuel === 'bot') tourDuBot();
        }, 500);

    } else {
        setTimeout(() => {
            [premiereCarte, deuxiemeCarte].forEach(c => {
                c.querySelector("img").style.opacity = "0";
                c.style.transform = "scale(1)";
            });
            reinitialiserTour();

            if (modeJeu === 'bot') {
                tourActuel = tourActuel === 'joueur1' ? 'bot' : 'joueur1';
                changerCouleurTour();
                if (tourActuel === 'bot') tourDuBot();
            } else if (modeJeu === '1v1') {
                tourActuel = tourActuel === 'joueur1' ? 'joueur2' : 'joueur1';
                changerCouleurTour();
            }
        }, 800);
    }
}

// --- vérification de fin de partie ---

function verifierVictoire() {
    let restantes = [...cartes].filter(c => !c.classList.contains("disabled") && c.style.display !== "none");
    if (restantes.length === 0) {
        partieTerminee = true;
        stopTimer();
        setTimeout(afficherEcranVictoire, 600);
        return true;
    }
    return false;
}
// --- écran de victoire ---
function afficherEcranVictoire() {
    const titre        = document.getElementById("titreVictoire");
    const message      = document.getElementById("messageVictoire");
    const scoresFinaux = document.getElementById("scoresFinaux");

    document.getElementById("zoneSauvegarde").innerHTML = `
        <input type="text" id="champPrenom" placeholder="Entre ton prénom..." maxlength="20">
        <button onclick="sauvegarderScore()"> Sauvegarder mon score</button>
    `;

    if (modeJeu === 'solo') {
        sonGagner.play();
        titre.textContent   = " Partie Terminée !";
        message.textContent = "Félicitations, tu as trouvé toutes les paires !";
        scoreJoueur1 = Math.round((pairesJoueur1 * 1000) / (mouvements + timer / 5));
        scoresFinaux.textContent = `Score : ${scoreJoueur1} pts — ${mouvements} mouvements — ${timer}s`;

    } else if (modeJeu === 'bot') {
        scoreJoueur1 = Math.round((pairesJoueur1 * 1000) / (mouvements + timer / 5));
        scoreDuBot    = Math.round((pairesBot     * 1000) / (mouvements + timer / 5));
        titre.textContent   = scoreJoueur1 > scoreDuBot ? " Tu as gagné !" : scoreDuBot > scoreJoueur1 ? " Le bot a gagné..." : " Égalité !";
        message.textContent = scoreJoueur1 > scoreDuBot ? "Bien joué, tu as battu le bot !" : scoreDuBot > scoreJoueur1 ? "Le bot t'a battu. Réessaie !" : "Score parfaitement égal !";
        scoresFinaux.textContent = `Toi : ${scoreJoueur1} pts — Bot : ${scoreDuBot} pts`;
        if (scoreJoueur1 > scoreDuBot) sonGagner.play();
        else sonPerdu.play();

    } else if (modeJeu === '1v1') {
        scoreJoueur1 = Math.round((pairesJoueur1 * 1000) / (mouvements + timer / 5));
        scoreJoueur2 = Math.round((pairesJoueur2 * 1000) / (mouvements + timer / 5));
        titre.textContent   = scoreJoueur1 > scoreJoueur2 ? " Joueur 1 gagne !" : scoreJoueur2 > scoreJoueur1 ? " Joueur 2 gagne !" : " Égalité !";
        message.textContent = scoreJoueur1 > scoreJoueur2 ? "Bien joué Joueur 1 !" : scoreJoueur2 > scoreJoueur1 ? "Bien joué Joueur 2 !" : "Les deux joueurs sont à égalité !";
        scoresFinaux.textContent = `J1 : ${scoreJoueur1} pts — J2 : ${scoreJoueur2} pts`;
        if (scoreJoueur1 === scoreJoueur2) sonPerdu.play();
        else sonGagner.play();
    }

    document.getElementById("ecranVictoire").style.display = "flex";
}

// --- sauvegarde du score ---

function sauvegarderScore() {
    const prenom = document.getElementById("champPrenom").value.trim();
    if (!prenom) { alert("Entre ton prénom d'abord !"); return; }

    let scoreASauvegarder = modeJeu === '1v1' ? Math.max(scoreJoueur1, scoreJoueur2) : scoreJoueur1;
    const modeLisible = { solo: "Solo", bot: "vs Bot", "1v1": "1v1" }[modeJeu] + " — " + difficulteActuelle;

    let classement = JSON.parse(localStorage.getItem("classement") || "[]");
    classement.push({ prenom, points: scoreASauvegarder, mode: modeLisible, date: new Date().toLocaleDateString("fr-FR") });
    classement.sort((a, b) => b.points - a.points);
    localStorage.setItem("classement", JSON.stringify(classement.slice(0, 15)));

    document.getElementById("zoneSauvegarde").innerHTML = `<p style="color:#00f7ff;font-size:20px;">✅ Score sauvegardé !</p>`;
}

function retournerAuMenu() {
    stopTimer();
    document.getElementById("ecranVictoire").style.display = "none";
    document.getElementById("home").style.display          = "none";
    document.getElementById("menu").style.display          = "flex";
    document.getElementById("choixMode").style.display     = "flex";
    document.getElementById("choixDifficulte").style.display = "none";
    partieCommencee = false; partieTerminee = false;
}

// --- leaderboard ---

function afficherLeaderboard() {
    const section  = document.getElementById("histoire");
    let classement = JSON.parse(localStorage.getItem("classement") || "[]");

    if (classement.length === 0) {
        section.innerHTML = `<h1>🏆 Tableau des Scores</h1><p class="vide-scores">Aucun score enregistré. Joue une partie !</p>`;
        return;
    }

    const lignes = classement.map((s, i) => {
        const m = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1;
        return `<tr><td>${m}</td><td>${s.prenom}</td><td>${s.points} pts</td><td>${s.mode}</td><td>${s.date}</td></tr>`;
    }).join("");

    section.innerHTML = `
        <h1>🏆 Tableau des Scores</h1>
        <table class="tableau-scores">
            <thead><tr><th>#</th><th>Joueur</th><th>Score</th><th>Mode</th><th>Date</th></tr></thead>
            <tbody>${lignes}</tbody>
        </table>
        <button id="btnEffacerScores" onclick="effacerScores()">🗑️ Effacer tous les scores</button>
    `;
}

function effacerScores() {
    if (confirm("Effacer tous les scores ? Cette action est irréversible.")) {
        localStorage.removeItem("classement");
        afficherLeaderboard();
    }
}

// --- utilitaires ---

function reinitialiserTour() { premiereCarte = null; deuxiemeCarte = null; verrou = false; }

function ajouterMouvement() {
    mouvements++;
    affichageMouvements.textContent = "Mouvements : " + mouvements;
}

// --- boutons pouvoirs ---

boutonReveal.addEventListener("click", () => {
    if (utilisationsReveal <= 0 || premiereCarte) return;
    modeReveal = true;
    boutonReveal.classList.add("used");
    utilisationsReveal--;
});

boutonPermutation.addEventListener("click", () => {
    if (utilisationsPermutation <= 0 || premiereCarte) return;
    modePermutation = true; permPremiereCarte = null;
    boutonPermutation.classList.add("used");
    utilisationsPermutation--;
});

// --- navigation ---

function naviguer(page) {
    document.getElementById("ecranVictoire").style.display = "none";
    ["home","contact","guide","histoire","menu"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });

    if (page === "accueil") {
        if (partieCommencee && !partieTerminee) {
            document.getElementById("home").style.display = "block";
        } else {
            document.getElementById("menu").style.display           = "flex";
            document.getElementById("choixMode").style.display      = "flex";
            document.getElementById("choixDifficulte").style.display = "none";
        }
        return;
    }

    if (page === "histoire") afficherLeaderboard();
    document.getElementById(page).style.display = "block";
}

// --- mémoire du bot ---

function ajouterALaMemoire(carte) {
    let src = carte.querySelector("img").src;
    let connue = memoireBot.find(m => m.carte === carte);
    if (!connue) memoireBot.push({ carte, src });
    else connue.src = src;
}

// le bot retourne deux cartes avec délai
function botRetourneCarte(carte1, carte2) {
    let img1 = carte1.querySelector("img");
    let img2 = carte2.querySelector("img");

    img1.style.opacity = "1"; carte1.style.transform = "scale(1.2)";
    ajouterALaMemoire(carte1);

    setTimeout(() => {
        img2.style.opacity = "1"; carte2.style.transform = "scale(1.2)";
        ajouterALaMemoire(carte2);
        premiereCarte = carte1; deuxiemeCarte = carte2;
        verrou = true;
        ajouterMouvement();
        verifierPaire();
    }, 800);
}

// tour principal du bot
function tourDuBot() {
    if (partieTerminee) return;

    setTimeout(() => {
        let dispo = [...cartes].filter(c => !c.classList.contains("disabled") && c.style.display !== "none");
        if (dispo.length < 2) return;

        // nettoyer les cartes déjà trouvées de la mémoire
        memoireBot = memoireBot.filter(m => !m.carte.classList.contains("disabled"));

        let tirage = Math.round(Math.random());

        if (tirage === 1 && memoireBot.length >= 2) {
            let paire = null;
            for (let i = 0; i < memoireBot.length && !paire; i++)
                for (let j = i + 1; j < memoireBot.length && !paire; j++)
                    if (memoireBot[i].src === memoireBot[j].src)
                        paire = [memoireBot[i].carte, memoireBot[j].carte];

            if (paire) {
                botRetourneCarte(paire[0], paire[1]);
            } else {
                let memAleatoire = [...memoireBot].sort(() => Math.random() - 0.5);
                botRetourneCarte(memAleatoire[0].carte, memAleatoire[1].carte);
            }
        } else {
            let aleatoire = [...dispo].sort(() => Math.random() - 0.5);
            botRetourneCarte(aleatoire[0], aleatoire[1]);
        }
    }, 1000);
}