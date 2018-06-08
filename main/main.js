var controller = {

    logoutButton : null,
    profile_name : null,
    profile_id : null,
    upload_btn : null,
    file_list_btn : null,

    onCreate: function () { },

    onDeviceReady: function () {
        this.logoutButton = $("#logout_btn");
        this.profile_name = $("#profile_name");
        this.file_list_btn = $("#file_list_btn");
        this.profile_id = $("#profile_id");
        this.upload_btn = $("#upload_btn");
        this.results_btn = $("#results_btn");

        this.logoutButton.click(this.onClickedLogout.bind(this));
        this.upload_btn.click(this.navigateToUpload.bind(this));
        this.file_list_btn.click(this.navigateToFileList.bind(this));
        this.results_btn.click(this.navigateToResults.bind(this));

        controller.showLoader();
        firebase.auth().onAuthStateChanged(function (user) {
            controller.hideLoader();
            if(!user){
                controller.navigateToLogin();
            }else{
                controller.profile_name.html("Email: " + user.email);
                controller.profile_id.html("User id: " + user.uid);
                console.log(user);
            }
        });

    },

    onClickedLogout : function () {
        firebase.auth().signOut().then(function() {
            controller.navigateToLogin();
        }).catch(function(error) {
            console.log(error);
        });
    },

    navigateToLogin : function () {
        window.location.href = "/SPW-Symulator/login/login.html";
    },

    navigateToFileList : function () {
        window.location.href = "/SPW-Symulator/files/files.html";
    },

    navigateToUpload : function () {
        window.location.href = "/SPW-Symulator/upload/upload.html";
    },

    navigateToSimulator : function () {
        window.location.href = "/SPW-Symulator/simulator/simulator.html";
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