var controller = {

    loginButton: null,
    registerButton: null,
    usernameInput: null,
    passwordInput: null,
    errorLabel: null,
    googleButton: null,
    facebookbtn : null,

    onCreate: function () {
    },

    onDeviceReady: function () {
        this.loginButton = $("#loginbtn");
        this.registerButton = $("#registerbtn");
        this.usernameInput = $("#login_input");
        this.passwordInput = $("#password_input");
        this.errorLabel = $("#errorlabel");
        this.googleButton = $("#googlebtn");
        this.facebookbtn = $("#facebookbtn");
        this.loginButton.click(this.onLoginClicked.bind(this));
        this.registerButton.click(this.navigateToRegister.bind(this));
        this.googleButton.click(this.onGoogleSignInClicked.bind(this));
        this.facebookbtn.click(this.onFacebookSignInClicked.bind(this));

        controller.showLoader();
        firebase.auth().getRedirectResult().then(function (result) {
            controller.hideLoader();
            if (result.user) {
                controller.navigateToMain();
            }
        }).catch(function (error) {
            controller.hideLoader();
            controller.errorLabel.text(error.code + ":" + error.message);
        });

    },

    onLoginClicked: function () {
        var email = this.usernameInput.val();
        var password = this.passwordInput.val();
        console.log("login:" + email + " pass:" + password);
        controller.showLoader();
        firebase.auth().signInWithEmailAndPassword(email, password).then(function (result) {
            controller.hideLoader();
            controller.navigateToMain();
        }).catch(function (error) {
            controller.hideLoader();
            controller.errorLabel.text(error.code + ":" + error.message);
        });
    },

    onGoogleSignInClicked: function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        console.log("onGoogleSignInClicked");
        firebase.auth().signInWithRedirect(provider);
    },

    onFacebookSignInClicked : function (){
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');
        console.log("onFacebookSignInClicked");
        firebase.auth().signInWithRedirect(provider);
    },

    navigateToRegister: function () {
        window.location.href = "/SPW-Symulator/register/register.html";
    },

    navigateToMain: function () {
        window.location.href = "/SPW-Symulator/main/main.html";
    },

    showLoader: function () {
        $('.preloader-background').fadeIn();
    },

    hideLoader: function () {
        $('.preloader-background').fadeOut('slow');
    }

};