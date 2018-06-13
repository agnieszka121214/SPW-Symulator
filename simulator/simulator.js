Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

var controller = {

    glContext : null,
    btn_clear : null,
    btn_send : null,

    indices : [],
    colors : [9,9,9],
    vertices : [9,9,9],
    temperatures : [],

    s_indices : [0,1,2,1,2,3],
    s_colors : [1,0,0, 1,0,0,
        0,0,1, 0,0,1],
    s_vertices : [
        -1 - 3 , -1 -1  , 0 ,    0- 3 , -1 -1, 0,
        -1 - 3 , 0 + 2  , 0 ,    0- 3 , 0 + 2, 0],
    s_temperatures : [],

    btn_save_simulation : null,

    filename : null,
    rotateY : 0,
    rotateZ : 0,

    btn_rotate_left : null,
    btn_rotate_right : null,
    btn_rotate_top : null,
    btn_rotate_bottom : null,

    textCanvas : null,
    textCanvasCtx : null,

    temp_container : null,

    onCreate: function () { },

    onDeviceReady: function () {

        // look up the text canvas.
        this.textCanvas = document.getElementById("text");
        this.textCanvasCtx = this.textCanvas.getContext("2d");

        this.btn_rotate_left = $('#btn_rotate_left');
        this.btn_rotate_right = $('#btn_rotate_right');
        this.btn_rotate_top = $('#btn_rotate_top');
        this.btn_rotate_bottom = $('#btn_rotate_bottom');

        this.temp_container = $('#temp_container');

        this.btn_send = $('#btn_send');
        this.btn_clear = $("#btn_clear");
        this.btn_save_simulation = $('#btn_save_simulation');
        this.btn_save_simulation.click(this.onClickedSaveSimulation.bind(this));
        this.btn_send.click(this.sendMessage.bind(this));
        this.btn_clear.click(this.clearMessages.bind(this));

        this.btn_rotate_left.click(this.rotateLrft.bind(this));
        this.btn_rotate_right.click(this.rotateRight.bind(this));
        this.btn_rotate_top.click(this.rotateTop.bind(this));
        this.btn_rotate_bottom.click(this.rotateBottom.bind(this));

        const url = localStorage.getItem("url");
        controller.filename = localStorage.getItem("filename").replace(/[^a-zA-Z0-9 ]/g, "");

        controller.showLoader();
        $.ajax({
            url: url,
            contentType: false,
            processData: false,
            success: function (data) {
                var lines = data.split('\n');
                for(var i = 0;i < lines.length;i++){
                   controller.processLine(lines[i],
                       controller.vertices,
                       controller.indices,
                       controller.temperatures);
                }

                controller.vertices = controller.convertVertices(controller.vertices);
                controller.indices = controller.convertIndices(controller.indices);
                controller.colors = controller.convertColors(controller.temperatures);

                controller.hideLoader();
                controller.renderer3D(
                    controller.vertices,
                    controller.colors,
                    controller.indices);
            }
        });

        //messages
        const ref = firebase.database().ref('messages/' + controller.filename);
        ref.on('value', function(snapshot) {
            controller.displayMessages(snapshot.val());
        });

        const ref2 = firebase.database().ref('simulation/' + controller.filename);
        ref2.on('value', function(snapshot) {
            const item = snapshot.val();
            console.log(item);
            if(item){
                controller.rotateY = item.rotate_y;
                controller.rotateZ = item.rotate_z;
            }
        });

    },

    rotateLrft : function(){
        controller.rotateZ = controller.rotateZ + 0.10;
        console.log(controller.rotateZ);
        controller.sendRotationChanges();
    },

    rotateRight : function(){
        controller.rotateZ = controller.rotateZ - 0.10;
        console.log(controller.rotateZ);
        controller.sendRotationChanges();
    },

    rotateTop : function(){
        controller.rotateY = controller.rotateY+ 0.10;
        console.log(controller.rotateY);
        controller.sendRotationChanges();
    },

    rotateBottom : function(){
        controller.rotateY = controller.rotateY - 0.10;
        console.log(controller.rotateY);
        controller.sendRotationChanges();
    },

    sendRotationChanges : function (){
        var user = firebase.auth().currentUser;
        const ref = firebase.database().ref("simulation/" + controller.filename);
        const data = {
            rotate_y: controller.rotateY,
            rotate_z: controller.rotateZ
        };
        ref.set(data).then(function (resp) {
            //
        }).catch(function (error) {
            console.log(error);
        });
    },

    onClickedSaveSimulation : function(){
        var canvas = document.getElementById('my_Canvas');
        canvas.toBlob(function(blob){
            const name = (+new Date()) + '-result';
            const uid = firebase.auth().currentUser.uid;
            const ref = firebase.storage().ref();
            const task = ref.child( "results/" + uid + "/" + name).put(blob);
            controller.showLoader();
            task.then((snapshot) => {
                console.log(snapshot);
                snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    const ref = firebase.database().ref("results/" + uid);
                    const data = {
                        filename: snapshot.metadata.name,
                        url: downloadURL
                    };
                    console.log(data);
                    ref.push().set(data).then(function (resp) {
                        controller.hideLoader();
                        controller.navigateToResults();
                    }).catch(function (error) {
                        controller.hideLoader();
                        console.log(error);
                    });
                });
            }).catch(function (error) {
                controller.hideLoader();
                console.log(error);
            });
        });
    },

    processLine: function (line, vertices, indices, temperatures){
        line = line.replace(' ','');
        var p = line.split(',');
        if(p.length ==  5){
            var x = parseFloat(p[1]);
            var y = parseFloat(p[2]);
            var z = parseFloat(p[3]);
            var t = parseFloat(p[4]);
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);
            temperatures.push(t);
        }else if(p.length ==  10){
            var v0 = parseFloat(p[2]);
            var v1 = parseFloat(p[3]);
            var v2 = parseFloat(p[4]);
            var v3 = parseFloat(p[5]);
            var v4 = parseFloat(p[6]);
            var v5 = parseFloat(p[7]);
            var v6 = parseFloat(p[8]);
            var v7 = parseFloat(p[9]);
            indices.push(v0);
            indices.push(v1);
            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
            indices.push(v5);
            indices.push(v6);
            indices.push(v7);
        }
    },

    convertVertices: function (vertices){
        for(var i = 0 ; i < vertices.length ; i ++){
            vertices[i] *= 35;
        }
        return vertices;
    },

    convertIndices: function (indices){
        var tab = [];

        for(var i = 0 ; i < indices.length ; i+= 8){
            var v0 = indices[i];
            var v1 = indices[i+1];
            var v2 = indices[i+2];
            var v3 = indices[i+3];
            var v4 = indices[i+4];
            var v5 = indices[i+5];
            var v6 = indices[i+6];
            var v7 = indices[i+7];
            tab = tab.concat([v0,v2,v3]);
            tab = tab.concat([v0,v1,v2]);
            tab = tab.concat([v1,v2,v5]);
            tab = tab.concat([v2,v6,v5]);
            tab = tab.concat([v7,v5,v6]);
            tab = tab.concat([v7,v4,v5]);
            tab = tab.concat([v0,v4,v7]);
            tab = tab.concat([v0,v3,v7]);
            tab = tab.concat([v3,v7,v2]);
            tab = tab.concat([v7,v6,v2]);
            tab = tab.concat([v0,v4,v1]);
            tab = tab.concat([v4,v1,v5]);
        }
        return tab;
    },

    convertColors: function (temp){
        var min =  temp.min();
        var max =  temp.max();

        controller.temp_container.html( "min:" + min + "C \n" + "max:" + max + "C" );

        var col = [0,0,0];
        for(var i = 0; i < temp.length ; i++ ){
            var c = (temp[i] - min)/(max - min)*100;
            var r =  ( (c / 50))*(c % 50)/50;
            var g = 0;
            var b = (2 - (c / 50))*(c % 50)/50;
            col.push(r);
            col.push(g);
            col.push(b);
        }
        return col;
    },

    renderer3D : function(vertices, colors, indices){

        var canvas = document.getElementById('my_Canvas');
        const gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
        controller.glContext = gl;

        // Create and store data into vertex buffer
        var vertex_buffer = gl.createBuffer ();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Create and store data into color buffer
        var color_buffer = gl.createBuffer ();
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        // Create and store data into index buffer
        var index_buffer = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        // Create and store data into vertex buffer
        var vertex_buffer_s = gl.createBuffer ();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_s);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(controller.s_vertices), gl.STATIC_DRAW);

        // Create and store data into color buffer
        var color_buffer_s = gl.createBuffer ();
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer_s);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(controller.s_colors), gl.STATIC_DRAW);

        // Create and store data into index buffer
        var index_buffer_s = gl.createBuffer ();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer_s);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(controller.s_indices), gl.STATIC_DRAW);

        /*=================== Shaders =========================*/

        var vertCode = 'attribute vec3 position;'+
            'uniform mat4 Pmatrix;'+
            'uniform mat4 Vmatrix;'+
            'uniform mat4 Mmatrix;'+
            'attribute vec3 color;'+//the color of the point
            'varying vec3 vColor;'+

            'void main(void) { '+//pre-built function
            'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);'+
            'vColor = color;'+
            '}';

        var fragCode = 'precision mediump float;'+
            'varying vec3 vColor;'+
            'void main(void) {'+
            'gl_FragColor = vec4(vColor, 1.);'+
            '}';

        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertCode);
        gl.compileShader(vertShader);

        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragCode);
        gl.compileShader(fragShader);

        controller.shaderProgram = gl.createProgram();
        gl.attachShader(controller.shaderProgram, vertShader);
        gl.attachShader(controller.shaderProgram, fragShader);
        gl.linkProgram(controller.shaderProgram);

        /* ====== Associating attributes to vertex shader =====*/
        var Pmatrix = gl.getUniformLocation(controller.shaderProgram, "Pmatrix");
        var Vmatrix = gl.getUniformLocation(controller.shaderProgram, "Vmatrix");
        var Mmatrix = gl.getUniformLocation(controller.shaderProgram, "Mmatrix");

        gl.useProgram(controller.shaderProgram);

        /*==================== MATRIX =====================*/

        function get_projection(angle, a, zMin, zMax) {
            var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
            return [
                0.5/ang, 0 , 0, 0,
                0, 0.5*a/ang, 0, 0,
                0, 0, -(zMax+zMin)/(zMax-zMin), -1,
                0, 0, (-2*zMax*zMin)/(zMax-zMin), 0
            ];
        }

        var proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);

        var mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
        var view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

        // translating z
        view_matrix[14] = view_matrix[14]-6;//zoom

        /*==================== Rotation ====================*/

        function rotateZ(m, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var mv0 = m[0], mv4 = m[4], mv8 = m[8];

            m[0] = c*m[0]-s*m[1];
            m[4] = c*m[4]-s*m[5];
            m[8] = c*m[8]-s*m[9];

            m[1]=c*m[1]+s*mv0;
            m[5]=c*m[5]+s*mv4;
            m[9]=c*m[9]+s*mv8;
        }

        function rotateX(m, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var mv1 = m[1], mv5 = m[5], mv9 = m[9];

            m[1] = m[1]*c-m[2]*s;
            m[5] = m[5]*c-m[6]*s;
            m[9] = m[9]*c-m[10]*s;

            m[2] = m[2]*c+mv1*s;
            m[6] = m[6]*c+mv5*s;
            m[10] = m[10]*c+mv9*s;
        }

        function rotateY(m, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var mv0 = m[0], mv4 = m[4], mv8 = m[8];

            m[0] = c*m[0]+s*m[2];
            m[4] = c*m[4]+s*m[6];
            m[8] = c*m[8]+s*m[10];

            m[2] = c*m[2]-s*mv0;
            m[6] = c*m[6]-s*mv4;
            m[10] = c*m[10]-s*mv8;
        }

        /*================= Drawing ===========================*/
        var time_old = 0;

        var animate = function(time) {

            mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

            var dt = time-time_old;
            rotateY(mov_matrix, controller.rotateY);
            rotateX(mov_matrix, controller.rotateZ);//time
            time_old = time;

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            gl.clearColor(0.5, 0.5, 0.5, 0.9);
            gl.clearDepth(1.0);


            controller.textCanvasCtx.clearRect(0, 0, controller.textCanvasCtx.width, controller.textCanvasCtx.height);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            var position = gl.getAttribLocation(controller.shaderProgram, "position");
            gl.vertexAttribPointer(position, 3, gl.FLOAT, false,0,0) ;
            // Position
            gl.enableVertexAttribArray(position);
            gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
            var color = gl.getAttribLocation(controller.shaderProgram, "color");
            gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ;
            // Color
            gl.enableVertexAttribArray(color);


            gl.viewport(0.0, 0.0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
            gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
            gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);


            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_s);
            var position2 = gl.getAttribLocation(controller.shaderProgram, "position");
            gl.vertexAttribPointer(position2, 3, gl.FLOAT, false,0,0) ;
            // Position
            gl.enableVertexAttribArray(position2);
            gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer_s);
            var color2 = gl.getAttribLocation(controller.shaderProgram, "color");
            gl.vertexAttribPointer(color2, 3, gl.FLOAT, false,0,0) ;
            // Color
            gl.enableVertexAttribArray(color2);

            const M = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
            gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
            gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
            gl.uniformMatrix4fv(Mmatrix, false, M);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer_s);
            gl.drawElements(gl.TRIANGLES, controller.s_indices.length, gl.UNSIGNED_SHORT, 0);

            window.requestAnimationFrame(animate);
        }
        animate(0);
    },

    sendMessage : function(){
        var user = firebase.auth().currentUser;
        const ref = firebase.database().ref("messages/" + controller.filename);
        const data = {
            text: $("#message_input").val(),
            user: user.email
        };

        ref.push().set(data).then(function (resp) {
            $("#message_input").val("")
        }).catch(function (error) {
            console.log(error);
        });

    },

    displayMessages : function(messages){
        var template = "<ul class=\"collection\" >";
        for( x in messages){
            const messagee = messages[x];
            console.log(messagee);
            template += "<li class=\"collection-item center-align\">\n" +
                "            <div class=\"row\">\n" + messagee.user + ": " +  messagee.text +  "</div>\n" +
                "        </li>";
        }
        template += "</ul>";
        $("#messages_list").html(template);
    },

    clearMessages : function(){
        const ref = firebase.database().ref("messages/" + controller.filename);
        ref.remove();
    },

    navigateToLogin : function () {
        window.location.href = "/SPW-Symulator/login/login.html";
    },

    navigateToResults : function () {
        window.location.href = "/SPW-Symulator/results/results.html";
    },

    showLoader: function () {
        $('.preloader-background').fadeIn();
    },

    hideLoader: function () {
        $('.preloader-background').fadeOut('slow');
    }

};