var window_width = 400;
var window_height = 600;
var maxhp = 4;
var komora = 10;
var magazynek = 0;
var punkty = 0;
var cooldown = 0;
var cooldown2 = 0;
var czyPociskiSa = true;
const pociski = [];
const obiekty = [];
let direction2 = 90;
var zycia = 3;



let keysPressed = {};
document.addEventListener("keydown", function(event) {
    keysPressed[event.key] = true;
});
document.addEventListener("keyup", function(event) {
    keysPressed[event.key] = false;
});

function updateDirection() {
    if (keysPressed["ArrowLeft"] && direction2 < 170) {
        direction2 += 2;
    }
    if (keysPressed["ArrowRight"] && direction2 > 10) {
        direction2 -= 2;
    }
}

let isShooting = false;
document.addEventListener("keydown", function(event) {
    if (event.code === "KeyC") {
        isShooting = true;
    }
});
document.addEventListener("keyup", function(event) {
    if (event.code === "KeyC") {
        isShooting = false;
    }
});



var Armata = function () {
    var armataHtml = '<div class="armata"></div>';

    this.armataElement = $(armataHtml)
    this.armataElement.css({
        position: "absolute",
        left: window_width/2-5,
        top: -5,
        width: 10,
        height: 20
    })
    $("#game").append(this.armataElement);
}

Armata.prototype.obrot = function (direction) {
    this.armataElement.css({
        transform: `rotate(${direction-90}deg)`
    });
};




var Object = function (x, y, hp) {
    const blockSize = 40;
    const blockOffset = (window_width/blockSize)*8/9;
    const baseYPosition = window_height;
    this.hp = hp;

    this.x = x * (blockSize + blockOffset)+blockOffset+blockSize/2;
    this.y = baseYPosition - y * (blockSize + blockOffset)-blockOffset-blockSize/2;
    
    this.rysuj();
};

Object.prototype.rysuj = function () {
    var autoHtml = '<div class="obiekt"></div>';

    this.autoElement = $(autoHtml);

    var newWidth = Math.max(5, 40 / maxhp * this.hp);
    var newHeight = Math.max(5, 40 / maxhp * this.hp);
    var newX = this.x - newWidth/2;
    var newY = this.y - newHeight/2;


    this.autoElement.css({
        position: "absolute",
        left: newX,
        top: newY,
        width: newWidth,
        height: newHeight
    });

    $("#game").append(this.autoElement);

    if (this.hp <= 0) {
        this.autoElement.remove();
    }
};

Object.prototype.wGore = function (speed) {
    this.y -= speed;

    var newWidth = Math.max(5, 40 / maxhp * this.hp);
    var newHeight = Math.max(5, 40 / maxhp * this.hp);

    var newX = this.x - newWidth/2;
    var newY = this.y - newHeight/2;


    this.autoElement.css({
        left: newX,
        top: newY,
        width: newWidth,
        height: newHeight
    });

    if (this.hp <= 0) {
        this.autoElement.remove();
    }
};

Object.prototype.sprawdzKolizjeKrawedz = function () {
    var obiektTop = this.y - this.autoElement.height()/2;
    if(obiektTop <= 0){
        return true;
    }
}



var Pocisk = function (x, y, direction, speed) {
    this.direction = direction;
    this.x = x;
    this.y = y;
    this.speed = speed;
    var pociskHtml = '<div class="pocisk"></div>';

    this.pociskElement = $(pociskHtml);
    this.pociskElement.css({
        position: "absolute",
        left: this.x,
        top: this.y
    });
    $("#game").append(this.pociskElement);
}
Pocisk.prototype.go = function () {
    this.x += Math.cos(this.direction*(Math.PI/180))*this.speed;
    this.y += Math.sin(this.direction*(Math.PI/180))*this.speed;

    this.pociskElement.css({
        left: this.x,
        top: this.y
    })
}

Pocisk.prototype.sprawdzKolizjeKrawedz = function (j) {
    var pociskMargin = 5;
    var pociskLeft = this.x - this.pociskElement.width()/2 - pociskMargin;
    var pociskRight = this.x + this.pociskElement.width()/2 + pociskMargin;
    var pociskTop = this.y - this.pociskElement.height()/2 - pociskMargin;
    var pociskBottom = this.y + this.pociskElement.height()/2 + pociskMargin;

    if (
        pociskRight >= window_width ||
        pociskLeft <= 0 ||
        pociskBottom >= window_height ||
        pociskTop <= 0
    ){     
        if (!this.changedDirection) {
            if (pociskRight >= window_width || pociskLeft <= 0) {
                // Odbicie lewo/prawo
                this.direction = 180 - this.direction;
            } else if(pociskTop <= 0) {
                // Odbicie góra/dół
                this.direction = -this.direction;
            }
            else if(pociskBottom >= window_height){
                this.pociskElement.remove();
                pociski.splice(j, 1);
                j--;
                magazynek++;
                document.getElementById("magazynek").textContent = "Magazynek: " + magazynek;
            }
            this.changedDirection = true;
        }
    }
}


