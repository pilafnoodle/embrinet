const img = new Image();

const canvas=document.getElementById("canvas")
const ctx=canvas.getContext("2d")


img.src='img/fishpond.avif';

const isMobile = window.innerWidth <= 768;
pwidth = isMobile ? 15 : 30;
pheight = isMobile ? 8 : 15;
blockArray = []; //stores original image blocks
brightnessArray=[]; //stores brightness  (ajust alpha value)
lastBrightnessArray=[];
forceArray=[]; //stores the direction of the last movement up,down,left,right
//these are processed pixel cols and rows, not raw pixel cols and rows
cols=0;
rows=0;
let pixelatedCanvas=null;

img.onload = () => {
    canvas.width = Math.floor(window.innerWidth / pwidth) * pwidth;
    canvas.height = Math.floor(window.innerHeight / pheight) * pheight;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);


    pixelatedCanvas = pixelateImage(img, pwidth, pheight, 0, 0, canvas.width, canvas.height); 
    cols = Math.floor(canvas.width / pwidth);
    rows = Math.floor(canvas.height / pheight);

    imageData=ctx.getImageData(0,0,canvas.width,canvas.height).data
    for(let i=0; i<canvas.width/pwidth ;i++){
        blockArray[i] = [];
        brightnessArray[i] = [];
        forceArray[i] = [];
        lastBrightnessArray[i]=[];


        for (let j=0; j<canvas.height/pheight; j++){

            x=i*pwidth
            y=j*pheight
            pos=(x+y*canvas.width)*4
            r=imageData[pos] 
            g=imageData[pos+1]
            b=imageData[pos+2]
            blockArray[i][j] = 0.299*r + 0.587*g + 0.114*b;
            brightnessArray[i][j] = 0 //everything dark brightness
            lastBrightnessArray[i][j]=0;

            const forceVector = { x: 0, y: 0 };
            forceArray[i][j] = forceVector //everything is at 0 force initially
        }
    }

    drawAll();
    document.getElementById('home-page-content').style.display = 'block';

};

function drawAll(){
    ripplePixels(); // calculates brightness of every point
    updateBrightness(); // applies it

    spawnFish();//checks if i should spawn a new
    FihRipple();
    requestAnimationFrame(drawAll);
}

//also updates force array to decay
function updateBrightness(){ //dispalys based on brightness array and moves the
    ctx.drawImage(pixelatedCanvas,0,0,canvas.width,canvas.height);
    for (let i=0; i<cols;i++){
        for (let j=0; j<rows;j++){
            brightness=brightnessArray[i][j]
            ctx.fillStyle = `rgba(0, 0, 0, ${1 - brightness/255})`;  //last param is alpha, higher brightness means 1-1=0, so completely transparent
            ctx.fillRect(i*pwidth,j*pheight,pwidth,pheight);    
            forceArray[i][j].x =  forceArray[i][j].x * Math.exp(-0.02);
            forceArray[i][j].y = forceArray[i][j].y * Math.exp(-0.02);
        }
    }
}

/*
currentTick=0;
targetTime=0;
function randomBlinks(time){
    x=Math.floor(Math.random()*brightnessArray.length);
    y=Math.floor(Math.random()*brightnessArray[0].length);

    if(currentTick>targetTime){
        currentTick=0;
        targetTime=Math.floor(Math.random()*10); //20 is the rate
        // console.log(targetTime);
        // console.log("******************");
        brightnessArray[x][y]=255;
    }
    currentTick++;
    // console.log(currentTick);
    requestAnimationFrame(randomBlinks);
}

function fadePixels(){
    //the higher the brightness, the faster i need to kill it
    for (let i=0; i<cols;i++){
        for (let j=0; j<rows;j++){
            brightnessArray[i][j] = brightnessArray[i][j] * Math.exp(-0.06);
        }
    }
    requestAnimationFrame(fadePixels);
}*/
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;


