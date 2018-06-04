var controller = {

    loginButton : null,
    registerButton : null,
    usernameInput : null,
    passwordInput : null,
    errorLabel : null,
    passwordRetypeInput : null,

    onCreate: function() { },

    onDeviceReady: function() {
        this.loginButton = $("#loginbtn");
        this.registerButton = $("#registerbtn");
        this.usernameInput = $("#login_input");
        this.passwordInput = $("#password_input");
        this.errorLabel = $("#errorlabel");
        this.passwordRetypeInput = $("#password_retype_input");
        this.registerButton.click(this.onRegisterClicked.bind(this));
        this.loginButton.click(this.navigateToLogin.bind(this));
    },

    onRegisterClicked: function () {
        var email = this.usernameInput.val();
        var password = this.passwordInput.val();
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function (result) {
            controller.navigateToMain();
        }).catch(function(error) {
            controller.errorLabel.text(error.code + ":" + error.message);
        });
    },

    navigateToLogin: function () {
        window.location.href = "/SPW-Symulator/login/login.html";
    },

    navigateToMain: function () {
        window.location.href = "/SPW-Symulator/main/main.html";
    }


};