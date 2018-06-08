var controller = {

    btn_send : null,

    onCreate: function () {
    },

    onDeviceReady: function () {
        this.btn_send = $("#btn_send");
        this.btn_send.click(this.uploadFile.bind(this));
        this.hideLoader();
    },

    uploadFile: function(){
        const ref = firebase.storage().ref();
        const file = $('#file_input').get(0).files[0];
        const name = (+new Date()) + '-' + file.name;
        const metadata = { contentType: file.type };
        const uid = firebase.auth().currentUser.uid;
        const task = ref.child( "files/" + name).put(file, metadata);
        this.showLoader();
        task.then((snapshot) => {
            console.log(snapshot);
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
                const ref = firebase.database().ref("files");
                const data = {
                    filename: snapshot.metadata.name,
                    url: downloadURL
                };
                console.log(data);
                ref.push().set(data).then(function (resp) {
                    controller.hideLoader();
                    controller.navigateToFileList();
                }).catch(function (error) {
                    controller.hideLoader();
                    console.log(error);
                });
            });
        }).catch(function (error) {
            controller.hideLoader();
            console.log(error);
        });
    },

    navigateToLogin : function () {
        window.location.href = "/SPW-Symulator/login/login.html";
    },

    navigateToFileList : function () {
        window.location.href = "/SPW-Symulator/files/files.html";
    },

    showLoader: function () {
        $('.preloader-background').fadeIn();
    },

    hideLoader: function () {
        $('.preloader-background').fadeOut('slow');
    }

};