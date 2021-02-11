import { fromEvent, Observable, Subject} from 'rxjs'; 

class Game{
    private gCanvas;
    private gContext;
    private body;
    public  static player1Score: number = 0;
    public  static player2Score: number = 0;
    private player1: Paddle1;
    private player2: Paddle2;
    private ball: Ball;

    public  static keysPressed: boolean[] = [];
    constructor(){
        this.gCanvas = document.getElementById("game-canvas");
        this.body = document.getElementById("chika");
        this.gContext = this.gCanvas.getContext("2d");
        this.gContext.font = "25px HELVETICA";

        //RXJS IMMUTABLE CONSTANT
        const startObservable = <T>(e:any)=>fromEvent<KeyboardEvent>(document,e);

        startObservable("keydown").subscribe( (ele) => {Game.keysPressed[ele.which] = true})

        startObservable("keyup").subscribe( (ele) => {Game.keysPressed[ele.which] = false})

        startObservable("keypress").subscribe( (ele) => {Game.keysPressed[ele.which] = true})
        
        var paddleWidth:number = 10, paddleHeight:number = 60, ballSize:number = 15, wallOffset:number = 20;
        
        this.player1 = new Paddle1(paddleWidth,paddleHeight,wallOffset,this.gCanvas.height / 2 - paddleHeight / 2); 
        this.player2 = new Paddle2(paddleWidth,paddleHeight,this.gCanvas.width - (wallOffset + paddleWidth) ,this.gCanvas.height / 2 - paddleHeight / 2);
        this.ball = new Ball(ballSize,ballSize,this.gCanvas.width / 2 - ballSize / 2, this.gCanvas.height / 2 - ballSize / 2);    
        
    }

    Loop(){
        game.update();
        game.draw();
        requestAnimationFrame(game.Loop);
    }

    drawDetails(){
        
        //outline for canvas
        this.gContext.strokeStyle = "red";
        this.gContext.lineWidth = 5;
        this.gContext.strokeRect(10,10,this.gCanvas.width - 20 ,this.gCanvas.height - 20);
        
        //lines for canvas
        for (var i = 0; i + 30 < this.gCanvas.height; i += 30) {
            this.gContext.fillStyle = "red";
            this.gContext.fillRect(this.gCanvas.width / 2 - 10, i + 10, 15, 20);
        }
        
        //lines for scores
        this.gContext.fillText(Game.player1Score, 280, 50);
        this.gContext.fillText(Game.player2Score, 390, 50);
        
    }
    update(){
        this.player1.update(this.gCanvas);
        this.player2.update(this.ball,this.gCanvas);
        this.ball.update(this.player1,this.player2,this.gCanvas);
    }
    draw(){
        this.gContext.fillStyle = "green";
        this.gContext.fillRect(0,0,this.gCanvas.width,this.gCanvas.height);
              
        this.drawDetails();
        this.player1.draw(this.gContext);
        this.player2.draw(this.gContext);
        this.ball.draw(this.gContext);
    }

}

enum KeyBindings{
    UP = 79,
    DOWN = 75,
    PAUSE = 80,
    RESUME = 82,
    W = 87,
    S    = 83
}

class Entity{
    width:number;
    height:number;
    x:number;
    y:number;
    xVal:number = 0;
    yVal:number = 0;
    constructor(w:number,h:number,x:number,y:number){       
        this.width = w;
        this.height = h;
        this.x = x;
        this.y = y;
    }
    draw(context){
        context.fillStyle = "#fff";
        context.fillRect(this.x,this.y,this.width,this.height);
    }
}

class Paddle1 extends Entity{
    
    private speed:number = 10;
    
    constructor(w:number,h:number,x:number,y:number){
        super(w,h,x,y);
    }
    
