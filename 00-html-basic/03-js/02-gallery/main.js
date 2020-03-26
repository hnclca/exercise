var displayedImage = document.querySelector('.displayed-img');
var thumbBar = document.querySelector('.thumb-bar');

btn = document.querySelector('button');
var overlay = document.querySelector('.overlay');

/* Looping through images */
for (var i = 1; i <= 5; i++) {
  var newImage = document.createElement('img');
  newImage.setAttribute('src', 'images/pic' + i + '.jpg');
  newImage.addEventListener("click", function(e) {
	  displayedImage.setAttribute("src", getImageSrc(e.target))
  });
  thumbBar.appendChild(newImage);
  
}

function getImageSrc(element) {
	return element.getAttribute("src");
}

/* Wiring up the Darken/Lighten button */
btn.addEventListener("click", function(e){
  var className = btn.getAttribute("class");
  if ("dark" === className) {
	  btn.setAttribute("class", "light");
	  btn.textContent = "Lighten";
	  overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
  } else {
	  btn.setAttribute("class", "dark");
	  btn.textContent = "Darken";
	  overlay.style.backgroundColor = "rgba(0,0,0,0)";
  }
});

