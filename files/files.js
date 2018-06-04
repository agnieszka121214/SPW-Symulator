var controller = {


    onCreate: function () {
    },

    onDeviceReady: function () {
        controller.showLoader();
        firebase.auth().onAuthStateChanged(function (user) {
            if(!user){
                controller.navigateToLogin();
            }else {
                const userId = firebase.auth().currentUser.uid;
                const ref = firebase.database().ref('files/' + userId);
                ref.once('value').then(function (snapshot) {
                    controller.hideLoader();
                    controller.displayFilesList(snapshot.val());
                }).catch(function(error) {
                    controller.hideLoader();
                    console.log(error);
                });
            }
        });
    },

    displayFilesList : function(files){
        console.log(files);

        var template = "<ul class=\"collection\" >";
        for( x in files){
            const file = files[x];
            console.log(file);
            template += "<li class=\"collection-item center-align\">\n" +
                "            <div class=\"row\">\n" +
                "                <a id=\"upload_btn\" href=\""+ file.url +"\" class=\"collection-item\">"+file.filename+"</a>\n" +
                "            </div>\n" +
                "        </li>";
        }
        template += "</ul>";

        $("#files_list").html(template);
    },

    navigateToLogin : function () {
        window.location.href = "/SPW-Symulator/login/login.html";
    },

    showLoader: function () {
        $('.preloader-background').fadeIn();
    },

    hideLoader: function () {
        $('.preloader-background').fadeOut('slow');
    }

};