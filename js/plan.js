$(function() {
	// 获取游戏开始按钮
	var begin = $('.begin');

	// 获取主界面元素
	var start = $('.start');
	var game = $('.game');
	// 获取游戏界面的宽度值
	//获取 鼠标悬浮层
	var layer = $('.layer');
	var gameWidth = layer.width();
	var gameHeight = layer.height();

	//获取游戏背景
	var bgs = $('.bg');

	//获取我方飞机
	var plan = $('.myplan');
	var myplanWidth = plan.width();
	var myplanHeight = plan.height();

	// 我方飞机移动的最大left
	var maxX = gameWidth - myplanWidth;
	var maxY = gameHeight - myplanHeight;
	
	// 鼠标坐标
	var x, y;


	// 所有的计时器序号  
	var movebgTimer = null;
	var bulletTimer = null;
	var moveBulletTimer = null;
	var enemyplane = null;
	var moveEnemyPlaneTimer = null;

	// 开始游戏
	begin.click(function() {
		// 
		start.css('display', 'none');
		game.css('display', 'block');
		// 移动背景
		movebg();
		// 创建子弹实例
		createEveryBullet();
		// 点击开始游戏 移动每一颗子弹
		moveEveryBullet();

		// 创建敌机实例
		createEveryEnemyPlane();
		moveEveryEnemyPlane();

		// 重新调用鼠标移动事件
		movemou();
	});

	// 鼠标移动 方法
	function movemou(){
		// layer.on("touchmove",function(e) {
		// 	var touch = e.touches[0]
		// 	x = Number(touch.pageX);
		// 	y = Number(touch.pageY);
		// 	console.log(x,y)
		// 	// 
		// 	moveplan(x - myplanWidth / 2, y - myplanHeight / 2);

		// })

		layer.mousemove(function(e) {
			x = e.offsetX;
			y = e.offsetY;
			// 
			moveplan(x - myplanWidth / 2, y - myplanHeight / 2);

		})
	}

	// 飞机移动
	function moveplan(x, y) {
		// 
		x = x < 0 ? 0 : x > maxX ? maxX : x;
		y = y < 0 ? 0 : y > maxY ? maxY : y;
		plan.css({
			left: x + 'px',
			top: y + 'px'
		})
	}
	// 背景移动
	function movebg() {
		movebgTimer = setInterval(function() {
			for (var i = 0; i < bgs.length; i++) {
				//获取偏移
				// 距离浏览器视口偏移 offset().top(left/right/bottom)
				// 距离父级元素的偏移 position().top(left/right/bottom)
				// 获取交替背景距离游戏窗口的顶部 top值
				var currentTop = $(bgs[i]).position().top;
				// 背景图移动
				currentTop += 2;

				// 如果当前背景超出游戏主界面的高度 即game.height() 让top重新 = -game.height()
				if (currentTop >= $(bgs[i]).height() - 10) {
					currentTop = -$(bgs[i]).height();
				}

				$(bgs[i]).css('top', currentTop + 'px');
			}
		}, 10)
	}

	//子弹类 构造函数 初始化 
	function Bullet(){
		this.bulletWidth = 6;
		this.bulletHeight = 14;

		// 子弹移动坐标
		this.bulletX=0;
		this.bulletY=0;

		// 子弹DOM元素
		this.currentBullet = null;

		//子弹图片路径
		this.bulletSrc = './images/bullet.png';
	}
	//创建子弹的原型方法
	Bullet.prototype.createBullet = function(){
		// 创建子弹图片DOM元素
		this.currentBullet = document.createElement('img');

		// 链接子弹图片资源
		this.currentBullet.src = this.bulletSrc;
		// 子弹宽高，子弹偏移量
		this.currentBullet.style.position = 'absolute';
		this.currentBullet.style.zIndex = 2;
		this.currentBullet.style.width = this.bulletWidth;
		this.currentBullet.style.height = this.bulletHeight;

		//获取我方飞机坐标
		var myplanX = plan.position().left;
		var myplanY = plan.position().top;

		// 生成子弹移动坐标   子弹还未到达坐标
		this.bulletX = myplanX+myplanWidth/2;
		this.bulletY = myplanY-this.bulletHeight;

		//让子弹到达坐标
		this.currentBullet.style.left = this.bulletX +'px';
		this.currentBullet.style.top = this.bulletY+'px';

		// 将生成的子弹放置到页面上
		game[0].appendChild(this.currentBullet);
	}

	// 移动子弹的原型方法
	Bullet.prototype.moveBullet = function(bullets,index){
		// 让子弹每次移动两个像素
		this.bulletY -= 2;
		// 如果子弹超出屏幕最顶部 移除子弹（包括节点，和数组）
		if(this.bulletY <=0){
			this.currentBullet.remove();
			bullets.splice(index,1);
		}else{
			//移动子弹
			this.currentBullet.style.top = this.bulletY +'px';
		}
	}

	//判断子弹是否碰撞敌机
	Bullet.prototype.shootEenmyPlane = function(bullets,enemyPlanes,index){
		for(var i =0 ;i<enemyPlanes.length;i++){
			if(this.bulletX>=enemyPlanes[i].enemyPlaneX-this.bulletWidth&&this.bulletX<=enemyPlanes[i].enemyPlaneX+enemyPlanes[i].enemyPlaneWidth&&this.bulletY>=enemyPlanes[i].enemyPlaneY-this.bulletHeight&&this.bulletY<=enemyPlanes[i].enemyPlaneY+enemyPlanes[i].enemyPlaneHeight){
				// 击中敌机 减血量
				enemyPlanes[i].enemyPlaneBlood -=1;
				//敌机血量为0
				if(enemyPlanes[i].enemyPlaneBlood <= 0){
					//创建一个敌机爆炸图 DOM节点
					var boomEnemyPlane = document.createElement('img');
					
					boomEnemyPlane.src = enemyPlanes[i].enemyPlaneDieSrc;

					boomEnemyPlane.style.width =  enemyPlanes[i].width +'px';
					boomEnemyPlane.style.height =  enemyPlanes[i].height +'px';

					boomEnemyPlane.style.position = 'absolute';
					boomEnemyPlane.style.zIndex = 3;

					// 当前敌机爆炸图出现的 x,y
					boomEnemyPlane.style.left= enemyPlanes[i].enemyPlaneX + 'px';
					boomEnemyPlane.style.top= enemyPlanes[i].enemyPlaneY + 'px';

					// 从页面上移除敌机DOM
					enemyPlanes[i].currentEnemyPlane.remove();
					//从数组里面移除敌机
					enemyPlanes.splice(i,1);

					game[0].appendChild(boomEnemyPlane);
					(function(element){
						setTimeout(function(){
							boomEnemyPlane.remove();
						},400)
					})(boomEnemyPlane)
				}


				//从屏幕上移除子弹
				this.currentBullet.remove();
				//从数组中移除子弹
				bullets.splice(index,1);
			}
		}
	}


	// 数组 用来存储 new出来的子弹对象
	var bullets = [];



	// 创建子弹实例方法 new子弹类（构造函数）用于创建子弹的
	function createEveryBullet(){
		bulletTimer = setInterval(function(){
			// 调用子弹类  构造子弹实例  ==》每一个子弹实例代表一颗子弹
			var bullet = new Bullet();
			// 
			bullet.createBullet();
			bullets.push(bullet);
			// 
		},200)
	}

	//移动每一个子弹
	function moveEveryBullet(){
		moveBulletTimer = setInterval(function(){
			//遍历每一颗子弹
			for(var i=0; i<bullets.length ;i++){

				//bullets[0] 代表第一个 bullet 
				bullets[i].moveBullet(bullets,i);
				// 


				if (bullets[i] == undefined) {
					return;
				}

				//存在敌机,判断子弹是否碰撞敌机
				bullets[i].shootEenmyPlane(bullets,enemyPlanes,i);
			}
		},5)
	}








	// 存储敌机数据  数组   (对象数组)
	var enemy = [{
		img:'./images/enemy1.png',
		dieImg:'./images/enemy1b.gif',
		width:34,
		height:24,
		blood:1
	},{
		img:'./images/enemy2.png',
		dieImg:'./images/enemy2b.gif',
		width:46,
		height:60,
		blood:5
	},{
		img:'./images/enemy3.png',
		dieImg:'./images/enemy3b.gif',
		width:110,
		height:164,
		blood:10
	}];




	// 构建一个敌机类 (构造函数)
	function EnemyPlane(){
		// 根据敌机数据 创建相对应的敌机类型 小中大
		var emy = null;  //emy 用来存储对象
		// Math.random() //获取随机数 [0,1)

		//0 - 0.5 生成小型机
		//0.5 - 0.9 生成中型机
		//0.9 - 1.0 生成大型敌机

		var random = Math.random();
		// 
		if(random <= 0.5){
			emy=enemy[0];//小型敌机 
			
		}else if(random <=0.9){
			emy=enemy[1];//中型敌机

		}else {
			emy=enemy[2];//大型敌机
		}

		// 敌机的宽度 和 高度
		this.enemyPlaneWidth = emy.width;
		this.enemyPlaneHeight = emy.height;


		// 随机生成敌机的 X,Y坐标
		this.enemyPlaneX = Math.random()*(gameWidth - this.enemyPlaneWidth);
		this.enemyPlaneY = -this.enemyPlaneHeight;


		// 敌机图片路径
		this.enemyPlaneSrc = emy.img;
		// 敌机爆炸图片路径
		this.enemyPlaneDieSrc = emy.dieImg;
		//敌机血量
		this.enemyPlaneBlood = emy.blood;

		// 敌机DOM元素 
		this.currentEnemyPlane = null;
	}

	// 创建敌机  原型方法
	EnemyPlane.prototype.createEnemyPlane = function(){
		// 创建一个敌机DOM元素
		this.currentEnemyPlane = document.createElement('img');
		

		// 链接到敌机图片
		this.currentEnemyPlane.src = this.enemyPlaneSrc;

		// 敌机DOM元素 宽高
		this.currentEnemyPlane.style.width = this.enemyPlaneWidth +'px';
		this.currentEnemyPlane.style.height = this.enemyPlaneHeight +'px';

		// 敌机偏移
		this.currentEnemyPlane.style.position='absolute';
		this.currentEnemyPlane.style.zIndex = 3;

		this.currentEnemyPlane.style.left = this.enemyPlaneX +'px';
		this.currentEnemyPlane.style.top = this.enemyPlaneY +'px';

		game[0].appendChild(this.currentEnemyPlane);
	}

	// 移动敌机 
	EnemyPlane.prototype.moveEnemyPlane = function(enemyPlanes,index){
		this.enemyPlaneY+=2;

		
		//当前敌机 超出屏幕高度
		if (this.enemyPlaneY >= gameHeight) {
			//移除敌机dom
			this.currentEnemyPlane.remove();
			//从数组里面移除敌机
			enemyPlanes.splice(index,1);

		}else{
			this.currentEnemyPlane.style.top = this.enemyPlaneY + 'px';
		}




	}

	// 保存敌机实例的数组
	var enemyPlanes = [];

	// 创建每一架敌机
	function createEveryEnemyPlane(){
		enemyplane = setInterval(function(){
			//实例化敌机对象
			var enemyPlane = new EnemyPlane()

			// 创建敌机实例
			enemyPlane.createEnemyPlane();

			// 保存敌机实例
			enemyPlanes.push(enemyPlane)

		},1500)
	}

	// 移动每一架敌机
	function moveEveryEnemyPlane(){
		moveEnemyPlaneTimer = setInterval(function(){

			// 每次移动飞机 都要重新获取我方飞机的 X和y
			var myplanx = plan.position().left;
			var myplanY = plan.position().top;
			// 遍历每一架敌机
			for(var i = 0;i<enemyPlanes.length;i++){
				enemyPlanes[i].moveEnemyPlane(enemyPlanes,i);

				// 判断敌方飞机是否碰撞我方飞机
				if(myplanx>=enemyPlanes[i].enemyPlaneX - myplanWidth&&myplanx<=enemyPlanes[i].enemyPlaneX+enemyPlanes[i].enemyPlaneWidth&&myplanY>=enemyPlanes[i].enemyPlaneY-myplanHeight&&myplanY<=enemyPlanes[i].enemyPlaneY+enemyPlanes[i].enemyPlaneHeight){
					$('.myplan>img').attr('src','./images/planeb.gif');

					$('.game>img').remove();
					bullets = [];
					enemyPlanes = [];

/*movebgTimer
bulletTimer
moveBulletTimer
enemyplane
moveEnemyPlaneTimer*/
					//清空所有的定时器
					clearInterval(movebgTimer)//背景计时器
					clearInterval(bulletTimer)//生成子弹定时器
					clearInterval(moveBulletTimer)//移动子弹计时器
					clearInterval(enemyplane)//生成敌方飞机计时器
					clearInterval(moveEnemyPlaneTimer)//移动地方飞机定时器


					// 移除layer鼠标事件
					layer.unbind();

					//敌方飞机碰撞到我方飞机两秒后，初始化游戏 重新开始
					setTimeout(function(){
						$('.myplan>img').attr('src','./images/plane.gif');

						plan.css({
							left: '50%',
							top: 'calc(680px - 80px)'
						});

						start.css('display', 'block');
						game.css('display', 'none');



					},2000)


				}

			}
		},20)
	}



})