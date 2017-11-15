function blurBackground(){
	var elmt = document.getElementById("background");
	if(!elmt.classList.contains("blur")){
		elmt.classList.add("blur");
	}
}

function sharpenBackground(){
	var elmt = document.getElementById("background");
	if(elmt.classList.contains("blur")){
		elmt.classList.remove("blur");
	}

}

function navbarLogout(){
	

}

function navbarLogin(){

}