    update(canvas){
     if( Game.keysPressed[KeyBindings.W] ){
        this.yVal = -1;
        if(this.y <= 20){
            //RXJS OBSERVABLE
            new Observable ( subscriber => {this.yVal = 0}).subscribe();
        }
     }else if(Game.keysPressed[KeyBindings.S]){
         this.yVal = 1;
         if(this.y + this.height >= canvas.height - 20){
             new Observable ( subscriber => { this.yVal = 0;}).subscribe()
         }
     }
     else{
         this.yVal = 0;
     }
     
     this.y += this.yVal * this.speed;
     
    }
}

class Paddle2 extends Entity{
    
    private speed:number = 10;
    
    constructor(w:number,h:number,x:number,y:number){
        super(w,h,x,y);        
    }
    
    update(ball:Ball, canvas){ 
       
       //chase ball
       if(Game.keysPressed[KeyBindings.UP]){
            this.yVal = -1; 
            
            if(this.y <= 20){
                //RXJS OBSERVABLE
                new Observable( subscriber => {this.yVal = 0;} ).subscribe()      
            }
       }
       else if(Game.keysPressed[KeyBindings.DOWN]){
           this.yVal = 1;
           
           if(this.y + this.height >= canvas.height - 20){
               new Observable( subscriber => {this.yVal = 0;} ).subscribe()      
           }
       }
       else{
           this.yVal = 0;
       }
       
        this.y += this.yVal * this.speed;

    }
    
}

class Ball extends Entity{
    
    private speed:number = 5;
    
    constructor(w:number,h:number,x:number,y:number){
        super(w,h,x,y);
        var randomDirection = Math.floor(Math.random() * 2) + 1; 
        if(randomDirection % 2){
            //RXJS OBSERVABLE
            new Observable( subscriber => {this.xVal = 1;} ).subscribe()
        }else{
            new Observable( subscriber => {this.xVal = -1;} ).subscribe()
        }
        this.yVal = 1;
    }
    
    update(player:Paddle1,computer:Paddle2,canvas){
       
        //top canvas parameters
        if(Game.keysPressed[KeyBindings.PAUSE]) {

            //RXJS OBSERVABLE
            new Observable( subscriber => {this.speed = 0} ).subscribe()
         }else if(Game.keysPressed[KeyBindings.RESUME]){
            new Observable( subscriber => {this.speed = 5} ).subscribe()
        }

        if(this.y <= 10){
            new Observable( subscriber => {this.yVal = 1;} ).subscribe()
            
        }
        
        //bottom canvas parameters
        if(this.y + this.height >= canvas.height - 10){

            //RXJS SUBJECT
            const bottom = new Subject();
            bottom.subscribe(subscriber => {this.yVal = -1});
            bottom.next()
        }
        
        //left canvas parameters
        if(this.x <= 0){  
            const left = new Subject();
            left.subscribe(subscriber => {
                this.x = canvas.width / 2 - this.width / 2;
                Game.player2Score += 1;});
            left.next()
            
        }
        
        //check right canvas bounds
        if(this.x + this.width >= canvas.width){
            const right = new Subject();
            right.subscribe(subscriber => {
                this.x = canvas.width / 2 - this.width / 2;
                Game.player1Score += 1;
            });
            right.next()
        }
        
        
        //check player collision
        if(this.x <= player.x + player.width){

            //RXJS SUBJECT
            const pcollision = new Subject();
            pcollision.subscribe(subscriber => {
                if(this.y >= player.y && this.y + this.height <= player.y + player.height){
                    this.xVal = 1;
                }
            });
            pcollision.next()
            }
        
        
        //check computer collision
        if(this.x + this.width >= computer.x){

            //RXJS SUBJECT
            const ccollision = new Subject();
            ccollision.subscribe(subscriber => {
                if(this.y >= computer.y && this.y + this.height <= computer.y + computer.height){
                    this.xVal = -1;
                }
            });
            ccollision.next()
           
        }
       
        this.x += this.xVal * this.speed;
        this.y += this.yVal * this.speed;
    }
}

var game = new Game();
requestAnimationFrame(game.Loop);
