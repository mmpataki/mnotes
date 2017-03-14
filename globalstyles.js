var visibilities = ["block", "none"];
var resizecallbacks = [];

function toggleexpander(ele) {
	var index = ele.nextElementSibling.style.display == "block" ? 1 : 0;
	ele.nextElementSibling.style.display = visibilities[index];
	ele.children[index].style.display = "block";
	ele.children[1 - index].style.display = "none";
}

function dgraph(xs) {
	if(xs.children[1] == null) {
		var ele = document.createElement("div");
		ele.style.display = "block";
		ele.style.height = "100%";
		xs.appendChild(ele);
		register_resize_callback(dgraph, xs);
	}
	draw_chart(xs.children[1], JSON.parse(xs.getAttribute("gdata")));
}

function register_resize_callback(func, args) {
	resizecallbacks.push({
		'func': func,
		'args': args
	});
}

window.onresize = function() {
	for(var i=0; i<resizecallbacks.length; i++) {
		resizecallbacks[i].func(resizecallbacks[i].args);
	}
}