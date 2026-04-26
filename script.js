const cards = document.querySelectorAll(".card");
let firstCard = null;
let secondCard = null;
let lock = false;

let score = 0;
const scoreDisplay = document.querySelector(".score");
let images = [    "CardImages/pear.png",
                  "CardImages/apple.png" ,
                  "CardImages/bananas.png",
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
];
images.sort(() => 0.5 - Math.random());
console.log(images);
cards.forEach((card, index) => {
    let img = card.querySelector("img");
    img.src = images[index];
    img.style.opacity = "0";
});
cards.forEach(card => {
    card.addEventListener("click", () => {
        if (lock) return;
        if (card === firstCard) return;

        let img = card.querySelector("img");
        img.style.opacity = "1";
        card.style.transform = "scale(1.2)";

        if (!firstCard) {
            firstCard = card;
            return;
        }

        secondCard = card;
        lock = true;

        checkMatch();
    });
});
function checkMatch() {
    let img1 = firstCard.querySelector("img").src;
    let img2 = secondCard.querySelector("img").src;

    if (img1 === img2) {
        lock = true;

        setTimeout(() => {
            score++;
            scoreDisplay.textContent = "Score : " + score;

            firstCard.style.backgroundColor = "green";
            secondCard.style.backgroundColor = "green";

            firstCard.classList.add("disabled");
            secondCard.classList.add("disabled");

            firstCard.style.transform = "scale(1)";
            secondCard.style.transform = "scale(1)";

            firstCard.querySelector("img").src = "CardImages/image.png";
            secondCard.querySelector("img").src = "CardImages/image.png";

            reset();
        }, 500);
    }else {
        setTimeout(() => {
            firstCard.querySelector("img").style.opacity = "0";
            secondCard.querySelector("img").style.opacity = "0";

            firstCard.style.transform = "scale(1)";
            secondCard.style.transform = "scale(1)";

            reset();
        }, 800);
    }
}


function reset() {
    firstCard = null;
    secondCard = null;
    lock = false;
}

function pages(page){
        document.getElementById("home").style.display="none";
        document.getElementById("contact").style.display="none";
        document.getElementById("guide").style.display="none";
        document.getElementById("histoire").style.display="none";
        document.getElementById(page).style.display="block";
}
        
    
