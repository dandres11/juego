

window.onload = function() {


    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

    var puntaje = 0;
    var puntaje_texto;
    var turbo_texto;
    var turbo = 100;
    var x_mult = 1;
    var mundo_cargado = false;
    var mundo_ganar_x = 0;

    function preload () {

        game.load.image('jugador1', '../imagenes/jugadores/1/s1.png');
        game.load.image('piso1', '../imagenes/mundos/1/p1.png');
        game.load.image('estrella1', '../imagenes/objetos/1/estrella.png');
        game.load.image('bola1', '../imagenes/objetos/1/bola.png');
        game.load.image('obstaculo1', '../imagenes/objetos/1/obstaculo.png');
        game.load.image('fondo1', '../imagenes/fondos/1/fondo.jpg');
        game.load.image('vida', '../imagenes/jugadores/1/n1.png');
        console.log("Precarga de imagenes OK!");

    }

    function create () {

        game.add.sprite(0,0, 'fondo1');

        puntaje_texto = game.add.text(16, 16, 'puntaje: 0', { fontSize: '32px', fill: '#FFF' });
        puntaje_texto.fixedToCamera = true;
        turbo_texto = game.add.text(200, 16, 'turbo: 0', { fontSize: '32px', fill: '#FFF' });
        turbo_texto.fixedToCamera = true;

        vidas_texto = game.add.text(16, 60, 'Vidas: ', { fontSize: '32px', fill: '#FFF' })
        vidas_texto.fixedToCamera = true;

        vidas = [];
        vidas.push(game.add.sprite(150,60, 'vida'))
        vidas.push(game.add.sprite(190,60, 'vida'))
        vidas.push(game.add.sprite(230,60, 'vida'))

        for (var i = 0; i < vidas.length; i ++){
            vidas[i].fixedToCamera = true;
        }

        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.world.setBounds(0, 0, 2000, 2000);

        jugador1 = game.add.sprite(100,100, 'jugador1');
        //        jugador1.scale.setTo(0.5, 0.5);
        game.physics.arcade.enable(jugador1);
        jugador1.body.bounce.y = 0.2;
        jugador1.body.gravity.y = 500;
        jugador1.body.collideWorldBounds.y = true;
        jugador1.checkWorldBounds = true;
        jugador1.events.onOutOfBounds.add(game_over, this);

        game.camera.follow(jugador1);

        plataformas = game.add.group();
        plataformas.enableBody = true;

        obstaculos = game.add.group();
        obstaculos.enableBody = true;

        estrellas = game.add.group();
        estrellas.enableBody = true;
        bolas = game.add.group();
        bolas.enableBody = true;

        //Funcion de la librería que carga el CSV (Archivo Plano) generado en excel para pintar el mundo
        Papa.parse("../mundos/mundo1.csv", {
            download: true,
            complete: function(results) {
                //Se creó una función cargar_fundo, la cual recibe el archivo CSV ya convertido a formato JSON (La función está al final del archivo)
                cargar_mundo(results.data);
            }
        });

        //Cargar mundo aleatorio (Para otro tipo de juego, así lo hicimos al inicio)
        //        for (var i = 0; i < 2000; i += 50){
        //            var posision_y = Math.floor((Math.random() * 300) + 250);
        //            piso = plataformas.create(i,200, 'piso1');
        //            piso.scale.setTo(0.5,0.5);
        //            piso.body.immovable = true;  
        //
        //            if (i%3 == 0){
        //                obstaculo = obstaculos.create(i,180, 'obstaculo1');
        //                //                obstaculo.scale.setTo(0.5,0.5);
        //                obstaculo.body.immovable = true; 
        //            }
        //        }
        //          CARGAR ESTRELLAS RANDOM (Cuando queríamos que las estellas caigan de forma aleatoria)
        //
        //        game.time.events.repeat(Phaser.Timer.SECOND * 2, 10, crearElemento, this);

        cursor = game.input.keyboard.createCursorKeys();
        spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    }

    function update(){
        //Condición para no empezar el juego hasta que el mundo no termine de cargar
        if (mundo_cargado == true){
            turbo_texto.text = "Turbo: " + turbo;
            game.physics.arcade.collide(jugador1, plataformas);
            game.physics.arcade.collide(estrellas, plataformas);
            game.physics.arcade.collide(bolas, plataformas);
            game.physics.arcade.collide(obstaculos, plataformas);

            game.physics.arcade.overlap(jugador1, estrellas, recolectar, null, this);
            game.physics.arcade.overlap(jugador1, bolas, recolectar_bola, null, this);
            game.physics.arcade.overlap(jugador1, obstaculos, toca_obstaculo, null, this);

            jugador1.body.velocity.x = 0;

            if (cursor.left.isDown){
                jugador1.body.velocity.x = -150*x_mult;
            }
            else if (cursor.right.isDown){
                jugador1.body.velocity.x = 150*x_mult;
            }

            if (cursor.up.isDown && jugador1.body.touching.down){
                jugador1.body.velocity.y = -350;
            }

            if (spaceKey.isDown){
                if (turbo > 0){
                    x_mult = 2;
                    turbo -= 1;
                }
                else{
                    x_mult = 1;
                }
            }

            else if (spaceKey.isUp){
                x_mult = 1;
            }

            if (jugador1.x > mundo_ganar_x){
                siguiente_mundo();
            }
        }

    }

    function recolectar(jugador, estrella){
        estrella.kill();

        puntaje += 10;
        puntaje_texto.text = "Puntaje: " + puntaje;
        turbo += 10;
    }

    function recolectar_bola(jugador, bola){
        bola.kill();

        puntaje += 20;
        puntaje_texto.text = "Puntaje: " + puntaje;
        turbo += 10;
    }

    function crearElemento(){
        var tipo = Math.floor((Math.random() * 2) + 1);
        var posision_x = Math.floor((Math.random() * 2000) + 1);
        if (tipo == 1){
            e1 = estrellas.create(posision_x, 0, 'estrella1')
            e1.body.gravity.y = 100;
            e1.scale.setTo(0.3,0.3);
            e1.body.bounce.y = 0;
        }
        else{
            b1 = bolas.create(posision_x, 0, 'bola1')
            b1.body.gravity.y = 100;
            b1.scale.setTo(0.3,0.3);
            b1.body.bounce.y = 0;
        }
    }

    function toca_obstaculo(jugador, obstaculo){
        console.log("TOCO OBSTACULO");
        obstaculo.kill();
        vidas[vidas.length-1].kill()
        vidas.splice(vidas.length-1, 1);
        if (vidas.length == 0){
            game_over()
        }
    }

    function game_over(){
        alert("GAME OVER");
        game.state.start(game.state.current);
    }

    function siguiente_mundo(){
        alert("GANASTE");
        game.state.start(game.state.current);
    }

    function cargar_mundo(datos){
        //Función que carga los elementos del archivo CSV y los conveierte a objetos en el juego
        //Debo hacer 3 ciclos anidados.
        //1. para recorrer la filas
        //2. para recorrer las columnas
        //3. para recorrer los elementos separados por ;
        var y_acum = 0
        for (var i = 0; i < datos.length; i ++){
            var x_acum = 0
            for (var j = 0; j < datos[i].length; j ++){
                //La función SPLIT separa variables STRING por un caracter y las convierte a un ARREGLO
                var objects = datos[i][j].split(";");
                for (var k = 0; k < objects.length; k ++){
                    if (objects[k] == "x"){
                        piso = plataformas.create(x_acum, y_acum, 'piso1');
                        piso.scale.setTo(0.5,0.5);
                        piso.body.immovable = true;
                    } 
                    else if (objects[k] == "o"){
                        obstaculo = obstaculos.create(x_acum, y_acum-30, 'obstaculo1');
                        obstaculo.body.immovable = true; 
                        obstaculo.body.immovable = true;
                    }
                    else if (objects[k] == "e1"){
                        e1 = estrellas.create(x_acum, 0, 'estrella1');
                        e1.body.gravity.y = 100;
                        e1.scale.setTo(0.3,0.3);
                        e1.body.bounce.y = 0;
                    }
                    else if (objects[k] == "e2"){
                        b1 = bolas.create(x_acum, 0, 'bola1');
                        b1.body.gravity.y = 100;
                        b1.scale.setTo(0.3,0.3);
                        b1.body.bounce.y = 0;
                    }
                    else if (objects[k] == "w"){
                        mundo_ganar_x = x_acum;
                    }
                }
                //Acumulo las X para poder incrementando y pintando correctamente en el mundo
                x_acum += 50;
            }
            //Acumulo las Y para poder incrementando y pintando correctamente en el mundo
            y_acum += 100;
        }
        //Variable para el update de no empezar el juego hasta que el mundo termine de cargar
        mundo_cargado = true;
    }

};
