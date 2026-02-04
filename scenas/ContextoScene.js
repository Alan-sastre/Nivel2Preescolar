class ContextoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ContextoScene' });
        this.currentSlide = 0;
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

        this.slideContainer = this.add.container(width / 2, height / 2 - 30);

        this.slides = [
            {
                titulo: 'ESTRUCTURA',
                color: 0x3498DB,
                funciones: ['Soporta todas las partes', 'Protege componentes internos', 'Material resistente', 'Base de montaje'],
                image: 'pecho'
            },
            {
                titulo: 'SENSORES',
                color: 0x2ECC71,
                funciones: ['Detectan el entorno', 'Miden distancias', 'Identifican obstáculos', 'Envían datos'],
                image: 'sensor'
            },
            {
                titulo: 'MOTORES',
                color: 0xE67E22,
                funciones: ['Producen movimiento', 'Controlan velocidad', 'Precisión de giro', 'Locomoción'],
                image: 'motor'
            },
            {
                titulo: 'CEREBRO',
                color: 0x9B59B6,
                funciones: ['Procesa datos', 'Ejecuta programas', 'Toma decisiones', 'Almacena memoria'],
                image: 'cerebro'
            },
            {
                titulo: 'BRAZOS',
                color: 0xE74C3C,
                funciones: ['Agarrar objetos', 'Movimientos precisos', 'Trabajo industrial', 'Manipulación'],
                image: 'derecha'
            },
            {
                titulo: 'PIERNAS',
                color: 0x1ABC9C,
                funciones: ['Soporta peso', 'Permite caminar', 'Estabilidad', 'Equilibrio'],
                image: 'pderecho'
            }
        ];

        this.createNavigation(width, height);
        this.showSlide(0);
    }

    createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillStyle(0x1a1a2e, 1);
        bg.fillRect(0, 0, width, height);
        
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const star = this.add.circle(x, y, Math.random() * 2 + 1, 0xffffff, Math.random() * 0.4 + 0.1);
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 1000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createTitle(width) {
        this.add.text(width / 2, 35, 'PARTES DEL ROBOT', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setStroke('#3498DB', 4);
    }

    showSlide(index) {
        this.slideContainer.removeAll(true);
        
        const slide = this.slides[index];
        const color = slide.color;
        
        const container = this.add.container(0, 0);
        this.slideContainer.add(container);
        
        const image = this.add.image(-200, 0, slide.image);
        image.setScale(slide.image === 'cerebro' ? 0.6 : 0.75);
        container.add(image);
        
        const infoPanel = this.add.rectangle(180, 0, 320, 240, 0x252545, 0.95);
        infoPanel.setStrokeStyle(2, color);
        container.add(infoPanel);
        
        const titleText = this.add.text(180, -85, slide.titulo, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(titleText);
        
        const line = this.add.rectangle(180, -55, 200, 2, color);
        container.add(line);
        
        const startY = -30;
        slide.funciones.forEach((func, i) => {
            const dot = this.add.circle(50, startY + i * 35, 4, color);
            container.add(dot);
            
            const funcText = this.add.text(70, startY + i * 35, func, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#dddddd'
            }).setOrigin(0, 0.5);
            container.add(funcText);
        });
        
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 400
        });
        
        this.updateDots();
        this.updateButtons();
    }
    
    createNavigation(width, height) {
        const btnY = height - 55;
        
        this.prevBtn = this.createButton(80, btnY, '◀', 0x34495E);
        this.nextBtn = this.createButton(width - 80, btnY, '▶', 0x34495E);
        
        this.playBtn = this.createButton(width - 80, btnY, 'COMENZAR', 0x2ECC71);
        this.playBtn.setVisible(false);
        
        this.dotsContainer = this.add.container(width / 2, height - 85);
        
        this.dots = [];
        const dotSpacing = 28;
        const startX = -((this.slides.length - 1) * dotSpacing) / 2;
        
        this.slides.forEach((slide, i) => {
            const dotX = startX + i * dotSpacing;
            const dot = this.add.container(dotX, 0);
            
            const dotBg = this.add.circle(0, 0, 10, 0x1a1a2e);
            dotBg.setStrokeStyle(2, slide.color);
            dot.add(dotBg);
            
            const dotInner = this.add.circle(0, 0, 5, slide.color);
            dot.add(dotInner);
            
            this.dotsContainer.add(dot);
            this.dots.push({ bg: dotBg, inner: dotInner, color: slide.color });
        });
    }
    
    createButton(x, y, text, color) {
        const container = this.add.container(x, y);
        
        const shadow = this.add.rectangle(3, 3, 110, 42, 0x000000, 0.3);
        container.add(shadow);
        
        const bg = this.add.rectangle(0, 0, 110, 42, color);
        bg.setStrokeStyle(2, 0xffffff, 0.3);
        container.add(bg);
        
        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(label);
        
        const hit = this.add.rectangle(0, 0, 110, 42, 0x000000, 0);
        hit.setInteractive({ useHandCursor: true });
        container.add(hit);
        
        hit.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
        });
        
        hit.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });
        
        hit.on('pointerdown', () => {
            if (text === '◀' && this.currentSlide > 0) {
                this.currentSlide--;
                this.showSlide(this.currentSlide);
            } else if (text === '▶' && this.currentSlide < this.slides.length - 1) {
                this.currentSlide++;
                this.showSlide(this.currentSlide);
            } else if (text === 'COMENZAR') {
                this.scene.start('MinijuegoScene');
            }
        });
        
        return container;
    }
    
    updateDots() {
        this.dots.forEach((dot, i) => {
            if (i === this.currentSlide) {
                dot.inner.setFillStyle(0xffffff);
                this.tweens.add({ targets: dot.bg, scale: 1.2, duration: 200 });
            } else {
                dot.inner.setFillStyle(dot.color);
                this.tweens.add({ targets: dot.bg, scale: 1, duration: 200 });
            }
        });
    }
    
    updateButtons() {
        this.prevBtn.setVisible(this.currentSlide > 0);
        
        if (this.currentSlide === this.slides.length - 1) {
            this.nextBtn.setVisible(false);
            this.playBtn.setVisible(true);
        } else {
            this.nextBtn.setVisible(true);
            this.playBtn.setVisible(false);
        }
    }
}