Pocisk.prototype.sprawdzKolizje = function (obiekt) {
    var pociskMargin = 5;
    var obiektMargin = 1;

    var pociskLeft = this.x - this.pociskElement.width()/2 - pociskMargin;
    var pociskRight = this.x + this.pociskElement.width()/2 + pociskMargin;
    var pociskTop = this.y - this.pociskElement.height()/2 - pociskMargin;
    var pociskBottom = this.y + this.pociskElement.height()/2 + pociskMargin;

    var obiektLeft = obiekt.x - obiekt.autoElement.height()/2 - obiektMargin;
    var obiektRight = obiekt.x + obiekt.autoElement.width()/2 + obiektMargin;
    var obiektTop = obiekt.y - obiekt.autoElement.height()/2 - obiektMargin;
    var obiektBottom = obiekt.y + obiekt.autoElement.height()/2 + obiektMargin;

    if (
        pociskRight >= obiektLeft &&
        pociskLeft <= obiektRight &&
        pociskBottom >= obiektTop &&
        pociskTop <= obiektBottom
    ) {
        const pociskCenterX = (pociskLeft + pociskRight) / 2;
        const pociskCenterY = (pociskTop + pociskBottom) / 2;
        const obiektCenterX = (obiektLeft + obiektRight) / 2;
        const obiektCenterY = (obiektTop + obiektBottom) / 2;

        const deltaX = pociskCenterX - obiektCenterX;
        const deltaY = pociskCenterY - obiektCenterY;

        if (!this.changedDirection) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Odbicie lewo/prawo
                this.direction = 180 - this.direction;
            } else {
                // Odbicie góra/dół
                this.direction = -this.direction;
            }

            this.changedDirection = true;
        }

        return true;
    }

    return false;
};

function shoot() {
    czyPociskiSa = true;
    if (cooldown >= 15) {
        if(komora > 0){
            let poc = new Pocisk(window_width/2-3, 10, direction2, 5);
            pociski.push(poc);
            komora--;
            cooldown = 0;
            document.getElementById("komora").textContent = "Komora: " + komora;
        }
        czyPociskiSa = false;
    }

}

function spawnLayer(time) {
    if (cooldown2 >= 50/time){
        for (let x = 0; x < 8; x++) {
            let obj = new Object(x, 0, Math.round(Math.random()*maxhp));
            obiekty.push(obj);
            cooldown2 = 0;
        }
    }
}


for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 4; y++) {
        let obj = new Object(x, y, Math.round(Math.random()*maxhp));
        obiekty.push(obj);
    }
}

var armata = new Armata;
// var pocisk1 = new Pocisk(50, 55, 65, 5);

function gameLoop() {
    let interval;
    clearInterval(interval)
    interval = setInterval(() => {
        if(zycia <= 0){
            return;
        }
        // pocisk1.go()
        // for (let i = 0; i < obiekty.length; i++) {
        //     let obiekt = obiekty[i];
        //     if (!obiekt.autoElement || obiekt.hp <= 0) {
        //         continue;
        //     }

        //     if (pocisk1.sprawdzKolizje(obiekt)) {
        //         obiekt.hp -= 1;
        //         obiekt.wGore(0);

        //         if (obiekt.hp <= 0) {
        //             obiekt.autoElement.remove();
        //             obiekty.splice(i, 1);
        //             i--;
        //         }
        //     }
        // }
        // pocisk1.changedDirection = false;

        spawnLayer(0.2);
        updateDirection();
        armata.obrot(direction2);
        if (isShooting){
            shoot();
        }
        for (let j = 0; j < pociski.length; j++) {
            let pocisk = pociski[j];
            pocisk.go()
            for (let i = 0; i < obiekty.length; i++) {
                let obiekt = obiekty[i];
                if (!obiekt.autoElement || obiekt.hp <= 0) {
                    continue;
                }
    
                if (pocisk.sprawdzKolizje(obiekt)) {
                    obiekt.hp -= 1;
                    obiekt.wGore(0);
    
                    if (obiekt.hp <= 0) {
                        obiekt.autoElement.remove();
                        obiekty.splice(i, 1);
                        i--;
                        punkty++;
                        document.getElementById("punktacja").textContent = "Punkty: " + punkty;
                    }
                }
            }
            pocisk.changedDirection = false;
            pocisk.sprawdzKolizjeKrawedz(j);
            pocisk.changedDirection = false;
        }
        if(pociski.length == 0 && czyPociskiSa == false){
            przeladuj();
        }

        for (let j = 0; j< obiekty.length; j++) {
            let obiekt = obiekty[j];
            if (!obiekt.autoElement || obiekt.hp <= 0) {
                continue;
            }
            if(obiekt.sprawdzKolizjeKrawedz()){
                obiekt.autoElement.remove();
                obiekty.splice(j, 1);
                j--;
                zycia--;
                document.getElementById("zycia").textContent = "Życia: " + zycia;
            }
            else{
                obiekt.wGore(0.2);
            } 
        }
        cooldown++;
        cooldown2++;
        czyPociskiSa = true;
    },16)
};

function przeladuj() {
    console.log("przeładowanie")
    komora = magazynek;
    magazynek = 0;
    console.log(magazynek);
    console.log(komora);
    document.getElementById("komora").textContent = "Komora: " + komora;
    document.getElementById("magazynek").textContent = "Magazynek: " + magazynek;
}

document.addEventListener("keydown", function(event) {
    if (event.key === "x") {
        if(pociski.length<=2){
            przeladuj();
        }
    }
});


gameLoop();