var LastBrightnessCoeffSlider = document.getElementById("LastBrightnessCoeffSlider");
var LastBrightnessCoeff = parseFloat(LastBrightnessCoeffSlider.value); 

LastBrightnessCoeffSlider.addEventListener("input", () => {
    LastBrightnessCoeff = parseFloat(LastBrightnessCoeffSlider.value);
    normalizeCoeff = ((VertProp * 2) + HorizProp) ;
})

var VertPropSlider = document.getElementById("VertPropSlider");
var VertProp = parseFloat(VertPropSlider.value); 

VertPropSlider.addEventListener("input", () => {
    VertProp = parseFloat(VertPropSlider.value);
    normalizeCoeff = ((VertProp * 2) + HorizProp);
})

var HorizPropSlider = document.getElementById("HorizPropSlider");
var HorizProp = parseFloat(HorizPropSlider.value); 

HorizPropSlider.addEventListener("input", () => {
    HorizProp = parseFloat(HorizPropSlider.value);
   // HorizProp = (0.3 + 0.05) - rawValue;
    normalizeCoeff = ((VertProp * 2) + HorizProp) ;
})
var normalizeCoeff = ((VertProp * 2) + HorizProp) ;

var showControlsBox = document.getElementById("show-controls-box");
var controlsContainer = document.querySelector(".controls-container"); 

showControlsBox.addEventListener("change", () => {
    if (showControlsBox.checked) {
        controlsContainer.style.display = "flex"; 
    } else {
        controlsContainer.style.display = "none";
    }
});

function ripplePixels(){
    lastBrightnessArray = brightnessArray.map(col => [...col]);
    for (let i=0; i<cols;i++){ 
        for (let j=1; j<rows-1; j++){

         
            rightBrightness=0;
            if(j%1==0 && i!==0){ 
                rightBrightness=lastBrightnessArray[i-1][j] //this is for left going fish
            }
            upBrightness=lastBrightnessArray[i][j-1]
            if(j!==rows-1){
                downBrightness=lastBrightnessArray[i][j+1] 
            } 

                    
            brightnessArray[i][j] = Math.min(255,lastBrightnessArray[i][j]*((LastBrightnessCoeff * (1 - VertProp)))
                + ( downBrightness*VertProp*0.6 + upBrightness*VertProp*0.6 + HorizProp*rightBrightness)/(VertProp+HorizProp));


        }
    }
}


//js canvas 0,0 is upper left corner
class Fih{
    constructor(spawnHeight, direction, text,speed,fontSize){

        this.direction=direction
        this.fontSize=fontSize
        if (direction=="right"){
            this.posX=-500;
            this.posY=spawnHeight;
            this.text=`>(${text}(°>`;
            this.speed=speed;
            
        }
        else if(direction=="left"){
            this.posX=canvas.width
            this.posY=spawnHeight;
            this.text=`<°)${text})<`;
            this.speed=-speed;
        }
    }
    updatePosition(){
        this.posX = this.posX+this.speed;
        if(this.posX>canvas.width && this.direction=="right"){
            this.posX=0;
        }
        else if(this.posX < -this.fontSize * this.text.length && this.direction=="left"){
            this.posX = canvas.width;
        }   
    }
    draw(){
        ctx.font = `${this.fontSize}px monospace`
        ctx.fillStyle ="white"
        if (this.direction=="left"){
            ctx.textBaseline = "bottom";
            ctx.textAlign = "left";
        }
        else if(this.direction=="right"){
            ctx.textBaseline = "bottom";
            ctx.textAlign = "right";
        }
        ctx.fillText(this.text, this.posX, this.posY);
    }
    isClicked(){

    }
}

fihArray=[]
const linkMap = new Map();
linkMap.set("Rivulets","embri.net")
linkMap.set("Cascade","embri.net")
linkMap.set("Memory","embri.net")
linkMap.set("Embri","embri.net")
linkMap.set("Emergent","embri.net")
linkMap.set("Chrysalis","embri.net")
linkMap.set("Fleeting","embri.net")
linkMap.set("Sunvault","embri.net")
linkMap.set("Traces","embri.net")
linkMap.set("Wings","embri.net")

