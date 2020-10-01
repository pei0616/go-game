var cvs=document.getElementById('cas');
var ctx=cvs.getContext('2d');
var reset = document.getElementById('reset');
var title = document.getElementById('title');

//取得可見視窗的寬度(不包含工具列、卷軸)
function getViewWidth() {
    var w = {};
    if(window.innerWidth) {
        w.width = window.innerWidth;  
    }
    else if(document.documentElement.clientWidth) {
        w.width = document.documentElement.clientWidth;
    }
    else if(document.body.clientWidth) {
        w.width = document.body.clientWidth;
    }
    return w;
}

//改變畫布大小
function resizeCanvas(){
    //取得可見視窗寬度
    var view = getViewWidth();
    console.log(view.width);
    //調整棋盤繪製
    if(view.width < 768){
        cvs.setAttribute('width',310);
        cvs.setAttribute('height',310);
        for(var i =0 ; i<15;i++){
            ctx.style="black";
            //垂直，每格間距為20
            ctx.moveTo(15+i*20,15);
            ctx.lineTo(15+i*20,295);
            ctx.stroke();
            //橫軸，每格間距為20
            ctx.moveTo(15,15+i*20);
            ctx.lineTo(295,15+i*20);
            ctx.stroke();    
        }   
    }
    if(view.width >= 768){
        cvs.setAttribute('width',450);
        cvs.setAttribute('height',450);
        for(var i =0 ; i<15;i++){
            ctx.style="black";
            //垂直，每格間距為30
            ctx.moveTo(15+i*30,15);
            ctx.lineTo(15+i*30,435);
            ctx.stroke();
            //橫軸，每格間距為30
            ctx.moveTo(15,15+i*30);
            ctx.lineTo(435,15+i*30);
            ctx.stroke();
        }
    }
}
//重新載入畫布大小
window.addEventListener('resize',resizeCanvas());
//禁止使用者選取DOM元素
document.onselectstart=function(){
    return false;
}

//贏法數組:橫向、垂直、斜向
//三維陣列:x、y座標、哪種贏法(count)
var wins=[];
    for(var i=0;i<15;i++){
        wins[i]=[];
        for(var j=0;j<15;j++){
            wins[i][j]=[];
        }
    }


//count變數從第0種開始
var count =0;
//橫
/*以下這五顆棋子在地0種贏法時會表示為true
wins[10][0][0]=true
wins[11][0][0]=true
wins[12][0][0]=true
wins[13][0][0]=true
wins[14][0][0]=true
*/
for(var x=0;x<11;x++){
    for(var y=0;y<15;y++){
        for(var z=0;z<5;z++){
            wins[x+z][y][count]=true;//true代表是一種贏法，用count記錄下來
        }
        count++;
    }
}

//直
for(var x=0;x<15;x++){
    for(var y=0;y<11;y++){
        for(var z=0;z<5;z++){
            wins[x][y+z][count]=true;//true代表是一種贏法，用count記錄下來
        }
        count++;
    }
}
//正斜線
for(var x=0;x<11;x++){
    for(var y=4;y<15;y++){
        for(var z=0;z<5;z++){
            wins[x+z][y-z][count]=true
        }
        count++;
    }
}
//反斜線
for(var x=0;x<11;x++){
    for(var y=0;y<11;y++){
        for(var z=0;z<5;z++){
            wins[x+z][y+z][count]=true
        }
        count++;
    }
}

console.log("總共有:" + count+" 種贏法");

//此座標是否已經有棋子
var isChess =[];
    for(var i=0;i<15;i++){
        isChess[i]=[];
        for(var j=0;j<15;j++){
            isChess[i][j]=0;//預設為0代表沒有 //1表示有
        }
    }

//玩家落下的棋子
var manWin=[];
//電腦落下的棋子
var computerWin=[];

for(var i=0;i<count;i++){
    //玩家跟電腦在I贏法情況下分別落下的旗子狀況，一開始皆為0
    manWin[i]=0;
    computerWin[i]=0;
}

//遊戲情況
var over =false;
//玩家下棋
var me=true;

//重新挑戰
reset.onclick=function(){
    window.location.reload();
}

