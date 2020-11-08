(function(){
    //DOM elements
    var oAvatar = document.getElementById('avatar'),
        oWelcomeMsg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oLoginBtn = document.getElementById('login-btn'),
        oLoginForm = document.getElementById('login-form'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginErrorField = document.getElementById('login-error'),
        oRegisterBtn = document.getElementById('register-btn'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterForm = document.getElementById('register-form'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),
        oFavBtn = document.getElementById("fav-btn"),
        oRecommendBtn = document.getElementById('recommend-btn'),
        oNavBtnList = document.getElementsByClassName('main-nav-btn'),
        oItemNav = document.getElementById('item-nav'),
        oItemList = document.getElementById('item-list'),
        oTpl = document.getElementById('tpl').innerHTML,
        userId = '1111',
        userFullName = 'John',
        lng = -74.0060,
        lat = 40.7128;

    // entry fn - init fn
    function init(){

        //validation session -> after ajax
        validateSession();
        //persistent login
        //to show login form
        //bind event
        bindEvent();

    }

    function validateSession(){
        switchLoginRegister("login");
    }

    function showOrHideElement(ele, style){
        //css - display
        ele.style.display = style;
    }

    // bind events
    function bindEvent(){
        oRegisterFormBtn.addEventListener("click", function(){
            switchLoginRegister("register");
        }, false);

        oLoginFormBtn.addEventListener("click", function(){
            switchLoginRegister("login");

        },false);

        oLoginBtn.addEventListener("click", loginExecutor, false);
        oRegisterBtn.addEventListener("click", registerExecutor, false);
        oNearbyBtn.addEventListener("click", loadNearbyData, false);
        oFavBtn.addEventListener("click", loadFavoriteItems, false);
        oRecommendBtn.addEventListener("click", loadRecommendedItems, false);
        oItemList.addEventListener("click", changeFavoriteItem, false);
        oLogoutBtn.addEventListener("click", logoutExecutor, false);
    }

    function logoutExecutor(){
        ajax({
            method:"POST",
            url:"./logout",
            data: null,
            success: function(res){
                if (res.result === "OK" || res.status === "OK"){
                    oLoginUsername.value="";
                    oLoginPwd.value="";
                    oRegisterUsername.value="";
                    oRegisterPwd.value="";
                    oRegisterFirstName.value="";
                    oRegisterLastName.value="";
                    switchLoginRegister("login");
                } else {
                    oWelcomeMsg.innerHTML = "Logout Failed!";
                }
            },
            error: function(){
                oWelcomeMsg.innerHTML = "Logout Failed!";
            }
        });

    }

    function loginExecutor(){

        var username =  oLoginUsername.value,
            password = oLoginPwd.value;

        if (username === "" || password === ""){
            oLoginErrorField.innerHTML = "Please fill in all fields";
            return;
        }
        password = md5(username+md5(password));

        ajax({
            method:"POST",
            url:"./login",
            data:{
                user_id:username,
                password:password,
            },
            success:function(res){
                if (res.status === "OK"){
                    welcomeMsg(res);
                    fetchData();
                } else {
                    oLoginErrorField.innerHTML = "Invalid username or password";
                }
            },
            error:function(){
                oLoginErrorField.innerHTML = "Invalid username or password";
                throw new Error("Invalid username or password");
            }
        })

    }

    function fetchData(){
        initGeo(loadNearbyData);
    }

    function initGeo(cb){
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                //console.log(position)
                //change lat and lng to current from position
                //console.log(lat)
                //console.log(lng)
                lat = position.coords.latitude || lat;
                lng = position.coords.longitude || lng;
                cb();
            }, function(){
                throw new Error("Geo location fetch failed")
            }, {maximumAge: 60000});
            oItemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>Retrieving your location...</p>';
        } else {
            throw new Error('Your browser does not support navigator!!')
        }
    }



    function serverExecutor(opt){
        oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>Loading ' + opt.message + ' item...</p>';
        ajax({
            method: opt.method,
            url: opt.url,
            data:opt.data,
            success: function(res){
                if (!res || res.length === 0){
                    oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>No ' + opt.message + ' item!</p>';
                } else {
                    render(res);
                    itemArr = res;
                }
            },
            error: function(){
                throw new Error("No "+ opt.message + " items!");
            }
        })

    }

    function loadNearbyData(){
        activeBtn("nearby-btn");
        console.log(lat);
        console.log(lng);
        var opt = {
            method:"GET",
            url: "./search?user_id=" + userId + "&lat=" + lat + "&lon=" + lng,
            data: null,
            message: "nearby"
        }
        serverExecutor(opt);
    }

    function loadFavoriteItems(){
        activeBtn("fav-btn");
        var opt = {
            method: "GET",
            url: "./history?user_id="+userId,
            data: null,
            message: "favorite"
        }
        serverExecutor(opt);
    }
    function loadRecommendedItems(){
        activeBtn("recommend-btn");
        var opt = {
            method: "GET",
            url: "./recommendation?user_id="+userId+"&lat="+lat+"&lon="+lng,
            data: null,
            message: "recommended"
        }
        serverExecutor(opt);
    }

    function registerExecutor() {
        var username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;

        if (
            username === "" ||
            password == "" ||
            firstName === "" ||
            lastName === ""
        ) {
            oRegisterResultField.innerHTML = "Please fill in all fields";
            return;
        }
        if (username.match(/^[a-z0-9_]+$/) === null) {
            oRegisterResultField.innerHTML = "Invalid username";
            return;
        }
        console.log(firstName);
        console.log(lastName);
        console.log(username);
        console.log(password);
        password = md5(username + md5(password));
        console.log(password);
        ajax({
            method: "POST",
            url: "./register",
            data: {
                user_id: username,
                password: password,
                first_name: firstName,
                last_name: lastName,
            },
            success: function(res){
                if (res.status === "OK" || res.result === "OK"){
                    oRegisterResultField.innerHTML = "Successfully registered!";

                } else {
                    oRegisterResultField.innerHTML = "User already existed!";
                }
            },
            error: function(){
                oRegisterResultField.innerHTML = "Failed to register!";
                throw new Error("Failed to register");
            }
        });
    }

    function changeFavoriteItem(evt){
        var tar = evt.target,
            oParent = tar.parentElement;

        if (oParent && oParent.className === "fav-link") {
            console.log("change...");
            var oCurLi = oParent.parentElement,
                classname = tar.className,
                isFavorite = classname === "fa fa-heart" ? true : false,
                oItems = oItemList.getElementsByClassName("item"),
                index = Array.prototype.indexOf.call(oItems, oCurLi),
                url = "./history",
                req = {
                    user_id: userId,
                    favorite: itemArr[index]
                };
            var method = !isFavorite ? "POST" : "DELETE";
            ajax({
                method: method,
                url: url,
                data: req,
                success: function(res) {
                    if (res.status === "OK" || res.result === "SUCCESS") {
                        tar.className = !isFavorite ? "fa fa-heart" : "fa fa-heart-o";
                    } else {
                        throw new Error("Change Favorite failed!");
                    }
                },
                error: function() {
                    throw new Error("Change Favorite failed!");
                }
            });
        }
    }
    function render(data){
        var len = data.length,
            list = '',
            item;
        for (var i = 0; i < len; i++){
            item = data[i];
            list += oTpl.replace(/{{(.*?)}}/g, function(node, key){

                if (key === "company_logo"){
                    return item[key] || 'https://via.placeholder.com/100';
                }
                if (key === "location"){
                    return item[key].replace(/,/g,'<br />').replace(/\''/g, '');

                }
                if (key === "favorite"){
                    return item[key] ? "fa fa-heart" : "fa fa-heart-o";
                }
                return item[key];
            })
        }
        oItemList.innerHTML = list;
    }
    function activeBtn(btnId){
        var len = oNavBtnList.length;
        for (var i = 0; i < len; i++) {
            oNavBtnList[i].className = 'main-nav-btn';
        }
        var btn = document.getElementById(btnId);
        btn.className += ' active';
    }

    function welcomeMsg(msg){
        userId = msg.user_id || userId;
        userFullName = msg.name || userFullName;

        oWelcomeMsg.innerHTML = "Welcome "+userFullName;
        showOrHideElement(oWelcomeMsg, 'block');
        showOrHideElement(oAvatar, 'block');
        showOrHideElement(oItemNav, 'block');
        showOrHideElement(oItemList, 'block');
        showOrHideElement(oLogoutBtn, 'block');
        showOrHideElement(oLoginForm, 'none');

    }

    function ajax(opt){
        var opt = opt || {},
            method = (opt.method || "GET").toUpperCase(),
            url = opt.url,
            data = opt.data || null,
            success = opt.success || function () {
            },
            error = opt.error || function () {
            },
            xhr = new XMLHttpRequest();
        if (!url){
            throw new Error("missing url");
        }

        xhr.open(method, url, true);

        if (!data){
            xhr.send();
        } else {
            xhr.setRequestHeader("Content-type", "application/json;charset=utf-8");
            xhr.send(JSON.stringify(data));
        }
        xhr.onload = function(){
            if (xhr.status === 200){
                success(JSON.parse(xhr.responseText))
            } else {
                error()
            }
        }

        xhr.onerror = function(){
            throw new Error("The request could not be completed.")
        }
    }


    function switchLoginRegister(name){

        //hide header
        showOrHideElement(oAvatar, "none");
        showOrHideElement(oWelcomeMsg, "none");
        showOrHideElement(oLogoutBtn, "none");
        //hide item list
        showOrHideElement(oItemNav, "none");
        showOrHideElement(oItemList, "none");

        if (name === "login") {
            //case 1 : name == login
            showOrHideElement(oRegisterForm, "none");
            oRegisterResultField.innerHTML = "";
            showOrHideElement(oLoginForm, "block");
        } else {
            //case 2 : name == register
            showOrHideElement(oLoginForm, "none");
            oLoginErrorField.innerHTML = "";
            showOrHideElement(oRegisterForm, "block");
        }
    }


    //data manager
    init();
})()