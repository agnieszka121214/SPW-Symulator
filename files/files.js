var controller = {


    onCreate: function () {
    },

    onDeviceReady: function () {
        controller.showLoader();
        const ref = firebase.database().ref('files');
        ref.on('value', function(snapshot) {
            controller.hideLoader();
            controller.displayFilesList(snapshot.val());
        }).catch(function(error) {
            controller.hideLoader();
            console.log(error);
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
                "                <a class=\"file_btn\" href='#' data-name='"+file.filename+"' data-url=\""+ file.url +"\" class=\"collection-item\">"+file.filename+"</a>\n" +
                "            </div>\n" +
                "        </li>";
        }
        template += "</ul>";

        $("#files_list").html(template);
        $( ".file_btn" ).click(function() {
            var url = $( this ).attr("data-url");
            var filename = $( this ).attr("data-name");
            localStorage.setItem("url", url);
            localStorage.setItem("filename", filename);
            controller.navigateToSimulator();
        });

    },

    navigateToSimulator : function () {
        window.location.href = "/SPW-Symulator/simulator/simulator.html";
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