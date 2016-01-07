/*globals $, Gun, Browser, console*/

function render(test) {
	'use strict';
	console.log(test.stats);
//	$('stats');
}

$('#start').click(function () {
	'use strict';
	$('<tr>').appendTo('#stats').append('<th>').text('Peer thing');

	var b, i, opt = {
		packets: Number($('#each').val()),
		interval: Number($('#interval').val()),
		progress: render,
		packet: function () {
			return Gun.text.random(Number($('#length').val()));
		}
	};
	for (i = 0; i < Number($('#tabs').val()); i += 1) {
		b = new Browser(opt);
	}


});
