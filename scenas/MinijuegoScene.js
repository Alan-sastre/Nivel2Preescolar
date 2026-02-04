class MinijuegoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MinijuegoScene' });
        this.score = 0;
        this.totalQuestions = 0;
        this.maxQuestions = 10;
    }

    preload() {
        this.load.image('sensor', 'assets/SENSOR.png');
        this.load.image('cerebro', 'assets/cerebro.png');
        this.load.image('motor', 'assets/motor.png');
        this.load.image('pecho', 'assets/pecho.png');
        this.load.image('izquierda', 'assets/izquierda.png');
        this.load.image('derecha', 'assets/derecha.png');
        this.load.image('pizquierdo', 'assets/Pizquierdo.png');
        this.load.image('pderecho', 'assets/Pderecho.png');
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        this.createBackground(width, height);
        this.createTitle(width);

        this.scoreText = this.add.text(width - 30, 22, '0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#F1C40F'
        }).setOrigin(1, 0);

        this.progressText = this.add.text(25, 22, '1 / 10', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0, 0);

        this.createRobot(width / 2, height / 2 + 10);
        this.createQuestionPanel(width, height);
        this.startNewRound();
    }

    createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 1);
        bg.fillRect(0, 0, width, height);
        
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const star = this.add.circle(x, y, Math.random() * 2 + 0.5, 0xffffff, Math.random() * 0.3 + 0.1);
            
            this.tweens.add({
                targets: star,
                alpha: 0.05,
                duration: 800 + Math.random() * 800,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createTitle(width) {
        this.add.text(width / 2, 40, 'ENCUENTRA LAS PARTES', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '26px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setStroke('#3498DB', 3);
    }

    createRobot(x, y) {
        this.robotContainer = this.add.container(x, y);
        
        const shadow = this.add.ellipse(0, 135, 140, 22, 0x000000, 0.25);
        this.robotContainer.add(shadow);
        
        this.robotParts = {};
        
        this.robotParts.cabeza = this.createPart('cabeza', 0, -65, (container) => {
            const img = this.add.image(0, 0, 'pecho');
            img.setScale(0.32);
            container.add(img);
        });
        
        this.robotParts.brazo_derecho = this.createPart('brazo_derecho', -75, -40, (container) => {
            const img = this.add.image(0, 20, 'derecha');
            img.setScale(0.32);
            container.add(img);
        });
        
        this.robotParts.brazo_izquierdo = this.createPart('brazo_izquierdo', 75, -40, (container) => {
            const img = this.add.image(0, 20, 'izquierda');
            img.setScale(0.32);
            container.add(img);
        });
        
        this.robotParts.pierna_derecha = this.createPart('pierna_derecha', 22, 10, (container) => {
            const img = this.add.image(0, 28, 'pderecho');
            img.setScale(0.32);
            container.add(img);
        });
        
        this.robotParts.pierna_izquierda = this.createPart('pierna_izquierda', -22, 10, (container) => {
            const img = this.add.image(0, 28, 'pizquierdo');
            img.setScale(0.32);
            container.add(img);
        });
    }

    createPart(name, x, y, drawFunction) {
        const container = this.add.container(x, y);
        drawFunction(container);
        
        const hitArea = this.add.rectangle(0, 0, 50, 100, 0x000000, 0.01);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);
        
        hitArea.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.1, duration: 120 });
        });

        hitArea.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 120 });
        });

        hitArea.on('pointerdown', () => {
            this.checkAnswer(name);
        });

        this.robotContainer.add(container);
        return container;
    }

    createQuestionPanel(width, height) {
        const panelBg = this.add.rectangle(width / 2, 85, 450, 45, 0x252545, 0.95);
        panelBg.setStrokeStyle(2, 0x3498DB);
        
        this.questionText = this.add.text(width / 2, 85, '', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        this.feedbackContainer = this.add.container(width / 2, 140);
        this.feedbackContainer.setVisible(false);
        
        const feedbackBg = this.add.rectangle(0, 0, 280, 45, 0x34495E, 0.95);
        feedbackBg.setStrokeStyle(3, 0xffffff);
        this.feedbackContainer.add(feedbackBg);
        
        this.feedbackText = this.add.text(0, 0, '', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.feedbackContainer.add(this.feedbackText);
    }

    startNewRound() {
        this.totalQuestions++;
        this.progressText.setText(this.totalQuestions + ' / 10');

        if (this.totalQuestions > this.maxQuestions) {
            this.showGameComplete();
            return;
        }

        this.questions = [
            { part: 'cabeza', text: 'Toca la CABEZA', exito: 'Muy bien!' },
            { part: 'brazo_derecho', text: 'Toca el BRAZO DERECHO', exito: 'Excelente!' },
            { part: 'brazo_izquierdo', text: 'Toca el BRAZO IZQUIERDO', exito: 'Bien hecho!' },
            { part: 'pierna_derecha', text: 'Toca la PIERNA DERECHA', exito: 'Correcto!' },
            { part: 'pierna_izquierda', text: 'Toca la PIERNA IZQUIERDA', exito: 'Perfecto!' }
        ];

        const randomIndex = Math.floor(Math.random() * this.questions.length);
        this.currentQuestion = this.questions[randomIndex];
        this.questionText.setText(this.currentQuestion.text);
        this.feedbackContainer.setVisible(false);
    }

    checkAnswer(selectedPart) {
        if (selectedPart === this.currentQuestion.part) {
            this.score += 10;
            this.scoreText.setText(this.score);
            
            this.feedbackText.setText('✨ ¡' + this.currentQuestion.exito + '! ✨');
            this.feedbackText.setColor('#2ECC71');
            this.feedbackContainer.setVisible(true);
            this.feedbackContainer.setAlpha(0);
            this.feedbackContainer.setScale(0.5);
            
            this.tweens.add({
                targets: this.feedbackContainer,
                alpha: 1,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            const part = this.robotParts[selectedPart];
            this.tweens.add({
                targets: part,
                scale: 1.2,
                duration: 150,
                yoyo: true,
                repeat: 2
            });
            
            const flash = this.add.rectangle(
                this.sys.game.config.width / 2,
                this.sys.game.config.height / 2,
                this.sys.game.config.width,
                this.sys.game.config.height,
                0x2ECC71,
                0.1
            );
            this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 300,
                onComplete: () => flash.destroy()
            });
            
            this.createCelebration();
            this.time.delayedCall(1500, () => {
                this.tweens.add({
                    targets: this.feedbackContainer,
                    alpha: 0,
                    scale: 1.2,
                    duration: 200,
                    onComplete: () => {
                        this.feedbackContainer.setVisible(false);
                        this.feedbackContainer.setScale(1);
                    }
                });
                this.startNewRound();
            });
            
        } else {
            this.feedbackText.setText('💪 ¡Intenta de nuevo!');
            this.feedbackText.setColor('#E74C3C');
            this.feedbackContainer.setVisible(true);
            this.feedbackContainer.setAlpha(0);
            this.feedbackContainer.setScale(1.2);
            
            this.tweens.add({
                targets: this.feedbackContainer,
                alpha: 1,
                scale: 1,
                duration: 200
            });
            
            const part = this.robotParts[selectedPart];
            this.tweens.add({
                targets: part,
                x: part.x + 8,
                duration: 50,
                yoyo: true,
                repeat: 4
            });
            
            this.time.delayedCall(1200, () => {
                this.tweens.add({
                    targets: this.feedbackContainer,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        this.feedbackContainer.setVisible(false);
                    }
                });
            });
        }
    }

    createCelebration() {
        const colors = [0x3498DB, 0x2ECC71, 0xE74C3C, 0xF1C40F, 0x9B59B6];
        
        for (let i = 0; i < 20; i++) {
            const x = this.sys.game.config.width / 2 + (Math.random() - 0.5) * 200;
            const y = this.sys.game.config.height / 2 + (Math.random() - 0.5) * 150;
            
            const particle = this.add.circle(x, y, 6, colors[Math.floor(Math.random() * colors.length)]);
            
            this.tweens.add({
                targets: particle,
                y: y - 80 - Math.random() * 40,
                x: x + (Math.random() - 0.5) * 100,
                alpha: 0,
                scale: 0,
                duration: 600 + Math.random() * 300,
                onComplete: () => particle.destroy()
            });
        }
    }

    showGameComplete() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(100);
        
        const panel = this.add.rectangle(width / 2, height / 2, 400, 280, 0x2C3E50);
        panel.setStrokeStyle(4, 0xF1C40F);
        panel.setDepth(101);
        panel.setScale(0);
        
        const titleText = this.add.text(width / 2, height / 2 - 90, '¡FELICIDADES!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#F1C40F'
        }).setOrigin(0.5).setDepth(102);
        titleText.setScale(0);
        
        const star1 = this.add.text(width / 2 - 100, height / 2 - 90, '⭐', { fontSize: '30px' }).setOrigin(0.5).setDepth(102);
        const star2 = this.add.text(width / 2, height / 2 - 110, '🌟', { fontSize: '40px' }).setOrigin(0.5).setDepth(102);
        const star3 = this.add.text(width / 2 + 100, height / 2 - 90, '⭐', { fontSize: '30px' }).setOrigin(0.5).setDepth(102);
        star1.setScale(0);
        star2.setScale(0);
        star3.setScale(0);
        
        this.add.text(width / 2, height / 2 - 35,
            '¡Muy bien! ¡Eres un experto\nen las partes del robot!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(102);
        
        const scoreBg = this.add.rectangle(width / 2, height / 2 + 25, 180, 50, 0x27AE60);
        scoreBg.setDepth(102);
        scoreBg.setScale(0);
        
        const scoreText = this.add.text(width / 2, height / 2 + 25, '✨ ' + this.score + ' puntos ✨', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(103);
        scoreText.setScale(0);
        
        this.tweens.add({
            targets: panel,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: [star1, star3],
            scale: 1,
            duration: 400,
            delay: 300,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: star2,
            scale: 1,
            duration: 500,
            delay: 500,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: titleText,
            scale: 1,
            duration: 500,
            delay: 700,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: [scoreBg, scoreText],
            scale: 1,
            duration: 400,
            delay: 1000,
            ease: 'Back.easeOut'
        });
        
        this.time.delayedCall(1500, () => {
            this.createFinalCelebration(width, height);
        });
        
        this.time.delayedCall(3000, () => {
            const restartText = this.add.text(width / 2, height / 2 + 105, 'Toca para jugar de nuevo', {
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                color: '#BDC3C7'
            }).setOrigin(0.5).setDepth(102);
            
            const hitArea = this.add.rectangle(width / 2, height / 2, 400, 280, 0x000000, 0);
            hitArea.setDepth(101);
            hitArea.setInteractive({ useHandCursor: true });
            
            hitArea.on('pointerdown', () => {
                this.scene.restart();
            });
            
            this.tweens.add({
                targets: restartText,
                alpha: 0.5,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        });
    }
    
    createFinalCelebration(width, height) {
        const colors = [0xF1C40F, 0xE74C3C, 0x2ECC71, 0x3498DB, 0x9B59B6, 0xE67E22];
        
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-100, height / 2);
            const color = colors[Phaser.Math.Between(0, colors.length - 1)];
            const size = Phaser.Math.Between(8, 16);
            
            const confetti = this.add.circle(x, y, size, color);
            confetti.setDepth(104);
            
            this.tweens.add({
                targets: confetti,
                y: height + 50,
                x: x + Phaser.Math.Between(-100, 100),
                angle: Phaser.Math.Between(360, 720),
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 500),
                onComplete: () => confetti.destroy()
            });
        }
    }
}

