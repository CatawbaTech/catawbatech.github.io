		

	
function passWord(){
	var passInput = document.getElementById("psw");
	var passText = document.getElementById("text");
	var pass = ("THE209")
	if(passInput.value.match(pass)) {
		passText.classList.remove("invalid")
		passText.classList.add("valid")
		window.location.href="./games/ctechgames.html"
	} 
	else {
		passText.classList.remove("valid")
		passText.classList.add("invalid")
	}
}
