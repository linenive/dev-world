import * as PIXI from 'pixi.js';
import { HelloWorld } from './scenes/helloWorld';

const load = (app: PIXI.Application) => {
    return new Promise<void>((resolve) => {
        app.loader.add('assets/hello-world.png').load(() => {
            resolve();
        });
    });
};

class StatusWindow {
    public uiFrame: PIXI.Graphics;

    private bigFont = new PIXI.TextStyle({
        fontSize: 24,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    private smallFont = new PIXI.TextStyle({
        fontSize: 14,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    private timeText: PIXI.Text;
    private timeText2: PIXI.Text;

    public constructor(displayName: string, ) {
        this.uiFrame = new PIXI.Graphics();
        this.uiFrame.beginFill(0xd0d0d0);
        this.uiFrame.lineStyle(2, 0x000000);
        this.uiFrame.drawRect(0, 0, 200, 300);
        this.uiFrame.endFill();

        // Create a graphics object to define our mask
        let mask = new PIXI.Graphics();
        // Add the rectangular area to show
        mask.beginFill(0xffffff);
        mask.drawRect(0, 0, 200, 300);
        mask.endFill();

        const uiPanel = new PIXI.Container();
        uiPanel.mask = mask;
        uiPanel.addChild(mask);
        this.uiFrame.addChild(uiPanel);

        const panelBackground = new PIXI.Graphics();
        panelBackground.beginFill(0xdfa0a0);
        panelBackground.drawRect(0, 0, 400, 400);
        panelBackground.endFill();
        uiPanel.addChild(panelBackground);
        
        const basicText = new PIXI.Text('상태창', this.bigFont);
        uiPanel.addChild(basicText);

        const nameText = new PIXI.Text('이름: 잔잔', this.smallFont);
        nameText.y = 50;
        uiPanel.addChild(nameText);

        this.timeText = new PIXI.Text('', this.smallFont);
        nameText.y = 80;
        uiPanel.addChild(nameText);

        this.timeText2 = new PIXI.Text('', this.smallFont);
        nameText.y = 110;
        uiPanel.addChild(nameText);
    }

    setTexts(timeText: string, timeText2: string) {
        this.timeText.text = timeText;
        this.timeText2.text = timeText2;
    }
}

class Game {
    private elapsedTime: number;

    public constructor() {
        this.elapsedTime = this.loadData();
    }

    saveData() {
        localStorage.setItem("elapseTime", this.elapsedTime.toString());
    }
    
    loadData(): number {
        const elapseTime = localStorage.getItem("elapseTime");
        if(elapseTime === null) {
            return 0;
        }
        return Number(elapseTime);
    }

    passTime() {
        this.elapsedTime++;

        if(this.elapsedTime%7 == 0) {
            this.saveData();
        }
    }

    // 60 * 24 = 1440
    // 1440 * 30 = 43200
    // 43200 * 12 = 518400
    getTimeStamp(): string {
        return `${Math.floor(this.elapsedTime/43200)}년 ` 
        + `${Math.floor(this.elapsedTime%518400/43200)+1}월 ${Math.floor(this.elapsedTime%43200/1440)+1}일 `
        + `${Math.floor(this.elapsedTime%1440/60)}:${this.elapsedTime%60}`;
    }

    getRawTime(): number{
        return this.elapsedTime%1440;
    }
}

const main = async () => {
    const game = new Game();

    // Main app
    let app = new PIXI.Application();

    // Display application properly
    document.body.style.margin = '0';
    app.renderer.backgroundColor = 0x1099bb;
    app.renderer.view.style.position = 'absolute';
    app.renderer.view.style.display = 'block';

    // Load assets
    await load(app);
    document.body.appendChild(app.view);

    // Set scene
    var scene = new HelloWorld(app);
    app.stage.addChild(scene);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    let rabbitTexture = PIXI.Texture.from('assets/rabbit.png');
    // Create a 5x5 grid of bunnies
    for (let i = 0; i < 25; i++) {
        const bunny = new PIXI.Sprite(rabbitTexture);
        bunny.anchor.set(0.5);
        bunny.width = 30;
        bunny.height = 30;
        bunny.x = (i % 5) * 40;
        bunny.y = Math.floor(i / 5) * 40;
        container.addChild(bunny);
    }

    // Move container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    // Center bunny sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    const statusWindow = new StatusWindow('Status');

    let nBright = 0;
    let passedTime = 0;
    let tick = 10;
    app.ticker.add((delta) => {
        passedTime += delta;

        while(passedTime > tick) {
            passedTime -= tick;

            game.passTime();
            container.rotation -= 0.01 * delta;

            statusWindow.setTexts(
                `시간: ${game.getTimeStamp()}`,
                `${nBright} , ${nBright.toString(16)}`);
        }
            nBright = Math.floor(255 * Math.sin(game.getRawTime()/1440*Math.PI));
            app.renderer.backgroundColor = Number(`0x10${nBright.toString(16)}${nBright.toString(16)}`);
    });

    const uiContainer = new PIXI.Container();
    app.stage.addChild(uiContainer);

    uiContainer.addChild(statusWindow.uiFrame);
    uiContainer.pivot.x = uiContainer.width;
    
    // View size = windows
    app.renderer.resize(window.innerWidth, window.innerHeight);
    uiContainer.x = app.screen.width;

    window.addEventListener('resize', (e) => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        uiContainer.x = app.screen.width;
    });
};

main();