fihSpawnTick=0;
fihSpawnInterval=0;
function spawnFish(){
    fihArray = fihArray.filter(f => {
        if (f.direction === "left") return f.posX > -f.fontSize * f.text.length;
        if (f.direction === "right") return f.posX < canvas.width;
        return true;
    });
       
    if(fihSpawnTick>fihSpawnInterval){
        fihSpawnTick=0;
        fihSpawnInterval=Math.floor(Math.random()*140)+40; 
        if (fihArray.length<5){
            let fontSize=Math.random()*5+20;
            const textOptions = Array.from(linkMap.keys()); 
            randomText = textOptions[Math.floor(Math.random() * textOptions.length)];
            console.log("all options:", textOptions);
            console.log("Picked:", randomText);
            //the spawn height has to be normalized to the center of a pixel
            //textfill is bottom left and pixel starts from right going fish, good because i want the ripple to start from the tail
            //now the qustion is how do i get the height from the mid line of the font

            raw_spawn= Math.random()* (window.innerHeight ) //raw pixel height, need to find nearest pixel that is multiple of pheight
            spawnHeight = Math.round(raw_spawn / pheight) * pheight + (0.5*pheight) + (0.5*fontSize) -pheight
                    //fin the nearest pixel edge
            console.log(spawnHeight);
            direction ="left"// Math.random() < 0.5 ? "left": "right"; //put this back
            speed=Math.random()*3+2.5;
            const fih =  new Fih(spawnHeight, direction, randomText , speed, fontSize);
            fihArray.push(fih);
        }else if(fihArray>=5){
            fihArray.shift();
        }
    }
    for(let i=0; i<fihArray.length; i++){
        fihArray[i].updatePosition();
        fihArray[i].draw();
    }
 
    
    fihSpawnTick++;
    // requestAnimationFrame(spawnFish);
}

//darkens pixels where a Fih hits
//creates forces
function FihRipple(){
    for (let i = 0; i < fihArray.length; i++){
        pixelatedX = Math.floor(fihArray[i].posX / pwidth);
        pixelatedY = Math.floor(fihArray[i].posY / pheight);

        if (pixelatedX >= 0 && pixelatedX < cols && pixelatedY >= 0 && pixelatedY < rows){
            brightnessArray[pixelatedX][pixelatedY] = 255 //12 characters long for max brightness
            forceArray[pixelatedX][pixelatedY] = fihArray[i].direction === "left" ? {x: -1, y: 0} : {x: 1, y: 0};       
        }
    }


}

function pixelateImage(originalImage, pwidth, pheight, destx,desty, drawWidth,drawHeight) {
const offscreen = document.createElement("canvas"); 
const context = offscreen.getContext("2d");


offscreen.width = drawWidth;
offscreen.height = drawHeight;
context.drawImage(originalImage, 0, 0, drawWidth, drawHeight);

const originalImageData = context.getImageData(0, 0, drawWidth, drawHeight).data;

    for (let y = 0; y < drawHeight; y += pheight) {
    for (let x = 0; x < drawWidth; x += pwidth) {
        const pixelIndexPosition = (x + y * drawWidth) * 4;
        context.fillStyle = `rgba(
        ${originalImageData[pixelIndexPosition]},
        ${originalImageData[pixelIndexPosition + 1]},
        ${originalImageData[pixelIndexPosition + 2]},
        ${originalImageData[pixelIndexPosition + 3]}
        )`;
        context.fillRect(x, y, pwidth, pheight);
    }
    }


ctx.drawImage(offscreen, destx, desty, drawWidth, drawHeight);
return offscreen;
}

const menuBtn = document.getElementById('menu-button');
const sheet = document.getElementById('controls-container');
const textContent=document.getElementById('text-content')
menuBtn.addEventListener('click', () => {
    sheet.classList.toggle('open');
    textContent.classList.toggle('open');


});