//下棋
//棋盤裡的每個小格子都是30*30，而這裡的offset是以(15,15)為對應，如果點擊(45,15)，則(45-15)/30=1，i=1
cvs.onclick=function(e){
   if(over){
    return;//結束遊戲
   }
   //Math.floor 取小於這個數的最大整數
   /*var i = Math.floor(e.offsetX/30);
   var j = Math.floor(e.offsetY/30);*/
    var i = (e.offsetX/30)|0;
    var j = (e.offsetY/30)|0;
    var x =i;
    var y =j;
    console.log(e.offsetX);//得知x座標
    console.log(e.offsetY);//得知y座標
    console.log(i);
    
    //檢查此座標是否有棋子，0代表沒有棋子;1代表玩家的棋子;2代表電腦的棋子
    if(isChess[x][y]==0){
        oneStep(x,y,me); //玩家棋子的顏色-黑
        isChess[x][y]=1;
        //觀看在count=i時的玩家是否有落下自己的旗子
        for(var i =0;i<count;i++){
            
            if(wins[x][y][i]){
                //記錄此種方法玩家落下的旗子數
                manWin[i]++;
                computerWin[i]=6;//電腦不可能贏了
                if(manWin[i]==5){
                    word="你贏了!!!";
                    getResult(word);
                    confetti.classList.remove('display');
                    over=true;
                }
            }
        }
        
        if(!over){
            me=!me;
            computerPlayerAction();//電腦去計算權值之後決定下棋的位置
        }
        
    }
    
}
//人和電腦贏的子佔贏法的情況
//count是棋子（x，y）在的贏法，我們之後就可以判斷wins是否為true來知道（x，y）是否在贏法count上了
//下棋
function oneStep(x,y,me){
    //繪製漸層棋子
    //棋子的半徑是13，Math.PI是180度
    //ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    //圓形漸層context.createRadialGradient(x0,y0,r0,x1,y1,r1)
    var grd = ctx.createRadialGradient(15+x*30, 15+y*30, 13, 15+x*30, 15+y*30, 0);
    if(me){
        grd.addColorStop(0,'#0a0a0a');//深一些
        grd.addColorStop(1, '#636766');//淺一些
        console.log("下黑棋");
    }
    else {
        grd.addColorStop(0, '#d1d1d1');
        grd.addColorStop(1, '#f9f9f9');
        console.log("下白棋");
    }
    ctx.beginPath();
    ctx.arc(15+x*30,15+y*30,13,0,2*Math.PI);
    ctx.closePath();
    ctx.fillStyle = grd;
    ctx.fill();
    
}


//manOfValue和computerOfValue權值計分
//電腦遍歷棋盤查詢每個空缺在玩家和電腦的贏法上的可能，即計算myWin和computerWin，並將其不同的值付給manOfValue和computerOfValue
function computerPlayerAction(){
    var max=0;//用來保存最高分的分數
    //用來保存最高分的x、y座標
    var u=0;//電腦x座標
    var v=0;//電腦y座標
    var myScore=[];
    var computerScore=[];

    //計分
    for(var x=0;x<15;x++){
        myScore[x]=[];
        computerScore[x]=[];
        for(var y=0;y<15;y++){
            myScore[x][y]=0;
            computerScore[x][y]=0;
        }
    }

    for(var x=0;x<15;x++){
        for(var y=0;y<15;y++){
            if(isChess[x][y] == 0){
                for(var i=0;i<count;i++){
                    if(wins[x][y][i]){
                        if(manWin[i]==1){
                            myScore[x][y]+=200;
                        }
                        else if(manWin[i]==2){
                            myScore[x][y]+=400;
                        }
                        else if(manWin[i]==3){
                            myScore[x][y]+=4400;
                        }
                        else if(manWin[i]==4){
                            myScore[x][y]+=30000;
                        }

                        
                        if(computerWin[i]==1){
                            computerScore[x][y]+=220;
                        }
                        else if(computerWin[i]==2){
                            computerScore[x][y]+=420;
                        }
                        else if(computerWin[i]==3){
                            computerScore[x][y]+=4200;
                        }
                        else if(computerWin[i]==4){
                            computerScore[x][y]+=20000;
                        }
                    }
                }
                if(myScore[x][y]>max){
                    max=myScore[x][y];
                    u=x;
                    v=y;
                }
                

                if(computerScore[x][y]>max){
                    max=computerScore[x][y];
                    u=x;
                    v=y;
                }
                
            }
        }
    }
    //電腦下棋
    oneStep(u,v,false);
    isChess[u][v]=2;
    for(var i=0;i<count;i++){
        if(wins[u][v][i]){
            computerWin[i]++;
            manWin[i]=6;//玩家不可能贏了
            if(computerWin[i]==5){
                var word='這局是電腦贏了!!!請繼續加油';
                getResult(word);
                over=true;
            }
        }  
    } 
    
    if(!over){
        //輪到玩家下棋
        me=!me;
    }
}

//勝負揭曉時加入文字
function getResult(word){
    var result = document.createElement('h3');
    result.className='result';
    var text = document.createTextNode(word);
    result.appendChild(text);
    cvs.before(result); 
}


